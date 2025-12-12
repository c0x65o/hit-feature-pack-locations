/**
 * Configuration defaults for locations feature pack
 */

export const configDefaults = {
  hierarchical_enabled: true,
  map_enabled: true,
  geocoding_enabled: true,
  geocoding_provider: 'nominatim' as const,
  require_location_on_signup: false,
  default_new_user_strategy: 'primary' as const,
  allow_multiple_user_locations: true,
};

export type LocationsConfig = typeof configDefaults;
