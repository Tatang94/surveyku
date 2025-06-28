<?php
/**
 * Konfigurasi Database Terpisah
 * Edit file ini sesuai dengan setting hosting Anda
 */

// Konfigurasi Database MySQL/MariaDB
define('DB_HOST', 'localhost');        // Host database
define('DB_NAME', 'surveyku_db');      // Nama database  
define('DB_USER', 'surveyku_user');    // Username database
define('DB_PASS', 'password123');      // Password database
define('DB_PORT', 3306);               // Port MySQL

// CPX Research Configuration
define('CPX_APP_ID', '27993');
define('CPX_SECURE_HASH', '0afd1ccfc80b096b3b8b61d55ac6ff6b');

// Security Settings
define('SESSION_LIFETIME', 3600 * 24); // 24 jam
define('BCRYPT_COST', 12);             // Cost untuk password hashing

// Postback Security (IP Whitelist CPX Research)
$CPX_ALLOWED_IPS = [
    '188.40.3.73',
    '157.90.97.92',
    '2a01:4f8:d0a:30ff::2'
];
?>