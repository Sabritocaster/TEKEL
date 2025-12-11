# https://api.vercel.com/v1/integrations/deploy/prj_rO86VGQzXbfKlEmbZRj4CZ2kmvZO/8Ol3lnb3fT

# Stock Tracking Application

A full-stack stock tracking application built with Next.js, MongoDB, and Prisma.

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router)
- **Database**: MongoDB
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Language**: JavaScript/JSX

## Project Structure

This project follows a **Feature-Based Modular Architecture**:

- `app/` - Next.js App Router routes and layouts
- `features/` - Feature modules (products, orders, auth, dashboard)
- `components/` - Global/shared UI components
- `lib/` - Shared utilities and configurations
- `prisma/` - Database schema and migrations

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Configure your MongoDB connection string in `.env.local`

4. Set up Prisma:
```bash
npm run db:generate
npm run db:push
```

5. (Optional) Seed the database:
```bash
npm run db:seed
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture

This project uses an Integrated Feature-Based Modular Architecture where:
- Each feature module contains its own components, server actions, and data access layer
- Features are self-contained but can share global components and utilities
- Server actions and data access are organized within each feature's `servers/` directory

