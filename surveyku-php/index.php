<?php
/**
 * SurveyKu - Platform Survei Indonesia (Versi PHP Sederhana)
 * File ini menggabungkan semua fungsi dalam satu aplikasi sederhana
 */

// Load konfigurasi dari file terpisah
require_once 'config.php';

// Ambil konstanta dari config
$DB_HOST = DB_HOST;
$DB_NAME = DB_NAME; 
$DB_USER = DB_USER;
$DB_PASS = DB_PASS;
$DB_PORT = DB_PORT;
$CPX_APP_ID = CPX_APP_ID;
$CPX_SECURE_HASH = CPX_SECURE_HASH;

// Start session
session_start();

// Database connection
function getDbConnection() {
    global $DB_HOST, $DB_PORT, $DB_NAME, $DB_USER, $DB_PASS;
    $dsn = "mysql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_NAME;charset=utf8mb4";
    try {
        return new PDO($dsn, $DB_USER, $DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ]);
    } catch (PDOException $e) {
        die("Database connection failed: " . $e->getMessage());
    }
}

// Authentication functions
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function getCurrentUser() {
    if (!isLoggedIn()) return null;
    
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch();
}

function login($email, $password) {
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        return true;
    }
    return false;
}

function register($data) {
    $pdo = getDbConnection();
    
    // Check if email exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    if ($stmt->fetch()) {
        return false;
    }
    
    // Create user
    $stmt = $pdo->prepare("
        INSERT INTO users (name, email, password, phone, age, gender, education, occupation, income, city, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    return $stmt->execute([
        $data['name'],
        $data['email'],
        password_hash($data['password'], PASSWORD_DEFAULT),
        $data['phone'] ?? null,
        $data['age'] ?? null,
        $data['gender'] ?? null,
        $data['education'] ?? null,
        $data['occupation'] ?? null,
        $data['income'] ?? null,
        $data['city'] ?? null
    ]);
}

function logout() {
    session_destroy();
    header('Location: index.php');
    exit;
}

// Withdrawal functions
function isWithdrawalPeriod() {
    $today = date('j'); // Tanggal saat ini (1-31)
    return $today >= 1 && $today <= 5; // Periode penarikan tanggal 1-5
}

function getMinimumWithdrawal() {
    return 50000; // Minimum Rp 50,000
}

function getUserAvailableBalance($userId) {
    $pdo = getDbConnection();
    
    // Total earnings
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'earning' AND status = 'completed'");
    $stmt->execute([$userId]);
    $earnings = $stmt->fetchColumn();
    
    // Total withdrawals (approved + paid)
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) as total FROM withdrawal_requests WHERE user_id = ? AND status IN ('approved', 'paid')");
    $stmt->execute([$userId]);
    $withdrawals = $stmt->fetchColumn();
    
    return ($earnings * 15000) - $withdrawals; // Convert USD to IDR
}

function createWithdrawalRequest($userId, $amount, $paymentMethod, $paymentAccount, $paymentName) {
    $pdo = getDbConnection();
    
    // Check available balance
    $availableBalance = getUserAvailableBalance($userId);
    if ($amount > $availableBalance) {
        return ['success' => false, 'message' => 'Saldo tidak mencukupi'];
    }
    
    // Check minimum withdrawal
    if ($amount < getMinimumWithdrawal()) {
        return ['success' => false, 'message' => 'Minimum penarikan Rp ' . number_format(getMinimumWithdrawal(), 0, ',', '.')];
    }
    
    // Check if withdrawal period
    if (!isWithdrawalPeriod()) {
        return ['success' => false, 'message' => 'Periode penarikan hanya tanggal 1-5 setiap bulan'];
    }
    
    // Check if user already has pending request this month
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM withdrawal_requests WHERE user_id = ? AND status = 'pending' AND MONTH(request_date) = MONTH(NOW()) AND YEAR(request_date) = YEAR(NOW())");
    $stmt->execute([$userId]);
    if ($stmt->fetchColumn() > 0) {
        return ['success' => false, 'message' => 'Anda sudah memiliki permintaan penarikan yang sedang diproses bulan ini'];
    }
    
    // Create withdrawal request
    $stmt = $pdo->prepare("
        INSERT INTO withdrawal_requests (user_id, amount, payment_method, payment_account, payment_name, status) 
        VALUES (?, ?, ?, ?, ?, 'pending')
    ");
    
    if ($stmt->execute([$userId, $amount, $paymentMethod, $paymentAccount, $paymentName])) {
        return ['success' => true, 'message' => 'Permintaan penarikan berhasil diajukan'];
    }
    
    return ['success' => false, 'message' => 'Gagal mengajukan permintaan penarikan'];
}

function getUserWithdrawals($userId) {
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("SELECT * FROM withdrawal_requests WHERE user_id = ? ORDER BY request_date DESC LIMIT 10");
    $stmt->execute([$userId]);
    return $stmt->fetchAll();
}

// Admin functions
function isAdmin() {
    return isset($_SESSION['admin_id']);
}

function getCurrentAdmin() {
    if (!isAdmin()) return null;
    
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE id = ?");
    $stmt->execute([$_SESSION['admin_id']]);
    return $stmt->fetch();
}

function adminLogin($username, $password) {
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ? AND status = 'active'");
    $stmt->execute([$username]);
    $admin = $stmt->fetch();
    
    if ($admin && password_verify($password, $admin['password'])) {
        $_SESSION['admin_id'] = $admin['id'];
        
        // Update last login
        $stmt = $pdo->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$admin['id']]);
        
        return true;
    }
    return false;
}

