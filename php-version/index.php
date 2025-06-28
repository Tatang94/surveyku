<?php
/**
 * Landing Page - Survey Platform Indonesia
 * PHP Version for Web Hosting
 */

require_once 'config/database.php';
require_once 'includes/auth.php';

$auth = new Auth();
$currentUser = $auth->getCurrentUser();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SurveyKu - Platform Survei Indonesia</title>
    <meta name="description" content="Dapatkan penghasilan tambahan dengan mengisi survei online. Platform survei terpercaya di Indonesia dengan pembayaran real.">
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
                    <?php if ($currentUser): ?>
                        <a href="dashboard.php">Dashboard</a>
                        <a href="profile.php">Profil</a>
                        <a href="logout.php">Logout</a>
                        <span>Halo, <?= htmlspecialchars($currentUser['name']) ?></span>
                    <?php else: ?>
                        <a href="login.php">Masuk</a>
                        <a href="register.php" class="btn btn-primary">Daftar</a>
                    <?php endif; ?>
                </nav>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <div style="text-align: center; padding: 4rem 0;">
                <h1 style="font-size: 3rem; font-weight: 700; margin-bottom: 1rem; background: linear-gradient(135deg, #2563eb, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    Platform Survei Indonesia
                </h1>
                <p style="font-size: 1.25rem; color: var(--text-muted); margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto;">
                    Dapatkan penghasilan tambahan dengan mudah. Isi survei dari perusahaan terpercaya dan terima pembayaran langsung ke rekening Anda.
                </p>
                
                <?php if (!$currentUser): ?>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="register.php" class="btn btn-primary" style="font-size: 1.125rem; padding: 1rem 2rem;">
                            Mulai Sekarang
                        </a>
                        <a href="#features" class="btn btn-secondary" style="font-size: 1.125rem; padding: 1rem 2rem;">
                            Pelajari Lebih Lanjut
                        </a>
                    </div>
                <?php else: ?>
                    <a href="dashboard.php" class="btn btn-primary" style="font-size: 1.125rem; padding: 1rem 2rem;">
                        Lanjut ke Dashboard
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="features" style="padding: 4rem 0; background: var(--surface);">
        <div class="container">
            <h2 style="text-align: center; font-size: 2.5rem; font-weight: 600; margin-bottom: 3rem;">
                Mengapa Memilih SurveyKu?
            </h2>
            
            <div class="dashboard-grid">
                <div class="card">
                    <div style="text-align: center;">
                        <div style="width: 4rem; height: 4rem; background: var(--primary); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;">💰</div>
                        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Penghasilan Real</h3>
                        <p style="color: var(--text-muted);">Dapatkan bayaran nyata untuk setiap survei yang Anda selesaikan. Minimal withdraw hanya Rp 50.000.</p>
                    </div>
                </div>
                
                <div class="card">
                    <div style="text-align: center;">
                        <div style="width: 4rem; height: 4rem; background: var(--success); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;">⚡</div>
                        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Proses Cepat</h3>
                        <p style="color: var(--text-muted);">Pembayaran diproses dalam 1-3 hari kerja. Sistem otomatis memastikan pembayaran yang cepat dan akurat.</p>
                    </div>
                </div>
                
                <div class="card">
                    <div style="text-align: center;">
                        <div style="width: 4rem; height: 4rem; background: var(--warning); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;">🔒</div>
                        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Aman Terpercaya</h3>
                        <p style="color: var(--text-muted);">Data Anda aman dengan enkripsi tingkat bank. Bermitra dengan CPX Research, platform survei global terpercaya.</p>
                    </div>
                </div>
                
                <div class="card">
                    <div style="text-align: center;">
                        <div style="width: 4rem; height: 4rem; background: var(--error); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;">📱</div>
                        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Akses Mudah</h3>
                        <p style="color: var(--text-muted);">Gunakan di mana saja, kapan saja. Platform responsif yang bekerja di desktop maupun mobile.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Stats Section -->
    <section style="padding: 4rem 0;">
        <div class="container">
            <h2 style="text-align: center; font-size: 2.5rem; font-weight: 600; margin-bottom: 3rem;">
                Platform Terpercaya
            </h2>
            
            <div class="dashboard-grid">
                <div class="stat-card">
                    <div class="stat-value">10,000+</div>
                    <div class="stat-label">Pengguna Aktif</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value">Rp 500M+</div>
                    <div class="stat-label">Total Dibayarkan</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value">50,000+</div>
                    <div class="stat-label">Survei Selesai</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value">4.8/5</div>
                    <div class="stat-label">Rating Pengguna</div>
                </div>
            </div>
        </div>
    </section>

    <!-- How It Works -->
    <section style="padding: 4rem 0; background: var(--surface);">
        <div class="container">
            <h2 style="text-align: center; font-size: 2.5rem; font-weight: 600; margin-bottom: 3rem;">
                Cara Kerja
            </h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                <div style="text-align: center;">
                    <div style="width: 3rem; height: 3rem; background: var(--primary); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">1</div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Daftar Gratis</h3>
                    <p style="color: var(--text-muted);">Buat akun dengan mengisi profil lengkap untuk mendapatkan survei yang sesuai dengan Anda.</p>
                </div>
                
                <div style="text-align: center;">
                    <div style="width: 3rem; height: 3rem; background: var(--primary); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">2</div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Pilih Survei</h3>
                    <p style="color: var(--text-muted);">Pilih survei dari daftar yang tersedia sesuai dengan minat dan profil demografis Anda.</p>
                </div>
                
                <div style="text-align: center;">
                    <div style="width: 3rem; height: 3rem; background: var(--primary); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">3</div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Terima Bayaran</h3>
                    <p style="color: var(--text-muted);">Setelah menyelesaikan survei, saldo Anda akan bertambah otomatis dan bisa ditarik kapan saja.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <?php if (!$currentUser): ?>
    <section style="padding: 4rem 0;">
        <div class="container">
            <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); border-radius: 2rem; padding: 4rem 2rem; text-align: center; color: white;">
                <h2 style="font-size: 2.5rem; font-weight: 600; margin-bottom: 1rem;">
                    Siap Mulai Menghasilkan?
                </h2>
                <p style="font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9;">
                    Bergabung dengan ribuan pengguna yang sudah merasakan penghasilan tambahan dari survei.
                </p>
                <a href="register.php" class="btn" style="background: white; color: var(--primary); font-size: 1.125rem; padding: 1rem 2rem;">
                    Daftar Sekarang - Gratis
                </a>
            </div>
        </div>
    </section>
    <?php endif; ?>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 SurveyKu Platform. Semua hak dilindungi.</p>
            <p style="margin-top: 0.5rem; font-size: 0.875rem;">
                Kontak: 
                <a href="mailto:tatangtaryaedi.tte@gmail.com" style="color: var(--primary);">tatangtaryaedi.tte@gmail.com</a> | 
                <a href="https://wa.me/6289663596711" style="color: var(--primary);">+62 896-6359-6711</a>
            </p>
        </div>
    </footer>

    <script src="assets/js/main.js"></script>
</body>
</html>