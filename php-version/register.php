<?php
/**
 * Registration Page - Survey Platform Indonesia
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

// Handle registration form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userData = [
        'name' => trim($_POST['name'] ?? ''),
        'email' => trim($_POST['email'] ?? ''),
        'password' => $_POST['password'] ?? '',
        'phone' => trim($_POST['phone'] ?? ''),
        'birth_date' => $_POST['birth_date'] ?? '',
        'gender' => $_POST['gender'] ?? '',
        'education' => $_POST['education'] ?? '',
        'occupation' => $_POST['occupation'] ?? '',
        'income' => $_POST['income'] ?? ''
    ];
    
    $confirmPassword = $_POST['confirm_password'] ?? '';
    $agreeTerms = isset($_POST['agree_terms']);
    
    // Validation
    if (empty($userData['name']) || empty($userData['email']) || empty($userData['password'])) {
        $error = 'Nama, email, dan password harus diisi';
    } elseif ($userData['password'] !== $confirmPassword) {
        $error = 'Password dan konfirmasi password tidak cocok';
    } elseif (!$agreeTerms) {
        $error = 'Anda harus menyetujui syarat dan ketentuan';
    } elseif (!filter_var($userData['email'], FILTER_VALIDATE_EMAIL)) {
        $error = 'Format email tidak valid';
    } elseif (strlen($userData['password']) < 6) {
        $error = 'Password minimal 6 karakter';
    } else {
        $result = $auth->register($userData);
        if ($result['success']) {
            header('Location: login.php?message=registered');
            exit;
        } else {
            $error = $result['message'];
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar - SurveyKu</title>
    <meta name="description" content="Daftar gratis di SurveyKu dan mulai dapatkan penghasilan tambahan dari survei online.">
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
                    <a href="login.php">Masuk</a>
                </nav>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main style="padding: 2rem 0;">
        <div class="container">
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem;">Daftar Akun Baru</h1>
                    <p style="color: var(--text-muted);">Bergabung dan mulai menghasilkan dari survei</p>
                </div>

                <?php if ($error): ?>
                    <div class="alert alert-error">
                        <?= htmlspecialchars($error) ?>
                    </div>
                <?php endif; ?>

                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Informasi Akun</h2>
                        <p class="card-description">Lengkapi data diri Anda untuk mendapatkan survei yang sesuai</p>
                    </div>

                    <form method="POST" action="register.php">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="name" class="form-label">Nama Lengkap *</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    name="name" 
                                    class="form-input" 
                                    required 
                                    value="<?= htmlspecialchars($_POST['name'] ?? '') ?>"
                                    placeholder="Nama lengkap Anda"
                                >
                            </div>
                            <div class="form-group">
                                <label for="email" class="form-label">Email *</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    class="form-input" 
                                    required 
                                    value="<?= htmlspecialchars($_POST['email'] ?? '') ?>"
                                    placeholder="email@example.com"
                                >
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="password" class="form-label">Password *</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password" 
                                    class="form-input" 
                                    required
                                    placeholder="Minimal 6 karakter"
                                >
                            </div>
                            <div class="form-group">
                                <label for="confirm_password" class="form-label">Konfirmasi Password *</label>
                                <input 
                                    type="password" 
                                    id="confirm_password" 
                                    name="confirm_password" 
                                    class="form-input" 
                                    required
                                    placeholder="Ulangi password"
                                >
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="phone" class="form-label">Nomor HP</label>
                            <input 
                                type="tel" 
                                id="phone" 
                                name="phone" 
                                class="form-input" 
                                value="<?= htmlspecialchars($_POST['phone'] ?? '') ?>"
                                placeholder="+62"
                            >
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="birth_date" class="form-label">Tanggal Lahir</label>
                                <input 
                                    type="date" 
                                    id="birth_date" 
                                    name="birth_date" 
                                    class="form-input"
                                    value="<?= htmlspecialchars($_POST['birth_date'] ?? '') ?>"
                                >
                            </div>
                            <div class="form-group">
                                <label for="gender" class="form-label">Jenis Kelamin</label>
                                <select id="gender" name="gender" class="form-select">
                                    <option value="">Pilih</option>
                                    <option value="male" <?= ($_POST['gender'] ?? '') === 'male' ? 'selected' : '' ?>>Laki-laki</option>
                                    <option value="female" <?= ($_POST['gender'] ?? '') === 'female' ? 'selected' : '' ?>>Perempuan</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="education" class="form-label">Pendidikan</label>
                                <select id="education" name="education" class="form-select">
                                    <option value="">Pilih</option>
                                    <option value="smp" <?= ($_POST['education'] ?? '') === 'smp' ? 'selected' : '' ?>>SMP</option>
                                    <option value="sma" <?= ($_POST['education'] ?? '') === 'sma' ? 'selected' : '' ?>>SMA/SMK</option>
                                    <option value="diploma" <?= ($_POST['education'] ?? '') === 'diploma' ? 'selected' : '' ?>>Diploma</option>
                                    <option value="sarjana" <?= ($_POST['education'] ?? '') === 'sarjana' ? 'selected' : '' ?>>S1</option>
                                    <option value="pascasarjana" <?= ($_POST['education'] ?? '') === 'pascasarjana' ? 'selected' : '' ?>>S2/S3</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="occupation" class="form-label">Pekerjaan</label>
                                <select id="occupation" name="occupation" class="form-select">
                                    <option value="">Pilih</option>
                                    <option value="student" <?= ($_POST['occupation'] ?? '') === 'student' ? 'selected' : '' ?>>Pelajar/Mahasiswa</option>
                                    <option value="employee" <?= ($_POST['occupation'] ?? '') === 'employee' ? 'selected' : '' ?>>Karyawan</option>
                                    <option value="entrepreneur" <?= ($_POST['occupation'] ?? '') === 'entrepreneur' ? 'selected' : '' ?>>Wirausaha</option>
                                    <option value="freelancer" <?= ($_POST['occupation'] ?? '') === 'freelancer' ? 'selected' : '' ?>>Freelancer</option>
                                    <option value="housewife" <?= ($_POST['occupation'] ?? '') === 'housewife' ? 'selected' : '' ?>>Ibu Rumah Tangga</option>
                                    <option value="other" <?= ($_POST['occupation'] ?? '') === 'other' ? 'selected' : '' ?>>Lainnya</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="income" class="form-label">Penghasilan per Bulan</label>
                            <select id="income" name="income" class="form-select">
                                <option value="">Pilih range</option>
                                <option value="0-1000000" <?= ($_POST['income'] ?? '') === '0-1000000' ? 'selected' : '' ?>>< Rp 1.000.000</option>
                                <option value="1000000-3000000" <?= ($_POST['income'] ?? '') === '1000000-3000000' ? 'selected' : '' ?>>Rp 1.000.000 - 3.000.000</option>
                                <option value="3000000-5000000" <?= ($_POST['income'] ?? '') === '3000000-5000000' ? 'selected' : '' ?>>Rp 3.000.000 - 5.000.000</option>
                                <option value="5000000-10000000" <?= ($_POST['income'] ?? '') === '5000000-10000000' ? 'selected' : '' ?>>Rp 5.000.000 - 10.000.000</option>
                                <option value="10000000+" <?= ($_POST['income'] ?? '') === '10000000+' ? 'selected' : '' ?>>Rp 10.000.000+</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label style="display: flex; align-items: start; gap: 0.5rem;">
                                <input type="checkbox" name="agree_terms" class="form-checkbox" required>
                                <span style="font-size: 0.875rem;">
                                    Saya menyetujui 
                                    <a href="terms.php" style="color: var(--primary); text-decoration: none;">Syarat dan Ketentuan</a> 
                                    serta 
                                    <a href="privacy.php" style="color: var(--primary); text-decoration: none;">Kebijakan Privasi</a>
                                </span>
                            </label>
                        </div>

                        <button type="submit" class="btn btn-primary btn-block">
                            Daftar Sekarang
                        </button>
                    </form>

                    <div style="text-align: center; margin-top: 2rem;">
                        <p style="color: var(--text-muted);">
                            Sudah punya akun? 
                            <a href="login.php" style="color: var(--primary); text-decoration: none; font-weight: 500;">
                                Masuk di sini
                            </a>
                        </p>
                    </div>
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