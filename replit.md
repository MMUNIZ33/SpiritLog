# Overview

My Daily Office is a spiritual practice tracking application that helps users maintain consistent habits across meditation, prayer, and reading. The app provides individual practice tracking, community features to see how others are practicing, analytics dashboards, and calendar views for historical data. Built as a full-stack web application with a React frontend and Express backend, it uses PostgreSQL for data persistence and includes Replit authentication for user management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Single-page application using functional components and hooks
- **Wouter**: Lightweight client-side routing instead of React Router
- **TanStack Query**: Server state management for API calls, caching, and data synchronization
- **React Hook Form with Zod**: Form handling and validation with type-safe schemas
- **Tailwind CSS**: Utility-first styling with custom CSS variables for theming
- **shadcn/ui**: Pre-built component library based on Radix UI primitives
- **Dark theme**: Application uses a zen-inspired dark color scheme throughout

## Backend Architecture
- **Express.js**: RESTful API server with middleware for logging, JSON parsing, and error handling
- **TypeScript**: Type safety across the entire backend codebase
- **Modular routing**: Separate route handlers organized by feature area
- **Storage abstraction**: Interface-based storage layer for easy testing and potential database switching
- **Middleware pipeline**: Request logging, authentication, and error handling

## Database Design
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL
- **Drizzle ORM**: Type-safe database queries and migrations
- **Core entities**:
  - Users: Profile information from Replit auth
  - Practice entries: Daily spiritual practice records (meditation, prayer, reading minutes + notes)
  - Sessions: Required for Replit authentication system
- **Data relationships**: Practice entries linked to users, supporting date-based queries and statistics

## Authentication System
- **Replit Auth**: OIDC-based authentication using Replit's identity system
- **Passport.js**: Authentication middleware with OpenID Connect strategy
- **Session management**: PostgreSQL-backed sessions with connect-pg-simple
- **Required user operations**: Mandatory getUser/upsertUser methods for Replit auth integration

## API Design
- **RESTful endpoints**: Standard HTTP methods for CRUD operations
- **Route structure**:
  - `/api/auth/*`: Authentication and user management
  - `/api/practice-entries/*`: Daily practice CRUD operations
  - `/api/stats`: User statistics and analytics
  - `/api/community`: Community feed functionality
- **Input validation**: Zod schemas shared between frontend and backend
- **Error handling**: Consistent error responses with proper HTTP status codes

# External Dependencies

## Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Replit**: Development and hosting platform with integrated authentication

## Frontend Libraries
- **Radix UI**: Accessible component primitives for complex UI elements
- **Lucide React**: Icon library for consistent iconography
- **date-fns**: Date manipulation and formatting utilities
- **class-variance-authority**: Type-safe CSS variant management

## Backend Services
- **Replit OIDC**: Authentication provider with automatic user provisioning
- **Express ecosystem**: Standard middleware for sessions, parsing, and security

## Development Tools
- **Vite**: Frontend build tool with HMR and development server
- **ESBuild**: Backend bundling for production deployment
- **Drizzle Kit**: Database migration and schema management
- **PostCSS**: CSS processing with Tailwind and autoprefixer