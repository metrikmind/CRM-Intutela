<?php
// classes/Documento.php

require_once '../config/database.php';

class Documento {
    private $db;
    private $uploadDir;
    
    public function __construct() {
        $this->db = Database::getInstance();
        $this->uploadDir = '../uploads/documenti/';
        
        // Create upload directory if it doesn't exist
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }
    
    // Upload document
    public function uploadDocument($pratica_id, $file, $visibile_cliente = 'Si', $descrizione = null) {
        try {
            // Validate practice exists
            $practice = $this->db->fetchOne("SELECT id FROM pratiche WHERE id = ?", [$pratica_id]);
            if (!$practice) {
                return ['success' => false, 'message' => 'Pratica non trovata'];
            }
            
            // Validate file
            if (!isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
                return ['success' => false, 'message' => 'Errore nel caricamento del file'];
            }
            
            // Check file size (max 10MB)
            if ($file['size'] > 10 * 1024 * 1024) {
                return ['success' => false, 'message' => 'File troppo grande (max 10MB)'];
            }
            
            // Get file info
            $originalName = $file['name'];
            $fileSize = $file['size'];
            $mimeType = mime_content_type($file['tmp_name']);
            
            // Generate unique filename
            $extension = pathinfo($originalName, PATHINFO_EXTENSION);
            $fileName = uniqid('doc_') . '_' . time() . '.' . $extension;
            $filePath = $this->uploadDir . $fileName;
            
            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $filePath)) {
                return ['success' => false, 'message' => 'Errore nel salvataggio del file'];
            }
            
            // Save to database
            $this->db->beginTransaction();
            
            $sql = "INSERT INTO documenti (pratica_id, nome_file, nome_originale, tipo_file, dimensione, percorso, visibile_cliente, descrizione) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            
            $params = [
                $pratica_id,
                $fileName,
                $originalName,
                $mimeType,
                $fileSize,
                $filePath,
                $visibile_cliente,
                $descrizione
            ];
            
            $this->db->execute($sql, $params);
            $documentId = $this->db->lastInsertId();
            
            $this->db->commit();
            
