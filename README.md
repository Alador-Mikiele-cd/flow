# SireyFlow — Admin

Next.js + NextAuth v5 (Credentials only, no OAuth providers) + MongoDB.
Admin-only for now — one login, one dashboard. More screens (stock, sales, receipts, revenue) get added incrementally.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. `.env.local` is already set up with your MongoDB URI and an AUTH_SECRET.

3. Create your admin login (there's no signup page on purpose — this creates the one account directly in MongoDB):
   ```
   node scripts/create-admin.mjs you@example.com yourpassword "Your Name"
   ```

4. Run the dev server:
   ```
   npm run dev
   ```

5. Go to http://localhost:3000 — you'll be redirected to `/login`. Sign in with the account you created in step 3. After login you land on `/dashboard`, which is currently just a placeholder confirming auth works.

## How auth works

- `auth.ts` — NextAuth config: Credentials provider only, checks email/password against the `users` collection in MongoDB (password stored as a bcrypt hash).
- `proxy.ts` — protects every route except `/login` and the auth API; redirects signed-out visitors to `/login` automatically.
- `lib/mongodb.ts` — shared MongoDB connection.
- `scripts/create-admin.mjs` — one-off script to insert an admin user (hashes the password for you).

## Next up

Stock (add/view designs + quantities), record a sale, receipt view, and a revenue summary — building these one at a time from here.

## See it with sample data

Run this once to populate 10 sample designs with placeholder images, so you can see the dashboard fully populated:
```
node scripts/seed-products.mjs
```
Safe to re-run — it skips any design code that already exists. Replace the placeholder image URLs with real product photo links any time by editing a design (or re-running with your own).
