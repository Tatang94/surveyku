<?php
/**
 * SurveyKu - Platform Survei Indonesia (Versi PHP Sederhana)
 * File ini menggabungkan semua fungsi dalam satu aplikasi sederhana
 */

// Konfigurasi Database (PostgreSQL Neon)
$DATABASE_URL = "postgresql://neondb_owner:npg_JTCAZ6fP1cXp@ep-square-wind-afhnt68h.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require";

// Parse database URL
$db_parts = parse_url($DATABASE_URL);
$DB_HOST = $db_parts['host'];
$DB_PORT = $db_parts['port'] ?? 5432;
$DB_NAME = ltrim($db_parts['path'], '/');
$DB_USER = $db_parts['user'];
$DB_PASS = $db_parts['pass'];

// CPX Research Configuration
$CPX_APP_ID = "27993";
$CPX_SECURE_HASH = "0afd1ccfc80b096b3b8b61d55ac6ff6b";

// Start session
session_start();

// Database connection
function getDbConnection() {
    global $DB_HOST, $DB_PORT, $DB_NAME, $DB_USER, $DB_PASS;
    $dsn = "pgsql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_NAME;sslmode=require";
    try {
        return new PDO($dsn, $DB_USER, $DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
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
    
    return [
        'total_earnings' => $totalEarnings,
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
        }
    }
}

// Handle CPX Postback
if (isset($_GET['cpx_postback']) && $_GET['cpx_postback'] === '1') {
    // Validate IP (CPX Research IPs)
    $allowed_ips = ['188.40.3.73', '157.90.97.92'];
    $client_ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];
    
    if (in_array($client_ip, $allowed_ips)) {
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
        
        /* Responsive */
        @media (max-width: 768px) {
            .header-content { flex-direction: column; gap: 1rem; }
            .hero h1 { font-size: 2rem; }
            .stats-grid { grid-template-columns: 1fr; }
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
                            <div class="stat-number"><?= $stats['completed_surveys'] ?></div>
                            <div class="stat-label">Survei Selesai</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number"><?= $stats['completion_rate'] ?>%</div>
                            <div class="stat-label">Tingkat Penyelesaian</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number"><?= $stats['available_surveys'] ?></div>
                            <div class="stat-label">Survei Tersedia</div>
                        </div>
                    </div>

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
        // Simple form validation
        document.addEventListener('DOMContentLoaded', function() {
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