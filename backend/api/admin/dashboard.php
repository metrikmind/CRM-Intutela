<?php
// api/admin/dashboard.php

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../classes/Auth.php';
require_once '../../classes/Pratica.php';

// Check admin authentication
$auth = new Auth();
if (!$auth->checkAdminAuth()) {
    errorResponse('Accesso non autorizzato', 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Metodo non consentito', 405);
}

try {
    $pratica = new Pratica();
    $result = $pratica->getDashboardStats();
    
    if ($result['success']) {
        successResponse($result['data']);
    } else {
        errorResponse($result['message']);
    }
    
} catch (Exception $e) {
    error_log("Dashboard API error: " . $e->getMessage());
    errorResponse('Errore del server', 500);
}
?>