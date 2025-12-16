/**
 * Stub for @/lib/feature-pack-schemas
 * 
 * This is a type-only stub for feature pack compilation.
 * At runtime, the consuming application provides the actual implementation
 * which is auto-generated from feature pack schemas.
 * 
 * This stub re-exports from the local schema file for type checking.
 */

// Re-export from the actual schema file for type checking during build
export {
  locationTypes,
  locations,
  locationUserMemberships,
  type LocationType,
  type InsertLocationType,
  type UpdateLocationType,
  type Location,
  type InsertLocation,
  type UpdateLocation,
  type LocationUserMembership,
  type InsertLocationUserMembership,
  type UpdateLocationUserMembership,
  DEFAULT_LOCATION_TYPES,
} from '../schema/locations';

