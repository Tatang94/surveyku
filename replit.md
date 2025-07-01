# replit.md

## Overview

This is a full-stack survey platform application built with React + TypeScript frontend and Express.js backend. The platform allows users to register, complete surveys, earn money, and manage their earnings. It integrates with CPX Research for survey provisioning and uses PostgreSQL with Drizzle ORM for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL store
- **Authentication**: Session-based authentication with bcrypt password hashing
- **API Design**: RESTful endpoints with proper error handling

## Key Components

### Authentication System
- User registration with profile data collection
- Session-based login/logout
- Password hashing with bcrypt
- Protected route middleware

### Survey Management
- Integration with CPX Research API for survey provisioning
- Survey URL generation with secure hashing
- User survey tracking and completion status
- Reward calculation and distribution

### User Profile System
- Comprehensive user registration with demographic data
- Profile completeness tracking
- User statistics and earnings tracking

### Transaction System
- Earnings tracking from completed surveys
- Withdrawal functionality with minimum thresholds
- Transaction history management

## Data Flow

1. **User Registration**: Users provide demographic information for better survey targeting
2. **Survey Discovery**: Platform fetches available surveys from CPX Research based on user profile
3. **Survey Completion**: Users complete surveys through embedded CPX Research interface
4. **Reward Processing**: Completed surveys trigger postback notifications for reward distribution
5. **Earnings Management**: Users can track earnings and request withdrawals

## External Dependencies

### CPX Research Integration
- Survey provisioning and management
- Secure URL generation with MD5 hashing
- Postback system for completion notifications
- User profiling for targeted survey delivery

### Database
- PostgreSQL for persistent data storage
- Drizzle ORM for type-safe database operations
- Migration system for schema management

### UI/UX Libraries
- Radix UI for accessible component primitives
- Lucide React for consistent iconography
- TanStack Query for efficient data fetching
- React Hook Form with Zod validation

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- Express server with TypeScript compilation via tsx
- Environment-based configuration
- Session storage with connect-pg-simple

### Production
- Frontend built and served as static files
- Backend compiled to ESM JavaScript
- PostgreSQL database with connection pooling
- Session persistence with database store

### Environment Configuration
- Database connection via `DATABASE_URL`
- CPX Research credentials (`CPX_APP_ID`, `CPX_SECURE_HASH`)
- Session secret for secure authentication
- Configurable postback URLs for webhooks

## Changelog
- June 27, 2025. Initial setup
- June 27, 2025. Database integration with PostgreSQL completed
- June 27, 2025. CPX Research integration with real credentials (App ID: 27993)
- June 27, 2025. Animated splash screen with logo implemented

## Recent Changes
✓ PostgreSQL database successfully integrated with Drizzle ORM
✓ DatabaseStorage class replacing in-memory storage
✓ Real CPX Research credentials configured (App ID: 27993, secure hash)
✓ Animated splash screen with floating logo and progress bar
✓ Indonesian language interface maintained throughout
✓ Complete survey workflow with postback URL handling
✓ Migration from Replit Agent to Replit environment completed (June 28, 2025)
✓ Next.js version created for Vercel deployment with same PostgreSQL database
✓ Stable database credentials provided for consistent import/export
✓ Comprehensive help system with FAQ, contact info, and legal documents (June 28, 2025)
✓ Multiple CPX postback implementations created for different deployment scenarios
✓ Contact information updated: tatangtaryaedi.tte@gmail.com, +6289663596711
✓ IP whitelist security implemented across all postback files (June 28, 2025)
✓ CPX Research authorized IPs: 188.40.3.73, 2a01:4f8:d0a:30ff::2, 157.90.97.92
✓ Project successfully migrated to Replit environment with stable PostgreSQL database (June 28, 2025)
✓ Dependencies installed and database tables created automatically
✓ Application server running on port 5000 with frontend/backend integration
✓ Environment variables configured for production-ready deployment
✓ PHP version simplified into single-file application in `surveyku-php/` folder (June 28, 2025)
✓ All-in-one PHP file with authentication, CPX integration, and responsive design
✓ Simplified deployment with just index.php, .htaccess, and README
✓ Same PostgreSQL database integration for consistency across versions
✓ Old complex PHP version removed, replaced with streamlined version
✓ PHP version updated to use MySQL/MariaDB for private hosting compatibility (June 28, 2025)
✓ Separate config.php file created for easier database configuration
✓ MySQL schema with proper foreign keys and indexes implemented
✓ Standalone CPX postback file created for flexible deployment options (June 28, 2025)
✓ Complete postback security with IP whitelist, logging, and duplicate protection
✓ Monthly withdrawal system implemented with admin approval (June 28, 2025)
✓ Withdrawal period restricted to 1st-5th of each month for DANA payments
✓ Admin dashboard for managing withdrawal requests and user statistics
✓ Multi-payment method support (DANA, GoPay, OVO, Bank Transfer)
✓ Animated splash screen added to PHP version for consistency (June 28, 2025)
✓ All deployment versions now feature identical splash screen and UX
✓ Project successfully migrated to Replit environment from Replit Agent (July 1, 2025)
✓ PostgreSQL database automatically created and connected
✓ All dependencies installed and application running on port 5000
✓ Cyber attack maps removed to focus exclusively on SurveyKu platform
✓ Pattern lock authentication system implemented (July 1, 2025)
✓ Database schema updated from password to pattern storage
✓ Interactive pattern lock components created with visual feedback
✓ Multi-step registration and login flow with pattern confirmation

## Database Credentials (Stable)
PostgreSQL URL: postgresql://neondb_owner:npg_JTCAZ6fP1cXp@ep-square-wind-afhnt68h.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
Host: ep-square-wind-afhnt68h.c-2.us-west-2.aws.neon.tech
Port: 5432
User: neondb_owner
Database: neondb

## Deployment Options
1. **Replit (Current)**: Express.js + React, running on port 5000
2. **Vercel (Next.js)**: Complete Next.js version in `nextjs-version/` folder, ready for Vercel deployment
3. **PHP Hosting**: Simplified PHP version in `surveyku-php/` folder, single-file application for traditional web hosting

## CPX Research Postback Files
Multiple postback implementations created for flexible deployment:
- `cpx-postback.php` - PHP standalone for web hosting
- `cpx-postback-standalone.js` - Node.js dedicated server
- `server/routes.ts` - Integrated endpoint (current Replit)
- `nextjs-version/src/app/api/cpx-postback/route.ts` - Next.js API route

**Primary Postback URL:** https://[replit-domain].replit.dev/api/cpx-postback
**Backup URLs:** Available for redundancy and high availability

## Help & Support System
Comprehensive help modal with:
- FAQ for all user categories (General, Earnings, Surveys, Account)
- Step-by-step platform usage guide
- Direct contact integration (Email & WhatsApp)
- Legal documents (Terms & Privacy Policy)
- Accessible from header navigation and user menu

## User Preferences

Preferred communication style: Simple, everyday language in Indonesian.
Database: PostgreSQL with Drizzle ORM
Authentication: Session-based with bcrypt
UI: Animated splash screen with professional logo design