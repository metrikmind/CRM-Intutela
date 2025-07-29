<?php
// db-test.php - Test connessione database (salvare in backend/)

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    echo json_encode(['step' => 1, 'message' => 'Starting database test']);
    
    $host = 'localhost';
    $dbname = 'intutela-it9f5d_2';
    $username = 'intutela-it9f5d';
    $password = 'hE.k._-1OS0l4wXw';
    
    echo json_encode(['step' => 2, 'message' => 'Connecting to database']);
    
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    echo json_encode(['step' => 3, 'message' => 'Database connected successfully']);
    
    // Test query
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo json_encode([
        'success' => true,
        'message' => 'Database test completed',
        'tables_count' => count($tables),
        'tables' => $tables
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>