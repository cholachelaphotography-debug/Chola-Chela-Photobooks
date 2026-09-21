# Update package (based on your uploaded files)

Your 8 files were reviewed and merged as follows:

## Kept from your upload
- next.config.ts (eslint ignoreDuringBuilds, images config)
- next-auth.d.ts (session role typing)
- EditorClient zoom/position behaviour (extended with cover text + two-page toggle)
- PostgreSQL as database provider

## Upgraded from your upload
- prisma/schema.prisma — materials, technician role, payment/print workflow fields, coverText
- OrderForm.tsx — material pricing, Pay Now/Later, Mobile Money & Mastercard, shipping notice, cancel unpaid
- api/orders/route.ts — new order creation workflow
- admin page + AdminOrders — confirm payment, release for print
- order page — passes new order fields

## Added (new files)
- src/lib/pricing.ts
- src/app/api/materials/route.ts
- src/app/api/orders/[id]/route.ts (actions)
- src/app/api/admin/technicians/route.ts
- src/app/technician/* 
- scripts/seed-materials.js, make-technician.js

## After extract
```
npx prisma db push
node scripts/seed-materials.js
npm run dev
```
