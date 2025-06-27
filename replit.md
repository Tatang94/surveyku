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

## User Preferences

Preferred communication style: Simple, everyday language.