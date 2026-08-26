# Branched

A structured, searchable classifieds marketplace — housing, jobs, marketplace goods, services,
vehicles, and community listings — built to replace unsafe, unsearchable Telegram group chats.

Built with Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui-style components, Prisma +
PostgreSQL, NextAuth (Google + email/password), UploadThing for image storage, and PostgreSQL
full-text search.

---

## 1. Features

- **Auth**: email/password and Google sign-in (NextAuth), profile page, avatar upload
- **Listings**: create / edit / delete, multi-image upload, 6 categories, optional price
- **Browse**: category filters, keyword search (Postgres full-text search), sort by newest/price,
  pagination
- **Listing detail**: image gallery, seller card, "Contact seller" messaging entry point
- **Messaging**: 1:1 conversations tied to a listing, polling-based updates (no websockets needed)
- **Favorites**: save/unsave listings, dedicated favorites page
- **Trust & safety**: report listing / report user, `isFlagged` + `isBanned` fields, auto-flag
  after repeated reports — a foundation for an admin moderation queue (not built in this MVP, but
  the schema and report table are ready for one)

## 2. Project structure

```
branched/
├── prisma/
│   ├── schema.prisma        # All data models
│   ├── seed.ts               # Demo categories, users, listings
│   └── sql/fulltext_search.sql
├── src/
│   ├── app/
│   │   ├── (auth)/login, register/
│   │   ├── api/               # All backend routes (auth, listings, messages, favorites, reports...)
│   │   ├── browse/
│   │   ├── favorites/
│   │   ├── listings/[id], listings/[id]/edit, listings/new
│   │   ├── messages/, messages/[id]/
│   │   ├── profile/[id], profile/edit
│   │   ├── layout.tsx, page.tsx, globals.css
│   ├── components/
│   │   ├── ui/                # shadcn-style primitives (button, input, card, dialog, etc.)
│   │   ├── listings/           # ListingCard, ListingForm, ImageUploader, FavoriteButton...
│   │   ├── messaging/          # ConversationList, ChatWindow
│   │   ├── search/             # SearchBar, CategoryFilter
│   │   ├── layout/              # Navbar, Footer, Logo
│   │   └── report-button.tsx
│   ├── lib/                    # prisma client, auth config, uploadthing config, utils
│   ├── types/                  # shared TS types + NextAuth type augmentation
│   └── middleware.ts           # protects authenticated-only routes
├── .env.example
├── package.json
└── tailwind.config.ts
```

## 3. Prerequisites

- Node.js 18.18+ (20.x recommended)
- A PostgreSQL database (local via Docker, or a hosted one — Neon, Supabase, Railway, RDS...)
- (Optional but recommended for full feature parity) accounts for:
  - Google Cloud Console (OAuth client) — for "Continue with Google"
  - UploadThing — for image uploads

## 4. Local setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment template and fill in values
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/branched?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""
```

If you don't have Postgres running locally, the fastest option is Docker:

```bash
docker run --name branched-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=branched -p 5432:5432 -d postgres:16
```

### 4.1 Create the database schema

```bash
npx prisma db push
```

### 4.2 Enable full-text search

Prisma doesn't manage the generated `tsvector` column, so apply it once with raw SQL:

```bash
psql "$DATABASE_URL" -f prisma/sql/fulltext_search.sql
```

(No `psql` client? Paste the contents of that file into any Postgres GUI — TablePlus, DBeaver,
Supabase's SQL editor, etc. The app also works without this step — search automatically falls
back to a simple `ILIKE` filter — but full-text search is faster and ranks results by relevance.)

### 4.3 Seed demo data

```bash
npm run db:seed
```

This creates 6 categories, 3 demo users, and 6 demo listings.
Demo login: `anna@example.com` / `password123`

### 4.4 Google OAuth (optional)

1. Go to https://console.cloud.google.com/apis/credentials
2. Create an OAuth Client ID (Web application)
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy the client ID/secret into `.env`

Without this, email/password login still works fully.

### 4.5 UploadThing (optional, for image uploads)

1. Sign up at https://uploadthing.com and create an app
2. Copy `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` into `.env`

Without this, listing/profile forms still work but image upload will show an error — you can
still submit a listing with 0 images.

### 4.6 Run the app

```bash
npm run dev
```

Visit http://localhost:3000

Other useful scripts:

```bash
npm run db:studio    # Prisma Studio — browse/edit data visually
npm run db:migrate   # Generate a versioned migration (use instead of db:push in production)
npm run lint
npm run build && npm run start
```

## 5. Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket
2. Import the project in Vercel
3. Add the same environment variables from `.env` in Vercel's Project Settings → Environment
   Variables (use your production `DATABASE_URL`, a fresh `NEXTAUTH_SECRET`, and
   `NEXTAUTH_URL=https://your-domain.vercel.app`)
4. Update the Google OAuth redirect URI to
   `https://your-domain.vercel.app/api/auth/callback/google`
5. After the first deploy, run `npx prisma db push` (and the full-text SQL file) against your
   production database — either locally with the production `DATABASE_URL`, or via a one-off
   Vercel deployment hook / CI step.
6. Deploy. Vercel auto-detects Next.js; no custom build config is required (the `postinstall`
   script already runs `prisma generate`).

## 6. Architecture notes

- **Auth**: NextAuth with the Prisma adapter + JWT sessions. Credentials provider hashes
  passwords with bcrypt; Google provider works out of the box once configured.
- **Search**: Postgres `tsvector`/`GIN` index over title (weight A), location (B), and
  description (C.) API routes and the browse page both gracefully fall back to `ILIKE` filtering
  if the generated column hasn't been created yet, so the app never hard-fails.
- **Messaging**: `Conversation` + `ConversationParticipant` + `Message` tables support 1:1 threads
  scoped optionally to a listing. The chat UI polls every 4 seconds — easy to swap for
  Pusher/Ably/websockets later without changing the schema.
- **Trust & safety**: `Report` targets either a `Listing` or a `User`. After 3 reports, the
  target is auto-flagged (`isFlagged`) — a natural hook for an admin dashboard/moderation queue,
  which is intentionally out of scope for this MVP but the data model is ready for it.
- **Images**: stored via UploadThing (`listingImages` and `avatar` file routes in
  `src/lib/uploadthing.ts`). Swapping to S3 later only touches that one file and the two
  upload-related components.
