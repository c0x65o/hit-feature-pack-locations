'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import { useUi, useAlertDialog, type BreadcrumbItem } from '@hit/ui-kit';
import { useLocation, useLocationMutations, type Location } from '../hooks/useLocations';
import { useLocationTypes } from '../hooks/useLocationTypes';
import { useGeocode } from '../hooks/useGeocoding';
import { LocationSelector } from '../components/LocationSelector';
import { LocationMap } from '../components/LocationMap';

interface LocationEditProps {
  id?: string;
  onNavigate?: (path: string) => void;
}

export function LocationEdit({
  id,
  onNavigate,
}: LocationEditProps) {
  const { Page, Card, Button, Input, TextArea, Alert, Spinner, Checkbox, Select, AlertDialog } = useUi();
  const alertDialog = useAlertDialog();
  
  const isNew = !id || id === 'new';
  const { location, loading: loadingLocation, error: loadError } = useLocation(isNew ? undefined : id);
  const { createLocation, updateLocation, loading: saving, error: saveError } = useLocationMutations();
  const { types } = useLocationTypes();
  const { geocode, loading: geocoding } = useGeocode();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [locationTypeId, setLocationTypeId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Populate form when location loads
  useEffect(() => {
    if (location) {
      setName(location.name);
      setAddress(location.address || '');
      setCity(location.city || '');
      setState(location.state || '');
      setPostalCode(location.postalCode || '');
      setCountry(location.country || '');
      setLatitude(location.latitude || '');
      setLongitude(location.longitude || '');
      setParentId(location.parentId);
      setLocationTypeId((location as any).locationTypeId || (location as any).location_type_id || null);
      setIsActive(location.isActive);
    }
  }, [location]);

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Name is required';
    }

    if (latitude && isNaN(parseFloat(latitude))) {
      errors.latitude = 'Latitude must be a valid number';
    }

    if (longitude && isNaN(parseFloat(longitude))) {
      errors.longitude = 'Longitude must be a valid number';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGeocode = async () => {
    const fullAddress = [
      address,
      city,
      state,
      postalCode,
      country,
    ].filter(Boolean).join(', ');

    if (!fullAddress.trim()) {
      await alertDialog.showAlert('Please enter an address to geocode', { 
        variant: 'warning',
        title: 'Address Required'
      });
      return;
    }

    try {
      const result = await geocode(fullAddress);
      setLatitude(result.latitude.toString());
      setLongitude(result.longitude.toString());
    } catch (error) {
      await alertDialog.showAlert(
        `Failed to geocode address: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { variant: 'error', title: 'Geocoding Failed' }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const locationData: Partial<Location> = {
      name,
      address: address || null,
      city: city || null,
      state: state || null,
      postalCode: postalCode || null,
      country: country || null,
      latitude: latitude || null,
      longitude: longitude || null,
      parentId,
      locationTypeId,
      isActive,
    };

    try {
      if (isNew) {
        const newLocation = await createLocation(locationData);
        navigate(`/locations/${newLocation.id}`);
      } else if (id) {
        await updateLocation(id, locationData);
        navigate(`/locations/${id}`);
      }
    } catch {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    if (isNew) {
      navigate('/locations');
    } else {
      navigate(`/locations/${id}`);
    }
  };

  // Loading state for edit mode
  if (!isNew && loadingLocation) {
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

  // Error loading location
  if (!isNew && loadError) {
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
          {loadError.message}
        </Alert>
      </Page>
    );
  }

  const currentLocation: Partial<Location> = {
    id: id || 'preview',
    name: name || 'Preview',
    latitude: latitude || null,
    longitude: longitude || null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Locations', href: '/locations', icon: <MapPin size={14} /> },
    ...(!isNew && location ? [{ label: location.name, href: `/locations/${id}` }] : []),
    { label: isNew ? 'New' : 'Edit' },
  ];

  return (
    <Page
      title={isNew ? 'New Location' : 'Edit Location'}
      breadcrumbs={breadcrumbs}
      onNavigate={navigate}
      actions={
        <Button variant="secondary" onClick={handleCancel}>
          <ArrowLeft size={16} className="mr-2" />
          Cancel
        </Button>
      }
    >
      {/* Save Error */}
      {saveError && (
        <Alert variant="error" title="Error saving location">
          {saveError.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="space-y-4">
            <Input
              label="Name"
              value={name}
              onChange={setName}
              placeholder="Enter location name..."
              required
              error={fieldErrors.name}
            />

            <div>
              <label className="block text-sm font-medium mb-2">Location Type</label>
              <Select
                value={locationTypeId || ''}
                onChange={(val) => setLocationTypeId(val || null)}
                options={[
                  { value: '', label: 'No Type' },
                  ...types.map(type => ({ value: type.id, label: type.name })),
                ]}
              />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Address</h3>
          <div className="space-y-4">
            <TextArea
              label="Street Address"
              value={address}
              onChange={setAddress}
              placeholder="Enter street address..."
              rows={2}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="City"
                value={city}
                onChange={setCity}
                placeholder="City"
              />

              <Input
                label="State/Province"
                value={state}
                onChange={setState}
                placeholder="State or Province"
              />

              <Input
                label="Postal Code"
                value={postalCode}
                onChange={setPostalCode}
                placeholder="ZIP/Postal Code"
              />

              <Input
                label="Country"
                value={country}
                onChange={setCountry}
                placeholder="Country"
              />
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  label="Latitude"
                  value={latitude}
                  onChange={setLatitude}
                  placeholder="Auto-filled via geocoding"
                  error={fieldErrors.latitude}
                />

                <Input
                  label="Longitude"
                  value={longitude}
                  onChange={setLongitude}
                  placeholder="Auto-filled via geocoding"
                  error={fieldErrors.longitude}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleGeocode}
                disabled={geocoding}
              >
                <MapPin size={16} className="mr-2" />
                {geocoding ? 'Geocoding...' : 'Lookup Coordinates'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Map Preview */}
        {latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude)) && (
          <Card>
            <h3 className="text-lg font-semibold mb-4">Map Preview</h3>
            <LocationMap location={currentLocation as Location} height="300px" />
          </Card>
        )}

        <Card>
          <h3 className="text-lg font-semibold mb-4">Settings</h3>
          <div className="space-y-4">
            <LocationSelector
              value={parentId}
              onChange={setParentId}
              placeholder="Select parent location (optional)"
              excludeId={id}
              allowClear
            />

            <div className="space-y-2">
              <Checkbox
                checked={isActive}
                onChange={setIsActive}
                label="Active"
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-800">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            <Save size={16} className="mr-2" />
            {isNew ? 'Create Location' : 'Save Changes'}
          </Button>
        </div>
      </form>
      <AlertDialog {...alertDialog.props} />
    </Page>
  );
}

export default LocationEdit;
