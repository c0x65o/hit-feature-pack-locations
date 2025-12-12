/**
 * Locations Schema
 *
 * Drizzle table definitions for the locations feature pack.
 * This schema gets merged into the project's database.
 *
 * UI Annotations (for future schema-driven CRUD):
 * @ui-list columns: name, code, city, state, isPrimary, createdAt
 * @ui-list sortable: name, code, city, createdAt
 * @ui-list searchable: name, code, address, city, state
 * @ui-detail sections: info(name, code, address), location(coordinates, map), hierarchy(parent, children)
 * @ui-edit fields: name(text, required), code(text), address(textarea), city(text), state(text), postalCode(text), country(text), parentId(select), isPrimary(checkbox)
 */

import { pgTable, varchar, text, timestamp, boolean, uuid, decimal, index } from "drizzle-orm/pg-core";

/**
 * Locations table - stores business locations
 *
 * Features:
 * - Hierarchical structure via parentId
 * - Primary/HQ location flag
 * - Address fields with optional geocoding (latitude/longitude)
 * - Active/inactive status
 */
export const locations = pgTable("locations", {
  /** Unique identifier for the location */
  id: uuid("id").primaryKey().defaultRandom(),

  /** Location name - displayed in list view */
  name: varchar("name", { length: 255 }).notNull(),

  /** Location code/identifier - optional unique code */
  code: varchar("code", { length: 100 }),

  /** Street address */
  address: text("address"),

  /** City */
  city: varchar("city", { length: 100 }),

  /** State/Province */
  state: varchar("state", { length: 100 }),

  /** Postal/ZIP code */
  postalCode: varchar("postal_code", { length: 20 }),

  /** Country */
  country: varchar("country", { length: 100 }),

  /** Latitude - auto-populated via geocoding */
  latitude: decimal("latitude", { precision: 10, scale: 7 }),

  /** Longitude - auto-populated via geocoding */
  longitude: decimal("longitude", { precision: 10, scale: 7 }),

  /**
   * Parent location ID for hierarchical structure
   * Null for top-level locations
   */
  parentId: uuid("parent_id").references(() => locations.id, { onDelete: "set null" }),

  /**
   * Whether this is the primary/HQ location
   * Only one location should be primary at a time (enforced in API layer)
   */
  isPrimary: boolean("is_primary").notNull().default(false),

  /** Whether the location is active */
  isActive: boolean("is_active").notNull().default(true),

  /** When the location was created */
  createdAt: timestamp("created_at").defaultNow().notNull(),

  /** When the location was last updated */
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Indexes for common queries
  codeIdx: index("locations_code_idx").on(table.code),
  parentIdx: index("locations_parent_idx").on(table.parentId),
  primaryIdx: index("locations_primary_idx").on(table.isPrimary),
  activeIdx: index("locations_active_idx").on(table.isActive),
}));

/**
 * Location user memberships - links users to locations
 *
 * Important: Uses userKey (email/JWT sub) instead of FK to auth DB
 * This allows interoperability when auth runs on separate DB/service
 */
export const locationUserMemberships = pgTable("location_user_memberships", {
  /** Unique identifier for the membership */
  id: uuid("id").primaryKey().defaultRandom(),

  /**
   * User identifier (typically email from JWT sub claim)
   * No FK to auth DB - stored as string for interoperability
   */
  userKey: varchar("user_key", { length: 255 }).notNull(),

  /** Location ID - FK to locations table */
  locationId: uuid("location_id").notNull().references(() => locations.id, { onDelete: "cascade" }),

  /**
   * Whether this is the user's default location
   * Only one membership per user should be default (enforced in API layer)
   */
  isDefault: boolean("is_default").notNull().default(false),

  /** When the membership was created */
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Indexes for common queries
  userKeyIdx: index("location_memberships_user_key_idx").on(table.userKey),
  locationIdx: index("location_memberships_location_idx").on(table.locationId),
  defaultIdx: index("location_memberships_default_idx").on(table.isDefault),
}));

// Type exports for use in API routes and components
export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;
export type UpdateLocation = Partial<Omit<InsertLocation, "id" | "createdAt">>;

export type LocationUserMembership = typeof locationUserMemberships.$inferSelect;
export type InsertLocationUserMembership = typeof locationUserMemberships.$inferInsert;
export type UpdateLocationUserMembership = Partial<Omit<InsertLocationUserMembership, "id" | "createdAt">>;
