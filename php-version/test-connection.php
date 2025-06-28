<?php
/**
 * Database Connection Test
 * Survey Platform Indonesia - PHP Version
 * 
 * Use this file to test your Supabase connection
 */

// Include the database configuration
require_once 'config/database.php';

echo "<!DOCTYPE html>\n";
echo "<html><head><title>Database Connection Test</title></head><body>";
echo "<h1>Database Connection Test</h1>";

try {
    // Test database connection
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    
    // Test basic query
    $stmt = $pdo->query("SELECT version()");
    $version = $stmt->fetch();
    
    echo "<div style='color: green; background: #f0f8f0; padding: 15px; border: 1px solid #4CAF50; border-radius: 5px; margin: 10px 0;'>";
    echo "<h3>✅ Connection Successful!</h3>";
    echo "<p><strong>Database Version:</strong> " . htmlspecialchars($version['version']) . "</p>";
    echo "</div>";
    
    // Test if tables exist
    $tables = ['users', 'surveys', 'user_surveys', 'transactions'];
    echo "<h3>Table Check:</h3>";
    
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
            $result = $stmt->fetch();
            echo "<p style='color: green;'>✅ Table '$table' exists (Records: {$result['count']})</p>";
        } catch (PDOException $e) {
            echo "<p style='color: red;'>❌ Table '$table' missing or error: " . $e->getMessage() . "</p>";
        }
    }
    
    // Test insert capability (with rollback)
    echo "<h3>Write Test:</h3>";
    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)");
        $stmt->execute([
            'test@example.com',
            password_hash('test123', PASSWORD_DEFAULT),
            'Test User'
        ]);
        
        echo "<p style='color: green;'>✅ Database write test successful</p>";
        
        // Rollback the test insert
        $pdo->rollback();
        echo "<p style='color: blue;'>ℹ️ Test data rolled back (not saved)</p>";
        
    } catch (PDOException $e) {
        $pdo->rollback();
        echo "<p style='color: red;'>❌ Database write test failed: " . $e->getMessage() . "</p>";
    }
    
} catch (Exception $e) {
    echo "<div style='color: red; background: #fff0f0; padding: 15px; border: 1px solid #f44336; border-radius: 5px; margin: 10px 0;'>";
    echo "<h3>❌ Connection Failed!</h3>";
    echo "<p><strong>Error:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<h4>Troubleshooting:</h4>";
    echo "<ul>";
    echo "<li>Check your database credentials in config/database.php</li>";
    echo "<li>Ensure your hosting supports PostgreSQL (php-pgsql extension)</li>";
    echo "<li>Verify your Supabase project is active</li>";
    echo "<li>Check if your hosting IP is allowed in Supabase</li>";
    echo "</ul>";
    echo "</div>";
}

echo "<hr>";
echo "<h3>Configuration Info:</h3>";
echo "<p><strong>Host:</strong> " . DB_HOST . "</p>";
echo "<p><strong>Database:</strong> " . DB_NAME . "</p>";
echo "<p><strong>User:</strong> " . DB_USER . "</p>";
echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";

// Check required PHP extensions
echo "<h3>PHP Extensions:</h3>";
$required_extensions = ['pdo', 'pdo_pgsql', 'curl', 'json'];
foreach ($required_extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "<p style='color: green;'>✅ $ext</p>";
    } else {
        echo "<p style='color: red;'>❌ $ext (required)</p>";
    }
}

echo "<hr>";
echo "<p><small>Delete this file (test-connection.php) after testing for security.</small></p>";
echo "</body></html>";
?>