<?php
/**
 * CPX Research Postback Handler - Standalone Version
 * SurveyKu Platform - PHP Version
 * 
 * URL: https://yourdomain.com/cpx-postback.php
 * 
 * Support: tatangtaryaedi.tte@gmail.com | +6289663596711
 * App ID: 27993
 */

// Load konfigurasi
require_once 'config.php';

// Log function untuk debugging
function logMessage($message) {
    $timestamp = date('Y-m-d H:i:s');
    $log = "[$timestamp] $message" . PHP_EOL;
    file_put_contents('cpx_postback.log', $log, FILE_APPEND | LOCK_EX);
}

// Get client IP
function getClientIP() {
    $ip_keys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
    foreach ($ip_keys as $key) {
        if (!empty($_SERVER[$key])) {
            $ips = explode(',', $_SERVER[$key]);
            return trim($ips[0]);
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

// Validate IP whitelist
function validateIPWhitelist() {
    global $CPX_ALLOWED_IPS;
    $client_ip = getClientIP();
    
    logMessage("Postback request from IP: $client_ip");
    
    if (!in_array($client_ip, $CPX_ALLOWED_IPS)) {
        logMessage("UNAUTHORIZED IP: $client_ip");
        http_response_code(403);
        echo "UNAUTHORIZED";
        exit;
    }
    
    return true;
}

// Validate postback parameters
function validatePostback($params) {
    $required = ['user_id', 'reward_value', 'currency_name', 'transaction_id'];
    
    foreach ($required as $param) {
        if (empty($params[$param])) {
            logMessage("Missing required parameter: $param");
            return false;
        }
    }
    
    // Validate user_id is numeric
    if (!is_numeric($params['user_id'])) {
        logMessage("Invalid user_id: " . $params['user_id']);
        return false;
    }
    
    // Validate reward_value is positive number
    if (!is_numeric($params['reward_value']) || floatval($params['reward_value']) <= 0) {
        logMessage("Invalid reward_value: " . $params['reward_value']);
        return false;
    }
    
    return true;
}

// Database connection
function getDbConnection() {
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    try {
        return new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ]);
    } catch (PDOException $e) {
        logMessage("Database connection failed: " . $e->getMessage());
        return null;
    }
}

// Save transaction to database
function saveTransaction($params) {
    $pdo = getDbConnection();
    if (!$pdo) {
        return false;
    }
    
    try {
        // Check if user exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
        $stmt->execute([$params['user_id']]);
        if (!$stmt->fetch()) {
            logMessage("User not found: " . $params['user_id']);
            return false;
        }
        
        // Check for duplicate transaction
        $stmt = $pdo->prepare("SELECT id FROM transactions WHERE reference_id = ? AND user_id = ?");
        $stmt->execute([$params['transaction_id'], $params['user_id']]);
        if ($stmt->fetch()) {
            logMessage("Duplicate transaction: " . $params['transaction_id']);
            return true; // Return true as transaction already exists
        }
        
        // Insert new transaction
        $stmt = $pdo->prepare("
            INSERT INTO transactions (user_id, amount, currency, type, status, reference_id, description, created_at) 
            VALUES (?, ?, ?, 'earning', 'completed', ?, 'CPX Survey Reward', NOW())
        ");
        
        $result = $stmt->execute([
            $params['user_id'],
            $params['reward_value'],
            $params['currency_name'],
            $params['transaction_id']
        ]);
        
        if ($result) {
            logMessage("Transaction saved successfully for user " . $params['user_id'] . " - Amount: " . $params['reward_value'] . " " . $params['currency_name']);
            return true;
        }
        
        return false;
        
    } catch (PDOException $e) {
        logMessage("Database error: " . $e->getMessage());
        return false;
    }
}

// Main postback handler
function handlePostback() {
    // Validate IP
    validateIPWhitelist();
    
    // Get parameters
    $params = [
        'user_id' => $_GET['user_id'] ?? $_POST['user_id'] ?? null,
        'reward_value' => $_GET['reward_value'] ?? $_POST['reward_value'] ?? null,
        'currency_name' => $_GET['currency_name'] ?? $_POST['currency_name'] ?? 'USD',
        'transaction_id' => $_GET['transaction_id'] ?? $_POST['transaction_id'] ?? null,
        'survey_id' => $_GET['survey_id'] ?? $_POST['survey_id'] ?? null,
        'ip' => getClientIP(),
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    // Log received parameters
    logMessage("Postback received: " . json_encode($params));
    
    // Validate parameters
    if (!validatePostback($params)) {
        http_response_code(400);
        echo "ERROR: Invalid parameters";
        exit;
    }
    
    // Save transaction
    if (saveTransaction($params)) {
        logMessage("Postback processed successfully");
        echo "OK";
    } else {
        logMessage("Failed to save transaction");
        http_response_code(500);
        echo "ERROR: Failed to save transaction";
    }
}

// Set content type
header('Content-Type: text/plain; charset=utf-8');

// Handle request
if ($_SERVER['REQUEST_METHOD'] === 'GET' || $_SERVER['REQUEST_METHOD'] === 'POST') {
    handlePostback();
} else {
    http_response_code(405);
    echo "Method Not Allowed";
}
?>