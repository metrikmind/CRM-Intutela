<?php
// api/admin/clienti.php

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../classes/Auth.php';
require_once '../../classes/Cliente.php';

// Check admin authentication
$auth = new Auth();
if (!$auth->checkAdminAuth()) {
    errorResponse('Accesso non autorizzato', 401);
}

$cliente = new Cliente();
$currentAdmin = $auth->getCurrentAdmin();

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Get single client
                $result = $cliente->getClientById($_GET['id']);
            } else {
                // Get all clients with pagination
                $page = (int)($_GET['page'] ?? 1);
                $limit = (int)($_GET['limit'] ?? 50);
                $search = $_GET['search'] ?? '';
                
                $result = $cliente->getAllClients($page, $limit, $search);
            }
            break;
            
        case 'POST':
            $input = getJsonInput();
            $result = $cliente->createClient($input);
            
            if ($result['success']) {
                logActivity($currentAdmin['id'], 'admin', 'create_client', 
                    'Creato cliente: ' . $input['nome_completo']);
            }
            break;
            
        case 'PUT':
            if (!isset($_GET['id'])) {
                errorResponse('ID cliente richiesto');
            }
            
            $input = getJsonInput();
            $result = $cliente->updateClient($_GET['id'], $input);
            
            if ($result['success']) {
                logActivity($currentAdmin['id'], 'admin', 'update_client', 
                    'Aggiornato cliente ID: ' . $_GET['id']);
            }
            break;
            
        case 'DELETE':
            if (!isset($_GET['id'])) {
                errorResponse('ID cliente richiesto');
            }
            
            $result = $cliente->deleteClient($_GET['id']);
            
            if ($result['success']) {
                logActivity($currentAdmin['id'], 'admin', 'delete_client', 
                    'Eliminato cliente ID: ' . $_GET['id']);
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
    error_log("Clienti API error: " . $e->getMessage());
    errorResponse('Errore del server', 500);
}
?>