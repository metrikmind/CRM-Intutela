<?php
// classes/Pratica.php

require_once '../config/database.php';

class Pratica {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    // Get all practices with filters
    public function getAllPractices($page = 1, $limit = 50, $filters = []) {
        try {
            $offset = ($page - 1) * $limit;
            
            $where = ['1=1'];
            $params = [];
            
            // Apply filters
            if (!empty($filters['search'])) {
                $where[] = "(c.nome_completo LIKE ? OR p.numero_contratto LIKE ? OR b.nome LIKE ?)";
                $searchParam = '%' . $filters['search'] . '%';
                $params = array_merge($params, [$searchParam, $searchParam, $searchParam]);
            }
            
            if (!empty($filters['stato_pratica_id'])) {
                $where[] = "p.stato_pratica_id = ?";
                $params[] = $filters['stato_pratica_id'];
            }
            
            if (!empty($filters['banca_id'])) {
                $where[] = "p.banca_id = ?";
                $params[] = $filters['banca_id'];
            }
            
            if (!empty($filters['cliente_id'])) {
                $where[] = "p.cliente_id = ?";
                $params[] = $filters['cliente_id'];
            }
            
            $whereClause = implode(' AND ', $where);
            
            // Get total count
            $countSql = "SELECT COUNT(*) as total 
                        FROM pratiche p 
                        LEFT JOIN clienti c ON p.cliente_id = c.id 
                        LEFT JOIN banche b ON p.banca_id = b.id 
                        WHERE $whereClause";
            
            $totalResult = $this->db->fetchOne($countSql, $params);
            $total = $totalResult['total'];
            
            // Get practices
            $sql = "SELECT p.*, c.nome_completo as cliente_nome, c.progressivo_cliente,
                           s.nome as stato_nome, s.colore as stato_colore,
                           b.nome as banca_nome,
                           COUNT(d.id) as num_documenti
                    FROM pratiche p
                    LEFT JOIN clienti c ON p.cliente_id = c.id
                    LEFT JOIN stati_pratiche s ON p.stato_pratica_id = s.id
                    LEFT JOIN banche b ON p.banca_id = b.id
                    LEFT JOIN documenti d ON p.id = d.pratica_id
                    WHERE $whereClause
                    GROUP BY p.id
                    ORDER BY p.updated_at DESC
                    LIMIT $limit OFFSET $offset";
            
            $practices = $this->db->fetchAll($sql, $params);
            
            return [
                'success' => true,
                'data' => [
                    'practices' => $practices,
                    'pagination' => [
                        'current_page' => $page,
                        'total_pages' => ceil($total / $limit),
                        'total_records' => $total,
                        'per_page' => $limit
                    ]
                ]
            ];
            
        } catch (Exception $e) {
            error_log("Get practices error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore nel recupero pratiche'];
        }
    }
    
    // Get practice by ID with full details
    public function getPracticeById($id) {
        try {
            $sql = "SELECT p.*, c.nome_completo as cliente_nome, c.progressivo_cliente, c.codice_fiscale,
                           s.nome as stato_nome, s.colore as stato_colore,
                           b.nome as banca_nome
                    FROM pratiche p
                    LEFT JOIN clienti c ON p.cliente_id = c.id
                    LEFT JOIN stati_pratiche s ON p.stato_pratica_id = s.id
                    LEFT JOIN banche b ON p.banca_id = b.id
                    WHERE p.id = ?";
            
            $practice = $this->db->fetchOne($sql, [$id]);
            
            if (!$practice) {
                return ['success' => false, 'message' => 'Pratica non trovata'];
            }
            
            // Get documents
            $docsSql = "SELECT * FROM documenti WHERE pratica_id = ? ORDER BY created_at DESC";
            $documents = $this->db->fetchAll($docsSql, [$id]);
            
            return [
                'success' => true,
                'data' => [
                    'practice' => $practice,
                    'documents' => $documents
                ]
            ];
            
        } catch (Exception $e) {
            error_log("Get practice error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore nel recupero pratica'];
        }
    }
    
    // Create new practice
    public function createPractice($data) {
        try {
            $this->db->beginTransaction();
            
            // Validate client exists
            $client = $this->db->fetchOne("SELECT id FROM clienti WHERE id = ?", [$data['cliente_id']]);
            if (!$client) {
                $this->db->rollback();
                return ['success' => false, 'message' => 'Cliente non trovato'];
            }
            
            $sql = "INSERT INTO pratiche (
                        cliente_id, numero_contratto, data_mandato, data_contratto, durata_contratto,
                        banca_id, percentuale_mandato, euro_incasso, stato_pratica_id, importo_reclamo,
                        proposta_intutela, proposta_banca, accettazione_banca, modalita_incasso,
                        chi_incassa, quietanza_incasso, data_pec_accesso_atti, scadenza_accesso_atti,
                        data_pec_reclamo, scadenza_reclamo, procura_ricorso, note
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $params = [
                $data['cliente_id'],
                $data['numero_contratto'],
                !empty($data['data_mandato']) ? $data['data_mandato'] : null,
                !empty($data['data_contratto']) ? $data['data_contratto'] : null,
                !empty($data['durata_contratto']) ? (int)$data['durata_contratto'] : null,
                !empty($data['banca_id']) ? $data['banca_id'] : null,
                $data['percentuale_mandato'] ?? 0.50,
                !empty($data['euro_incasso']) ? $data['euro_incasso'] : null,
                $data['stato_pratica_id'] ?? 1,
                !empty($data['importo_reclamo']) ? $data['importo_reclamo'] : null,
                !empty($data['proposta_intutela']) ? $data['proposta_intutela'] : null,
                !empty($data['proposta_banca']) ? $data['proposta_banca'] : null,
                $data['accettazione_banca'] ?? 'In attesa',
                $data['modalita_incasso'] ?? null,
                $data['chi_incassa'] ?? 'Associazione',
                $data['quietanza_incasso'] ?? 'No',
                !empty($data['data_pec_accesso_atti']) ? $data['data_pec_accesso_atti'] : null,
                !empty($data['scadenza_accesso_atti']) ? $data['scadenza_accesso_atti'] : null,
                !empty($data['data_pec_reclamo']) ? $data['data_pec_reclamo'] : null,
                !empty($data['scadenza_reclamo']) ? $data['scadenza_reclamo'] : null,
                $data['procura_ricorso'] ?? 'No',
                $data['note'] ?? null
            ];
            
            $this->db->execute($sql, $params);
            $practiceId = $this->db->lastInsertId();
            
            $this->db->commit();
            
            return [
                'success' => true,
                'message' => 'Pratica creata con successo',
                'data' => ['id' => $practiceId]
            ];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Create practice error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore nella creazione pratica'];
        }
    }
    
    // Update practice
    public function updatePractice($id, $data) {
        try {
            $this->db->beginTransaction();
            
            // Check if practice exists
            $existing = $this->db->fetchOne("SELECT id FROM pratiche WHERE id = ?", [$id]);
            if (!$existing) {
                $this->db->rollback();
                return ['success' => false, 'message' => 'Pratica non trovata'];
            }
            
            $sql = "UPDATE pratiche SET 
                        numero_contratto = ?, data_mandato = ?, data_contratto = ?, durata_contratto = ?,
                        banca_id = ?, percentuale_mandato = ?, euro_incasso = ?, stato_pratica_id = ?, 
                        importo_reclamo = ?, proposta_intutela = ?, proposta_banca = ?, accettazione_banca = ?,
                        modalita_incasso = ?, chi_incassa = ?, quietanza_incasso = ?, data_pec_accesso_atti = ?,
                        scadenza_accesso_atti = ?, data_pec_reclamo = ?, scadenza_reclamo = ?, procura_ricorso = ?,
                        note = ?, updated_at = NOW()
                    WHERE id = ?";
            
            $params = [
                $data['numero_contratto'],
                !empty($data['data_mandato']) ? $data['data_mandato'] : null,
                !empty($data['data_contratto']) ? $data['data_contratto'] : null,
                !empty($data['durata_contratto']) ? (int)$data['durata_contratto'] : null,
                !empty($data['banca_id']) ? $data['banca_id'] : null,
                $data['percentuale_mandato'] ?? 0.50,
                !empty($data['euro_incasso']) ? $data['euro_incasso'] : null,
                $data['stato_pratica_id'],
                !empty($data['importo_reclamo']) ? $data['importo_reclamo'] : null,
                !empty($data['proposta_intutela']) ? $data['proposta_intutela'] : null,
                !empty($data['proposta_banca']) ? $data['proposta_banca'] : null,
                $data['accettazione_banca'] ?? 'In attesa',
                $data['modalita_incasso'] ?? null,
                $data['chi_incassa'] ?? 'Associazione',
                $data['quietanza_incasso'] ?? 'No',
                !empty($data['data_pec_accesso_atti']) ? $data['data_pec_accesso_atti'] : null,
                !empty($data['scadenza_accesso_atti']) ? $data['scadenza_accesso_atti'] : null,
                !empty($data['data_pec_reclamo']) ? $data['data_pec_reclamo'] : null,
                !empty($data['scadenza_reclamo']) ? $data['scadenza_reclamo'] : null,
                $data['procura_ricorso'] ?? 'No',
                $data['note'] ?? null,
                $id
            ];
            
            $this->db->execute($sql, $params);
            $this->db->commit();
            
            return ['success' => true, 'message' => 'Pratica aggiornata con successo'];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Update practice error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore nell\'aggiornamento pratica'];
        }
    }
    
    // Delete practice
    public function deletePractice($id) {
        try {
            $this->db->beginTransaction();
            
            // Delete associated documents first (files will be handled separately)
            $this->db->execute("DELETE FROM documenti WHERE pratica_id = ?", [$id]);
            
            // Delete practice
            $result = $this->db->execute("DELETE FROM pratiche WHERE id = ?", [$id]);
            
            if ($result === 0) {
                $this->db->rollback();
                return ['success' => false, 'message' => 'Pratica non trovata'];
            }
            
            $this->db->commit();
            
            return ['success' => true, 'message' => 'Pratica eliminata con successo'];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Delete practice error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore nell\'eliminazione pratica'];
        }
    }
    
