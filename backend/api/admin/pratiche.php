<?php
// api/admin/pratiche.php

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../classes/Auth.php';
require_once '../../classes/Pratica.php';

// Check admin authentication
$auth = new Auth();
if (!$auth->checkAdminAuth()) {
    errorResponse('Accesso non autorizzato', 401);
}

$pratica = new Pratica();
$currentAdmin = $auth->getCurrentAdmin();

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Get single practice
                $result = $pratica->getPracticeById($_GET['id']);
            } else {
                // Get all practices with filters
                $page = (int)($_GET['page'] ?? 1);
                $limit = (int)($_GET['limit'] ?? 50);
                
                $filters = [
                    'search' => $_GET['search'] ?? '',
                    'stato_pratica_id' => $_GET['stato_pratica_id'] ?? '',
                    'banca_id' => $_GET['banca_id'] ?? '',
                    'cliente_id' => $_GET['cliente_id'] ?? '',
                ];
                
                $result = $pratica->getAllPractices($page, $limit, $filters);
            }
            break;
            
        case 'POST':
            $input = getJsonInput();
            $result = $pratica->createPractice($input);
            
            if ($result['success']) {
                logActivity($currentAdmin['id'], 'admin', 'create_practice', 
                    'Creata pratica: ' . $input['numero_contratto']);
            }
            break;
            
        case 'PUT':
            if (!isset($_GET['id'])) {
                errorResponse('ID pratica richiesto');
            }
            
            $input = getJsonInput();
            $result = $pratica->updatePractice($_GET['id'], $input);
            
            if ($result['success']) {
                logActivity($currentAdmin['id'], 'admin', 'update_practice', 
                    'Aggiornata pratica ID: ' . $_GET['id']);
            }
            break;
            
        case 'DELETE':
            if (!isset($_GET['id'])) {
                errorResponse('ID pratica richiesto');
            }
            
            $result = $pratica->deletePractice($_GET['id']);
            
            if ($result['success']) {
                logActivity($currentAdmin['id'], 'admin', 'delete_practice', 
                    'Eliminata pratica ID: ' . $_GET['id']);
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
    error_log("Pratiche API error: " . $e->getMessage());
    errorResponse('Errore del server', 500);
}
?>