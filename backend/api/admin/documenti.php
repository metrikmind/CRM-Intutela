<?php
// api/admin/documenti.php

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../classes/Auth.php';
require_once '../../classes/Documento.php';

// Check admin authentication
$auth = new Auth();
if (!$auth->checkAdminAuth()) {
    errorResponse('Accesso non autorizzato', 401);
}

$documento = new Documento();
$currentAdmin = $auth->getCurrentAdmin();

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if (isset($_GET['action']) && $_GET['action'] === 'download' && isset($_GET['id'])) {
                // Download document
                $result = $documento->downloadDocument($_GET['id'], 'admin');
                
                if ($result['success']) {
                    $file = $result['data'];
                    
                    header('Content-Type: ' . $file['mime_type']);
                    header('Content-Disposition: attachment; filename="' . $file['original_name'] . '"');
                    header('Content-Length: ' . filesize($file['file_path']));
                    
                    readfile($file['file_path']);
                    exit;
                } else {
                    errorResponse($result['message']);
                }
            } elseif (isset($_GET['pratica_id'])) {
                // Get documents by practice
                $result = $documento->getDocumentsByPractice($_GET['pratica_id']);
            } elseif (isset($_GET['id'])) {
                // Get single document
                $result = $documento->getDocumentById($_GET['id']);
            } else {
                // Get all documents with pagination
                $page = (int)($_GET['page'] ?? 1);
                $limit = (int)($_GET['limit'] ?? 50);
                $search = $_GET['search'] ?? '';
                
                $result = $documento->getAllDocuments($page, $limit, $search);
            }
            break;
            
        case 'POST':
            if (!isset($_FILES['document']) || !isset($_POST['pratica_id'])) {
                errorResponse('File e ID pratica richiesti');
            }
            
            $pratica_id = (int)$_POST['pratica_id'];
            $visibile_cliente = $_POST['visibile_cliente'] ?? 'Si';
            $descrizione = $_POST['descrizione'] ?? null;
            
            $result = $documento->uploadDocument($pratica_id, $_FILES['document'], $visibile_cliente, $descrizione);
            
            if ($result['success']) {
                logActivity($currentAdmin['id'], 'admin', 'upload_document', 
                    'Caricato documento per pratica ID: ' . $pratica_id);
            }
            break;
            
        case 'PUT':
            if (!isset($_GET['id'])) {
                errorResponse('ID documento richiesto');
            }
            
            $input = getJsonInput();
            $result = $documento->updateDocument($_GET['id'], $input);
            
            if ($result['success']) {
                logActivity($currentAdmin['id'], 'admin', 'update_document', 
                    'Aggiornato documento ID: ' . $_GET['id']);
            }
            break;
            
        case 'DELETE':
            if (!isset($_GET['id'])) {
                errorResponse('ID documento richiesto');
            }
            
            $result = $documento->deleteDocument($_GET['id']);
            
            if ($result['success']) {
                logActivity($currentAdmin['id'], 'admin', 'delete_document', 
                    'Eliminato documento ID: ' . $_GET['id']);
            }
            break;
            
        default:
            errorResponse('Metodo non consentito', 405);
    }
    
    if ($result['success']) {
        successResponse($result['data'] ?? [], $result['message']);
    } else {
        errorResponse($result['message']);
    }
    
} catch (Exception $e) {
    error_log("Documenti API error: " . $e->getMessage());
    errorResponse('Errore del server', 500);
}
?>