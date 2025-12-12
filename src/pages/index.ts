/**
 * Locations Pages
 * 
 * Using direct exports for optimal tree-shaking and code splitting.
 * Each component is only bundled when actually imported/used.
 */

export { LocationDashboard, default as LocationDashboardPage } from './Dashboard';
export { LocationList, default as LocationListPage } from './List';
export { LocationDetail, default as LocationDetailPage } from './Detail';
export { LocationEdit, default as LocationEditPage } from './Edit';
export { LocationTypes, default as LocationTypesPage } from './LocationTypes';
