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

// Pages - exported individually for tree-shaking
export {
  LocationDashboard,
  LocationDashboardPage,
  LocationList,
  LocationListPage,
  LocationDetail,
  LocationDetailPage,
  LocationEdit,
  LocationEditPage,
  LocationTypes,
  LocationTypesPage,
  LocationUserAssociations,
  LocationUserAssociationsPage,
} from './pages/index';

// Dashboard alias for route matching
export { LocationDashboard as Dashboard } from './pages/Dashboard';

// Components - exported individually for tree-shaking
export * from './components/index';

// Hooks - exported individually for tree-shaking
export * from './hooks/index';

// Navigation config
export { navContributions as nav } from './nav';

// Schema exports - MOVED to @hit/feature-pack-locations/schema to avoid bundling drizzle-orm in client
// Don't import from schema file at all - it pulls in drizzle-orm

// Default location types - defined inline to avoid pulling in schema file
export const DEFAULT_LOCATION_TYPES = [
  { name: 'Building', icon: 'Building', color: '#6366f1' },
  { name: 'Floor', icon: 'Layers', color: '#8b5cf6' },
  { name: 'Room', icon: 'DoorOpen', color: '#ec4899' },
  { name: 'Desk', icon: 'Monitor', color: '#10b981' },
] as const;