function adminLogout() {
    unset($_SESSION['admin_id']);
    header('Location: index.php?page=admin');
    exit;
}

function getPendingWithdrawals() {
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("
        SELECT wr.*, u.name as user_name, u.email as user_email 
        FROM withdrawal_requests wr 
        JOIN users u ON wr.user_id = u.id 
        WHERE wr.status = 'pending' 
        ORDER BY wr.request_date ASC
    ");
    $stmt->execute();
    return $stmt->fetchAll();
}

function processWithdrawal($requestId, $action, $notes = '') {
    $pdo = getDbConnection();
    $admin = getCurrentAdmin();
    
    $status = ($action === 'approve') ? 'approved' : 'rejected';
    
    $stmt = $pdo->prepare("
        UPDATE withdrawal_requests 
        SET status = ?, admin_notes = ?, processed_date = NOW(), processed_by = ? 
        WHERE id = ?
    ");
    
    return $stmt->execute([$status, $notes, $admin['name'], $requestId]);
}

// CPX Research functions
function generateCPXUrl($userId) {
    global $CPX_APP_ID, $CPX_SECURE_HASH;
    $user = getCurrentUser();
    
    $params = [
        'app_id' => $CPX_APP_ID,
        'ext_user_id' => $userId,
        'username' => $user['name'] ?? '',
        'email' => $user['email'] ?? '',
        'subid_1' => 'web',
        'secure_hash' => md5($userId . $CPX_SECURE_HASH)
    ];
    
    return 'https://offers.cpx-research.com/index.php?' . http_build_query($params);
}

function getUserStats($userId) {
    $pdo = getDbConnection();
    
    // Total earnings
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'earning'");
    $stmt->execute([$userId]);
    $totalEarnings = $stmt->fetchColumn();
    
    // Completed surveys
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM user_surveys WHERE user_id = ? AND status = 'completed'");
    $stmt->execute([$userId]);
    $completedSurveys = $stmt->fetchColumn();
    
    // Available balance (for withdrawal)
    $availableBalance = getUserAvailableBalance($userId);
    
    return [
        'total_earnings' => $totalEarnings,
        'available_balance' => $availableBalance,
        'completed_surveys' => $completedSurveys,
        'completion_rate' => $completedSurveys > 0 ? 95 : 0,
        'available_surveys' => 12
    ];
}

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'login':
                if (login($_POST['email'], $_POST['password'])) {
                    header('Location: index.php?page=dashboard');
                    exit;
                } else {
                    $error = "Email atau password salah!";
                }
                break;
                
            case 'register':
                if (register($_POST)) {
                    $success = "Registrasi berhasil! Silakan login.";
                } else {
                    $error = "Email sudah terdaftar!";
                }
                break;
                
            case 'logout':
                logout();
                break;
                
            case 'admin_login':
                if (adminLogin($_POST['username'], $_POST['password'])) {
                    header('Location: index.php?page=admin_dashboard');
                    exit;
                } else {
                    $error = "Username atau password admin salah!";
                }
                break;
                
            case 'admin_logout':
                adminLogout();
                break;
                
            case 'withdrawal_request':
                if (isLoggedIn()) {
                    $result = createWithdrawalRequest(
                        $_SESSION['user_id'],
                        floatval($_POST['amount']),
                        $_POST['payment_method'],
                        $_POST['payment_account'],
                        $_POST['payment_name']
                    );
                    
                    if ($result['success']) {
                        $success = $result['message'];
                    } else {
                        $error = $result['message'];
                    }
                }
                break;
                
            case 'process_withdrawal':
                if (isAdmin()) {
                    $requestId = $_POST['request_id'];
                    $action = $_POST['withdrawal_action']; // 'approve' or 'reject'
                    $notes = $_POST['admin_notes'] ?? '';
                    
                    if (processWithdrawal($requestId, $action, $notes)) {
                        $success = "Permintaan penarikan berhasil " . ($action === 'approve' ? 'disetujui' : 'ditolak');
                    } else {
                        $error = "Gagal memproses permintaan penarikan";
                    }
                }
                break;
                
            case 'mark_splash_shown':
                $_SESSION['splash_shown'] = true;
                exit('OK');
                break;
        }
    }
}

