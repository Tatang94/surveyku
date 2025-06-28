# Survey Platform Indonesia - PHP Version

Versi PHP dari Survey Platform Indonesia yang dioptimalkan untuk web hosting tradisional (shared hosting, VPS, dedicated server).

## Fitur Utama

- ✅ **PHP 7.4+** dengan PDO PostgreSQL
- ✅ **Database PostgreSQL** yang sama dengan versi lainnya
- ✅ **CPX Research Integration** dengan postback handler
- ✅ **Sistem Autentikasi** dengan session PHP
- ✅ **Responsive Design** dengan CSS murni
- ✅ **Dashboard Lengkap** dengan statistik user
- ✅ **Form Registrasi** dengan validasi lengkap
- ✅ **Manajemen Profil** dan kelengkapan data
- ✅ **Sistem Reward** terintegrasi CPX Research

## Struktur Project

```
php-version/
├── config/
│   └── database.php          # Konfigurasi database dan koneksi
├── includes/
│   ├── auth.php              # Sistem autentikasi dan user management
│   └── cpx.php               # Integrasi CPX Research
├── assets/
│   ├── css/style.css         # Styling responsif lengkap
│   └── js/main.js            # JavaScript functionality
├── api/
│   └── cpx-postback.php      # Endpoint untuk CPX Research postback
├── index.php                 # Landing page
├── login.php                 # Halaman login
├── register.php              # Halaman registrasi
├── dashboard.php             # Dashboard pengguna
├── logout.php                # Logout handler
└── README.md                 # Dokumentasi ini
```

## Database Configuration

Versi PHP mendukung dua opsi database:

### Option 1: Supabase PostgreSQL (Recommended)
```php
define('DB_HOST', 'db.your-project-ref.supabase.co');
define('DB_PORT', '5432');
define('DB_NAME', 'postgres');
define('DB_USER', 'postgres');
define('DB_PASS', 'your-supabase-password');
```

### Option 2: Neon Database (Compatible)
```php
define('DB_HOST', 'ep-square-wind-afhnt68h.c-2.us-west-2.aws.neon.tech');
define('DB_PORT', '5432');
define('DB_NAME', 'neondb');
define('DB_USER', 'neondb_owner');
define('DB_PASS', 'npg_JTCAZ6fP1cXp');
```

## CPX Research Configuration

```php
define('CPX_APP_ID', '27993');
define('CPX_SECURE_HASH', 'your_secure_hash_here');
```

## Requirements

### Server Requirements
- **PHP 7.4** atau lebih baru
- **PostgreSQL Extension** (php-pgsql)
- **PDO Extension** (php-pdo)
- **cURL Extension** (php-curl)
- **JSON Extension** (php-json)
- **Session Support**

### Shared Hosting Compatibility
- Kompatibel dengan shared hosting yang mendukung PHP dan PostgreSQL
- Tidak memerlukan akses SSH atau command line
- Menggunakan teknologi web standar

## Installation

### Option A: Menggunakan Supabase (Recommended)

1. **Setup Supabase Database**
   - Ikuti panduan lengkap di `SUPABASE_SETUP.md`
   - Buat project di supabase.com
   - Jalankan schema SQL dari `sql/supabase-schema.sql`

2. **Upload Files**
   - Upload semua file ke hosting
   - Rename `config/database-supabase.php` menjadi `config/database.php`
   - Update credentials Supabase di file tersebut

### Option B: Menggunakan Neon Database

1. **Upload Files**
   - Upload semua file ke hosting
   - Gunakan `config/database.php` yang sudah ada (sudah dikonfigurasi untuk Neon)

2. **Database Ready**
   - Database dan tabel sudah tersedia
   - Tidak perlu setup tambahan

### 3. CPX Research Setup
1. Login ke CPX Research dashboard
2. Dapatkan Secure Hash untuk App ID 27993
3. Update `CPX_SECURE_HASH` di file konfigurasi
4. Set postback URL: `https://your-domain.com/api/cpx-postback.php`

## Features Detail

### Authentication System
- Registrasi dengan validasi email dan password
- Login dengan session management
- Logout aman dengan session destroy
- Password hashing menggunakan PHP password_hash()

### User Management
- Profil lengkap dengan data demografis
- Tracking kelengkapan profil
- Sistem statistik user (penghasilan, survei selesai, dll)

### CPX Research Integration
- Generate survey URL dengan secure hash
- Postback handler untuk reward processing
- IP whitelist validation untuk keamanan
- Transaction tracking dan duplicate prevention

### Frontend
- Responsive design untuk desktop dan mobile
- CSS Grid dan Flexbox untuk layout modern
- Interactive JavaScript untuk UX yang baik
- Progressive enhancement approach

## API Endpoints

### CPX Research Postback
```
POST /api/cpx-postback.php
```

**Parameters:**
- `transaction_id` (required) - ID transaksi dari CPX
- `user_id` (required) - ID user di sistem
- `reward` (required) - Jumlah reward dalam rupiah
- `status` (required) - Status survei (completed/failed)
- `survey_id` (optional) - ID survei CPX
- `secure_hash` (optional) - Hash untuk validasi

**Response:**
```json
{
  "status": "success",
  "message": "Postback processed successfully"
}
```

## Security Features

### IP Whitelist
Postback endpoint menggunakan IP whitelist untuk CPX Research:
- 188.40.3.73
- 2a01:4f8:d0a:30ff::2
- 157.90.97.92

### Data Validation
- Input sanitization dengan htmlspecialchars()
- SQL injection prevention dengan prepared statements
- CSRF protection dengan session validation
- Password strength requirements

### Error Handling
- Comprehensive error logging
- User-friendly error messages
- Graceful fallback untuk koneksi database

## Deployment Options

### Shared Hosting
1. Upload files via FTP/File Manager
2. Set file permissions (644 untuk files, 755 untuk folders)
3. Update database credentials jika diperlukan
4. Test koneksi database

### VPS/Dedicated Server
1. Upload files ke web root
2. Configure virtual host
3. Set proper file permissions
4. Configure SSL certificate

### Cloud Hosting
- Compatible dengan Hostinger, Niagahoster, IDCloudHost
- Works dengan cPanel, DirectAdmin, Plesk
- Support untuk PHP hosting dengan PostgreSQL

## Environment Variables Alternative

Untuk keamanan yang lebih baik, gunakan environment variables:

```php
// Dalam config/database.php
define('DB_HOST', $_ENV['DB_HOST'] ?? 'default_host');
define('DB_USER', $_ENV['DB_USER'] ?? 'default_user');
// dst...
```

## Contact & Support

- **Email:** tatangtaryaedi.tte@gmail.com
- **WhatsApp:** +62 896-6359-6711
- **Platform:** SurveyKu Indonesia

## Version History

- **v1.0.0** (June 28, 2025) - Initial PHP version
  - Complete authentication system
  - CPX Research integration
  - Responsive frontend
  - PostgreSQL database integration
  - Security features implementation

## License

© 2025 SurveyKu Platform. All rights reserved.

## Database Schema

Menggunakan schema yang sama dengan versi Express.js dan Next.js:

```sql
-- users table
-- surveys table  
-- user_surveys table
-- transactions table
```

Semua tabel sudah tersedia di database PostgreSQL yang terkonfigurasi.

## Performance Optimization

- CSS dan JS minification ready
- Database query optimization
- Session management yang efisien
- Caching strategy untuk data statis

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)