# Setup Supabase untuk Survey Platform Indonesia

## Langkah 1: Buat Project Supabase

1. **Kunjungi** [supabase.com](https://supabase.com)
2. **Sign up/Login** dengan akun GitHub atau email
3. **Create new project**
   - Organization: Pilih atau buat baru
   - Name: `survey-platform-indonesia`
   - Database Password: Buat password yang kuat (simpan dengan aman)
   - Region: Singapore (terdekat dengan Indonesia)
4. **Tunggu** project selesai dibuat (2-3 menit)

## Langkah 2: Setup Database Schema

1. **Buka Supabase Dashboard** project Anda
2. **Klik "SQL Editor"** di sidebar kiri
3. **Buat New Query**
4. **Copy-paste** seluruh isi file `sql/supabase-schema.sql`
5. **Klik "Run"** untuk mengeksekusi
6. **Verifikasi** semua tabel berhasil dibuat di tab "Table Editor"

## Langkah 3: Dapatkan Connection String

1. **Klik "Settings"** di sidebar
2. **Pilih "Database"**
3. **Scroll ke "Connection string"**
4. **Copy "URI"** (format: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)

## Langkah 4: Update PHP Configuration

Edit file `config/database.php`:

```php
// Ganti dengan detail Supabase Anda
define('DB_HOST', 'db.abcdefghijklmnop.supabase.co');  // Dari connection string
define('DB_PORT', '5432');
define('DB_NAME', 'postgres');
define('DB_USER', 'postgres');
define('DB_PASS', 'your-database-password');  // Password yang Anda buat
```

### Contoh Connection String:
Jika connection string Anda:
```
postgresql://postgres:your-password@db.abcdefghijklmnop.supabase.co:5432/postgres
```

Maka konfigurasinya:
```php
define('DB_HOST', 'db.abcdefghijklmnop.supabase.co');
define('DB_USER', 'postgres');
define('DB_PASS', 'your-password');
define('DB_NAME', 'postgres');
```

## Langkah 5: Test Koneksi

1. **Upload** file PHP ke hosting
2. **Akses** `index.php` di browser
3. **Coba registrasi** user baru
4. **Check di Supabase** tab "Table Editor" > "users" untuk memastikan data tersimpan

## Langkah 6: Security Setup (Opsional)

### Row Level Security (RLS)
Supabase secara default mengaktifkan RLS. Untuk aplikasi PHP ini, Anda bisa:

1. **Disable RLS** untuk kemudahan (kurang aman):
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_surveys DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
```

2. **Atau gunakan service role** untuk bypass RLS:
   - Di Dashboard > Settings > API
   - Copy "service_role" key (jangan gunakan anon key)
   - Tidak perlu untuk PHP app ini

## Database Schema yang Dibuat

### Tables:
- **users** - Data pengguna dengan profil lengkap
- **surveys** - Master data survei CPX Research
- **user_surveys** - Tracking survei yang dikerjakan user
- **transactions** - Record penghasilan dan withdrawal

### Features:
- **Auto timestamps** dengan trigger
- **Data validation** dengan CHECK constraints
- **Indexes** untuk performa optimal
- **Sample data** untuk testing

## Monitoring & Maintenance

### Dashboard Supabase:
- **Database > Tables** - Lihat dan edit data
- **Database > Logs** - Monitor query dan error
- **Settings > Billing** - Cek usage (free tier: 500MB, 2GB bandwidth)

### Backup:
- Supabase otomatis backup daily
- Export manual via Dashboard > Settings > Database

## Troubleshooting

### Koneksi Gagal:
1. **Check password** di connection string
2. **Verify host/port** sesuai project Anda
3. **Pastikan hosting support** PostgreSQL (php-pgsql)

### Schema Error:
1. **Run schema.sql** lagi jika ada table yang missing
2. **Check permissions** di Supabase (biasanya auto-granted)

### Performance:
- **Free tier** Supabase: 500MB storage, 2GB bandwidth/month
- **Upgrade** ke Pro ($25/month) jika perlu lebih

## Environment Variables (Alternatif)

Untuk keamanan yang lebih baik, gunakan environment variables:

```php
// config/database.php
define('DB_HOST', $_ENV['SUPABASE_HOST'] ?? 'default-host');
define('DB_USER', $_ENV['SUPABASE_USER'] ?? 'postgres');
define('DB_PASS', $_ENV['SUPABASE_PASS'] ?? 'default-pass');
define('DB_NAME', $_ENV['SUPABASE_DB'] ?? 'postgres');
```

Lalu set di hosting control panel atau .env file.

## Production Checklist

- [ ] Database schema berhasil dibuat
- [ ] Connection string sudah benar
- [ ] Test registrasi/login berhasil
- [ ] CPX postback URL sudah di-set
- [ ] SSL certificate aktif (HTTPS)
- [ ] Error logging diaktifkan
- [ ] Backup strategy sudah jelas

## Support

Jika mengalami kesulitan:
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Email Support**: tatangtaryaedi.tte@gmail.com
- **WhatsApp**: +62 896-6359-6711