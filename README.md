# @hit/feature-pack-locations

Locations feature pack for HIT platform with hierarchical locations, user assignments, map visualization, and geocoding.

## Features

- **Hierarchical Locations**: Support for parent/child location relationships
- **User Assignments**: Link users to locations (supports multiple locations per user)
- **Map Visualization**: Display locations on interactive maps
- **Geocoding**: Automatic address to coordinates lookup
- **Primary/HQ Location**: Mark a location as the primary headquarters
- **CRUD Operations**: Full create, read, update, delete functionality

## Installation

Add to your `hit.yaml`:

```yaml
feature_packs:
  - name: locations
    version: "1.0.0"
    options:
      hierarchical_enabled: true
      map_enabled: true
      geocoding_enabled: true
      require_location_on_signup: false
      default_new_user_strategy: "primary"
```

## Usage

The feature pack provides pages, components, and hooks:

```tsx
import { LocationList, LocationDetail, LocationEdit } from '@hit/feature-pack-locations';
import { useLocations, useLocationMutations } from '@hit/feature-pack-locations';

// Use pages in your routes
<Route path="/locations" element={<LocationList />} />
<Route path="/locations/:id" element={<LocationDetail id={params.id} />} />
<Route path="/locations/:id/edit" element={<LocationEdit id={params.id} />} />

// Use hooks in your components
const { data, loading, error } = useLocations();
const { createLocation, updateLocation } = useLocationMutations();
```

## Configuration Options

- `hierarchical_enabled` (boolean, default: true) - Enable parent/child relationships
- `map_enabled` (boolean, default: true) - Show map visualization
- `geocoding_enabled` (boolean, default: true) - Enable automatic geocoding
- `geocoding_provider` (string, default: "nominatim") - Geocoding provider
- `require_location_on_signup` (boolean, default: false) - Require location selection during signup
- `default_new_user_strategy` (string, default: "primary") - Strategy for assigning default location
- `allow_multiple_user_locations` (boolean, default: true) - Allow users to be assigned to multiple locations

## API Routes

The feature pack expects these API routes to be implemented in your app:

- `GET /api/locations` - List locations
- `POST /api/locations` - Create location
- `GET /api/locations/[id]` - Get location
- `PUT /api/locations/[id]` - Update location
- `DELETE /api/locations/[id]` - Delete location
- `GET /api/locations/tree` - Get hierarchical tree
- `POST /api/locations/[id]/set-primary` - Set as primary location
- `GET /api/locations/memberships` - Get user memberships
- `POST /api/locations/memberships` - Assign user to location
- `DELETE /api/locations/memberships/[id]` - Remove membership
- `POST /api/locations/geocode` - Geocode address

## Schema

The pack provides Drizzle ORM schema that should be imported into your project's schema:

```ts
import { locations, locationUserMemberships } from '@hit/feature-pack-locations/schema';
```

## License

MIT
