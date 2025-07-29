<?php
// simple-test.php - Test basico PHP (salvare in backend/)

// Show all errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Basic headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'status' => 'PHP is working',
    'php_version' => phpversion(),
    'server_time' => date('Y-m-d H:i:s'),
    'memory_limit' => ini_get('memory_limit'),
    'extensions' => [
        'pdo' => extension_loaded('pdo'),
        'pdo_mysql' => extension_loaded('pdo_mysql'),
        'json' => extension_loaded('json'),
        'session' => extension_loaded('session')
    ]
]);
?>