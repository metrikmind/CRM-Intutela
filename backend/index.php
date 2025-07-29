<?php
// index.php - Backend Entry Point

require_once 'config/cors.php';

// API Status endpoint
header('Content-Type: application/json');

$response = [
    'name' => 'InTutela CRM API',
    'version' => '1.0.0',
    'status' => 'running',
    'timestamp' => date('Y-m-d H:i:s'),
    'endpoints' => [
        'auth' => [
            'POST /api/auth/admin-login' => 'Admin login',
            'POST /api/auth/client-login' => 'Client login',  
            'POST /api/auth/logout' => 'Logout'
        ],
        'admin' => [
            'GET /api/admin/dashboard' => 'Dashboard statistics',
            'GET|POST|PUT|DELETE /api/admin/clients' => 'Clients management',
            'GET|POST|PUT|DELETE /api/admin/practices' => 'Practices management',
            'GET|POST|PUT|DELETE /api/admin/documents' => 'Documents management',
            'POST /api/admin/import-csv' => 'CSV import'
        ],
        'client' => [
            'GET /api/client/dashboard' => 'Client dashboard',
            'GET /api/client/practices' => 'Client practices',
            'GET /api/client/documents' => 'Client documents'
        ],
        'shared' => [
            'GET /api/shared/banks' => 'Banks list',
            'GET /api/shared/states' => 'Practice states'
        ]
    ]
];

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>