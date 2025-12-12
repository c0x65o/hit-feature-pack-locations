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
 * Location Types table - stores location type definitions with icons
 */
export const locationTypes = pgTable("location_types", {
    /** Unique identifier for the location type */
    id: uuid("id").primaryKey().defaultRandom(),
    /** Type name (e.g., "Headquarters", "Warehouse", "Store") */
    name: varchar("name", { length: 100 }).notNull(),
    /** Type code/identifier */
    code: varchar("code", { length: 50 }).notNull().unique(),
    /** Icon name from lucide-react or custom SVG */
    icon: varchar("icon", { length: 100 }).notNull(),
    /** Icon color (hex code) */
    color: varchar("color", { length: 7 }).notNull().default("#3b82f6"),
    /** Description of the location type */
    description: text("description"),
    /** Whether this is a system type (cannot be deleted) */
    isSystem: boolean("is_system").notNull().default(false),
    /** When the type was created */
    createdAt: timestamp("created_at").defaultNow().notNull(),
    /** When the type was last updated */
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    codeIdx: index("location_types_code_idx").on(table.code),
}));
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
    // Self-referencing foreign key: provide explicit return type to avoid TS circular inference issues
    parentId: uuid("parent_id").references(() => locations.id, { onDelete: "set null" }),
    /**
     * Location type ID - FK to location_types table
     * Determines the icon and category of the location
     */
    locationTypeId: uuid("location_type_id").references(() => locationTypes.id, { onDelete: "set null" }),
    /** Whether this is the primary/HQ location */
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
    typeIdx: index("locations_type_idx").on(table.locationTypeId),
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
/**
 * Default location types to be seeded
 * These are inserted via migration or API initialization
 */
export const DEFAULT_LOCATION_TYPES = [
    {
        name: "Headquarters",
        code: "hq",
        icon: "Building2",
        color: "#fbbf24",
        description: "Main headquarters or corporate office",
        isSystem: true,
    },
    {
        name: "Warehouse",
        code: "warehouse",
        icon: "Package",
        color: "#3b82f6",
        description: "Storage and distribution facility",
        isSystem: true,
    },
    {
        name: "Store",
        code: "store",
        icon: "ShoppingBag",
        color: "#10b981",
        description: "Retail store location",
        isSystem: true,
    },
    {
        name: "Office",
        code: "office",
        icon: "Building",
        color: "#6366f1",
        description: "General office location",
        isSystem: true,
    },
    {
        name: "Factory",
        code: "factory",
        icon: "Cog",
        color: "#ef4444",
        description: "Manufacturing facility",
        isSystem: true,
    },
];
//# sourceMappingURL=locations.js.map