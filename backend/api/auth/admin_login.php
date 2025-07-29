<?php
// api/auth/admin_login.php - Versione ultra-semplificata

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://dashboard.intutela.it');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Only POST allowed']);
    exit();
}

try {
    // Get input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'No JSON data received', 'raw_input' => $input]);
        exit();
    }
    
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    
    // Simple hardcoded check for testing
    if ($username === 'admin' && $password === 'password123') {
        session_start();
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_id'] = 1;
        $_SESSION['admin_username'] = 'admin';
        
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'id' => 1,
                'username' => 'admin',
                'nome' => 'Admin',
                'ruolo' => 'super_admin'
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false, 
            'message' => 'Invalid credentials',
            'debug' => ['username' => $username, 'password_length' => strlen($password)]
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>