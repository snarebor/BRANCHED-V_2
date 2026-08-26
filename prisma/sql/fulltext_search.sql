-- Full-text search support for Listing (title + description + location)
-- Run this once after your initial Prisma migration/db push:
--   psql "$DATABASE_URL" -f prisma/sql/fulltext_search.sql
-- or paste into your migration's `migration.sql` if using `prisma migrate dev`.

-- 1. Replace the placeholder tsvector column with a generated column
ALTER TABLE "Listing" DROP COLUMN IF EXISTS "searchVector";

ALTER TABLE "Listing"
  ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce("location", '')), 'B') ||
    setweight(to_tsvector('simple', coalesce("description", '')), 'C')
  ) STORED;

-- 2. Index it for fast search
CREATE INDEX IF NOT EXISTS "Listing_searchVector_idx" ON "Listing" USING GIN ("searchVector");
