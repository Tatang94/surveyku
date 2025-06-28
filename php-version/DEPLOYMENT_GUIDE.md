# Panduan Deployment PHP Version ke Web Hosting

## Langkah-langkah Deployment

### 1. Persiapan File

1. **Download/Copy semua file** dari folder `php-version`
2. **Compress menjadi ZIP** untuk upload yang lebih mudah
3. **Pastikan struktur folder** tetap utuh

### 2. Upload ke Hosting

#### Via cPanel File Manager:
1. Login ke cPanel hosting Anda
2. Buka **File Manager**
3. Masuk ke folder `public_html` atau `www`
4. **Upload ZIP file** dan extract
5. **Set file permissions:**
   - Files: 644
   - Folders: 755

#### Via FTP:
1. Gunakan FTP client (FileZilla, WinSCP)
2. Upload semua file ke direktori web root
3. Pastikan struktur folder sesuai

### 3. Database Configuration

Database PostgreSQL sudah tersedia dan siap digunakan:

```
Host: ep-square-wind-afhnt68h.c-2.us-west-2.aws.neon.tech
Port: 5432
Database: neondb
User: neondb_owner
Password: npg_JTCAZ6fP1cXp
```

**Tidak perlu setup database** - semua tabel sudah ada.

### 4. PHP Extensions Required

Pastikan hosting mendukung:
- ✅ PHP 7.4 atau lebih baru
- ✅ PostgreSQL (php-pgsql)
- ✅ PDO PostgreSQL (php-pdo-pgsql)
- ✅ cURL (php-curl)
- ✅ JSON (php-json)

### 5. CPX Research Setup

1. **Login ke CPX Research dashboard**
2. **Dapatkan Secure Hash** untuk App ID: 27993
3. **Edit file** `config/database.php`:
   ```php
   define('CPX_SECURE_HASH', 'hash_dari_cpx_dashboard');
   ```
4. **Set Postback URL** di CPX dashboard:
   ```
   https://your-domain.com/api/cpx-postback.php
   ```

### 6. Testing

1. **Buka website** Anda di browser
2. **Test registrasi** pengguna baru
3. **Test login** dengan akun yang dibuat
4. **Check dashboard** dan fitur-fitur utama
5. **Test postback** dengan CPX Research

## Hosting Providers

### Recommended Hosting yang Support PostgreSQL:

#### 1. **Heroku** (Free tier available)
- Native PostgreSQL support
- Easy deployment via Git
- Automatic SSL

#### 2. **DigitalOcean App Platform**
- Managed PostgreSQL
- Auto-scaling
- Built-in monitoring

#### 3. **Railway**
- PostgreSQL add-on
- Simple deployment
- Environment variables support

#### 4. **Render**
- Free PostgreSQL (90 days)
- Auto-deploy from Git
- Custom domains

### Traditional Hosting dengan PostgreSQL:

#### 1. **A2 Hosting**
- PostgreSQL support
- cPanel included
- SSD storage

#### 2. **InMotion Hosting**
- PostgreSQL databases
- Free SSL
- 90-day money back

#### 3. **SiteGround**
- PostgreSQL support
- Cloudflare CDN
- Daily backups

## Environment Variables (Optional)

Untuk keamanan yang lebih baik, set environment variables:

```php
// config/database.php
define('DB_HOST', $_ENV['DB_HOST'] ?? 'default_host');
define('DB_USER', $_ENV['DB_USER'] ?? 'default_user');
define('DB_PASS', $_ENV['DB_PASS'] ?? 'default_pass');
define('CPX_SECURE_HASH', $_ENV['CPX_SECURE_HASH'] ?? 'default_hash');
```

## SSL Certificate

1. **Aktifkan SSL** di hosting control panel
2. **Update CPX postback URL** ke HTTPS
3. **Test HTTPS access** ke semua halaman

## Performance Optimization

### 1. Enable Gzip Compression
Tambahkan ke `.htaccess`:
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

### 2. Browser Caching
```apache
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

### 3. Database Connection Optimization
PHP menggunakan connection pooling otomatis dengan PDO.

## Security Setup

### 1. File Permissions
```bash
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chmod 600 config/database.php  # Extra security untuk config
```

### 2. Hide Sensitive Files
Tambahkan ke `.htaccess`:
```apache
<Files "config/database.php">
    Order allow,deny
    Deny from all
</Files>

<Files "*.log">
    Order allow,deny
    Deny from all
</Files>
```

### 3. Error Reporting
Untuk production, set di `config/database.php`:
```php
// Disable error reporting in production
error_reporting(0);
ini_set('display_errors', 0);
```

## Monitoring & Logs

### 1. Error Logs
Check error logs di:
- cPanel Error Logs
- `/logs/cpx-postback.log` (custom log)
- PHP error logs

### 2. Database Monitoring
- Monitor koneksi database
- Check query performance
- Monitor disk usage

## Troubleshooting

### Database Connection Error
1. **Check credentials** di `config/database.php`
2. **Verify host accessibility** dari hosting server
3. **Check PostgreSQL extension** di hosting

### CPX Postback Issues
1. **Verify IP whitelist** di `includes/cpx.php`
2. **Check postback URL** di CPX dashboard
3. **Review postback logs** di `/logs/`

### Permission Errors
1. **Set correct file permissions** (644/755)
2. **Check owner/group** pada shared hosting
3. **Verify web server access**

## Custom Domain Setup

1. **Point domain** ke hosting server
2. **Update DNS settings** (A record)
3. **Configure SSL** untuk custom domain
4. **Update CPX postback URL** dengan domain baru

## Backup Strategy

### 1. File Backup
- Backup semua PHP files
- Include database config
- Backup assets (CSS/JS)

### 2. Database Backup
Database PostgreSQL sudah di-backup otomatis oleh Neon.

## Support

Jika mengalami kesulitan:

- **Email:** tatangtaryaedi.tte@gmail.com
- **WhatsApp:** +62 896-6359-6711

## Quick Start Checklist

- [ ] Upload semua file PHP ke hosting
- [ ] Set file permissions (644/755)
- [ ] Verify PHP extensions
- [ ] Test database connection
- [ ] Setup CPX Research credentials
- [ ] Configure postback URL
- [ ] Test user registration
- [ ] Test login/logout
- [ ] Test dashboard functionality
- [ ] Verify CPX integration
- [ ] Enable SSL certificate
- [ ] Set up monitoring