# Survey Platform Indonesia - Next.js Version

Versi Next.js dari Survey Platform Indonesia yang dioptimalkan untuk deployment di Vercel.

## Fitur Utama

- ✅ **Next.js 14** dengan App Router
- ✅ **NextAuth.js** untuk autentikasi
- ✅ **PostgreSQL** dengan Drizzle ORM
- ✅ **Tailwind CSS** untuk styling
- ✅ **TypeScript** untuk type safety
- ✅ **Radix UI** untuk komponen UI
- ✅ **CPX Research** integration untuk survei

## Database

Menggunakan database PostgreSQL yang sama dengan versi Express.js:

```
DATABASE_URL: postgresql://neondb_owner:npg_JTCAZ6fP1cXp@ep-square-wind-afhnt68h.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
```

## Environment Variables yang Diperlukan untuk Vercel

```env
DATABASE_URL=postgresql://neondb_owner:npg_JTCAZ6fP1cXp@ep-square-wind-afhnt68h.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key
CPX_APP_ID=27993
CPX_SECURE_HASH=your-cpx-secure-hash
```

## Setup dan Installation

1. Install dependencies:
```bash
cd nextjs-version
npm install
```

2. Setup environment variables:
```bash
cp .env.example .env.local
# Edit .env.local dengan kredensial yang sesuai
```

3. Run database migrations:
```bash
npm run db:push
```

4. Start development server:
```bash
npm run dev
```

## Deployment ke Vercel

1. Push code ke repository GitHub
2. Connect repository ke Vercel
3. Set environment variables di Vercel Dashboard
4. Deploy secara otomatis

## Struktur Proyek

```
nextjs-version/
├── src/
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable components
│   ├── lib/                 # Utilities and configurations
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
└── migrations/              # Database migrations
```

## Fitur Yang Tersedia

- [x] Landing page dengan informasi platform
- [x] Sistem registrasi dan login
- [x] Dashboard pengguna
- [x] Integrasi CPX Research
- [x] Tracking survei dan penghasilan
- [x] Responsive design
- [x] Dark mode support

## API Endpoints

- `/api/auth/[...nextauth]` - NextAuth.js endpoints
- `/api/surveys` - Survey management
- `/api/user/stats` - User statistics
- `/api/transactions` - Transaction history

## Perbedaan dengan Versi Express.js

1. **Framework**: Next.js (App Router) vs Express.js
2. **Autentikasi**: NextAuth.js vs session-based
3. **Deployment**: Vercel vs Replit
4. **API**: API Routes vs Express routes
5. **SSR/SSG**: Built-in Next.js features vs client-side only