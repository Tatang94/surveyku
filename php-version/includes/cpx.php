<?php
/**
 * CPX Research Integration
 * Survey Platform Indonesia - PHP Version
 */

require_once 'config/database.php';

class CPXResearch {
    private $db;
    private $appId;
    private $secureHash;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->appId = CPX_APP_ID;
        $this->secureHash = CPX_SECURE_HASH;
    }
    
    public function generateSurveyUrl($userId, $userEmail = null, $userProfile = []) {
        $params = [
            'app_id' => $this->appId,
            'ext_user_id' => $userId,
            'username' => $userProfile['name'] ?? '',
            'email' => $userEmail ?? '',
            'age' => $this->calculateAge($userProfile['birth_date'] ?? ''),
            'gender' => $this->mapGender($userProfile['gender'] ?? ''),
            'income' => $this->mapIncome($userProfile['income'] ?? ''),
            'education' => $this->mapEducation($userProfile['education'] ?? ''),
            'timestamp' => time()
        ];
        
        // Generate secure hash
        $hashString = $this->appId . $userId . $userEmail . $this->secureHash;
        $params['secure_hash'] = md5($hashString);
        
        $queryString = http_build_query($params);
        return "https://offers.cpx-research.com/index.php?" . $queryString;
    }
    
    public function validatePostback($data) {
        $requiredFields = ['transaction_id', 'user_id', 'reward', 'status'];
        
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                return ['valid' => false, 'message' => "Missing required field: $field"];
            }
        }
        
        // Validate IP whitelist (CPX Research IPs)
        $allowedIPs = [
            '188.40.3.73',
            '2a01:4f8:d0a:30ff::2', 
            '157.90.97.92'
        ];
        
        $clientIP = $this->getClientIP();
        if (!in_array($clientIP, $allowedIPs)) {
            return ['valid' => false, 'message' => 'Unauthorized IP: ' . $clientIP];
        }
        
        // Validate secure hash if provided
        if (isset($data['secure_hash'])) {
            $expectedHash = md5($this->appId . $data['user_id'] . $data['transaction_id'] . $this->secureHash);
            if ($data['secure_hash'] !== $expectedHash) {
                return ['valid' => false, 'message' => 'Invalid secure hash'];
            }
        }
        
        return ['valid' => true, 'message' => 'Valid postback'];
    }
    
    public function processReward($userId, $transactionId, $reward, $status, $surveyId = null) {
        try {
            $this->db->beginTransaction();
            
            // Check if transaction already exists
            $stmt = $this->db->prepare("SELECT id FROM transactions WHERE cpx_transaction_id = ?");
            $stmt->execute([$transactionId]);
            
            if ($stmt->fetch()) {
                $this->db->rollback();
                return ['success' => false, 'message' => 'Transaction already processed'];
            }
            
            if ($status === 'completed') {
                // Record transaction
                $stmt = $this->db->prepare("
                    INSERT INTO transactions (
                        user_id, type, amount, description, cpx_transaction_id, 
                        created_at, updated_at
                    ) VALUES (?, 'earning', ?, ?, ?, NOW(), NOW())
                ");
                $stmt->execute([
                    $userId,
                    $reward,
                    "CPX Survey Reward - Transaction ID: $transactionId",
                    $transactionId
                ]);
                
                // Update or create user survey record
                if ($surveyId) {
                    $stmt = $this->db->prepare("
                        INSERT INTO user_surveys (
                            user_id, cpx_survey_id, status, reward, completed_at, 
                            created_at, updated_at
                        ) VALUES (?, ?, 'completed', ?, NOW(), NOW(), NOW())
                        ON CONFLICT (user_id, cpx_survey_id) 
                        DO UPDATE SET 
                            status = 'completed', 
                            reward = ?, 
                            completed_at = NOW(), 
                            updated_at = NOW()
                    ");
                    $stmt->execute([$userId, $surveyId, $reward, $reward]);
                }
            }
            
            $this->db->commit();
            return ['success' => true, 'message' => 'Reward processed successfully'];
            
        } catch (PDOException $e) {
            $this->db->rollback();
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
    
    public function getAvailableSurveys($userId, $userAgent = '', $ipAddress = '') {
        // This would typically call CPX Research API
        // For now, return mock data structure
        return [
            [
                'id' => 'cpx_survey_1',
                'title' => 'Survei Konsumen Produk Teknologi',
                'description' => 'Berikan pendapat Anda tentang produk teknologi terbaru',
                'reward' => '5000',
                'duration' => 15,
                'category' => 'Technology'
            ],
            [
                'id' => 'cpx_survey_2', 
                'title' => 'Survei Gaya Hidup dan Belanja',
                'description' => 'Ceritakan kebiasaan belanja dan gaya hidup Anda',
                'reward' => '7500',
                'duration' => 20,
                'category' => 'Lifestyle'
            ]
        ];
    }
    
    private function calculateAge($birthDate) {
        if (empty($birthDate)) return '';
        
        $birth = new DateTime($birthDate);
        $today = new DateTime();
        return $today->diff($birth)->y;
    }
    
    private function mapGender($gender) {
        $mapping = [
            'male' => 'M',
            'female' => 'F'
        ];
        return $mapping[$gender] ?? '';
    }
    
    private function mapIncome($income) {
        $mapping = [
            '0-1000000' => '1',
            '1000000-3000000' => '2', 
            '3000000-5000000' => '3',
            '5000000-10000000' => '4',
            '10000000+' => '5'
        ];
        return $mapping[$income] ?? '';
    }
    
    private function mapEducation($education) {
        $mapping = [
            'smp' => '1',
            'sma' => '2',
            'diploma' => '3', 
            'sarjana' => '4',
            'pascasarjana' => '5'
        ];
        return $mapping[$education] ?? '';
    }
    
    private function getClientIP() {
        $ipKeys = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                foreach (explode(',', $_SERVER[$key]) as $ip) {
                    $ip = trim($ip);
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                        return $ip;
                    }
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
}
?>