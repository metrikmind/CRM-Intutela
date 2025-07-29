<?php
// api/cliente/documenti.php

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../classes/Auth.php';
require_once '../../classes/Documento.php';

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
    $documento = new Documento();
    
    if (isset($_GET['action']) && $_GET['action'] === 'download' && isset($_GET['id'])) {
        // Download document
        $result = $documento->downloadDocument($_GET['id'], 'cliente', $currentClient['id']);
        
        if ($result['success']) {
            $file = $result['data'];
            
            // Log download activity
            logActivity($currentClient['id'], 'cliente', 'download_document', 
                'Download documento ID: ' . $_GET['id']);
            
            header('Content-Type: ' . $file['mime_type']);
            header('Content-Disposition: attachment; filename="' . $file['original_name'] . '"');
            header('Content-Length: ' . filesize($file['file_path']));
            
            readfile($file['file_path']);
            exit;
        } else {
            errorResponse($result['message']);
        }
    } else {
        // Get all client documents
        $result = $documento->getClientDocuments($currentClient['id']);
    }
    
    if ($result['success']) {
        successResponse($result['data']);
    } else {
        errorResponse($result['message']);
    }
    
} catch (Exception $e) {
    error_log("Client documents API error: " . $e->getMessage());
    errorResponse('Errore del server', 500);
}
?>