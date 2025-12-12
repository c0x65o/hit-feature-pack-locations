-- Feature Pack: locations
-- Base tables for locations + user memberships + location types
-- Idempotent (safe to re-run)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Location Types table
CREATE TABLE IF NOT EXISTS "location_types" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(100) NOT NULL,
  "code" varchar(50) NOT NULL,
  "icon" varchar(100) NOT NULL,
  "color" varchar(7) DEFAULT '#3b82f6' NOT NULL,
  "description" text,
  "is_system" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add unique constraint on code if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'location_types_code_unique'
  ) THEN
    ALTER TABLE "location_types" ADD CONSTRAINT "location_types_code_unique" UNIQUE ("code");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "location_types_code_idx" ON "location_types" USING btree ("code");

-- Locations table
CREATE TABLE IF NOT EXISTS "locations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(255) NOT NULL,
  "code" varchar(100),
  "address" text,
  "city" varchar(100),
  "state" varchar(100),
  "postal_code" varchar(20),
  "country" varchar(100),
  "latitude" numeric(10, 7),
  "longitude" numeric(10, 7),
  "parent_id" uuid,
  "location_type_id" uuid,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'locations_parent_id_locations_id_fk'
  ) THEN
    ALTER TABLE "locations"
      ADD CONSTRAINT "locations_parent_id_locations_id_fk"
      FOREIGN KEY ("parent_id") REFERENCES "locations"("id")
      ON DELETE set null ON UPDATE no action;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'locations_location_type_id_location_types_id_fk'
  ) THEN
    ALTER TABLE "locations"
      ADD CONSTRAINT "locations_location_type_id_location_types_id_fk"
      FOREIGN KEY ("location_type_id") REFERENCES "location_types"("id")
      ON DELETE set null ON UPDATE no action;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "locations_code_idx" ON "locations" USING btree ("code");
CREATE INDEX IF NOT EXISTS "locations_parent_idx" ON "locations" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "locations_type_idx" ON "locations" USING btree ("location_type_id");
CREATE INDEX IF NOT EXISTS "locations_active_idx" ON "locations" USING btree ("is_active");

CREATE TABLE IF NOT EXISTS "location_user_memberships" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_key" varchar(255) NOT NULL,
  "location_id" uuid NOT NULL,
  "is_default" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'location_user_memberships_location_id_locations_id_fk'
  ) THEN
    ALTER TABLE "location_user_memberships"
      ADD CONSTRAINT "location_user_memberships_location_id_locations_id_fk"
      FOREIGN KEY ("location_id") REFERENCES "locations"("id")
      ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "location_memberships_user_key_idx" ON "location_user_memberships" USING btree ("user_key");
CREATE INDEX IF NOT EXISTS "location_memberships_location_idx" ON "location_user_memberships" USING btree ("location_id");
CREATE INDEX IF NOT EXISTS "location_memberships_default_idx" ON "location_user_memberships" USING btree ("is_default");

-- Seed default location types (idempotent - only inserts if they don't exist)
INSERT INTO "location_types" ("name", "code", "icon", "color", "description", "is_system")
VALUES 
  ('Headquarters', 'hq', 'Building2', '#fbbf24', 'Main headquarters or corporate office', true),
  ('Warehouse', 'warehouse', 'Package', '#3b82f6', 'Storage and distribution facility', true),
  ('Store', 'store', 'ShoppingBag', '#10b981', 'Retail store location', true),
  ('Office', 'office', 'Building', '#6366f1', 'General office location', true),
  ('Factory', 'factory', 'Cog', '#ef4444', 'Manufacturing facility', true)
ON CONFLICT ("code") DO NOTHING;

