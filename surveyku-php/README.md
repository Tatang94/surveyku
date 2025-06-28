# SurveyKu - Versi PHP Sederhana

Versi PHP yang disederhanakan dari platform survei SurveyKu. Semua fitur digabungkan dalam satu file `index.php` untuk kemudahan deployment dan maintenance.

## Fitur

✅ **Autentikasi Lengkap**
- Registrasi pengguna dengan data demografis
- Login/logout dengan session management
- Password hashing dengan bcrypt

✅ **Integrasi CPX Research**
- App ID: 27993
- Secure hash untuk URL generation
- Postback handler untuk reward processing

✅ **Dashboard User**
- Statistik penghasilan real-time
- Riwayat transaksi
- Link ke platform survei CPX

✅ **Database PostgreSQL**
- Koneksi ke Neon PostgreSQL yang sama
- Schema yang kompatibel dengan versi utama
- Transaksi dan user management

## Deployment

### 1. Upload ke Web Hosting
```bash
# Upload semua file ke public_html atau folder web:
- index.php (file utama)
- config.php (konfigurasi database)
- .htaccess (konfigurasi Apache)
- sql-setup.sql (schema database)
```

### 2. Konfigurasi Database
1. Buat database MySQL baru di hosting Anda
2. Edit file `config.php` dengan data hosting Anda:
```php
define('DB_HOST', 'localhost');     // Host database
define('DB_NAME', 'nama_database'); // Nama database Anda
define('DB_USER', 'username_db');   // Username database
define('DB_PASS', 'password_db');   // Password database
```

3. Import `sql-setup.sql` melalui phpMyAdmin atau command line:
```bash
mysql -u username -p nama_database < sql-setup.sql
```

### 3. Setup CPX Research
Pilihan Postback URL untuk CPX Research:

**Option 1 - Integrated (Recommended):**
```
https://yourdomain.com/index.php?cpx_postback=1
```

**Option 2 - Standalone:**
```
https://yourdomain.com/cpx-postback.php
```

### 4. Permissions
Pastikan web server memiliki permission untuk:
- Read/write sessions
- Connect ke database PostgreSQL
- Execute PHP scripts

## Keamanan

### IP Whitelist
Postback handler memvalidasi IP CPX Research:
- 188.40.3.73
- 157.90.97.92

### Security Headers
File `.htaccess` sudah dikonfigurasi dengan:
- XSS Protection
- Content Security Policy
- Clickjacking Protection
- Gzip Compression

## Struktur File

```
surveyku-php/
├── index.php        # Aplikasi utama (all-in-one)
├── config.php       # Konfigurasi database terpisah
├── cpx-postback.php # Postback handler CPX Research (standalone)
├── .htaccess        # Konfigurasi Apache
├── sql-setup.sql    # Schema database MySQL
└── README.md        # Dokumentasi ini
```

## URLs

- **Homepage**: `https://yourdomain.com/`
- **Login**: `https://yourdomain.com/index.php?page=login`
- **Register**: `https://yourdomain.com/index.php?page=register`
- **Dashboard**: `https://yourdomain.com/index.php?page=dashboard`
- **CPX Postback**: `https://yourdomain.com/index.php?cpx_postback=1`

## Kustomisasi

### Mengubah Tampilan
Edit bagian `<style>` dalam file `index.php` untuk menyesuaikan:
- Warna tema
- Layout responsif
- Typography

### Menambah Fitur
Tambahkan case baru dalam switch statement untuk `$page`:
```php
<?php elseif ($page === 'new-page'): ?>
    <!-- Konten halaman baru -->
<?php endif; ?>
```

## Support

- Email: tatangtaryaedi.tte@gmail.com
- WhatsApp: +6289663596711
- CPX Research App ID: 27993

## Testing

1. Buka `https://yourdomain.com/`
2. Daftar akun baru
3. Login ke dashboard
4. Klik "Buka Platform Survei"
5. Test postback dengan parameter CPX

## Maintenance

File ini self-contained dan mudah dimaintain:
- Semua konfigurasi di bagian atas file
- Functions terorganisir by kategori
- HTML dan CSS dalam satu file
- JavaScript minimal untuk validasi

## Compatibility

- PHP 7.4+
- MySQL 5.7+ atau MariaDB 10.3+
- Apache 2.4+ dengan mod_rewrite
- Modern browsers (IE11+)