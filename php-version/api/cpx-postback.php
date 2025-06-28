<?php
/**
 * CPX Research Postback Handler - PHP Version
 * Survey Platform Indonesia
 * 
 * Support: tatangtaryaedi.tte@gmail.com | +6289663596711
 * App ID: 27993
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';
require_once '../includes/cpx.php';

function logMessage($message) {
    $logFile = '../logs/cpx-postback.log';
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] $message" . PHP_EOL;
    
    if (!file_exists(dirname($logFile))) {
        mkdir(dirname($logFile), 0755, true);
    }
    
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

function getClientIP() {
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

function validateIPWhitelist() {
    $allowedIPs = [
        '188.40.3.73',
        '2a01:4f8:d0a:30ff::2', 
        '157.90.97.92'
    ];
    
    $clientIP = getClientIP();
    return in_array($clientIP, $allowedIPs);
}

try {
    logMessage("CPX Postback received from IP: " . getClientIP());
    
    // Validate IP whitelist
    if (!validateIPWhitelist()) {
        logMessage("Unauthorized IP access attempt: " . getClientIP());
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
        exit;
    }
    
    // Get request data
    $params = array_merge($_GET, $_POST);
    logMessage("Postback params: " . json_encode($params));
    
    // Validate required parameters
    $requiredFields = ['transaction_id', 'user_id', 'reward', 'status'];
    foreach ($requiredFields as $field) {
        if (!isset($params[$field]) || empty($params[$field])) {
            logMessage("Missing required field: $field");
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => "Missing required field: $field"]);
            exit;
        }
    }
    
    // Initialize CPX service
    $cpx = new CPXResearch();
    
    // Validate postback
    $validation = $cpx->validatePostback($params);
    if (!$validation['valid']) {
        logMessage("Invalid postback: " . $validation['message']);
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => $validation['message']]);
        exit;
    }
    
    // Process reward
    $result = $cpx->processReward(
        $params['user_id'],
        $params['transaction_id'],
        $params['reward'],
        $params['status'],
        $params['survey_id'] ?? null
    );
    
    if ($result['success']) {
        logMessage("Postback processed successfully for user {$params['user_id']}, transaction {$params['transaction_id']}");
        echo json_encode(['status' => 'success', 'message' => 'Postback processed successfully']);
    } else {
        logMessage("Failed to process postback: " . $result['message']);
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $result['message']]);
    }
    
} catch (Exception $e) {
    logMessage("Exception in postback processing: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Internal server error']);
}
?>