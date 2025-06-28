<?php
/**
 * Login Page - Survey Platform Indonesia
 * PHP Version for Web Hosting
 */

require_once 'config/database.php';
require_once 'includes/auth.php';

$auth = new Auth();
$error = '';
$success = '';

// Check if already logged in
if ($auth->isLoggedIn()) {
    header('Location: dashboard.php');
    exit;
}

// Handle login form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        $error = 'Email dan password harus diisi';
    } else {
        $result = $auth->login($email, $password);
        if ($result['success']) {
            header('Location: dashboard.php');
            exit;
        } else {
            $error = $result['message'];
        }
    }
}

// Check for registration success message
if (isset($_GET['message']) && $_GET['message'] === 'registered') {
    $success = 'Registrasi berhasil! Silakan login dengan akun Anda.';
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Masuk - SurveyKu</title>
    <meta name="description" content="Masuk ke akun SurveyKu untuk mengakses survei dan mengelola penghasilan Anda.">
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="header-content">
                <a href="index.php" class="logo">SurveyKu</a>
                <nav class="nav">
                    <a href="index.php">Beranda</a>
                    <a href="register.php" class="btn btn-primary">Daftar</a>
                </nav>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main style="min-height: 80vh; display: flex; align-items: center; padding: 2rem 0;">
        <div class="container">
            <div class="form-container">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem;">Masuk ke Akun</h1>
                    <p style="color: var(--text-muted);">Masuk untuk mengakses dashboard dan survei Anda</p>
                </div>

                <?php if ($error): ?>
                    <div class="alert alert-error">
                        <?= htmlspecialchars($error) ?>
                    </div>
                <?php endif; ?>

                <?php if ($success): ?>
                    <div class="alert alert-success">
                        <?= htmlspecialchars($success) ?>
                    </div>
                <?php endif; ?>

                <form method="POST" action="login.php">
                    <div class="form-group">
                        <label for="email" class="form-label">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            class="form-input" 
                            required 
                            value="<?= htmlspecialchars($_POST['email'] ?? '') ?>"
                            placeholder="Masukkan email Anda"
                        >
                    </div>

                    <div class="form-group">
                        <label for="password" class="form-label">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            class="form-input" 
                            required
                            placeholder="Masukkan password Anda"
                        >
                    </div>

                    <button type="submit" class="btn btn-primary btn-block">
                        Masuk
                    </button>
                </form>

                <div style="text-align: center; margin-top: 2rem;">
                    <p style="color: var(--text-muted);">
                        Belum punya akun? 
                        <a href="register.php" style="color: var(--primary); text-decoration: none; font-weight: 500;">
                            Daftar di sini
                        </a>
                    </p>
                </div>

                <div style="text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border);">
                    <p style="font-size: 0.875rem; color: var(--text-muted);">
                        Lupa password? Hubungi support kami di<br>
                        <a href="mailto:tatangtaryaedi.tte@gmail.com" style="color: var(--primary);">tatangtaryaedi.tte@gmail.com</a>
                    </p>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 SurveyKu Platform. Semua hak dilindungi.</p>
        </div>
    </footer>

    <script src="assets/js/main.js"></script>
</body>
</html>