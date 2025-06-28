/**
 * CPX Research Postback Handler - Standalone Version
 * SurveyKu Platform
 * 
 * Support: tatangtaryaedi.tte@gmail.com | +6289663596711
 * App ID: 27993
 */

const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration
const CONFIG = {
    CPX_APP_ID: '27993',
    CPX_SECURE_HASH: process.env.CPX_SECURE_HASH || 'your-secure-hash-here',
    API_BASE_URL: process.env.API_BASE_URL || 'https://your-replit-domain.replit.dev',
    LOG_ENABLED: true,
    WHITELIST_IPS: [
        '188.40.3.73',
        '2a01:4f8:d0a:30ff::2',
        '157.90.97.92'
    ]
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Logging function
function logMessage(message) {
    if (CONFIG.LOG_ENABLED) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${message}`);
    }
}

// Get client IP address
function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

// Validate IP whitelist
function validateIPWhitelist(req) {
    const clientIP = getClientIP(req);
    logMessage(`Postback request from IP: ${clientIP}`);
    
    if (!CONFIG.WHITELIST_IPS.includes(clientIP)) {
        logMessage(`Rejected postback from unauthorized IP: ${clientIP}`);
        return false;
    }
    
    return true;
}

// Validate CPX postback
function validatePostback(params, req) {
    // First validate IP whitelist
    if (!validateIPWhitelist(req)) {
        return false;
    }
    
    const required = ['app_id', 'user_id', 'trans_id', 'reward', 'signature'];
    
    // Check required parameters
    for (const param of required) {
        if (!params[param]) {
            logMessage(`Missing required parameter: ${param}`);
            return false;
        }
    }
    
    // Validate app_id
    if (params.app_id !== CONFIG.CPX_APP_ID) {
        logMessage(`Invalid app_id: ${params.app_id} (expected: ${CONFIG.CPX_APP_ID})`);
        return false;
    }
    
    // Validate signature
    const signatureString = params.user_id + params.trans_id + params.reward + CONFIG.CPX_SECURE_HASH;
    const expectedSignature = crypto.createHash('md5').update(signatureString).digest('hex');
    
    if (params.signature !== expectedSignature) {
        logMessage(`Signature mismatch. Expected: ${expectedSignature}, Received: ${params.signature}`);
        return false;
    }
    
    return true;
}

// Forward postback to main API
async function forwardToAPI(params) {
    try {
        const response = await axios.post(`${CONFIG.API_BASE_URL}/api/cpx-postback`, {
            user_id: params.user_id,
            trans_id: params.trans_id,
            reward: params.reward,
            currency: params.currency || 'USD',
            signature: params.signature,
            timestamp: Math.floor(Date.now() / 1000)
        }, {
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        return {
            success: true,
            data: response.data,
            status: response.status
        };
    } catch (error) {
        logMessage(`API forward error: ${error.message}`);
        return {
            success: false,
            error: error.message,
            status: error.response?.status || 500
        };
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        config: {
            app_id: CONFIG.CPX_APP_ID,
            api_url: CONFIG.API_BASE_URL
        }
    });
});

// Main postback endpoint
app.all('/postback', async (req, res) => {
    try {
        // Get parameters from both GET and POST
        const params = { ...req.query, ...req.body };
        
        logMessage(`Postback received: ${JSON.stringify(params)}`);
        
        // Validate postback (including IP whitelist)
        if (!validatePostback(params, req)) {
            logMessage('Postback validation failed');
            return res.status(400).json({
                error: 'Invalid postback data or unauthorized IP',
                timestamp: new Date().toISOString()
            });
        }
        
        // Forward to main API
        const result = await forwardToAPI(params);
        
        if (result.success) {
            logMessage(`Postback successfully processed for user: ${params.user_id}`);
            res.json({
                status: 'success',
                message: 'Postback processed successfully',
                trans_id: params.trans_id,
                timestamp: new Date().toISOString()
            });
        } else {
            logMessage(`Failed to process postback: ${result.error}`);
            res.status(result.status || 500).json({
                error: 'Failed to process postback',
                details: result.error,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        logMessage(`Postback processing error: ${error.message}`);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Test endpoint for manual testing
app.post('/test', (req, res) => {
    const testParams = {
        app_id: CONFIG.CPX_APP_ID,
        user_id: '1',
        trans_id: 'TEST_' + Date.now(),
        reward: '1.00',
        currency: 'USD',
        signature: crypto.createHash('md5').update('1TEST_' + Date.now() + '1.00' + CONFIG.CPX_SECURE_HASH).digest('hex')
    };
    
    res.json({
        message: 'Test postback data generated',
        test_url: `${req.protocol}://${req.get('host')}/postback`,
        test_params: testParams,
        curl_command: `curl -X POST ${req.protocol}://${req.get('host')}/postback -H "Content-Type: application/json" -d '${JSON.stringify(testParams)}'`
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    logMessage(`Unhandled error: ${error.message}`);
    res.status(500).json({
        error: 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        available_endpoints: ['/health', '/postback', '/test'],
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    logMessage(`CPX Postback server running on port ${PORT}`);
    logMessage(`Health check: http://localhost:${PORT}/health`);
    logMessage(`Postback URL: http://localhost:${PORT}/postback`);
    logMessage(`Test endpoint: http://localhost:${PORT}/test`);
    
    if (CONFIG.CPX_SECURE_HASH === 'your-secure-hash-here') {
        logMessage('⚠️  WARNING: Please set CPX_SECURE_HASH environment variable');
    }
    
    if (CONFIG.API_BASE_URL.includes('your-replit-domain')) {
        logMessage('⚠️  WARNING: Please set API_BASE_URL environment variable');
    }
});

module.exports = app;