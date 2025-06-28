<?php
/**
 * Database Configuration
 * Survey Platform Indonesia - PHP Version
 */

// Database credentials - same as other versions
define('DB_HOST', 'ep-square-wind-afhnt68h.c-2.us-west-2.aws.neon.tech');
define('DB_PORT', '5432');
define('DB_NAME', 'neondb');
define('DB_USER', 'neondb_owner');
define('DB_PASS', 'npg_JTCAZ6fP1cXp');
define('DB_CHARSET', 'utf8mb4');

// CPX Research configuration
define('CPX_APP_ID', '27993');
define('CPX_SECURE_HASH', 'your_secure_hash_here'); // Replace with actual hash from CPX dashboard

// Site configuration
define('SITE_URL', 'https://your-domain.com');
define('SITE_NAME', 'SurveyKu - Platform Survei Indonesia');
define('SESSION_TIMEOUT', 3600); // 1 hour

// Database connection using PDO
class Database {
    private static $instance = null;
    private $pdo;
    
    private function __construct() {
        try {
            $dsn = "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME;
            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch(PDOException $e) {
            die("Database connection failed: " . $e->getMessage());
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
}

// Start session
session_start();

// Timezone
date_default_timezone_set('Asia/Jakarta');
?>