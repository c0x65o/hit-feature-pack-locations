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
export { LocationDashboard, LocationDashboardPage, LocationList, LocationListPage, LocationDetail, LocationDetailPage, LocationEdit, LocationEditPage, LocationTypes, LocationTypesPage, LocationUserAssociations, LocationUserAssociationsPage, } from './pages/index';
export { LocationDashboard as Dashboard } from './pages/Dashboard';
export * from './components/index';
export * from './hooks/index';
export { navContributions as nav } from './nav';
export { locationTypes, locations, locationUserMemberships, type LocationType, type InsertLocationType, type UpdateLocationType, type Location, type InsertLocation, type UpdateLocation, type LocationUserMembership, type InsertLocationUserMembership, type UpdateLocationUserMembership, DEFAULT_LOCATION_TYPES, } from './schema/locations';
//# sourceMappingURL=index.d.ts.map