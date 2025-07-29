<?php
// api/auth/cliente_login.php

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../classes/Auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Metodo non consentito', 405);
}

try {
    $input = getJsonInput();
    
    // Validate input
    if (empty($input['codice_fiscale']) || empty($input['password'])) {
        errorResponse('Codice fiscale e password sono obbligatori');
    }
    
    $auth = new Auth();
    $result = $auth->loginCliente($input['codice_fiscale'], $input['password']);
    
    if ($result['success']) {
        successResponse($result['data'], $result['message']);
    } else {
        errorResponse($result['message'], 401);
    }
    
} catch (Exception $e) {
    error_log("Client login API error: " . $e->getMessage());
    errorResponse('Errore del server', 500);
}
?>