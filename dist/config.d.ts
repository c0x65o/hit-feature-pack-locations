/**
 * Configuration defaults for locations feature pack
 */
export declare const configDefaults: {
    hierarchical_enabled: boolean;
    map_enabled: boolean;
    geocoding_enabled: boolean;
    geocoding_provider: "nominatim";
    require_location_on_signup: boolean;
    default_new_user_strategy: "primary";
    allow_multiple_user_locations: boolean;
};
export type LocationsConfig = typeof configDefaults;
//# sourceMappingURL=config.d.ts.map