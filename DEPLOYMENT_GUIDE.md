# Panduan Deploy Survey Platform Indonesia

## Overview Platform

Survey Platform Indonesia memiliki 3 versi deployment yang berbeda:

1. **Replit Version** - Express.js + React (Current)
2. **Vercel Version** - Next.js dengan NextAuth.js
3. **PHP Version** - Traditional hosting dengan dual database

Semua versi menggunakan CPX Research App ID **27993** untuk konsistensi data.

---

## 🚀 1. Deploy ke Vercel (Next.js Version)

### Setup Repository
```bash
# Clone atau fork repository ini
git clone https://github.com/Tatang94/surveyku.git
cd surveyku
```

### Konfigurasi Vercel Project
1. **Login ke Vercel Dashboard**
2. **Import Project** dari GitHub
3. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `nextjs-version`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Environment Variables di Vercel
Set variabel berikut di Vercel Dashboard > Settings > Environment Variables:

```env
DATABASE_URL=postgresql://neondb_owner:npg_JTCAZ6fP1cXp@ep-square-wind-afhnt68h.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require

NEXTAUTH_SECRET=your-random-secret-key-32-chars-min
NEXTAUTH_URL=https://your-app.vercel.app

CPX_APP_ID=27993
CPX_SECURE_HASH=your_cpx_secure_hash
```

### Deploy Commands
```bash
# Deploy from local
cd nextjs-version
vercel --prod

# Or push to GitHub (auto deploy)
git add .
git commit -m "Deploy NextJS version"
git push origin main
```

### Troubleshooting Vercel

**Error: routes-manifest.json not found**
- Pastikan `rootDirectory` di vercel.json = `nextjs-version`
- Verifikasi build command menggunakan Next.js, bukan Vite

**Database Connection Issues**
- Pastikan DATABASE_URL sudah di-set di environment variables
- Test koneksi dengan endpoint `/api/test-db`

---

## 💻 2. Deploy ke Traditional PHP Hosting

### Opsi A: Menggunakan Supabase (Recommended)

#### 1. Setup Supabase Database
```bash
# Buat project di supabase.com
# Region: Singapore (terdekat Indonesia)
# Copy connection string
```

#### 2. Upload Files
```bash
# Upload semua file dari folder php-version/
# ke public_html atau www di hosting Anda
```

#### 3. Database Configuration
```php
// Rename config/database-supabase.php menjadi config/database.php
// Update dengan kredensial Supabase Anda:

define('DB_HOST', 'db.your-project-ref.supabase.co');
define('DB_USER', 'postgres');
define('DB_PASS', 'your-supabase-password');
define('DB_NAME', 'postgres');
```

#### 4. Setup Database Schema
- Login ke Supabase Dashboard
- Buka SQL Editor
- Jalankan script dari `sql/supabase-schema.sql`

### Opsi B: Menggunakan Neon Database

#### 1. Upload Files
```bash
# Upload semua file dari folder php-version/
# config/database.php sudah dikonfigurasi untuk Neon
```

#### 2. Verify Database
```bash
# Akses: https://your-domain.com/test-connection.php
# Untuk test koneksi database
# Hapus file ini setelah testing untuk keamanan
```

### Requirements PHP Hosting
- **PHP**: 7.4+ (Recommended: 8.0+)
- **Extensions**: pdo, pdo_pgsql, curl, json
- **PostgreSQL**: Support koneksi eksternal
- **SSL**: Certificate aktif (HTTPS)

---

## ⚡ 3. Deploy ke Replit (Current)

### Current Status
- ✅ Sudah berjalan di port 5000
- ✅ Database PostgreSQL terintegrasi  
- ✅ CPX Research konfigurasi aktif

### Make Public
1. **Open Project Settings**
2. **Enable "Public"** 
3. **Get Public URL**: `https://your-repl.replit.dev`

### Custom Domain (Optional)
1. **Upgrade to Replit Pro**
2. **Link custom domain**
3. **Update CPX postback URL**

---

## 🔗 4. CPX Research Configuration

### App ID: 27993 (Sama untuk semua versi)

### Postback URLs Setup
Set di CPX Research Dashboard:

```
Primary: https://your-domain.com/api/cpx-postback
Replit: https://your-repl.replit.dev/api/cpx-postback  
Vercel: https://your-app.vercel.app/api/cpx-postback
PHP: https://your-hosting.com/api/cpx-postback.php
```

### Security Configuration
```php
// IP Whitelist CPX Research:
$allowed_ips = [
    '188.40.3.73',
    '2a01:4f8:d0a:30ff::2', 
    '157.90.97.92'
];
```

---

## 📊 5. Database Management

### Shared Database Credentials
Semua versi menggunakan Neon PostgreSQL yang sama:

```
Host: ep-square-wind-afhnt68h.c-2.us-west-2.aws.neon.tech
Database: neondb
User: neondb_owner
Password: npg_JTCAZ6fP1cXp
```

### Backup Strategy
- **Neon**: Auto backup daily
- **Supabase**: Auto backup daily (free tier)
- **Manual**: Export via pg_dump

### Schema Migration
```bash
# Replit/Vercel (Drizzle)
npm run db:push

# PHP (Manual SQL)
# Jalankan script migrasi di database admin
```

---

## 🔧 6. Troubleshooting

### Common Issues

**Port 5000 in use (Replit)**
```bash
# Restart workflow
# Atau gunakan kill command
pkill -f "server/index.ts"
```

**Database connection timeout**
- Verify credentials dan network access
- Check hosting provider firewall
- Ensure SSL connection untuk Supabase/Neon

**CPX Research postback fails**
- Verify IP whitelist
- Check HTTPS certificate
- Test postback URL manually

**Build fails on Vercel**
- Ensure `rootDirectory: "nextjs-version"` 
- Verify all dependencies di package.json
- Check environment variables

### Performance Optimization

**PHP Version**
```php
// Enable OPcache di php.ini
opcache.enable=1
opcache.memory_consumption=256
```

**Next.js Version** 
```javascript
// Optimize images dan assets
// Enable compression di vercel.json
```

---

## 📋 7. Production Checklist

### Pre-Launch
- [ ] Database connection verified
- [ ] CPX Research integration tested  
- [ ] SSL certificate active
- [ ] Environment variables set
- [ ] Error logging enabled
- [ ] Backup strategy confirmed

### Post-Launch
- [ ] Monitor error logs
- [ ] Test user registration flow
- [ ] Verify survey completion rewards
- [ ] Check postback URL functionality
- [ ] Monitor database performance

### Security
- [ ] Remove test files (test-connection.php)
- [ ] Set proper file permissions (644 files, 755 directories)
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Implement input validation

---

## 📞 Support

**Developer Contact:**
- **Email**: tatangtaryaedi.tte@gmail.com
- **WhatsApp**: +62 896-6359-6711

**Documentation:**
- **Supabase Setup**: `php-version/SUPABASE_SETUP.md`
- **Next.js Guide**: `nextjs-version/README.md`
- **Project Overview**: `replit.md`

**Resources:**
- **CPX Research**: App ID 27993
- **Database**: Stable Neon PostgreSQL
- **Repository**: https://github.com/Tatang94/surveyku