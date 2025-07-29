<?php
// direct-login.php - Login diretto senza routing (salvare in backend/)

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// CORS Headers
header('Access-Control-Allow-Origin: https://dashboard.intutela.it');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Handle OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Show test page for GET requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Direct Login Test</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .form { max-width: 400px; margin: 0 auto; }
            input { width: 100%; padding: 10px; margin: 10px 0; }
            button { width: 100%; padding: 15px; background: #007bff; color: white; border: none; }
        </style>
    </head>
    <body>
        <div class="form">
            <h2>Direct Login Test</h2>
            <form id="loginForm">
                <input type="text" id="username" placeholder="Username" value="admin">
                <input type="password" id="password" placeholder="Password" value="password123">
                <button type="submit">Test Login</button>
            </form>
            <div id="result"></div>
        </div>

        <script>
        document.getElementById('loginForm').onsubmit = function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            fetch('direct-login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username, password})
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('result').innerHTML = 
                    '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            })
            .catch(error => {
                document.getElementById('result').innerHTML = 
                    '<p style="color: red;">Error: ' + error + '</p>';
            });
        };
        </script>
    </body>
    </html>
    <?php
    exit();
}

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get JSON input
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode([
                'success' => false, 
                'message' => 'JSON Error: ' . json_last_error_msg(),
                'raw_input' => $input
            ]);
            exit();
        }
        
        $username = trim($data['username'] ?? '');
        $password = $data['password'] ?? '';
        
        if (empty($username) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'Username and password required']);
            exit();
        }
        
        // Database connection
        $pdo = new PDO(
            'mysql:host=localhost;dbname=intutela-it9f5d_2;charset=utf8mb4',
            'intutela-it9f5d',
            'hE.k._-1OS0l4wXw',
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );
        
        // Find admin
        $stmt = $pdo->prepare("SELECT * FROM amministratori WHERE username = ? OR email = ?");
        $stmt->execute([$username, $username]);
        $admin = $stmt->fetch();
        
        if (!$admin) {
            echo json_encode(['success' => false, 'message' => 'User not found']);
            exit();
        }
        
        // Check password
        if (!password_verify($password, $admin['password_hash'])) {
            echo json_encode(['success' => false, 'message' => 'Invalid password']);
            exit();
        }
        
        // Success
        session_start();
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_id'] = $admin['id'];
        $_SESSION['admin_username'] = $admin['username'];
        
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'id' => $admin['id'],
                'username' => $admin['username'],
                'nome' => $admin['nome'],
                'cognome' => $admin['cognome'],
                'ruolo' => $admin['ruolo']
            ]
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage(),
            'debug' => [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]
        ]);
    }
}
?>