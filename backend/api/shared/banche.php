<?php
// api/shared/banche.php

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../classes/Auth.php';

// Check authentication (both admin and client can access)
$auth = new Auth();
if (!$auth->checkAdminAuth() && !$auth->checkClientAuth()) {
    errorResponse('Accesso non autorizzato', 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Metodo non consentito', 405);
}

try {
    $db = Database::getInstance();
    
    $search = $_GET['search'] ?? '';
    $limit = (int)($_GET['limit'] ?? 100);
    
    $where = '';
    $params = [];
    
    if (!empty($search)) {
        $where = 'WHERE nome LIKE ?';
        $params[] = '%' . $search . '%';
    }
    
    $sql = "SELECT id, nome FROM banche $where ORDER BY nome ASC";
    
    if ($limit > 0) {
        $sql .= " LIMIT $limit";
    }
    
    $banche = $db->fetchAll($sql, $params);
    
    successResponse($banche);
    
} catch (Exception $e) {
    error_log("Banche API error: " . $e->getMessage());
    errorResponse('Errore del server', 500);
}
?>