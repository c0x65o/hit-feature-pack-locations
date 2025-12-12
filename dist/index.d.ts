/**
 * @hit/feature-pack-locations
 *
 * Locations feature pack with hierarchical locations, user assignments, map visualization, and geocoding.
 *
 * Components are exported individually for optimal tree-shaking.
 * When used with the route loader system, only the requested component is bundled.
 *
 * @example
 * ```tsx
 * import { LocationList, LocationDetail, LocationEdit } from '@hit/feature-pack-locations';
 *
 * // Use in your app's routes
 * <Route path="/locations" element={<LocationList />} />
 * <Route path="/locations/:id" element={<LocationDetail id={params.id} />} />
 * <Route path="/locations/:id/edit" element={<LocationEdit id={params.id} />} />
 * ```
 */
export { LocationList, LocationListPage, LocationDetail, LocationDetailPage, LocationEdit, LocationEditPage, } from './pages/index';
export * from './components/index';
export * from './hooks/index';
export { navContributions as nav } from './nav';
export { locations, locationUserMemberships, type Location, type InsertLocation, type UpdateLocation, type LocationUserMembership, type InsertLocationUserMembership, type UpdateLocationUserMembership, } from './schema/locations';
//# sourceMappingURL=index.d.ts.map