'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Building2,
  Calendar,
  Clock,
} from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useLocation, useLocationMutations, type Location } from '../hooks/useLocations';
import { useLocationTypes, type LocationType } from '../hooks/useLocationTypes';
import { LocationMap } from '../components/LocationMap';
import { LocationUsers } from '../components/LocationUsers';
import * as LucideIcons from 'lucide-react';

interface LocationDetailProps {
  id?: string;
  onNavigate?: (path: string) => void;
}

export function LocationDetail({
  id,
  onNavigate,
}: LocationDetailProps) {
  const { Page, Card, Button, Alert, Spinner, Badge } = useUi();
  
  const { location, loading, error } = useLocation(id);
  const { deleteLocation, loading: mutating } = useLocationMutations();
  const { types } = useLocationTypes();
  const [parentLocation, setParentLocation] = useState<Location | null>(null);
  const [loadingParent, setLoadingParent] = useState(false);

  // Fetch parent location if parentId exists
  useEffect(() => {
    if (location?.parentId) {
      setLoadingParent(true);
      fetch(`/api/locations/${location.parentId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('hit_token')
            ? { 'Authorization': `Bearer ${localStorage.getItem('hit_token')}` }
            : {}),
        },
      })
        .then(res => res.json())
        .then(data => {
          setParentLocation(data);
          setLoadingParent(false);
        })
        .catch(() => {
          setLoadingParent(false);
        });
    } else {
      setParentLocation(null);
    }
  }, [location?.parentId]);

  // Get location type - handle both camelCase and snake_case from API
  const locationTypeId = location?.locationTypeId || (location as any)?.location_type_id;
  const locationType = locationTypeId
    ? types.find(t => t.id === locationTypeId)
    : null;

  // Get icon component for location type
  const LocationTypeIcon = locationType?.icon
    ? (LucideIcons[locationType.icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>) || Building2
    : Building2;

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const handleDelete = async () => {
    if (!location) return;
    if (!confirm(`Are you sure you want to delete "${location.name}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteLocation(location.id);
      navigate('/locations');
    } catch {
      // Error handled by hook
    }
  };

  const formatAddress = () => {
    if (!location) return 'No address';
    const parts = [
      location.address,
      location.city,
      location.state,
      location.postalCode,
      location.country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'No address';
  };

  // Loading State
  if (loading) {
    return (
      <Page title="Loading...">
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      </Page>
    );
  }

  // Error State
  if (error) {
    return (
      <Page
        title="Location Not Found"
        actions={
          <Button variant="secondary" onClick={() => navigate('/locations')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Locations
          </Button>
        }
      >
        <Alert variant="error" title="Error">
          {error.message}
        </Alert>
      </Page>
    );
  }

  if (!location) {
    return null;
  }

  return (
    <Page
      title={location.name}
      actions={
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/locations')}>
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <Button variant="primary" onClick={() => navigate(`/locations/${location.id}/edit`)}>
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={mutating}>
            <Trash2 size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      }
    >
      {/* Status Badges */}
      <div className="flex items-center gap-2 mb-4">
        {location.isActive ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="error">Inactive</Badge>
        )}
        {(location.isPrimary || (location as any).is_primary) && (
          <Badge variant="info">Primary Location</Badge>
        )}
        {locationType && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: locationType.color || '#3b82f6',
              color: 'white',
            }}
          >
            <LocationTypeIcon size={14} className="mr-1 inline" />
            {locationType.name}
          </span>
        )}
      </div>

      {/* Location Information */}
      <div className="mb-4">
        <Card>
        <h3 className="text-lg font-semibold mb-4">Location Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
            <p className="text-gray-900 dark:text-gray-100">{location.name}</p>
          </div>
          {location.code && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Code</label>
              <p className="text-gray-900 dark:text-gray-100">
                <code className="text-sm">{location.code}</code>
              </p>
            </div>
          )}
          {locationType && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location Type</label>
              <p className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <LocationTypeIcon size={16} style={{ color: locationType.color }} />
                {locationType.name}
              </p>
            </div>
          )}
          {location.parentId && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Parent Location</label>
              {loadingParent ? (
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
              ) : parentLocation ? (
                <p className="text-gray-900 dark:text-gray-100">
                  <button
                    onClick={() => navigate(`/locations/${parentLocation.id}`)}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {parentLocation.name}
                  </button>
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Not found</p>
              )}
            </div>
          )}
          {location.address && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Street Address</label>
              <p className="text-gray-900 dark:text-gray-100">{location.address}</p>
            </div>
          )}
          {location.city && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">City</label>
              <p className="text-gray-900 dark:text-gray-100">{location.city}</p>
            </div>
          )}
          {location.state && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">State/Province</label>
              <p className="text-gray-900 dark:text-gray-100">{location.state}</p>
            </div>
          )}
          {location.postalCode && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Postal Code</label>
              <p className="text-gray-900 dark:text-gray-100">{location.postalCode}</p>
            </div>
          )}
          {location.country && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Country</label>
              <p className="text-gray-900 dark:text-gray-100">{location.country}</p>
            </div>
          )}
          {!location.address && !location.city && !location.state && !location.postalCode && !location.country && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
              <p className="text-gray-500 dark:text-gray-400">No address</p>
            </div>
          )}
          {location.latitude && location.longitude && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Latitude</label>
                <p className="text-gray-900 dark:text-gray-100">{location.latitude}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Longitude</label>
                <p className="text-gray-900 dark:text-gray-100">{location.longitude}</p>
              </div>
            </>
          )}
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Calendar size={14} />
              Created
            </label>
            <p className="text-gray-900 dark:text-gray-100">
              {new Date(location.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Clock size={14} />
              Last Updated
            </label>
            <p className="text-gray-900 dark:text-gray-100">
              {new Date(location.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
        </Card>
      </div>

      {/* Map */}
      {location.latitude && location.longitude && (
        <div className="mb-4">
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Map View
            </h3>
            <LocationMap location={location} height="400px" />
          </Card>
        </div>
      )}

      {/* User Associations */}
      <div className="mb-4">
        <LocationUsers locationId={location.id} />
      </div>

    </Page>
  );
}

export default LocationDetail;
