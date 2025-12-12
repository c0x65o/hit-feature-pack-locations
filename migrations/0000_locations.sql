-- Feature Pack: locations
-- Seed data and extensions only - tables are managed by Drizzle via TypeScript schema
-- Idempotent (safe to re-run)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Seed default location types (idempotent - only inserts if they don't exist)
-- Tables must exist first (created by Drizzle from lib/feature-pack-schemas.ts)
INSERT INTO "location_types" ("name", "code", "icon", "color", "description", "is_system")
VALUES 
  ('Headquarters', 'hq', 'Building2', '#fbbf24', 'Main headquarters or corporate office', true),
  ('Warehouse', 'warehouse', 'Package', '#3b82f6', 'Storage and distribution facility', true),
  ('Store', 'store', 'ShoppingBag', '#10b981', 'Retail store location', true),
  ('Office', 'office', 'Building', '#6366f1', 'General office location', true),
  ('Factory', 'factory', 'Cog', '#ef4444', 'Manufacturing facility', true)
ON CONFLICT ("code") DO NOTHING;
