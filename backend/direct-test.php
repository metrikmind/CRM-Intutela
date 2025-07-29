<?php
// direct-test.php - Test senza .htaccess (salvare in backend/)

// Mostra tutti gli errori
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Headers di base
header('Content-Type: text/html; charset=utf-8');

echo "<h1>Test Diretto PHP</h1>";
echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";
echo "<p><strong>Server Time:</strong> " . date('Y-m-d H:i:s') . "</p>";
echo "<p><strong>Document Root:</strong> " . $_SERVER['DOCUMENT_ROOT'] . "</p>";
echo "<p><strong>Script Name:</strong> " . $_SERVER['SCRIPT_NAME'] . "</p>";

echo "<h2>PHP Extensions</h2>";
$extensions = ['pdo', 'pdo_mysql', 'json', 'session', 'curl', 'openssl'];
foreach($extensions as $ext) {
    $status = extension_loaded($ext) ? '✅ Loaded' : '❌ Missing';
    echo "<p><strong>$ext:</strong> $status</p>";
}

echo "<h2>File Permissions Test</h2>";
$testDir = __DIR__ . '/uploads';
if (!is_dir($testDir)) {
    mkdir($testDir, 0755, true);
}
$canWrite = is_writable($testDir);
echo "<p><strong>Uploads writable:</strong> " . ($canWrite ? '✅ Yes' : '❌ No') . "</p>";

echo "<h2>Database Connection Test</h2>";
try {
    $pdo = new PDO(
        'mysql:host=localhost;dbname=intutela-it9f5d_2;charset=utf8mb4',
        'intutela-it9f5d', 
        'hE.k._-1OS0l4wXw',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "<p>✅ Database connection successful</p>";
    
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "<p><strong>Tables found:</strong> " . count($tables) . "</p>";
    
    if (in_array('amministratori', $tables)) {
        $stmt = $pdo->query("SELECT COUNT(*) FROM amministratori");
        $adminCount = $stmt->fetchColumn();
        echo "<p><strong>Admin users:</strong> $adminCount</p>";
    }
    
} catch (Exception $e) {
    echo "<p>❌ Database error: " . $e->getMessage() . "</p>";
}

echo "<h2>Request Info</h2>";
echo "<p><strong>Request Method:</strong> " . $_SERVER['REQUEST_METHOD'] . "</p>";
echo "<p><strong>HTTP Host:</strong> " . $_SERVER['HTTP_HOST'] . "</p>";
echo "<p><strong>Request URI:</strong> " . $_SERVER['REQUEST_URI'] . "</p>";

phpinfo();
?>