// Handle CPX Postback
if (isset($_GET['cpx_postback']) && $_GET['cpx_postback'] === '1') {
    // Validate IP (CPX Research IPs)
    global $CPX_ALLOWED_IPS;
    $client_ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];
    
    if (in_array($client_ip, $CPX_ALLOWED_IPS)) {
        $user_id = $_GET['user_id'] ?? null;
        $reward = floatval($_GET['reward_value'] ?? 0);
        $currency = $_GET['currency_name'] ?? 'USD';
        $transaction_id = $_GET['transaction_id'] ?? '';
        
        if ($user_id && $reward > 0) {
            $pdo = getDbConnection();
            
            // Record transaction
            $stmt = $pdo->prepare("
                INSERT INTO transactions (user_id, amount, currency, type, reference_id, description, created_at) 
                VALUES (?, ?, ?, 'earning', ?, 'CPX Survey Reward', NOW())
            ");
            $stmt->execute([$user_id, $reward, $currency, $transaction_id]);
            
            echo "OK";
        } else {
            echo "ERROR";
        }
    } else {
        echo "UNAUTHORIZED";
    }
    exit;
}

$page = $_GET['page'] ?? 'home';
$user = getCurrentUser();
$showSplash = !isset($_SESSION['splash_shown']) && !$user;
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SurveyKu - Platform Survei Indonesia</title>
    <meta name="description" content="Dapatkan penghasilan tambahan dengan mengisi survei online. Platform survei terpercaya di Indonesia.">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        /* Header */
        .header { background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100; }
        .header-content { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; }
        .logo { font-size: 1.5rem; font-weight: 700; color: #2563eb; text-decoration: none; }
        .nav { display: flex; gap: 1rem; align-items: center; }
        .nav a { text-decoration: none; color: #64748b; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: all 0.2s; }
        .nav a:hover { background: #f1f5f9; color: #2563eb; }
        
        /* Buttons */
        .btn { padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer; text-decoration: none; display: inline-block; font-weight: 500; transition: all 0.2s; }
        .btn-primary { background: #2563eb; color: white; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-secondary { background: #64748b; color: white; }
        .btn-success { background: #059669; color: white; }
        
        /* Cards */
        .card { background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 1rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 2rem 0; }
        .stat-card { background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .stat-number { font-size: 2rem; font-weight: 700; color: #2563eb; }
        .stat-label { color: #64748b; margin-top: 0.5rem; }
        
        /* Forms */
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
        .form-group input, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; }
        .form-group input:focus, .form-group select:focus { outline: none; border-color: #2563eb; }
        
        /* Hero */
        .hero { background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 4rem 0; text-align: center; }
        .hero h1 { font-size: 3rem; font-weight: 700; margin-bottom: 1rem; }
        .hero p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; }
        
        /* Alerts */
        .alert { padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .alert-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        
        /* Splash Screen */
        .splash-screen { 
            position: fixed; 
            top: 0; left: 0; 
            width: 100vw; height: 100vh; 
            background: linear-gradient(135deg, #2563eb, #7c3aed); 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            z-index: 9999; 
            animation: fadeOut 0.5s ease-in-out 3s forwards; 
        }
        
        .splash-logo { 
            text-align: center; 
            color: white; 
            animation: logoFloat 3s ease-in-out infinite; 
        }
        
        .splash-logo h1 { 
            font-size: 4rem; 
            font-weight: 700; 
            margin-bottom: 1rem; 
            text-shadow: 0 2px 10px rgba(0,0,0,0.3); 
        }
        
        .splash-logo p { 
            font-size: 1.25rem; 
            opacity: 0.9; 
            margin-bottom: 2rem; 
        }
        
        .progress-bar { 
            width: 200px; 
            height: 6px; 
            background: rgba(255,255,255,0.2); 
            border-radius: 3px; 
            overflow: hidden; 
            margin: 0 auto; 
        }
        
        .progress-fill { 
            height: 100%; 
            background: white; 
            border-radius: 3px; 
            animation: progressLoad 3s ease-out forwards; 
        }
        
        @keyframes logoFloat {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-10px) rotate(2deg); }
            75% { transform: translateY(-5px) rotate(-2deg); }
        }
        
        @keyframes progressLoad {
            0% { width: 0%; }
            100% { width: 100%; }
        }
        
        @keyframes fadeOut {
            0% { opacity: 1; }
            100% { opacity: 0; visibility: hidden; }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .header-content { flex-direction: column; gap: 1rem; }
            .hero h1 { font-size: 2rem; }
            .stats-grid { grid-template-columns: 1fr; }
            .splash-logo h1 { font-size: 2.5rem; }
        }
    </style>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="header-content">
                <a href="index.php" class="logo">SurveyKu</a>
                <nav class="nav">
                    <?php if ($user): ?>
                        <a href="index.php?page=dashboard">Dashboard</a>
                        <form method="POST" style="display: inline;">
                            <input type="hidden" name="action" value="logout">
                            <button type="submit" class="btn btn-secondary">Logout</button>
                        </form>
                        <span>Halo, <?= htmlspecialchars($user['name']) ?></span>
                    <?php else: ?>
                        <a href="index.php?page=login">Masuk</a>
                        <a href="index.php?page=register" class="btn btn-primary">Daftar</a>
                    <?php endif; ?>
                </nav>
            </div>
        </div>
    </header>

    <!-- Splash Screen -->
    <?php if ($showSplash): ?>
    <div class="splash-screen" id="splashScreen">
        <div class="splash-logo">
            <h1>SurveyKu</h1>
            <p>Platform Survei Terpercaya Indonesia</p>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        </div>
    </div>
    <?php endif; ?>

    <!-- Content -->
    <main>
        <?php if (isset($error)): ?>
            <div class="container">
                <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
            </div>
        <?php endif; ?>
        
        <?php if (isset($success)): ?>
            <div class="container">
                <div class="alert alert-success"><?= htmlspecialchars($success) ?></div>
            </div>
        <?php endif; ?>

        <?php if ($page === 'home'): ?>
            <?php if (!$user): ?>
                <!-- Hero Section -->
                <section class="hero">
                    <div class="container">
                        <h1>Dapatkan Penghasilan dari Survei Online</h1>
                        <p>Platform survei terpercaya di Indonesia dengan pembayaran nyata</p>
                        <a href="index.php?page=register" class="btn btn-primary" style="background: white; color: #2563eb; font-size: 1.1rem; padding: 1rem 2rem;">Mulai Sekarang</a>
                    </div>
                </section>

                <!-- Features -->
                <section style="padding: 4rem 0;">
                    <div class="container">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-number">Rp 500rb+</div>
                                <div class="stat-label">Rata-rata penghasilan per bulan</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">10,000+</div>
                                <div class="stat-label">Pengguna aktif</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">24/7</div>
                                <div class="stat-label">Survei tersedia</div>
                            </div>
                        </div>
                    </div>
                </section>
            <?php else: ?>
                <?php header('Location: index.php?page=dashboard'); exit; ?>
            <?php endif; ?>

        <?php elseif ($page === 'login'): ?>
            <section style="padding: 4rem 0;">
                <div class="container">
                    <div class="card" style="max-width: 400px; margin: 0 auto;">
                        <h2 style="text-align: center; margin-bottom: 2rem;">Masuk ke Akun Anda</h2>
                        <form method="POST">
                            <input type="hidden" name="action" value="login">
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" name="email" required>
                            </div>
                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" name="password" required>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width: 100%;">Masuk</button>
                        </form>
                        <p style="text-align: center; margin-top: 1rem;">
                            Belum punya akun? <a href="index.php?page=register">Daftar di sini</a>
                        </p>
                    </div>
                </div>
            </section>

        <?php elseif ($page === 'register'): ?>
            <section style="padding: 4rem 0;">
                <div class="container">
                    <div class="card" style="max-width: 600px; margin: 0 auto;">
                        <h2 style="text-align: center; margin-bottom: 2rem;">Daftar Akun Baru</h2>
                        <form method="POST">
                            <input type="hidden" name="action" value="register">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label>Nama Lengkap</label>
                                    <input type="text" name="name" required>
                                </div>
                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" required>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label>Password</label>
                                    <input type="password" name="password" required>
                                </div>
                                <div class="form-group">
                                    <label>No. Telepon</label>
                                    <input type="tel" name="phone">
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label>Umur</label>
                                    <input type="number" name="age" min="18" max="100">
                                </div>
                                <div class="form-group">
                                    <label>Jenis Kelamin</label>
                                    <select name="gender">
                                        <option value="">Pilih</option>
                                        <option value="male">Laki-laki</option>
                                        <option value="female">Perempuan</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Pendidikan</label>
                                    <select name="education">
                                        <option value="">Pilih</option>
                                        <option value="sma">SMA/SMK</option>
                                        <option value="diploma">Diploma</option>
                                        <option value="s1">S1</option>
                                        <option value="s2">S2</option>
                                    </select>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label>Pekerjaan</label>
                                    <input type="text" name="occupation">
                                </div>
                                <div class="form-group">
                                    <label>Kota</label>
                                    <input type="text" name="city">
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width: 100%;">Daftar Sekarang</button>
                        </form>
                        <p style="text-align: center; margin-top: 1rem;">
                            Sudah punya akun? <a href="index.php?page=login">Masuk di sini</a>
                        </p>
                    </div>
                </div>
            </section>

        <?php elseif ($page === 'dashboard' && $user): ?>
            <?php $stats = getUserStats($user['id']); ?>
            <section style="padding: 2rem 0;">
                <div class="container">
                    <h1 style="margin-bottom: 2rem;">Dashboard</h1>
                    
                    <!-- Stats -->
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">Rp <?= number_format($stats['total_earnings'] * 15000, 0, ',', '.') ?></div>
                            <div class="stat-label">Total Penghasilan</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">Rp <?= number_format($stats['available_balance'], 0, ',', '.') ?></div>
                            <div class="stat-label">Saldo Tersedia</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number"><?= $stats['completed_surveys'] ?></div>
                            <div class="stat-label">Survei Selesai</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number"><?= $stats['available_surveys'] ?></div>
                            <div class="stat-label">Survei Tersedia</div>
                        </div>
                    </div>

                    <!-- Withdrawal Section -->
                    <div class="card">
                        <h2 style="margin-bottom: 1rem;">Penarikan Dana</h2>
                        
                        <?php if (isWithdrawalPeriod()): ?>
                            <div class="alert alert-success">
                                <strong>Periode Penarikan Aktif!</strong> Anda dapat mengajukan penarikan hingga tanggal 5.
                            </div>
                        <?php else: ?>
                            <div class="alert alert-error">
                                <strong>Periode Penarikan Ditutup.</strong> Penarikan hanya dapat diajukan tanggal 1-5 setiap bulan.
                            </div>
                        <?php endif; ?>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0;">
                            <!-- Withdrawal Form -->
                            <div>
                                <h3 style="margin-bottom: 1rem;">Ajukan Penarikan</h3>
                                <form method="POST" style="<?= !isWithdrawalPeriod() || $stats['available_balance'] < getMinimumWithdrawal() ? 'opacity: 0.5; pointer-events: none;' : '' ?>">
                                    <input type="hidden" name="action" value="withdrawal_request">
                                    
                                    <div class="form-group">
                                        <label>Jumlah Penarikan</label>
                                        <input type="number" name="amount" min="<?= getMinimumWithdrawal() ?>" 
                                               max="<?= $stats['available_balance'] ?>" 
                                               placeholder="Minimum Rp <?= number_format(getMinimumWithdrawal(), 0, ',', '.') ?>" required>
                                        <small style="color: #64748b;">Saldo tersedia: Rp <?= number_format($stats['available_balance'], 0, ',', '.') ?></small>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>Metode Pembayaran</label>
                                        <select name="payment_method" required>
                                            <option value="dana">DANA</option>
                                            <option value="gopay">GoPay</option>
                                            <option value="ovo">OVO</option>
                                            <option value="bank">Transfer Bank</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>Nomor Akun/Rekening</label>
                                        <input type="text" name="payment_account" placeholder="081234567890 atau No. Rekening" required>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>Nama Pemilik Akun</label>
                                        <input type="text" name="payment_name" placeholder="Nama sesuai akun pembayaran" required>
                                    </div>
                                    
                                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                                        Ajukan Penarikan
                                    </button>
                                </form>
                            </div>

                            <!-- Withdrawal Info -->
                            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 1rem;">
                                <h3 style="margin-bottom: 1rem;">Informasi Penarikan</h3>
                                <ul style="list-style: disc; margin-left: 1.5rem; line-height: 1.8;">
                                    <li>Penarikan hanya dapat diajukan tanggal <strong>1-5 setiap bulan</strong></li>
                                    <li>Minimum penarikan <strong>Rp <?= number_format(getMinimumWithdrawal(), 0, ',', '.') ?></strong></li>
                                    <li>Proses persetujuan admin <strong>1-3 hari kerja</strong></li>
                                    <li>Transfer ke rekening <strong>dalam 24 jam</strong> setelah disetujui</li>
                                    <li>Maksimal <strong>1 permintaan per bulan</strong></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Withdrawal History -->
                    <?php
                    $withdrawals = getUserWithdrawals($user['id']);
                    ?>
                    <?php if (!empty($withdrawals)): ?>
                        <div class="card">
                            <h2 style="margin-bottom: 1rem;">Riwayat Penarikan</h2>
                            <div style="overflow-x: auto;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <thead>
                                        <tr style="background: #f8fafc;">
                                            <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0;">Tanggal</th>
                                            <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0;">Jumlah</th>
                                            <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0;">Metode</th>
                                            <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0;">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php foreach ($withdrawals as $withdrawal): ?>
                                            <tr>
                                                <td style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                                                    <?= date('d/m/Y', strtotime($withdrawal['request_date'])) ?>
                                                </td>
                                                <td style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                                                    Rp <?= number_format($withdrawal['amount'], 0, ',', '.') ?>
                                                </td>
                                                <td style="padding: 1rem; border-bottom: 1px solid #e2e8f0; text-transform: uppercase;">
                                                    <?= htmlspecialchars($withdrawal['payment_method']) ?>
                                                </td>
                                                <td style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                                                    <?php
                                                    $statusColors = [
                                                        'pending' => '#f59e0b',
                                                        'approved' => '#059669',
                                                        'rejected' => '#dc2626',
                                                        'paid' => '#059669'
                                                    ];
                                                    $statusLabels = [
                                                        'pending' => 'Menunggu',
                                                        'approved' => 'Disetujui',
                                                        'rejected' => 'Ditolak',
                                                        'paid' => 'Dibayar'
                                                    ];
                                                    ?>
                                                    <span style="background: <?= $statusColors[$withdrawal['status']] ?>; color: white; padding: 0.25rem 0.75rem; border-radius: 0.5rem; font-size: 0.875rem;">
                                                        <?= $statusLabels[$withdrawal['status']] ?>
                                                    </span>
                                                </td>
                                            </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    <?php endif; ?>

                    <!-- Available Surveys -->
                    <div class="card">
                        <h2 style="margin-bottom: 1rem;">Survei Tersedia</h2>
                        <p style="margin-bottom: 2rem; color: #64748b;">Klik tombol di bawah untuk mulai mengisi survei dan dapatkan penghasilan.</p>
                        
                        <div style="text-align: center; padding: 2rem; background: #f8fafc; border-radius: 1rem;">
                            <h3 style="margin-bottom: 1rem;">Mulai Survei Sekarang</h3>
                            <p style="margin-bottom: 2rem; color: #64748b;">Survei tersedia 24/7 dengan berbagai kategori dan reward menarik.</p>
                            <a href="<?= generateCPXUrl($user['id']) ?>" 
                               target="_blank" 
                               class="btn btn-success" 
                               style="font-size: 1.1rem; padding: 1rem 2rem;">
                                Buka Platform Survei
                            </a>
                        </div>
                    </div>

                    <!-- Recent Transactions -->
                    <?php
                    $pdo = getDbConnection();
                    $stmt = $pdo->prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10");
                    $stmt->execute([$user['id']]);
                    $transactions = $stmt->fetchAll();
                    ?>
                    
                    <?php if (!empty($transactions)): ?>
                        <div class="card">
                            <h2 style="margin-bottom: 1rem;">Riwayat Transaksi</h2>
                            <div style="overflow-x: auto;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <thead>
                                        <tr style="background: #f8fafc;">
                                            <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0;">Tanggal</th>
                                            <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0;">Deskripsi</th>
                                            <th style="padding: 1rem; text-align: right; border-bottom: 1px solid #e2e8f0;">Jumlah</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php foreach ($transactions as $transaction): ?>
                                            <tr>
                                                <td style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                                                    <?= date('d/m/Y H:i', strtotime($transaction['created_at'])) ?>
                                                </td>
                                                <td style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                                                    <?= htmlspecialchars($transaction['description']) ?>
                                                </td>
                                                <td style="padding: 1rem; border-bottom: 1px solid #e2e8f0; text-align: right; color: #059669; font-weight: 600;">
                                                    +Rp <?= number_format($transaction['amount'] * 15000, 0, ',', '.') ?>
                                                </td>
                                            </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    <?php endif; ?>
                </div>
            </section>

        <?php elseif ($page === 'admin'): ?>
            <section style="padding: 4rem 0;">
                <div class="container">
                    <div class="card" style="max-width: 400px; margin: 0 auto;">
                        <h2 style="text-align: center; margin-bottom: 2rem;">Admin Login</h2>
                        <form method="POST">
                            <input type="hidden" name="action" value="admin_login">
                            <div class="form-group">
                                <label>Username</label>
                                <input type="text" name="username" required>
                            </div>
                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" name="password" required>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width: 100%;">Login Admin</button>
                        </form>
                        <p style="text-align: center; margin-top: 1rem; color: #64748b;">
                            Default: admin / admin123
                        </p>
                    </div>
                </div>
            </section>

        <?php elseif ($page === 'admin_dashboard' && isAdmin()): ?>
            <?php
            $admin = getCurrentAdmin();
            $pendingWithdrawals = getPendingWithdrawals();
            ?>
            <section style="padding: 2rem 0;">
                <div class="container">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h1>Admin Dashboard</h1>
                        <form method="POST" style="display: inline;">
                            <input type="hidden" name="action" value="admin_logout">
                            <button type="submit" class="btn btn-secondary">Logout</button>
                        </form>
                    </div>

                    <!-- Admin Stats -->
                    <div class="stats-grid">
                        <?php
                        $pdo = getDbConnection();
                        
                        // Total users
                        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users");
                        $stmt->execute();
                        $totalUsers = $stmt->fetchColumn();
                        
                        // Pending withdrawals count
                        $stmt = $pdo->prepare("SELECT COUNT(*) FROM withdrawal_requests WHERE status = 'pending'");
                        $stmt->execute();
                        $pendingCount = $stmt->fetchColumn();
                        
                        // Total withdrawals amount this month
                        $stmt = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) FROM withdrawal_requests WHERE status IN ('approved', 'paid') AND MONTH(request_date) = MONTH(NOW())");
                        $stmt->execute();
                        $monthlyWithdrawals = $stmt->fetchColumn();
                        
                        // Total transactions today
                        $stmt = $pdo->prepare("SELECT COUNT(*) FROM transactions WHERE DATE(created_at) = CURDATE()");
                        $stmt->execute();
                        $todayTransactions = $stmt->fetchColumn();
                        ?>
                        
                        <div class="stat-card">
                            <div class="stat-number"><?= $totalUsers ?></div>
                            <div class="stat-label">Total Users</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number"><?= $pendingCount ?></div>
                            <div class="stat-label">Penarikan Pending</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">Rp <?= number_format($monthlyWithdrawals, 0, ',', '.') ?></div>
                            <div class="stat-label">Penarikan Bulan Ini</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number"><?= $todayTransactions ?></div>
                            <div class="stat-label">Transaksi Hari Ini</div>
                        </div>
                    </div>

                    <!-- Pending Withdrawals -->
                    <div class="card">
                        <h2 style="margin-bottom: 1rem;">Permintaan Penarikan Pending</h2>
                        <?php if (empty($pendingWithdrawals)): ?>
                            <p style="text-align: center; color: #64748b; padding: 2rem;">
                                Tidak ada permintaan penarikan yang menunggu persetujuan.
                            </p>
                        <?php else: ?>
                            <div style="overflow-x: auto;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <thead>
                                        <tr style="background: #f8fafc;">
                                            <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0;">User</th>
                                            <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0;">Tanggal</th>
                                            <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0;">Jumlah</th>
                                            <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0;">Metode</th>
                                            <th style="padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0;">Akun</th>
                                            <th style="padding: 1rem; text-align: center; border-bottom: 1px solid #e2e8f0;">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php foreach ($pendingWithdrawals as $withdrawal): ?>
                                            <tr>
                                                <td style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                                                    <strong><?= htmlspecialchars($withdrawal['user_name']) ?></strong><br>
                                                    <small style="color: #64748b;"><?= htmlspecialchars($withdrawal['user_email']) ?></small>
                                                </td>
                                                <td style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                                                    <?= date('d/m/Y H:i', strtotime($withdrawal['request_date'])) ?>
                                                </td>
                                                <td style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                                                    <strong>Rp <?= number_format($withdrawal['amount'], 0, ',', '.') ?></strong>
                                                </td>
                                                <td style="padding: 1rem; border-bottom: 1px solid #e2e8f0; text-transform: uppercase;">
                                                    <?= htmlspecialchars($withdrawal['payment_method']) ?>
                                                </td>
                                                <td style="padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                                                    <strong><?= htmlspecialchars($withdrawal['payment_name']) ?></strong><br>
                                                    <small style="color: #64748b;"><?= htmlspecialchars($withdrawal['payment_account']) ?></small>
                                                </td>
                                                <td style="padding: 1rem; border-bottom: 1px solid #e2e8f0; text-align: center;">
                                                    <form method="POST" style="display: inline-block; margin: 0;">
                                                        <input type="hidden" name="action" value="process_withdrawal">
                                                        <input type="hidden" name="request_id" value="<?= $withdrawal['id'] ?>">
                                                        <input type="hidden" name="withdrawal_action" value="approve">
                                                        <input type="text" name="admin_notes" placeholder="Catatan admin" style="margin-bottom: 0.5rem; padding: 0.5rem; width: 150px; font-size: 0.875rem;">
                                                        <div>
                                                            <button type="submit" class="btn btn-success" style="padding: 0.5rem 1rem; margin-right: 0.5rem;">
                                                                Setuju
                                                            </button>
                                                        </div>
                                                    </form>
                                                    <form method="POST" style="display: inline-block; margin: 0;">
                                                        <input type="hidden" name="action" value="process_withdrawal">
                                                        <input type="hidden" name="request_id" value="<?= $withdrawal['id'] ?>">
                                                        <input type="hidden" name="withdrawal_action" value="reject">
                                                        <input type="hidden" name="admin_notes" value="Ditolak oleh admin">
                                                        <button type="submit" class="btn" style="background: #dc2626; color: white; padding: 0.5rem 1rem;">
                                                            Tolak
                                                        </button>
                                                    </form>
                                                </td>
                                            </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </section>

        <?php else: ?>
            <?php header('Location: index.php'); exit; ?>
        <?php endif; ?>
    </main>

    <!-- Footer -->
    <footer style="background: #1e293b; color: white; padding: 2rem 0; margin-top: 4rem;">
        <div class="container">
            <div style="text-align: center;">
                <div class="logo" style="color: white; margin-bottom: 1rem;">SurveyKu</div>
                <p style="margin-bottom: 1rem; opacity: 0.8;">Platform survei terpercaya di Indonesia</p>
                <p style="opacity: 0.6;">
                    Support: tatangtaryaedi.tte@gmail.com | +6289663596711<br>
                    © 2025 SurveyKu. All rights reserved.
                </p>
            </div>
        </div>
    </footer>

    <script>
        // Splash screen management
        document.addEventListener('DOMContentLoaded', function() {
            const splashScreen = document.getElementById('splashScreen');
            if (splashScreen) {
                // Mark splash as shown for this session
                setTimeout(() => {
                    fetch('index.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'action=mark_splash_shown'
                    });
                }, 3000);
            }

            // Simple form validation
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.addEventListener('submit', function(e) {
                    const requiredFields = form.querySelectorAll('[required]');
                    let isValid = true;
                    
                    requiredFields.forEach(field => {
                        if (!field.value.trim()) {
                            field.style.borderColor = '#dc2626';
                            isValid = false;
                        } else {
                            field.style.borderColor = '#d1d5db';
                        }
                    });
                    
                    if (!isValid) {
                        e.preventDefault();
                        alert('Mohon lengkapi semua field yang diperlukan!');
                    }
                });
            });
        });
    </script>
</body>
</html>