            return [
                'success' => true,
                'message' => 'Documento caricato con successo',
                'data' => ['id' => $documentId, 'filename' => $fileName]
            ];
            
        } catch (Exception $e) {
            $this->db->rollback();
            
            // Remove uploaded file if database operation failed
            if (isset($filePath) && file_exists($filePath)) {
                unlink($filePath);
            }
            
            error_log("Upload document error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore nel caricamento documento'];
        }
    }
    
    // Get documents for practice
    public function getDocumentsByPractice($pratica_id, $visibile_cliente_only = false) {
        try {
            $where = "pratica_id = ?";
            $params = [$pratica_id];
            
            if ($visibile_cliente_only) {
                $where .= " AND visibile_cliente = 'Si'";
            }
            
            $sql = "SELECT * FROM documenti WHERE $where ORDER BY created_at DESC";
            $documents = $this->db->fetchAll($sql, $params);
            
            return [
                'success' => true,
                'data' => $documents
            ];
            
        } catch (Exception $e) {
            error_log("Get documents error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore nel recupero documenti'];
        }
    }
    
    // Get document by ID
    public function getDocumentById($id) {
        try {
            $sql = "SELECT d.*, p.cliente_id 
                    FROM documenti d 
                    LEFT JOIN pratiche p ON d.pratica_id = p.id 
                    WHERE d.id = ?";
            
            $document = $this->db->fetchOne($sql, [$id]);
            
            if (!$document) {
                return ['success' => false, 'message' => 'Documento non trovato'];
            }
            
            return [
                'success' => true,
                'data' => $document
            ];
            
        } catch (Exception $e) {
            error_log("Get document error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore nel recupero documento'];
        }
    }
    
    // Download document
    public function downloadDocument($id, $user_type = 'admin', $user_id = null) {
        try {
            $documentResult = $this->getDocumentById($id);
            
            if (!$documentResult['success']) {
                return $documentResult;
            }
            
            $document = $documentResult['data'];
            
            // Check permissions for client users
            if ($user_type === 'cliente') {
                if ($document['visibile_cliente'] !== 'Si' || $document['cliente_id'] != $user_id) {
                    return ['success' => false, 'message' => 'Accesso negato al documento'];
                }
            }
            
            // Check if file exists
            if (!file_exists($document['percorso'])) {
                return ['success' => false, 'message' => 'File non trovato sul server'];
            }
            
            return [
                'success' => true,
                'data' => [
                    'file_path' => $document['percorso'],
                    'original_name' => $document['nome_originale'],
                    'mime_type' => $document['tipo_file']
                ]
            ];
            
        } catch (Exception $e) {
            error_log("Download document error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore nel download documento'];
        }
    }
    
    // Update document visibility/description
    public function updateDocument($id, $data) {
        try {
            $this->db->beginTransaction();
            
            // Check if document exists
            $existing = $this->db->fetchOne("SELECT id FROM documenti WHERE id = ?", [$id]);
            if (!$existing) {
                $this->db->rollback();
                return ['success' => false, 'message' => 'Documento non trovato'];
            }
            
            $sql = "UPDATE documenti SET visibile_cliente = ?, descrizione = ? WHERE id = ?";
            $params = [
                $data['visibile_cliente'] ?? 'Si',
                $data['descrizione'] ?? null,
                $id
            ];
            
            $this->db->execute($sql, $params);
            $this->db->commit();
            
            return ['success' => true, 'message' => 'Documento aggiornato con successo'];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Update document error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore nell\'aggiornamento documento'];
        }
    }
    
    // Delete document
    public function deleteDocument($id) {
        try {
            $this->db->beginTransaction();
            
            // Get document info
            $document = $this->db->fetchOne("SELECT * FROM documenti WHERE id = ?", [$id]);
            if (!$document) {
                $this->db->rollback();
                return ['success' => false, 'message' => 'Documento non trovato'];
            }
            
            // Delete from database
            $this->db->execute("DELETE FROM documenti WHERE id = ?", [$id]);
            
            // Delete physical file
            if (file_exists($document['percorso'])) {
                unlink($document['percorso']);
            }
            
            $this->db->commit();
            
            return ['success' => true, 'message' => 'Documento eliminato con successo'];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Delete document error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore nell\'eliminazione documento'];
        }
    }
    
    // Get client documents (for client area)
    public function getClientDocuments($cliente_id) {
        try {
            $sql = "SELECT d.*, p.numero_contratto 
                    FROM documenti d
                    LEFT JOIN pratiche p ON d.pratica_id = p.id
                    WHERE p.cliente_id = ? AND d.visibile_cliente = 'Si'
                    ORDER BY d.created_at DESC";
            
            $documents = $this->db->fetchAll($sql, [$cliente_id]);
            
            return [
                'success' => true,
                'data' => $documents
            ];
            
        } catch (Exception $e) {
            error_log("Get client documents error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore nel recupero documenti cliente'];
        }
    }
    
    // Get all documents with pagination (admin only)
    public function getAllDocuments($page = 1, $limit = 50, $search = '') {
        try {
            $offset = ($page - 1) * $limit;
            
            $where = '';
            $params = [];
            
            if (!empty($search)) {
                $where = "WHERE (d.nome_originale LIKE ? OR d.descrizione LIKE ? OR c.nome_completo LIKE ? OR p.numero_contratto LIKE ?)";
                $searchParam = '%' . $search . '%';
                $params = [$searchParam, $searchParam, $searchParam, $searchParam];
            }
            
            // Get total count
            $countSql = "SELECT COUNT(*) as total 
                        FROM documenti d 
                        LEFT JOIN pratiche p ON d.pratica_id = p.id 
                        LEFT JOIN clienti c ON p.cliente_id = c.id 
                        $where";
            
            $totalResult = $this->db->fetchOne($countSql, $params);
            $total = $totalResult['total'];
            
            // Get documents
            $sql = "SELECT d.*, p.numero_contratto, c.nome_completo as cliente_nome
                    FROM documenti d
                    LEFT JOIN pratiche p ON d.pratica_id = p.id
                    LEFT JOIN clienti c ON p.cliente_id = c.id
                    $where
                    ORDER BY d.created_at DESC
                    LIMIT $limit OFFSET $offset";
            
            $documents = $this->db->fetchAll($sql, $params);
            
            return [
                'success' => true,
                'data' => [
                    'documents' => $documents,
                    'pagination' => [
                        'current_page' => $page,
                        'total_pages' => ceil($total / $limit),
                        'total_records' => $total,
                        'per_page' => $limit
                    ]
                ]
            ];
            
        } catch (Exception $e) {
            error_log("Get all documents error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore nel recupero documenti'];
        }
    }
}
?>