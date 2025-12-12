/**
 * Locations Pages
 * 
 * Using direct exports for optimal tree-shaking and code splitting.
 * Each component is only bundled when actually imported/used.
 */

export { LocationList, default as LocationListPage } from './List';
export { LocationDetail, default as LocationDetailPage } from './Detail';
export { LocationEdit, default as LocationEditPage } from './Edit';
