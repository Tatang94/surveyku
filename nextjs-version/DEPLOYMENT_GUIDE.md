# Panduan Deployment ke Vercel

## Langkah-langkah Deployment

### 1. Persiapan Repository

1. Buat repository baru di GitHub
2. Upload folder `nextjs-version` ke repository
3. Pastikan semua file sudah ter-commit

### 2. Vercel Setup

1. Buka [vercel.com](https://vercel.com) dan login
2. Klik "New Project"
3. Import repository GitHub Anda
4. Pilih framework "Next.js" (otomatis terdeteksi)

### 3. Environment Variables

Di Vercel Dashboard, tambahkan environment variables berikut:

```
DATABASE_URL = postgresql://neondb_owner:npg_JTCAZ6fP1cXp@ep-square-wind-afhnt68h.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require

NEXTAUTH_URL = https://nama-proyek-anda.vercel.app

NEXTAUTH_SECRET = buatlah-secret-key-yang-aman-minimal-32-karakter

CPX_APP_ID = 27993

CPX_SECURE_HASH = dapatkan-dari-cpx-research-dashboard
```

### 4. Deploy

1. Klik "Deploy" di Vercel
2. Tunggu proses build selesai
3. Aplikasi akan tersedia di URL Vercel

### 5. Custom Domain (Opsional)

1. Di Vercel Dashboard, buka tab "Domains"
2. Tambahkan domain custom Anda
3. Update DNS settings sesuai petunjuk Vercel

## Database Migration

Database sudah terkonfigurasi dan tabel sudah ada. Tidak perlu migrasi tambahan.

## Testing

1. Buka URL deployment
2. Test registrasi pengguna baru
3. Test login
4. Test akses dashboard
5. Test integrasi survei CPX Research

## Monitoring

- Gunakan Vercel Analytics untuk monitoring performa
- Check logs di Vercel Dashboard untuk debugging
- Monitor database connections di Neon Dashboard

## Troubleshooting

### Error Build
- Pastikan semua dependencies terinstall
- Check TypeScript errors
- Pastikan environment variables sudah set

### Error Database
- Verifikasi DATABASE_URL benar
- Pastikan database accessible dari Vercel
- Check koneksi di Neon Dashboard

### Error NextAuth
- Pastikan NEXTAUTH_SECRET sudah set
- Update NEXTAUTH_URL dengan domain yang benar
- Verifikasi callback URLs