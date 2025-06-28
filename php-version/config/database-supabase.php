<?php
/**
 * Supabase Database Configuration
 * Survey Platform Indonesia - PHP Version
 */

// Supabase PostgreSQL credentials
// Get these from your Supabase project settings > Database
define('DB_HOST', 'db.your-project-ref.supabase.co');
define('DB_PORT', '5432');
define('DB_NAME', 'postgres');
define('DB_USER', 'postgres');
define('DB_PASS', 'your-supabase-password');
define('DB_CHARSET', 'utf8');

// CPX Research configuration
define('CPX_APP_ID', '27993');
define('CPX_SECURE_HASH', 'your_secure_hash_here'); // Replace with actual hash from CPX dashboard

// Site configuration
define('SITE_URL', 'https://your-domain.com');
define('SITE_NAME', 'SurveyKu - Platform Survei Indonesia');
define('SESSION_TIMEOUT', 3600); // 1 hour

// Supabase specific settings
define('SUPABASE_URL', 'https://your-project-ref.supabase.co');
define('SUPABASE_ANON_KEY', 'your-anon-key'); // Optional for future API integration

// Database connection using PDO with Supabase
class Database {
    private static $instance = null;
    private $pdo;
    
    private function __construct() {
        try {
            // Supabase connection string format
            $dsn = "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";sslmode=require";
            
            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_PERSISTENT => false, // Supabase works better without persistent connections
            ]);
            
            // Set timezone to Indonesia
            $this->pdo->exec("SET timezone = 'Asia/Jakarta'");
            
        } catch(PDOException $e) {
            error_log("Supabase connection failed: " . $e->getMessage());
            die("Database connection failed. Please check your Supabase configuration.");
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->pdo;
    }
    
    public function testConnection() {
        try {
            $stmt = $this->pdo->query("SELECT version()");
            $version = $stmt->fetch();
            return [
                'success' => true,
                'message' => 'Connected to Supabase PostgreSQL',
                'version' => $version['version']
            ];
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Connection test failed: ' . $e->getMessage()
            ];
        }
    }
}

// Start session
session_start();

// Timezone
date_default_timezone_set('Asia/Jakarta');

// Environment-based configuration (optional)
if (file_exists(__DIR__ . '/../.env')) {
    $env = parse_ini_file(__DIR__ . '/../.env');
    
    if (isset($env['SUPABASE_HOST'])) {
        define('DB_HOST_ENV', $env['SUPABASE_HOST']);
    }
    if (isset($env['SUPABASE_PASSWORD'])) {
        define('DB_PASS_ENV', $env['SUPABASE_PASSWORD']);
    }
    if (isset($env['CPX_SECURE_HASH'])) {
        define('CPX_SECURE_HASH_ENV', $env['CPX_SECURE_HASH']);
    }
}
?>