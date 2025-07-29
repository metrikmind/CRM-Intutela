<?php
// config/cors.php - VERSIONE CORRETTA PER dashboard.intutela.it

// Set CORS headers for API requests
header('Access-Control-Allow-Origin: https://dashboard.intutela.it');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

// Set timezone
date_default_timezone_set('Europe/Rome');

// Error reporting (disabilitare in produzione)
if (isset($_SERVER['HTTP_HOST']) && strpos($_SERVER['HTTP_HOST'], 'localhost') !== false) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    error_reporting(0);
}

// Session settings
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', isset($_SERVER['HTTPS']));

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Helper function for JSON responses
function jsonResponse($data, $status_code = 200) {
    http_response_code($status_code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

// Helper function for error responses
function errorResponse($message, $status_code = 400) {
    jsonResponse(['success' => false, 'message' => $message], $status_code);
}

// Helper function for success responses
function successResponse($data = [], $message = 'Operazione completata con successo') {
    jsonResponse(['success' => true, 'message' => $message, 'data' => $data]);
}

// Input sanitization
function sanitizeInput($input) {
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

// Get JSON input
function getJsonInput() {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        errorResponse('Invalid JSON format');
    }
    
    return $data ? sanitizeInput($data) : [];
}

// Log system activity
function logActivity($user_id, $user_type, $action, $details = null) {
    try {
        $db = Database::getInstance();
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        
        $sql = "INSERT INTO log_sistema (utente_id, utente_tipo, azione, dettagli, ip_address, user_agent) 
                VALUES (?, ?, ?, ?, ?, ?)";
        
        $db->execute($sql, [$user_id, $user_type, $action, $details, $ip, $user_agent]);
    } catch (Exception $e) {
        error_log("Error logging activity: " . $e->getMessage());
    }
}
?>