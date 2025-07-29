<?php
// api/shared/stati.php

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
    
    $sql = "SELECT id, nome, colore FROM stati_pratiche ORDER BY nome ASC";
    $stati = $db->fetchAll($sql);
    
    successResponse($stati);
    
} catch (Exception $e) {
    error_log("Stati API error: " . $e->getMessage());
    errorResponse('Errore del server', 500);
}
?>