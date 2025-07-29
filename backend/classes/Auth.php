<?php
// classes/Auth.php

require_once '../config/database.php';

class Auth {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    // Admin login
    public function loginAdmin($username, $password) {
        try {
            $sql = "SELECT id, username, email, password_hash, nome, cognome, ruolo, attivo 
                    FROM amministratori 
                    WHERE (username = ? OR email = ?) AND attivo = 'Si'";
            
            $admin = $this->db->fetchOne($sql, [$username, $username]);
            
            if (!$admin) {
                return ['success' => false, 'message' => 'Credenziali non valide'];
            }
            
            if (!password_verify($password, $admin['password_hash'])) {
                return ['success' => false, 'message' => 'Credenziali non valide'];
            }
            
            // Update last access
            $this->db->execute(
                "UPDATE amministratori SET ultimo_accesso = NOW() WHERE id = ?", 
                [$admin['id']]
            );
            
            // Set session
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_username'] = $admin['username'];
            $_SESSION['admin_nome'] = $admin['nome'] . ' ' . $admin['cognome'];
            $_SESSION['admin_ruolo'] = $admin['ruolo'];
            
            // Log activity
            logActivity($admin['id'], 'admin', 'login', 'Login amministratore');
            
            unset($admin['password_hash']);
            
            return [
                'success' => true, 
                'message' => 'Login effettuato con successo',
                'data' => $admin
            ];
            
        } catch (Exception $e) {
            error_log("Admin login error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore durante il login'];
        }
    }
    
    // Client login
    public function loginCliente($codice_fiscale, $password) {
        try {
            $sql = "SELECT id, progressivo_cliente, nome_completo, codice_fiscale, email, telefono 
                    FROM clienti 
                    WHERE codice_fiscale = ? AND password_hash IS NOT NULL";
            
            $cliente = $this->db->fetchOne($sql, [strtoupper($codice_fiscale)]);
            
            if (!$cliente) {
                return ['success' => false, 'message' => 'Codice fiscale non trovato o accesso non attivato'];
            }
            
            // Get password hash
            $hash_sql = "SELECT password_hash FROM clienti WHERE id = ?";
            $hash_result = $this->db->fetchOne($hash_sql, [$cliente['id']]);
            
            if (!password_verify($password, $hash_result['password_hash'])) {
                return ['success' => false, 'message' => 'Password non valida'];
            }
            
            // Set session
            $_SESSION['cliente_logged_in'] = true;
            $_SESSION['cliente_id'] = $cliente['id'];
            $_SESSION['cliente_nome'] = $cliente['nome_completo'];
            $_SESSION['cliente_cf'] = $cliente['codice_fiscale'];
            
            // Log activity
            logActivity($cliente['id'], 'cliente', 'login', 'Login cliente');
            
            return [
                'success' => true, 
                'message' => 'Login effettuato con successo',
                'data' => $cliente
            ];
            
        } catch (Exception $e) {
            error_log("Client login error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore durante il login'];
        }
    }
    
    // Generate password for client
    public function generateClientPassword($cliente_id) {
        try {
            $password = $this->generateRandomPassword();
            $hash = password_hash($password, PASSWORD_DEFAULT);
            
            $this->db->execute(
                "UPDATE clienti SET password_hash = ? WHERE id = ?", 
                [$hash, $cliente_id]
            );
            
            return ['success' => true, 'password' => $password];
            
        } catch (Exception $e) {
            error_log("Generate password error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Errore generazione password'];
        }
    }
    
    // Generate random password
    private function generateRandomPassword($length = 8) {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return substr(str_shuffle($chars), 0, $length);
    }
    
    // Check admin authentication
    public function checkAdminAuth() {
        return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
    }
    
    // Check client authentication
    public function checkClientAuth() {
        return isset($_SESSION['cliente_logged_in']) && $_SESSION['cliente_logged_in'] === true;
    }
    
    // Get current admin
    public function getCurrentAdmin() {
        if (!$this->checkAdminAuth()) {
            return null;
        }
        
        return [
            'id' => $_SESSION['admin_id'],
            'username' => $_SESSION['admin_username'],
            'nome' => $_SESSION['admin_nome'],
            'ruolo' => $_SESSION['admin_ruolo']
        ];
    }
    
    // Get current client
    public function getCurrentClient() {
        if (!$this->checkClientAuth()) {
            return null;
        }
        
        return [
            'id' => $_SESSION['cliente_id'],
            'nome' => $_SESSION['cliente_nome'],
            'codice_fiscale' => $_SESSION['cliente_cf']
        ];
    }
    
    // Logout
    public function logout() {
        session_destroy();
        return ['success' => true, 'message' => 'Logout effettuato con successo'];
    }
}
?>