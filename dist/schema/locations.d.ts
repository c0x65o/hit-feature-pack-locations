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
/**
 * Locations table - stores business locations
 *
 * Features:
 * - Hierarchical structure via parentId
 * - Primary/HQ location flag
 * - Address fields with optional geocoding (latitude/longitude)
 * - Active/inactive status
 */
export declare const locations: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "locations";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "locations";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "locations";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        code: import("drizzle-orm/pg-core").PgColumn<{
            name: "code";
            tableName: "locations";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        address: import("drizzle-orm/pg-core").PgColumn<{
            name: "address";
            tableName: "locations";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        city: import("drizzle-orm/pg-core").PgColumn<{
            name: "city";
            tableName: "locations";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        state: import("drizzle-orm/pg-core").PgColumn<{
            name: "state";
            tableName: "locations";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        postalCode: import("drizzle-orm/pg-core").PgColumn<{
            name: "postal_code";
            tableName: "locations";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        country: import("drizzle-orm/pg-core").PgColumn<{
            name: "country";
            tableName: "locations";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        latitude: import("drizzle-orm/pg-core").PgColumn<{
            name: "latitude";
            tableName: "locations";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        longitude: import("drizzle-orm/pg-core").PgColumn<{
            name: "longitude";
            tableName: "locations";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        parentId: import("drizzle-orm/pg-core").PgColumn<{
            name: "parent_id";
            tableName: "locations";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        isPrimary: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_primary";
            tableName: "locations";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        isActive: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_active";
            tableName: "locations";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "locations";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "locations";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Location user memberships - links users to locations
 *
 * Important: Uses userKey (email/JWT sub) instead of FK to auth DB
 * This allows interoperability when auth runs on separate DB/service
 */
export declare const locationUserMemberships: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "location_user_memberships";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "location_user_memberships";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        userKey: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_key";
            tableName: "location_user_memberships";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        locationId: import("drizzle-orm/pg-core").PgColumn<{
            name: "location_id";
            tableName: "location_user_memberships";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        isDefault: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_default";
            tableName: "location_user_memberships";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "location_user_memberships";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;
export type UpdateLocation = Partial<Omit<InsertLocation, "id" | "createdAt">>;
export type LocationUserMembership = typeof locationUserMemberships.$inferSelect;
export type InsertLocationUserMembership = typeof locationUserMemberships.$inferInsert;
export type UpdateLocationUserMembership = Partial<Omit<InsertLocationUserMembership, "id" | "createdAt">>;
//# sourceMappingURL=locations.d.ts.map