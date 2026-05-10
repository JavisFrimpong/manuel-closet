# Manuel's Closet

React + Vite storefront for a fashion shop with cart, checkout, Supabase-backed orders, an admin dashboard, and optional order-notification email via Supabase Edge Functions.

## Stack

- **Frontend:** React 18, TypeScript, Vite 5, Tailwind CSS, React Router
- **Backend:** [Supabase](https://supabase.com/) (Postgres, Auth, Storage, Edge Functions)
- **Email:** [Resend](https://resend.com/) from the `send-order-email` Edge Function (recommended on Edge; raw SMTP is often unreliable)

## Prerequisites

- Node.js 18+
- A Supabase project
- (Optional) Resend account for transactional email

## Environment variables

Create a `.env` in the project root (never commit real secrets):

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

These must be present **when you run `npm run build`** so production bundles contain the correct API URL and anon key.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

The Vite dev server proxies **`/supabase-fn`** → your project’s **`/functions/v1`**, so invoking Edge Functions from the browser avoids many local CORS issues. Always use `npm run dev` when testing order emails locally.

Other scripts:

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Start Vite dev server    |
| `npm run build`| Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint                   |

## Database

SQL migrations live under `supabase/migrations/`. Apply them to your Supabase database with the Supabase CLI (`supabase db push` after `supabase link`) or by running the SQL in the Dashboard SQL editor.

Key tables include `products`, `orders`, `order_items`, and optional `smtp_config`. Row Level Security (RLS) is enabled; migrations include policies so anonymous users can place orders and read for tracking, while authenticated admins manage products and update order status.

## Supabase Auth (admin & password reset)

1. In the Supabase Dashboard: **Authentication → URL configuration**
2. Set **Site URL** to your deployed site (or `http://localhost:5173` for local dev).
3. Add **Redirect URLs**, including:
   - `http://localhost:5173/admin`
   - `https://your-production-domain.com/admin`

Admin routes live at **`/admin`**. Use **Forgot password** on the sign-in screen to receive a reset link; after opening the link you should see **Set new password** before returning to normal sign-in.

## Edge Function: order email

Configuration is in `supabase/config.toml`:

```toml
[functions.send-order-email]
verify_jwt = false
```

Deploy:

```bash
npx supabase functions deploy send-order-email --project-ref YOUR_PROJECT_REF
```

### Secrets (Supabase Dashboard → Project Settings → Edge Functions → Secrets)

| Secret               | Purpose |
| -------------------- | ------- |
| `RESEND_API_KEY`     | Resend API key |
| `ORDER_NOTIFY_EMAIL` | Inbox that receives new-order notifications |

Optional: `RESEND_FROM` if you use a verified domain in Resend (instead of the default onboarding sender).

### Request body from the app

After an order is inserted, the storefront calls `send-order-email` with JSON shaped like:

```json
{
  "orderId": "uuid",
  "orderNumber": "MC-0001",
  "customerName": "…",
  "items": [
    {
      "order_id": "uuid",
      "product_id": "uuid",
      "product_name": "…",
      "product_price": 0,
      "quantity": 1,
      "size": "",
      "color": "",
      "subtotal": 0
    }
  ],
  "totalAmount": 0,
  "deliveryAddress": "…"
}
```

Ensure **`supabase/functions/send-order-email/index.ts`** parses this payload and sends mail accordingly (e.g. via Resend). If the handler expects different field names, align it with the payload above or adjust `OrderReview.tsx`.

The client helper `src/lib/invokeSendOrderEmail.ts` invokes this function and surfaces non-2xx response bodies so you can see real errors on the order confirmation page.

## Deploying the frontend

Build static assets:

```bash
npm run build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages, etc.). Configure the same `VITE_SUPABASE_*` variables in the host’s environment for production builds.

Ensure your host’s **Content Security Policy** (if any) allows `connect-src` to your Supabase URL (`https://*.supabase.co`) so the browser can call REST, Auth, and Functions.

## Project layout

```
src/
  components/     # Header, cart, product card
  context/        # Cart state
  lib/            # Supabase client, Edge invoke helper
  pages/          # Storefront, checkout, orders, tracking
  pages/admin/    # Login, dashboard, products, orders
supabase/
  functions/      # Edge Functions
  migrations/     # Postgres migrations
```

## License

Private project — all rights reserved unless stated otherwise.
