// Compatibility entrypoint for route loader
// The HIT route generator imports `@hit/feature-pack-locations/pages/LocationDetail`.
// Our canonical implementation lives in `./Detail`.

export { LocationDetail as default, LocationDetail } from './Detail';

