<?php
// test.php - File di test backend (creare nella root backend/)

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: https://dashboard.intutela.it');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Test 1: PHP funziona
    $phpVersion = phpversion();
    
    // Test 2: Database connection
    $dbTest = false;
    $dbError = '';
    
    try {
        $pdo = new PDO(
            'mysql:host=localhost;dbname=intutela-it9f5d_2;charset=utf8mb4',
            'intutela-it9f5d',
            'hE.k._-1OS0l4wXw',
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        $dbTest = true;
    } catch (Exception $e) {
        $dbError = $e->getMessage();
    }
    
    // Test 3: Check admin table
    $adminTest = false;
    $adminCount = 0;
    
    if ($dbTest) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) FROM amministratori");
            $adminCount = $stmt->fetchColumn();
            $adminTest = true;
        } catch (Exception $e) {
            $adminTest = false;
        }
    }
    
    // Test 4: File permissions
    $uploadsWritable = is_writable(__DIR__ . '/uploads/documenti');
    
    echo json_encode([
        'success' => true,
        'message' => 'Backend test completato',
        'tests' => [
            'php_version' => $phpVersion,
            'database_connection' => $dbTest,
            'database_error' => $dbError,
            'admin_table' => $adminTest,
            'admin_count' => $adminCount,
            'uploads_writable' => $uploadsWritable,
            'server_time' => date('Y-m-d H:i:s'),
            'request_method' => $_SERVER['REQUEST_METHOD'],
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown'
        ]
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_PRETTY_PRINT);
}
?>