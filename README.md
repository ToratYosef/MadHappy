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
DATABASE_URL=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ADMIN_EMAILS=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

> ℹ️ Generate unique values for sensitive entries (e.g. `NEXTAUTH_SECRET`, Stripe keys) and keep them out of version control—store them in your local `.env` file or your deployment platform's secret manager.

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
- Add `PRINTIFY_API_TOKEN` (private API token) and `PRINTIFY_SHOP_ID` (numeric shop id) to your environment.
- Server-side proxy routes are available for Printify product operations:
  - `GET /api/printify/products` (supports `limit`, `page`, optional `shopId`)
  - `POST /api/printify/products` to create a product
  - `GET | PUT | DELETE /api/printify/products/[productId]`
  - `GET /api/printify/products/[productId]/gpsr`
  - `POST /api/printify/products/[productId]/publish`
  - `POST /api/printify/products/[productId]/publishing-succeeded`
  - `POST /api/printify/products/[productId]/publishing-failed`
  - `POST /api/printify/products/[productId]/unpublish`
- Admin > Products includes a **Sync from Printify** button that mirrors Printify catalog data (colors, sizes, images linked to variants) into the local product tables. The sync loop respects the Printify pagination limit (50 items/page) and caps outbound API calls at 50 per run.

## Products
- Products are stored locally in the `Product` and `ProductVariant` tables. You can seed or manage them directly via the admin UI.
- Checkout uses Stripe Payment Element with a custom UI and creates pending orders; fulfillment is managed in-house.

## Notes
- Admin routes are protected by middleware and NextAuth; only emails in `ADMIN_EMAILS` or `AdminUser` records can sign in.
- Checkout session verifies items against live DB data before creating Stripe sessions.
- Webhook handles `checkout.session.completed` to create orders and decrement inventory inside a transaction.
- Tailwind theme colors: off-white background, near-black text, taupe, deep green, muted gold accents.
