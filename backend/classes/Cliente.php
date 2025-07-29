<?php
// classes/Cliente.php

require_once '../config/database.php';

class Cliente {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    // Get all clients with pagination
    public function getAllClients($page = 1, $limit = 50, $search = '') {
        try {
            $offset = ($page - 1) * $limit;
            
            $where = '';
            $params = [];
            
            if (!empty($search)) {
                $where = "WHERE c.nome_completo LIKE ? OR c.codice_fiscale LIKE ? OR c.progressivo_cliente LIKE ?";
                $searchParam = '%' . $search . '%';
                $params = [$searchParam, $searchParam, $searchParam];
            }
            
            // Get total count
            $countSql = "SELECT COUNT(DISTINCT c.id) as total FROM clienti c $where";
            $totalResult = $this->db->fetchOne($countSql, $params);
            $total = $totalResult['total'];
            
            // Get clients with practice count
            $sql = "SELECT c.*, COUNT(p.id) as num_pratiche,
                           MAX(p.updated_at) as ultima_attivita
                    FROM clienti c
                    LEFT JOIN pratiche p ON c.id = p.cliente_id
                    $where
                    GROUP BY c.id
                    ORDER BY c.progressivo_cliente ASC
                    LIMIT $limit OFFSET $offset";
            
            $clients = $this->db->fetchAll($sql, $params);
            
            return [
                'success' => true,
                'data' => [
                    'clients' => $clients,
                    'pagination' => [
                        'current_page' => $page,
                        'total_pages' => ceil($total / $limit),
                        'total_records' => $total,
                        'per_page' => $limit
                    ]
                ]
            ];
            
        } catch (Exception $e) {
            error_log("Get clients error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore nel recupero clienti'];
        }
    }
    
    // Get client by ID with practices
    public function getClientById($id) {
        try {
            $sql = "SELECT * FROM clienti WHERE id = ?";
            $client = $this->db->fetchOne($sql, [$id]);
            
            if (!$client) {
                return ['success' => false, 'message' => 'Cliente non trovato'];
            }
            
            // Get client practices
            $practicesSql = "SELECT p.*, s.nome as stato_nome, s.colore as stato_colore, b.nome as banca_nome
                            FROM pratiche p
                            LEFT JOIN stati_pratiche s ON p.stato_pratica_id = s.id
                            LEFT JOIN banche b ON p.banca_id = b.id
                            WHERE p.cliente_id = ?
                            ORDER BY p.created_at DESC";
            
            $practices = $this->db->fetchAll($practicesSql, [$id]);
            
            return [
                'success' => true,
                'data' => [
                    'client' => $client,
                    'practices' => $practices
                ]
            ];
            
        } catch (Exception $e) {
            error_log("Get client error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore nel recupero cliente'];
        }
    }
    
    // Create new client
    public function createClient($data) {
        try {
            $this->db->beginTransaction();
            
            // Check if progressivo_cliente already exists
            $checkSql = "SELECT id FROM clienti WHERE progressivo_cliente = ?";
            $existing = $this->db->fetchOne($checkSql, [$data['progressivo_cliente']]);
            
            if ($existing) {
                $this->db->rollback();
                return ['success' => false, 'message' => 'Progressivo cliente già esistente'];
            }
            
            $sql = "INSERT INTO clienti (progressivo_cliente, nome_completo, codice_fiscale, email, telefono, indirizzo) 
                    VALUES (?, ?, ?, ?, ?, ?)";
            
            $params = [
                $data['progressivo_cliente'],
                $data['nome_completo'],
                !empty($data['codice_fiscale']) ? strtoupper($data['codice_fiscale']) : null,
                $data['email'] ?? null,
                $data['telefono'] ?? null,
                $data['indirizzo'] ?? null
            ];
            
            $this->db->execute($sql, $params);
            $clientId = $this->db->lastInsertId();
            
            $this->db->commit();
            
            return [
                'success' => true,
                'message' => 'Cliente creato con successo',
                'data' => ['id' => $clientId]
            ];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Create client error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore nella creazione cliente'];
        }
    }
    
    // Update client
    public function updateClient($id, $data) {
        try {
            $this->db->beginTransaction();
            
            // Check if client exists
            $existing = $this->db->fetchOne("SELECT id FROM clienti WHERE id = ?", [$id]);
            if (!$existing) {
                $this->db->rollback();
                return ['success' => false, 'message' => 'Cliente non trovato'];
            }
            
            $sql = "UPDATE clienti SET 
                    progressivo_cliente = ?, 
                    nome_completo = ?, 
                    codice_fiscale = ?, 
                    email = ?, 
                    telefono = ?, 
                    indirizzo = ?,
                    updated_at = NOW()
                    WHERE id = ?";
            
            $params = [
                $data['progressivo_cliente'],
                $data['nome_completo'],
                !empty($data['codice_fiscale']) ? strtoupper($data['codice_fiscale']) : null,
                $data['email'] ?? null,
                $data['telefono'] ?? null,
                $data['indirizzo'] ?? null,
                $id
            ];
            
            $this->db->execute($sql, $params);
            $this->db->commit();
            
            return ['success' => true, 'message' => 'Cliente aggiornato con successo'];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Update client error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore nell\'aggiornamento cliente'];
        }
    }
    
    // Delete client
    public function deleteClient($id) {
        try {
            $this->db->beginTransaction();
            
            // Check if client has practices
            $practicesCount = $this->db->fetchOne(
                "SELECT COUNT(*) as count FROM pratiche WHERE cliente_id = ?", 
                [$id]
            );
            
            if ($practicesCount['count'] > 0) {
                $this->db->rollback();
                return ['success' => false, 'message' => 'Impossibile eliminare: cliente ha pratiche associate'];
            }
            
            $this->db->execute("DELETE FROM clienti WHERE id = ?", [$id]);
            $this->db->commit();
            
            return ['success' => true, 'message' => 'Cliente eliminato con successo'];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Delete client error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore nell\'eliminazione cliente'];
        }
    }
    
    // Import clients from CSV data
    public function importFromCsv($csvData) {
        try {
            $this->db->beginTransaction();
            
            $imported = 0;
            $errors = [];
            
            foreach ($csvData as $rowIndex => $row) {
                try {
                    // Skip empty rows
                    if (empty($row[0]) && empty($row[2])) continue;
                    
                    $progressivo = (int)$row[0];
                    $nome_completo = trim($row[2]);
                    
                    if (empty($progressivo) || empty($nome_completo)) {
                        $errors[] = "Riga " . ($rowIndex + 1) . ": Dati obbligatori mancanti";
                        continue;
                    }
                    
                    // Check if client already exists
                    $existing = $this->db->fetchOne(
                        "SELECT id FROM clienti WHERE progressivo_cliente = ?", 
                        [$progressivo]
                    );
                    
                    if (!$existing) {
                        $sql = "INSERT INTO clienti (progressivo_cliente, nome_completo) VALUES (?, ?)";
                        $this->db->execute($sql, [$progressivo, $nome_completo]);
                        $imported++;
                    }
                    
                } catch (Exception $e) {
                    $errors[] = "Riga " . ($rowIndex + 1) . ": " . $e->getMessage();
                }
            }
            
            $this->db->commit();
            
            return [
                'success' => true,
                'message' => "Importazione completata: $imported clienti importati",
                'data' => [
                    'imported' => $imported,
                    'errors' => $errors
                ]
            ];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Import CSV error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore durante l\'importazione'];
        }
    }
}
?>