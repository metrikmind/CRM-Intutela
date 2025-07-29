<?php
// api/cliente/dashboard.php

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
    
    $result = $pratica->getClientPractices($currentClient['id']);
    
    if ($result['success']) {
        // Calculate summary stats for client
        $practices = $result['data'];
        $stats = [
            'total_practices' => count($practices),
            'completed' => count(array_filter($practices, fn($p) => $p['stato_nome'] === 'Già Rimborsato')),
            'in_progress' => count(array_filter($practices, fn($p) => !in_array($p['stato_nome'], ['Già Rimborsato', 'Annullata']))),
            'cancelled' => count(array_filter($practices, fn($p) => $p['stato_nome'] === 'Annullata')),
            'practices' => $practices
        ];
        
        successResponse($stats);
    } else {
        errorResponse($result['message']);
    }
    
} catch (Exception $e) {
    error_log("Client dashboard API error: " . $e->getMessage());
    errorResponse('Errore del server', 500);
}
?>