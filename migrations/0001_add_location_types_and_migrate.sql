-- Feature Pack: locations
-- Migration: Add location types and migrate from is_primary to location_type_id
-- Idempotent (safe to re-run)

-- Step 1: Add location_type_id column if it doesn't exist (for existing installations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'locations' AND column_name = 'location_type_id'
  ) THEN
    ALTER TABLE "locations" ADD COLUMN "location_type_id" uuid;
  END IF;
END $$;

-- Step 2: Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'locations_location_type_id_location_types_id_fk'
  ) THEN
    ALTER TABLE "locations"
      ADD CONSTRAINT "locations_location_type_id_location_types_id_fk"
      FOREIGN KEY ("location_type_id") REFERENCES "location_types"("id")
      ON DELETE set null ON UPDATE no action;
  END IF;
END $$;

-- Step 3: Add index if it doesn't exist
CREATE INDEX IF NOT EXISTS "locations_type_idx" ON "locations" USING btree ("location_type_id");

-- Step 4: Seed default location types (idempotent - only inserts if they don't exist)
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
  
  -- Step 5: Migrate existing is_primary locations to HQ type
  -- Only if is_primary column still exists and location_type_id is null
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

-- Step 6: Remove is_primary column if it exists (optional - comment out if you want to keep it for now)
-- DO $$
-- BEGIN
--   IF EXISTS (
--     SELECT 1 FROM information_schema.columns 
--     WHERE table_name = 'locations' AND column_name = 'is_primary'
--   ) THEN
--     -- Drop index first
--     DROP INDEX IF EXISTS "locations_primary_idx";
--     -- Then drop column
--     ALTER TABLE "locations" DROP COLUMN "is_primary";
--   END IF;
-- END $$;

