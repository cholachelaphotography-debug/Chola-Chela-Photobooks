# Chola Chela Photography — Production Platform

Production-ready foundation for Zambia’s photo book design & printing service.

## What’s included

- **Next.js 15** (App Router) + TypeScript + Tailwind
- **Real authentication** (email + password via Auth.js / NextAuth)
- **Prisma + SQLite** database (easy local start, switchable to PostgreSQL)
- **Cloudinary** integration for photo storage (optional for local demo)
- **Photo upload API**
- **Photo book projects** with auto-create support
- **Order model** ready for payments & fulfillment
- Templates system (Classic, Wedding, Travel, Family, etc.)

## Quick Start

### 1. Install dependencies

```bash
cd chola-chela-prod
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Edit `.env` and add your values (especially Cloudinary if you want real image hosting).

### 3. Initialize the database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Cloudinary Setup (Recommended)

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Copy **Cloud name**, **API Key** and **API Secret**
3. Paste them into `.env`

Without Cloudinary the app still works (stores images as base64 for demo purposes).

## Project Structure

```
src/
  app/
    api/
      auth/          → Login / Register
      photos/        → Upload & list photos
      projects/      → Create & manage photo books
      orders/        → (coming) Order & payment
    (auth)/
      login/
      register/
    dashboard/       → Client studio
  components/
  lib/
    auth.ts
    prisma.ts
    cloudinary.ts
    templates.ts
prisma/
  schema.prisma      → Database models
```

## Next features to add

- [ ] Full Dashboard UI (port the current prototype UI)
- [ ] Photo book editor (drag & drop)
- [ ] Stripe / Flutterwave payment
- [ ] Admin dashboard
- [ ] PDF generation for print
- [ ] Email notifications

## Switching to PostgreSQL later

Change the `datasource` in `prisma/schema.prisma` to:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then update `DATABASE_URL` in `.env` to your Postgres connection string.

---

Built for **Chola Chela Photography** · Lusaka, Zambia
