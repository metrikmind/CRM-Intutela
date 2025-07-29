<?php
// api/auth/logout.php

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../classes/Auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Metodo non consentito', 405);
}

try {
    $auth = new Auth();
    $result = $auth->logout();
    
    successResponse([], $result['message']);
    
} catch (Exception $e) {
    error_log("Logout API error: " . $e->getMessage());
    errorResponse('Errore del server', 500);
}
?>