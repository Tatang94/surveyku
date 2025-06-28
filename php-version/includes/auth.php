<?php
/**
 * Authentication Functions
 * Survey Platform Indonesia - PHP Version
 */

require_once 'config/database.php';

class Auth {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function register($userData) {
        try {
            // Check if email already exists
            $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$userData['email']]);
            
            if ($stmt->fetch()) {
                return ['success' => false, 'message' => 'Email sudah terdaftar'];
            }
            
            // Hash password
            $hashedPassword = password_hash($userData['password'], PASSWORD_DEFAULT);
            
            // Calculate profile completeness
            $profileCompleteness = $this->calculateProfileCompleteness($userData);
            
            // Insert user
            $stmt = $this->db->prepare("
                INSERT INTO users (
                    email, password, name, phone, birth_date, gender, education, 
                    occupation, income, profile_completeness, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");
            
            $result = $stmt->execute([
                $userData['email'],
                $hashedPassword,
                $userData['name'],
                $userData['phone'] ?? null,
                $userData['birth_date'] ?? null,
                $userData['gender'] ?? null,
                $userData['education'] ?? null,
                $userData['occupation'] ?? null,
                $userData['income'] ?? null,
                $profileCompleteness
            ]);
            
            if ($result) {
                return ['success' => true, 'message' => 'Registrasi berhasil'];
            } else {
                return ['success' => false, 'message' => 'Gagal mendaftar'];
            }
            
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public function login($email, $password) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if ($user && password_verify($password, $user['password'])) {
                // Update last login
                $updateStmt = $this->db->prepare("UPDATE users SET updated_at = NOW() WHERE id = ?");
                $updateStmt->execute([$user['id']]);
                
                // Set session
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_email'] = $user['email'];
                $_SESSION['user_name'] = $user['name'];
                $_SESSION['login_time'] = time();
                
                return ['success' => true, 'user' => $user];
            } else {
                return ['success' => false, 'message' => 'Email atau password salah'];
            }
            
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public function logout() {
        session_destroy();
        return ['success' => true, 'message' => 'Logout berhasil'];
    }
    
    public function isLoggedIn() {
        return isset($_SESSION['user_id']) && 
               isset($_SESSION['login_time']) && 
               (time() - $_SESSION['login_time']) < SESSION_TIMEOUT;
    }
    
    public function getCurrentUser() {
        if (!$this->isLoggedIn()) {
            return null;
        }
        
        try {
            $stmt = $this->db->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            return $stmt->fetch();
        } catch (PDOException $e) {
            return null;
        }
    }
    
    public function requireLogin() {
        if (!$this->isLoggedIn()) {
            header('Location: login.php');
            exit;
        }
    }
    
    private function calculateProfileCompleteness($userData) {
        $fields = ['name', 'phone', 'birth_date', 'gender', 'education', 'occupation', 'income'];
        $completed = 1; // email is always required
        
        foreach ($fields as $field) {
            if (!empty($userData[$field])) {
                $completed++;
            }
        }
        
        return ($completed / (count($fields) + 1)) * 100;
    }
    
    public function getUserStats($userId) {
        try {
            // Get total earnings
            $stmt = $this->db->prepare("
                SELECT COALESCE(SUM(amount), 0) as total_earnings 
                FROM transactions 
                WHERE user_id = ? AND type = 'earning'
            ");
            $stmt->execute([$userId]);
            $totalEarnings = $stmt->fetch()['total_earnings'];
            
            // Get completed surveys count
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as completed_surveys 
                FROM user_surveys 
                WHERE user_id = ? AND status = 'completed'
            ");
            $stmt->execute([$userId]);
            $completedSurveys = $stmt->fetch()['completed_surveys'];
            
            // Get started surveys for completion rate
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as started_surveys 
                FROM user_surveys 
                WHERE user_id = ? AND status IN ('started', 'completed')
            ");
            $stmt->execute([$userId]);
            $startedSurveys = $stmt->fetch()['started_surveys'];
            
            $completionRate = $startedSurveys > 0 ? ($completedSurveys / $startedSurveys) * 100 : 0;
            
            // Get available surveys (mock for now)
            $availableSurveys = 5; // This would come from CPX Research API
            
            return [
                'total_earnings' => 'Rp ' . number_format($totalEarnings, 0, ',', '.'),
                'completed_surveys' => (int)$completedSurveys,
                'completion_rate' => round($completionRate, 1),
                'available_surveys' => $availableSurveys
            ];
            
        } catch (PDOException $e) {
            return [
                'total_earnings' => 'Rp 0',
                'completed_surveys' => 0,
                'completion_rate' => 0,
                'available_surveys' => 0
            ];
        }
    }
}
?>