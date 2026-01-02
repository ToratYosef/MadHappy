# low key high — Premium Minimal E‑commerce

A minimal, premium e-commerce experience for **low key high** built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, **Prisma**, **Neon Postgres**, **NextAuth**, and **Stripe Checkout**. Includes a protected admin dashboard for catalog and order management.

## Features
- Storefront pages: `/`, `/shop`, `/product/[slug]`, `/cart`, `/success`, `/cancel`
- Admin dashboard: `/admin`, `/admin/orders`, `/admin/orders/[id]`, `/admin/products`, `/admin/products/new`, `/admin/products/[id]`, `/admin/settings`, `/admin/login`
- Authentication via NextAuth (Google provider) with Prisma adapter and admin allowlist (`ADMIN_EMAILS`) + `AdminUser` table
- Zustand cart with localStorage persistence
- Stripe Checkout + webhook for order creation, inventory decrement, and idempotency
- Prisma models for products, variants, images, orders, admin users, site settings, and NextAuth tables
- Tasteful motion using Framer Motion respecting reduced-motion preferences

## Getting Started

1. **Install dependencies**

```bash
npm install
```

2. **Environment variables**

Copy `.env.example` to `.env` and fill in values:

```
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ADMIN_EMAILS=you@domain.com
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
ADMIN_EMAIL=
ADMIN_PASSWORD=
PRINTIFY_TOKEN=
PRINTIFY_SHOP_ID=
PRINTIFY_WEBHOOK_SECRET=
```

3. **Prisma & database**

Run migrations and generate the client:

```bash
npx prisma migrate dev --name init
npm run prisma:generate
```

Seed with sample products and admin users (from `ADMIN_EMAILS`):

```bash
npm run prisma:seed
```

4. **Development server**

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Stripe webhook (local)
Use the Stripe CLI to forward events:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Printify integration
- Products are synced from Printify via `POST /api/admin/printify/sync-products` and cached in the database (`printify_products_cache`, `printify_variant_cache`).
- Store your Printify token and shop ID in `PRINTIFY_TOKEN` and `PRINTIFY_SHOP_ID`. Webhook HMAC verification uses `PRINTIFY_WEBHOOK_SECRET`.
- Public catalog routes (`/api/products`, `/api/products/:id`) serve from the cache; no Printify calls are made from the browser.
- Checkout uses Stripe Payment Element with a custom UI, creates a pending order, and Stripe webhooks submit paid orders to Printify for fulfillment.

## Notes
- Admin routes are protected by middleware and NextAuth; only emails in `ADMIN_EMAILS` or `AdminUser` records can sign in.
- Checkout session verifies items against live DB data before creating Stripe sessions.
- Webhook handles `checkout.session.completed` to create orders and decrement inventory inside a transaction.
- Tailwind theme colors: off-white background, near-black text, taupe, deep green, muted gold accents.
