-- Feature Pack: locations
-- Migration: Seed location types and migrate data from is_primary to location_type_id
-- Tables are managed by Drizzle - this only handles seed data and data migration
-- Idempotent (safe to re-run)

-- Seed default location types (idempotent - only inserts if they don't exist)
DO $$
DECLARE
  hq_type_id uuid;
BEGIN
  -- Insert default location types if they don't exist
  INSERT INTO "location_types" ("name", "code", "icon", "color", "description", "is_system")
  VALUES 
    ('Headquarters', 'hq', 'Building2', '#fbbf24', 'Main headquarters or corporate office', true),
    ('Warehouse', 'warehouse', 'Package', '#3b82f6', 'Storage and distribution facility', true),
    ('Store', 'store', 'ShoppingBag', '#10b981', 'Retail store location', true),
    ('Office', 'office', 'Building', '#6366f1', 'General office location', true),
    ('Factory', 'factory', 'Cog', '#ef4444', 'Manufacturing facility', true)
  ON CONFLICT ("code") DO NOTHING;
  
  -- Get the HQ type ID for migration
  SELECT "id" INTO hq_type_id FROM "location_types" WHERE "code" = 'hq' LIMIT 1;
  
  -- Migrate existing is_primary locations to HQ type
  -- Only if is_primary column exists and location_type_id is null
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'locations' AND column_name = 'is_primary'
  ) THEN
    UPDATE "locations"
    SET "location_type_id" = hq_type_id
    WHERE "is_primary" = true 
      AND "location_type_id" IS NULL
      AND hq_type_id IS NOT NULL;
  END IF;
END $$;
