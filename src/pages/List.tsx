'use client';

import React, { useState } from 'react';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Building2,
  MapPin,
} from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useLocations, useLocationMutations, type Location } from '../hooks/useLocations';
import { useLocationTypes } from '../hooks/useLocationTypes';
import { LocationMap } from '../components/LocationMap';

interface LocationListProps {
  onNavigate?: (path: string) => void;
}

export function LocationList({
  onNavigate,
}: LocationListProps) {
  const { Page, Card, Button, DataTable, Badge, Alert } = useUi();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const { data, loading, error, refresh } = useLocations({
    page,
    pageSize: 25,
    sortBy: 'name',
    sortOrder: 'asc',
    search: search || undefined,
  });
  
  const { types } = useLocationTypes();
  const typesArray = Array.isArray(types) ? types : [];
  const { deleteLocation, loading: mutating } = useLocationMutations();

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteLocation(id);
      refresh();
    } catch {
      // Error handled by hook
    }
  };


  const formatAddress = (location: Pick<Location, 'address' | 'city' | 'state' | 'postalCode'>) => {
    const parts = [
      location.address,
      location.city,
      location.state,
      location.postalCode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'No address';
  };

  // Filter locations with coordinates for the map
  const locationsWithCoords = (data?.items || []).filter(
    (loc) => loc.latitude && loc.longitude
  );

  return (
    <Page
      title="Locations"
      description="Manage your business locations"
      actions={
        <Button variant="primary" onClick={() => navigate('/locations/new')}>
          <Plus size={16} className="mr-2" />
          New Location
        </Button>
      }
    >
      {/* Error State */}
      {error && (
        <Alert variant="error" title="Error loading locations">
          {error.message}
        </Alert>
      )}

      {/* Map View */}
      {locationsWithCoords.length > 0 && (
        <div className="mb-6">
          <Card>
            <LocationMap
            locations={locationsWithCoords}
            height="500px"
            zoom={10}
            onLocationClick={(loc) => navigate(`/locations/${loc.id}`)}
            />
          </Card>
        </div>
      )}

      <Card>
        {/* Locations Table */}
        <DataTable
          columns={[
            {
              key: 'name',
              label: 'Name',
              sortable: true,
              render: (_, row) => {
                const hasCoords = Boolean(row.latitude && row.longitude);
                const typeId = (row as any).locationTypeId || (row as any).location_type_id;
                const locationType = typesArray.find(t => t.id === typeId);
                return (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/locations/${row.id}`)}
                      className="font-medium hover:text-blue-500 transition-colors text-left flex items-center gap-2"
                    >
                      {locationType && (
                        <span title={locationType.name} className="inline-flex">
                          <MapPin size={14} style={{ color: locationType.color }} />
                        </span>
                      )}
                      {hasCoords && !locationType && (
                        <span title="Has coordinates" className="inline-flex">
                          <MapPin size={14} className="text-blue-500" />
                        </span>
                      )}
                      {row.name as string}
                    </button>
                  </div>
                );
              },
            },
            {
              key: 'code',
              label: 'Code',
              sortable: true,
              render: (value: unknown) => value ? <code className="text-sm">{value as string}</code> : '-',
            },
            {
              key: 'address',
              label: 'Address',
              render: (_, row) =>
                formatAddress({
                  address: row.address as string | null,
                  city: row.city as string | null,
                  state: row.state as string | null,
                  postalCode: row.postalCode as string | null,
                }),
            },
            {
              key: 'locationTypeId',
              label: 'Type',
              render: (_, row) => {
                const typeId = (row as any).locationTypeId || (row as any).location_type_id;
                const locationType = typesArray.find(t => t.id === typeId);
                return locationType ? (
                  <Badge variant="default">
                    <span style={{ color: locationType.color }}>{locationType.name}</span>
                  </Badge>
                ) : (
                  <Badge variant="default">No Type</Badge>
                );
              },
            },
            {
              key: 'isActive',
              label: 'Active',
              render: (value: unknown) =>
                value ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="error">Inactive</Badge>
                ),
            },
            {
              key: 'actions',
              label: '',
              align: 'right' as const,
              sortable: false,
              hideable: false,
              render: (_, row) => (
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/locations/${row.id}`)}>
                    <Eye size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/locations/${row.id}/edit`)}>
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={mutating}
                    onClick={() => handleDelete(row.id as string, row.name as string)}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={data?.items.map((loc) => ({
            id: loc.id,
            name: loc.name,
            code: loc.code,
            address: loc.address,
            city: loc.city,
            state: loc.state,
            postalCode: loc.postalCode,
            country: loc.country,
            latitude: loc.latitude,
            longitude: loc.longitude,
            locationTypeId: (loc as any).locationTypeId || (loc as any).location_type_id || null,
            isActive: loc.isActive,
          })) || []}
          emptyMessage="No locations found"
          loading={loading}
          exportable
          showColumnVisibility
          pageSize={25}
          onRefresh={refresh}
          refreshing={loading}
          tableId="locations"
        />
      </Card>
    </Page>
  );
}

export default LocationList;