    // Import practices from CSV
    public function importFromCsv($csvData) {
        try {
            $this->db->beginTransaction();
            
            $imported = 0;
            $errors = [];
            
            foreach ($csvData as $rowIndex => $row) {
                try {
                    // Skip empty rows or header
                    if ($rowIndex === 0 || empty($row[0]) || empty($row[2]) || empty($row[3])) continue;
                    
                    $progressivo_cliente = (int)$row[0];
                    $nome_cliente = trim($row[2]);
                    $numero_contratto = trim($row[3]);
                    
                    // Find or create client
                    $client = $this->db->fetchOne(
                        "SELECT id FROM clienti WHERE progressivo_cliente = ?", 
                        [$progressivo_cliente]
                    );
                    
                    if (!$client) {
                        // Create client
                        $this->db->execute(
                            "INSERT INTO clienti (progressivo_cliente, nome_completo) VALUES (?, ?)",
                            [$progressivo_cliente, $nome_cliente]
                        );
                        $cliente_id = $this->db->lastInsertId();
                    } else {
                        $cliente_id = $client['id'];
                    }
                    
                    // Find bank
                    $banca_id = null;
                    if (!empty($row[6])) {
                        $bank = $this->db->fetchOne("SELECT id FROM banche WHERE nome = ?", [trim($row[6])]);
                        $banca_id = $bank ? $bank['id'] : null;
                    }
                    
                    // Find status
                    $stato_pratica_id = 1; // Default
                    if (!empty($row[9])) {
                        $status = $this->db->fetchOne("SELECT id FROM stati_pratiche WHERE nome = ?", [trim($row[9])]);
                        $stato_pratica_id = $status ? $status['id'] : 1;
                    }
                    
                    // Check if practice already exists
                    $existing = $this->db->fetchOne(
                        "SELECT id FROM pratiche WHERE cliente_id = ? AND numero_contratto = ?",
                        [$cliente_id, $numero_contratto]
                    );
                    
                    if (!$existing) {
                        $sql = "INSERT INTO pratiche (
                                    cliente_id, numero_contratto, data_mandato, data_contratto, durata_contratto,
                                    banca_id, percentuale_mandato, euro_incasso, stato_pratica_id, importo_reclamo,
                                    proposta_intutela, proposta_banca, accettazione_banca, modalita_incasso,
                                    chi_incassa, quietanza_incasso, data_pec_accesso_atti, data_pec_reclamo,
                                    procura_ricorso, note
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                        
                        $params = [
                            $cliente_id,
                            $numero_contratto,
                            !empty($row[1]) ? date('Y-m-d', strtotime($row[1])) : null,
                            !empty($row[4]) ? date('Y-m-d', strtotime($row[4])) : null,
                            !empty($row[5]) ? (int)$row[5] : null,
                            $banca_id,
                            !empty($row[7]) ? (float)$row[7] : 0.50,
                            !empty($row[8]) ? (float)$row[8] : null,
                            $stato_pratica_id,
                            !empty($row[10]) ? (float)$row[10] : null,
                            !empty($row[11]) ? (float)$row[11] : null,
                            !empty($row[12]) ? (float)$row[12] : null,
                            !empty($row[13]) ? $row[13] : 'In attesa',
                            !empty($row[14]) ? $row[14] : null,
                            !empty($row[15]) ? $row[15] : 'Associazione',
                            !empty($row[16]) ? $row[16] : 'No',
                            !empty($row[17]) ? date('Y-m-d', strtotime($row[17])) : null,
                            !empty($row[19]) ? date('Y-m-d', strtotime($row[19])) : null,
                            !empty($row[21]) ? $row[21] : 'No',
                            !empty($row[22]) ? $row[22] : null
                        ];
                        
                        $this->db->execute($sql, $params);
                        $imported++;
                    }
                    
                } catch (Exception $e) {
                    $errors[] = "Riga " . ($rowIndex + 1) . ": " . $e->getMessage();
                }
            }
            
            $this->db->commit();
            
            return [
                'success' => true,
                'message' => "Importazione completata: $imported pratiche importate",
                'data' => [
                    'imported' => $imported,
                    'errors' => $errors
                ]
            ];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Import practices CSV error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore durante l\'importazione pratiche'];
        }
    }
    
    // Get practices for specific client (for client area)
    public function getClientPractices($cliente_id) {
        try {
            $sql = "SELECT p.*, s.nome as stato_nome, s.colore as stato_colore,
                           b.nome as banca_nome,
                           COUNT(d.id) as num_documenti
                    FROM pratiche p
                    LEFT JOIN stati_pratiche s ON p.stato_pratica_id = s.id
                    LEFT JOIN banche b ON p.banca_id = b.id
                    LEFT JOIN documenti d ON p.id = d.pratica_id AND d.visibile_cliente = 'Si'
                    WHERE p.cliente_id = ?
                    GROUP BY p.id
                    ORDER BY p.updated_at DESC";
            
            $practices = $this->db->fetchAll($sql, [$cliente_id]);
            
            return [
                'success' => true,
                'data' => $practices
            ];
            
        } catch (Exception $e) {
            error_log("Get client practices error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore nel recupero pratiche cliente'];
        }
    }
    
    // Get dashboard statistics
    public function getDashboardStats() {
        try {
            $stats = [];
            
            // Total practices
            $totalPractices = $this->db->fetchOne("SELECT COUNT(*) as count FROM pratiche");
            $stats['total_practices'] = $totalPractices['count'];
            
            // Total clients
            $totalClients = $this->db->fetchOne("SELECT COUNT(*) as count FROM clienti");
            $stats['total_clients'] = $totalClients['count'];
            
            // Practices by status
            $statusStats = $this->db->fetchAll("
                SELECT s.nome, s.colore, COUNT(p.id) as count
                FROM stati_pratiche s
                LEFT JOIN pratiche p ON s.id = p.stato_pratica_id
                GROUP BY s.id, s.nome, s.colore
                ORDER BY count DESC
            ");
            $stats['by_status'] = $statusStats;
            
            // Recent practices
            $recentPractices = $this->db->fetchAll("
                SELECT p.numero_contratto, c.nome_completo, s.nome as stato_nome, s.colore as stato_colore,
                       p.updated_at
                FROM pratiche p
                LEFT JOIN clienti c ON p.cliente_id = c.id
                LEFT JOIN stati_pratiche s ON p.stato_pratica_id = s.id
                ORDER BY p.updated_at DESC
                LIMIT 10
            ");
            $stats['recent_practices'] = $recentPractices;
            
            // Monthly stats
            $monthlyStats = $this->db->fetchAll("
                SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
                FROM pratiche
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month ASC
            ");
            $stats['monthly_stats'] = $monthlyStats;
            
            return [
                'success' => true,
                'data' => $stats
            ];
            
        } catch (Exception $e) {
            error_log("Get dashboard stats error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore nel recupero statistiche'];
        }
    }
}
?>