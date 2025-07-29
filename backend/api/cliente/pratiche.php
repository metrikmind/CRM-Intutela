<?php
// api/cliente/pratiche.php

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../classes/Auth.php';
require_once '../../classes/Pratica.php';

// Check client authentication
$auth = new Auth();
if (!$auth->checkClientAuth()) {
    errorResponse('Accesso non autorizzato', 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Metodo non consentito', 405);
}

try {
    $currentClient = $auth->getCurrentClient();
    $pratica = new Pratica();
    
    if (isset($_GET['id'])) {
        // Get single practice - verify ownership
        $result = $pratica->getPracticeById($_GET['id']);
        
        if ($result['success']) {
            $practice = $result['data']['practice'];
            
            if ($practice['cliente_id'] != $currentClient['id']) {
                errorResponse('Accesso negato alla pratica', 403);
            }
            
            // Only show client-visible documents
            $documents = array_filter(
                $result['data']['documents'], 
                fn($doc) => $doc['visibile_cliente'] === 'Si'
            );
            
            $result['data']['documents'] = $documents;
        }
    } else {
        // Get all client practices
        $result = $pratica->getClientPractices($currentClient['id']);
    }
    
    if ($result['success']) {
        successResponse($result['data']);
    } else {
        errorResponse($result['message']);
    }
    
} catch (Exception $e) {
    error_log("Client practices API error: " . $e->getMessage());
    errorResponse('Errore del server', 500);
}
?>