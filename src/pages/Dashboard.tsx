'use client';

import React from 'react';
import {
  Plus,
  MapPin,
  Building2,
  Package,
  ShoppingBag,
  Building,
  Cog,
  Tag,
  Users,
} from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useLocations, useLocationMemberships } from '../hooks/useLocations';
import { useLocationTypes } from '../hooks/useLocationTypes';
import { LocationMap } from '../components/LocationMap';

interface LocationDashboardProps {
  onNavigate?: (path: string) => void;
}

// Icon mapping for location types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, React.ComponentType<any>> = {
  Building2,
  Package,
  ShoppingBag,
  Building,
  Cog,
  MapPin,
};

export function LocationDashboard({
  onNavigate,
}: LocationDashboardProps) {
  const { Page, Card, Button, Alert, Badge } = useUi();
  
  const { data, loading, error } = useLocations({
    page: 1,
    pageSize: 1000, // Get all for dashboard stats
  });
  
  const { types } = useLocationTypes();
  const { memberships } = useLocationMemberships();

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  // Calculate stats
  const totalLocations = data?.items.length || 0;
  const activeLocations = data?.items.filter(loc => loc.isActive).length || 0;
  const locationsWithCoords = data?.items.filter(
    (loc) => loc.latitude && loc.longitude
  ).length || 0;
  const totalLocationTypes = types.length;
  
  // Calculate unassociated users
  // Get unique users from memberships
  const membershipsArray = Array.isArray(memberships) ? memberships : [];
  const associatedUsers = new Set(membershipsArray.map(m => m.userKey));
  const associatedUsersCount = associatedUsers.size;
  
  // Try to fetch total users to calculate unassociated count
  // This requires a /api/users endpoint to be available
  const [totalUsers, setTotalUsers] = React.useState<number | null>(null);
  const [unassociatedUsers, setUnassociatedUsers] = React.useState<number | null>(null);
  
  React.useEffect(() => {
    // Try to fetch users count if API is available
    const fetchUsers = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('hit_token') : null;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const res = await fetch('/api/users', {
          credentials: 'include',
          headers,
        });
        
        if (res.ok) {
          const users = await res.json();
          const total = Array.isArray(users) ? users.length : 0;
          setTotalUsers(total);
          setUnassociatedUsers(Math.max(0, total - associatedUsersCount));
        }
      } catch {
        // Users API not available, ignore
      }
    };
    
    fetchUsers();
  }, [associatedUsersCount]);
  
  // Group locations by type
  const locationsByType = types.map(type => ({
    type,
    count: data?.items.filter(loc => {
      const typeId = (loc as any).locationTypeId || (loc as any).location_type_id;
      return typeId === type.id;
    }).length || 0,
  }));

  // Get HQ location (type code "hq")
  const hqType = types.find(t => t.code === 'hq');
  const hqLocations = hqType ? data?.items.filter(loc => {
    const typeId = (loc as any).locationTypeId || (loc as any).location_type_id;
    return typeId === hqType.id;
  }) || [] : [];

  if (error) {
    return (
      <Page
        title="Locations Dashboard"
        description="Overview of your business locations"
      >
        <Alert variant="error" title="Error loading locations">
          {error.message}
        </Alert>
      </Page>
    );
  }

  return (
    <Page
      title="Locations Dashboard"
      description="Overview of your business locations"
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/locations/list')}>
            View All
          </Button>
          <Button variant="primary" onClick={() => navigate('/locations/new')}>
            <Plus size={16} className="mr-2" />
            New Location
          </Button>
        </div>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Locations</p>
                <p className="text-2xl font-bold mt-1">{totalLocations}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Location Types</p>
                <p className="text-2xl font-bold mt-1">{totalLocationTypes}</p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <Tag className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {unassociatedUsers !== null ? 'Unassociated Users' : 'Associated Users'}
                </p>
                <p className="text-2xl font-bold mt-1">
                  {unassociatedUsers !== null ? unassociatedUsers : associatedUsersCount}
                </p>
                {unassociatedUsers !== null && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {associatedUsersCount} associated
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${
                unassociatedUsers !== null && unassociatedUsers > 0
                  ? 'bg-orange-100 dark:bg-orange-900'
                  : 'bg-green-100 dark:bg-green-900'
              }`}>
                <Users className={`w-6 h-6 ${
                  unassociatedUsers !== null && unassociatedUsers > 0
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-green-600 dark:text-green-400'
                }`} />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Locations</p>
                <p className="text-2xl font-bold mt-1">{activeLocations}</p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Map View */}
      {locationsWithCoords > 0 && (
        <div className="mb-6">
          <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold">Location Map</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Click on markers to view location details
            </p>
          </div>
          <LocationMap
            locations={data?.items.filter(loc => loc.latitude && loc.longitude) || []}
            height="500px"
            zoom={10}
            onLocationClick={(loc) => navigate(`/locations/${loc.id}`)}
          />
          </Card>
        </div>
      )}

      {/* Locations by Type */}
      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold">Locations by Type</h3>
        </div>
        <div className="p-4">
          {locationsByType.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locationsByType.map(({ type, count }) => {
                const IconComponent = iconMap[type.icon] || MapPin;
                return (
                  <div
                    key={type.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                    onClick={() => navigate(`/locations/list?type=${type.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${type.color}20` }}
                      >
                        <IconComponent
                          size={20}
                          style={{ color: type.color }}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{type.name}</p>
                        {type.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {type.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="default">{count}</Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No location types configured
            </p>
          )}
        </div>
      </Card>
    </Page>
  );
}

export default LocationDashboard;

