# CPX Research Postback Deployment Guide
**SurveyKu Platform - Support: tatangtaryaedi.tte@gmail.com | +6289663596711**

## Keamanan IP Whitelist

**PENTING**: Semua implementasi postback dilengkapi validasi IP whitelist CPX Research.

### IP yang Diotorisasi:
- `188.40.3.73`
- `2a01:4f8:d0a:30ff::2`
- `157.90.97.92`

Request dari IP lain akan ditolak dengan error 403.

## File Postback yang Telah Dibuat

### 1. **cpx-postback.php** - PHP Standalone Version
- File PHP yang dapat di-upload ke hosting web apapun
- Menerima postback dari CPX Research dan meneruskan ke API Node.js
- Cocok untuk hosting shared atau VPS dengan PHP

### 2. **cpx-postback-standalone.js** - Node.js Standalone Server
- Server Node.js terpisah khusus untuk menangani postback
- Dapat di-deploy di Heroku, Railway, atau VPS
- Include health check dan test endpoints

### 3. **API Endpoints di Platform Utama**
- **Replit Express.js**: `/api/cpx-postback` (sudah ada di routes.ts)
- **Vercel Next.js**: `/api/cpx-postback` (baru dibuat di route.ts)

## URL Postback untuk CPX Research Dashboard

### Option 1: Replit Express.js (Primary)
```
https://[YOUR-REPLIT-DOMAIN].replit.dev/api/cpx-postback
```

### Option 2: Vercel Next.js (Backup)
```
https://[YOUR-VERCEL-DOMAIN].vercel.app/api/cpx-postback
```

### Option 3: PHP Hosting (Fallback)
```
https://[YOUR-HOSTING].com/cpx-postback.php
```

### Option 4: Standalone Node.js Server
```
https://[YOUR-HEROKU-APP].herokuapp.com/postback
```

## Konfigurasi CPX Research

**App ID:** 27993  
**Postback Method:** GET atau POST (keduanya didukung)  
**Signature Validation:** Enabled  

### Parameter yang Dikirim CPX:
- `app_id`: 27993
- `user_id`: ID pengguna dari platform
- `trans_id`: ID transaksi unik
- `reward`: Jumlah reward dalam USD
- `currency`: USD
- `signature`: MD5 hash untuk validasi

### Rumus Signature:
```
MD5(user_id + trans_id + reward + secure_hash)
```

## Environment Variables yang Diperlukan

```env
# CPX Research Configuration
CPX_SECURE_HASH=your-actual-secure-hash-from-cpx-dashboard
CPX_APP_ID=27993

# Database (sudah dikonfigurasi)
DATABASE_URL=postgresql://neondb_owner:npg_JTCAZ6fP1cXp@ep-square-wind-afhnt68h.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require

# API Base URL (untuk standalone servers)
API_BASE_URL=https://your-replit-domain.replit.dev
```

## Testing Postback

### 1. Health Check
```bash
curl https://your-domain.com/health
```

### 2. Manual Test
```bash
curl -X POST "https://your-domain.com/api/cpx-postback" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "27993",
    "user_id": "1",
    "trans_id": "TEST123",
    "reward": "2.50",
    "currency": "USD",
    "signature": "generated-signature"
  }'
```

### 3. Expected Response
```json
{
  "success": true,
  "message": "Postback processed successfully",
  "trans_id": "TEST123",
  "timestamp": "2025-06-28T12:34:56.789Z"
}
```

## Deployment Options

### Rekomendasi untuk Production:

1. **Primary**: Gunakan Replit Express.js endpoint
   - Sudah terintegrasi dengan database
   - Logging dan monitoring built-in
   - Mudah maintenance

2. **Backup**: Deploy PHP file ke hosting terpisah
   - Redundancy jika Replit down
   - Cost-effective
   - Reliable untuk high traffic

3. **Enterprise**: Standalone Node.js server
   - Dedicated resources untuk postback
   - Advanced monitoring dan scaling
   - Custom business logic

## Security Checklist

- ✅ Signature validation implemented
- ✅ App ID validation
- ✅ Parameter sanitization
- ✅ HTTPS only in production
- ✅ Rate limiting protection
- ✅ Request logging untuk audit
- ✅ Error handling yang proper

## Monitoring dan Logging

### Log Files to Monitor:
- `cpx-postback.log` (PHP version)
- Console logs (Node.js versions)
- Database transaction logs

### Key Metrics:
- Postback success rate
- Response time
- Failed validations
- User reward processing

## Troubleshooting Common Issues

### 1. Signature Mismatch
- Verify secure hash di environment variable
- Check parameter order dalam signature calculation
- Ensure UTF-8 encoding

### 2. User Not Found
- Verify user_id mapping
- Check database connection
- Validate user exists in system

### 3. Duplicate Transactions
- Check trans_id uniqueness validation
- Monitor database constraints
- Implement idempotency

### 4. Reward Not Applied
- Check balance update logic
- Verify transaction creation
- Monitor database commit status

## File yang Siap untuk Deployment

1. **cpx-postback.php** → Upload ke web hosting
2. **cpx-postback-standalone.js** → Deploy ke Heroku/Railway
3. **nextjs-version/src/app/api/cpx-postback/route.ts** → Deploy dengan Vercel
4. **server/routes.ts** → Sudah aktif di Replit

## Kontak Support

**Technical Support:**
- Email: tatangtaryaedi.tte@gmail.com
- WhatsApp: +6289663596711
- Subject: "[CPX Postback] Issue Description"

**Sertakan informasi berikut saat request support:**
- Postback URL yang digunakan
- Sample postback data
- Error logs atau screenshots
- Expected vs actual behavior