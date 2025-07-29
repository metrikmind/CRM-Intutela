<?php
// api/admin/import_csv.php

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../classes/Auth.php';
require_once '../../classes/Cliente.php';
require_once '../../classes/Pratica.php';

// Check admin authentication
$auth = new Auth();
if (!$auth->checkAdminAuth()) {
    errorResponse('Accesso non autorizzato', 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Metodo non consentito', 405);
}

try {
    // Check if file was uploaded
    if (!isset($_FILES['csv_file']) || $_FILES['csv_file']['error'] !== UPLOAD_ERR_OK) {
        errorResponse('Nessun file CSV caricato');
    }
    
    $file = $_FILES['csv_file'];
    
    // Validate file type
    $allowedTypes = ['text/csv', 'application/csv', 'text/plain'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes) && pathinfo($file['name'], PATHINFO_EXTENSION) !== 'csv') {
        errorResponse('Formato file non valido. Caricare solo file CSV.');
    }
    
    // Read CSV file
    $csvData = [];
    if (($handle = fopen($file['tmp_name'], 'r')) !== FALSE) {
        while (($data = fgetcsv($handle, 1000, ',')) !== FALSE) {
            $csvData[] = $data;
        }
        fclose($handle);
    } else {
        errorResponse('Impossibile leggere il file CSV');
    }
    
    if (empty($csvData)) {
        errorResponse('File CSV vuoto');
    }
    
    // Get import type from request
    $importType = $_POST['import_type'] ?? 'practices';
    
    if ($importType === 'clients') {
        $cliente = new Cliente();
        $result = $cliente->importFromCsv($csvData);
    } elseif ($importType === 'practices') {
        $pratica = new Pratica();
        $result = $pratica->importFromCsv($csvData);
    } else {
        errorResponse('Tipo di importazione non valido');
    }
    
    // Log activity
    $currentAdmin = $auth->getCurrentAdmin();
    logActivity(
        $currentAdmin['id'], 
        'admin', 
        'import_csv', 
        "Importazione $importType: " . ($result['data']['imported'] ?? 0) . " record"
    );
    
    if ($result['success']) {
        successResponse($result['data'], $result['message']);
    } else {
        errorResponse($result['message']);
    }
    
} catch (Exception $e) {
    error_log("Import CSV API error: " . $e->getMessage());
    errorResponse('Errore durante l\'importazione', 500);
}
?>