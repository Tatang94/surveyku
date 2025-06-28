<?php
/**
 * CPX Research Postback Handler for SurveyKu
 * 
 * This file handles postback notifications from CPX Research when users complete surveys.
 * CPX Research will send HTTP requests to this endpoint with survey completion data.
 * 
 * IMPORTANT: Configure this URL in your CPX Research dashboard as the postback URL
 * Example: https://your-domain.com/cpx-postback.php
 * 
 * Contact Information:
 * - Support Email: tatangtaryaedi.tte@gmail.com
 * - WhatsApp: +6289663596711
 */

// Security headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// CPX Research Configuration
define('CPX_APP_ID', '27993');
define('CPX_SECURE_HASH', 'your-secure-hash-here'); // Replace with actual secure hash from CPX Research
define('API_BASE_URL', 'https://your-replit-domain.replit.dev'); // Replace with your actual Replit domain

// CPX Research IP Whitelist
define('CPX_WHITELIST_IPS', [
    '188.40.3.73',
    '2a01:4f8:d0a:30ff::2',
    '157.90.97.92'
]);

/**
 * Log function for debugging
 */
function logMessage($message) {
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] $message" . PHP_EOL;
    file_put_contents('cpx-postback.log', $logEntry, FILE_APPEND | LOCK_EX);
}

/**
 * Get client IP address
 */
function getClientIP() {
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    } elseif (!empty($_SERVER['HTTP_X_REAL_IP'])) {
        return $_SERVER['HTTP_X_REAL_IP'];
    } elseif (!empty($_SERVER['REMOTE_ADDR'])) {
        return $_SERVER['REMOTE_ADDR'];
    }
    return 'unknown';
}

/**
 * Validate CPX Research IP whitelist
 */
function validateIPWhitelist() {
    $clientIP = getClientIP();
    logMessage("Postback request from IP: $clientIP");
    
    if (!in_array($clientIP, CPX_WHITELIST_IPS)) {
        logMessage("Rejected postback from unauthorized IP: $clientIP");
        return false;
    }
    
    return true;
}

/**
 * Validate CPX Research postback
 */
function validateCPXPostback($params) {
    // First validate IP whitelist
    if (!validateIPWhitelist()) {
        return false;
    }
    
    // Validate required parameters
    $required = ['app_id', 'user_id', 'trans_id', 'reward', 'signature'];
    foreach ($required as $param) {
        if (!isset($params[$param]) || empty($params[$param])) {
            return false;
        }
    }
    
    // Validate app_id
    if ($params['app_id'] !== CPX_APP_ID) {
        return false;
    }
    
    // Validate signature (security check)
    $expectedSignature = md5($params['user_id'] . $params['trans_id'] . $params['reward'] . CPX_SECURE_HASH);
    if ($params['signature'] !== $expectedSignature) {
        logMessage("Signature validation failed. Expected: $expectedSignature, Received: " . $params['signature']);
        return false;
    }
    
    return true;
}

/**
 * Forward postback to Node.js API
 */
function forwardToAPI($params) {
    $apiUrl = API_BASE_URL . '/api/cpx-postback';
    
    $postData = json_encode([
        'user_id' => $params['user_id'],
        'trans_id' => $params['trans_id'],
        'reward' => $params['reward'],
        'currency' => $params['currency'] ?? 'USD',
        'signature' => $params['signature'],
        'timestamp' => time()
    ]);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($postData)
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'success' => $httpCode === 200,
        'response' => $response,
        'http_code' => $httpCode
    ];
}

// Main postback processing
try {
    // Get request method
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Get parameters based on request method
    if ($method === 'POST') {
        $params = $_POST;
    } elseif ($method === 'GET') {
        $params = $_GET;
    } else {
        throw new Exception('Invalid request method');
    }
    
    // Log the incoming request
    logMessage("Postback received: " . json_encode($params));
    
    // Validate the postback
    if (!validateCPXPostback($params)) {
        logMessage("Postback validation failed");
        http_response_code(400);
        echo json_encode(['error' => 'Invalid postback data']);
        exit();
    }
    
    // Forward to Node.js API
    $result = forwardToAPI($params);
    
    if ($result['success']) {
        logMessage("Postback successfully forwarded to API");
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Postback processed']);
    } else {
        logMessage("Failed to forward postback to API. HTTP Code: " . $result['http_code']);
        http_response_code(500);
        echo json_encode(['error' => 'Failed to process postback']);
    }
    
} catch (Exception $e) {
    logMessage("Error processing postback: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Replace 'your-secure-hash-here' with the actual secure hash from CPX Research dashboard
 * 2. Replace 'your-replit-domain.replit.dev' with your actual Replit domain
 * 3. Upload this file to a web server that supports PHP
 * 4. Configure the postback URL in CPX Research dashboard to point to this file
 * 5. Test the postback using CPX Research test tools
 * 
 * SECURITY NOTES:
 * - Always validate the signature to prevent fraudulent postbacks
 * - Keep the secure hash confidential
 * - Monitor the log file for any suspicious activity
 * - Use HTTPS in production for secure communication
 * 
 * TROUBLESHOOTING:
 * - Check cpx-postback.log for detailed logs
 * - Verify that your server can make outbound HTTP requests
 * - Ensure the Node.js API endpoint is accessible
 * - Contact support if you encounter issues: tatangtaryaedi.tte@gmail.com
 */
?>