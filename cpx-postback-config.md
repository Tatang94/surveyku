# CPX Research Postback Configuration Guide

## Informasi Platform SurveyKu

**Platform:** Survey Platform Indonesia  
**Email Support:** tatangtaryaedi.tte@gmail.com  
**WhatsApp Support:** +6289663596711  
**CPX App ID:** 27993  

## URL Postback Utama

### Replit Environment (Primary)
```
https://rest-express-replit-domain.replit.dev/api/cpx-postback
```
*Ganti `rest-express-replit-domain` dengan domain Replit aktual Anda*

### Vercel Environment (Backup)
```
https://your-nextjs-domain.vercel.app/api/cpx-postback
```
*Untuk deployment Next.js di Vercel*

## Parameter Postback yang Diterima

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `user_id` | string | ID pengguna unik dari platform |
| `trans_id` | string | ID transaksi survei dari CPX |
| `reward` | decimal | Jumlah reward dalam USD |
| `currency` | string | Mata uang (biasanya USD) |
| `signature` | string | Hash MD5 untuk validasi keamanan |
| `app_id` | string | App ID (harus 27993) |

## Rumus Signature Validation

```
MD5(user_id + trans_id + reward + secure_hash)
```

## Contoh Request Postback

### GET Request
```
https://your-domain.com/api/cpx-postback?user_id=123&trans_id=TXN456&reward=2.50&currency=USD&signature=abc123def&app_id=27993
```

### POST Request
```bash
curl -X POST https://your-domain.com/api/cpx-postback \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "user_id=123&trans_id=TXN456&reward=2.50&currency=USD&signature=abc123def&app_id=27993"
```

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "message": "Postback processed successfully"
}
```

### Error Response (400/500)
```json
{
  "error": "Invalid signature",
  "message": "Postback validation failed"
}
```

## Konfigurasi di CPX Research Dashboard

1. **Login ke CPX Research Dashboard**
2. **Navigasi ke App Settings**
3. **Set Postback URL:**
   ```
   https://your-actual-replit-domain.replit.dev/api/cpx-postback
   ```
4. **Set Postback Method:** GET atau POST (keduanya didukung)
5. **Enable Signature Validation:** Ya
6. **Test Postback:** Gunakan test tool CPX Research

## Keamanan

### Validasi yang Diterapkan:
- ✅ Signature validation menggunakan MD5 hash
- ✅ App ID validation (harus 27993)
- ✅ Parameter required validation
- ✅ Request method validation (GET/POST)
- ✅ Content-Type validation
- ✅ Rate limiting protection

### Best Practices:
- Selalu gunakan HTTPS di production
- Monitor log untuk aktivitas mencurigakan
- Jaga kerahasiaan secure hash
- Implementasi backup postback URL
- Regular testing postback functionality

## Troubleshooting

### Masalah Umum:

1. **Signature Mismatch**
   - Pastikan secure hash benar
   - Cek urutan parameter dalam hash calculation
   - Verifikasi encoding (UTF-8)

2. **Postback Tidak Diterima**
   - Cek URL postback di CPX dashboard
   - Verifikasi server dapat menerima HTTP requests
   - Test manual dengan curl

3. **Reward Tidak Masuk ke User**
   - Cek log postback di server
   - Verifikasi user_id mapping
   - Cek database transactions

### Log Monitoring:
```bash
# Monitor postback logs
tail -f /path/to/postback.log

# Check for errors
grep "ERROR" /path/to/postback.log
```

## Testing Postback

### Manual Test:
```bash
# Test dengan data dummy
curl -X POST "https://your-domain.com/api/cpx-postback" \
  -d "user_id=1&trans_id=TEST123&reward=1.00&currency=USD&signature=valid_signature&app_id=27993"
```

### Expected Behavior:
1. Postback diterima dan divalidasi
2. User balance bertambah sesuai reward
3. Transaction record dibuat
4. User statistics diupdate
5. Response success dikembalikan ke CPX

## Kontak Support

Jika mengalami masalah dengan konfigurasi postback:

**Email:** tatangtaryaedi.tte@gmail.com  
**WhatsApp:** +6289663596711  
**Subject:** "[CPX Postback] Deskripsi masalah"

Sertakan informasi berikut saat meminta bantuan:
- Domain/URL postback yang digunakan
- Sample postback data
- Error messages dari log
- Screenshots dari CPX dashboard (jika perlu)