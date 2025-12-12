'use client';

import React, { useState } from 'react';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Building2,
} from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useLocations, useLocationMutations, type Location } from '../hooks/useLocations';

interface LocationListProps {
  onNavigate?: (path: string) => void;
}

export function LocationList({
  onNavigate,
}: LocationListProps) {
  const { Page, Card, Button, DataTable, Badge, Alert, Input } = useUi();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const { data, loading, error, refresh } = useLocations({
    page,
    pageSize: 25,
    sortBy: 'name',
    sortOrder: 'asc',
    search: search || undefined,
  });
  
  const { deleteLocation, setPrimaryLocation, loading: mutating } = useLocationMutations();

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

  const handleSetPrimary = async (id: string) => {
    try {
      await setPrimaryLocation(id);
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

      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <Input
            value={search}
            onChange={setSearch}
            placeholder="Search locations..."
          />
        </div>

      {/* Locations Table */}
        <DataTable
          columns={[
            {
              key: 'name',
              label: 'Name',
              sortable: true,
              render: (_, row) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/locations/${row.id}`)}
                    className="font-medium hover:text-blue-500 transition-colors text-left flex items-center gap-2"
                  >
                    {Boolean(row.isPrimary) && (
                      <span title="Primary/HQ Location" className="inline-flex">
                        <Building2 size={16} className="text-yellow-500" />
                      </span>
                    )}
                    {row.name as string}
                  </button>
                </div>
              ),
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
              key: 'isPrimary',
              label: 'Status',
              render: (value: unknown) =>
                value ? (
                  <Badge variant="success">Primary</Badge>
                ) : (
                  <Badge variant="default">Standard</Badge>
                ),
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
                  {!row.isPrimary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetPrimary(row.id as string)}
                      disabled={mutating}
                    >
                      <Building2 size={16} />
                    </Button>
                  )}
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
            isPrimary: loc.isPrimary,
            isActive: loc.isActive,
          })) || []}
          emptyMessage="No locations found"
          loading={loading}
          exportable
          showColumnVisibility
          pageSize={25}
          onRefresh={refresh}
        />
      </Card>
    </Page>
  );
}

export default LocationList;
