<?php
/**
 * Dashboard Page - Survey Platform Indonesia
 * PHP Version for Web Hosting
 */

require_once 'config/database.php';
require_once 'includes/auth.php';
require_once 'includes/cpx.php';

$auth = new Auth();
$cpx = new CPXResearch();

// Require login
$auth->requireLogin();
$currentUser = $auth->getCurrentUser();
$userStats = $auth->getUserStats($currentUser['id']);
$availableSurveys = $cpx->getAvailableSurveys($currentUser['id']);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - SurveyKu</title>
    <meta name="description" content="Dashboard pengguna SurveyKu - kelola survei dan penghasilan Anda.">
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
                    <a href="dashboard.php">Dashboard</a>
                    <a href="profile.php">Profil</a>
                    <a href="history.php">Riwayat</a>
                    <a href="logout.php">Logout</a>
                    <span>Halo, <?= htmlspecialchars($currentUser['name']) ?></span>
                </nav>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main style="padding: 2rem 0;">
        <div class="container">
            <div style="margin-bottom: 2rem;">
                <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem;">Dashboard</h1>
                <p style="color: var(--text-muted);">Selamat datang kembali, <?= htmlspecialchars($currentUser['name']) ?>!</p>
            </div>

            <!-- Stats Overview -->
            <div class="dashboard-grid">
                <div class="stat-card">
                    <div class="stat-value"><?= $userStats['total_earnings'] ?></div>
                    <div class="stat-label">Total Penghasilan</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">+0% dari bulan lalu</div>
                </div>

                <div class="stat-card">
                    <div class="stat-value"><?= $userStats['completed_surveys'] ?></div>
                    <div class="stat-label">Survei Selesai</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">+0 minggu ini</div>
                </div>

                <div class="stat-card">
                    <div class="stat-value"><?= $userStats['completion_rate'] ?>%</div>
                    <div class="stat-label">Tingkat Penyelesaian</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">Rata-rata industri: 65%</div>
                </div>

                <div class="stat-card">
                    <div class="stat-value"><?= $userStats['available_surveys'] ?></div>
                    <div class="stat-label">Survei Tersedia</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">Diperbarui real-time</div>
                </div>
            </div>

            <!-- Available Surveys -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Survei Yang Tersedia</h2>
                    <p class="card-description">Pilih survei yang sesuai dengan profil Anda untuk mendapatkan penghasilan</p>
                </div>

                <?php if (empty($availableSurveys)): ?>
                    <div style="text-align: center; padding: 3rem 1rem;">
                        <div style="width: 4rem; height: 4rem; background: var(--surface); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">📋</div>
                        <h3 style="margin-bottom: 0.5rem;">Belum Ada Survei Tersedia</h3>
                        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Survei baru akan muncul berdasarkan profil demografis Anda</p>
                        <button onclick="window.location.reload()" class="btn btn-primary">Refresh Survei</button>
                    </div>
                <?php else: ?>
                    <div class="survey-grid">
                        <?php foreach ($availableSurveys as $survey): ?>
                            <div class="survey-card">
                                <div class="survey-header">
                                    <div>
                                        <h3 class="survey-title"><?= htmlspecialchars($survey['title']) ?></h3>
                                        <div class="survey-meta">
                                            <span>⏱️ <?= $survey['duration'] ?> menit</span>
                                            <span>📁 <?= htmlspecialchars($survey['category']) ?></span>
                                        </div>
                                    </div>
                                    <div class="survey-reward">Rp <?= number_format($survey['reward'], 0, ',', '.') ?></div>
                                </div>
                                
                                <p class="survey-description"><?= htmlspecialchars($survey['description']) ?></p>
                                
                                <button 
                                    onclick="startSurvey('<?= $survey['id'] ?>')" 
                                    class="btn btn-primary"
                                    style="width: 100%;"
                                >
                                    Mulai Survei
                                </button>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Profile Completion -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Kelengkapan Profil</h2>
                    <p class="card-description">Lengkapi profil untuk mendapatkan lebih banyak survei yang sesuai</p>
                </div>

                <div style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span>Progres kelengkapan profil</span>
                        <span style="font-weight: 600;"><?= round($currentUser['profile_completeness']) ?>%</span>
                    </div>
                    <div class="progress">
                        <div class="progress-bar" style="width: <?= $currentUser['profile_completeness'] ?>%"></div>
                    </div>
                </div>

                <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
                    Profil yang lengkap membantu kami memberikan survei yang lebih relevan dan meningkatkan peluang diterima.
                </p>

                <a href="profile.php" class="btn btn-secondary">Lengkapi Profil</a>
            </div>

            <!-- Recent Activity -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Aktivitas Terbaru</h2>
                    <p class="card-description">Riwayat survei dan transaksi Anda</p>
                </div>

                <div style="text-align: center; padding: 2rem 1rem;">
                    <p style="color: var(--text-muted); margin-bottom: 1rem;">Belum ada aktivitas</p>
                    <a href="history.php" class="btn btn-secondary">Lihat Riwayat Lengkap</a>
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
    <script>
        function startSurvey(surveyId) {
            // Generate CPX Research survey URL
            const surveyUrl = `survey.php?id=${surveyId}`;
            window.open(surveyUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
        }

        // Auto refresh surveys every 5 minutes
        setInterval(() => {
            const surveySection = document.querySelector('.survey-grid');
            if (surveySection) {
                fetch('api/get-surveys.php')
                    .then(response => response.json())
                    .then(data => {
                        if (data.success && data.surveys.length > 0) {
                            location.reload();
                        }
                    })
                    .catch(console.error);
            }
        }, 300000); // 5 minutes
    </script>
</body>
</html>