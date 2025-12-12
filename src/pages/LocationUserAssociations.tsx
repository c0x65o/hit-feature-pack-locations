'use client';

import React, { useState } from 'react';
import {
  UserPlus,
  UserMinus,
  Users,
  Check,
  MapPin,
} from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import {
  useLocations,
  useLocationMemberships,
  useLocationMembershipMutations,
  type LocationUserMembership,
} from '../hooks/useLocations';

interface LocationUserAssociationsProps {
  onNavigate?: (path: string) => void;
}

export function LocationUserAssociations({
  onNavigate,
}: LocationUserAssociationsProps) {
  const { Page, Card, Button, Badge, Alert, Input, Modal, Spinner, DataTable } = useUi();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [userEmail, setUserEmail] = useState('');
  const [searchEmail, setSearchEmail] = useState('');

  const { data: locationsData } = useLocations({ page: 1, pageSize: 1000 });
  const { memberships, loading, error, refresh } = useLocationMemberships();
  const { assignLocation, removeMembership, loading: mutating } = useLocationMembershipMutations();

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const handleRefresh = () => {
    refresh();
  };

  const handleAddUser = async () => {
    if (!userEmail.trim() || !selectedLocationId) {
      return;
    }
    try {
      await assignLocation(selectedLocationId, userEmail.trim(), false);
      setAddModalOpen(false);
      setUserEmail('');
      setSelectedLocationId('');
      handleRefresh();
    } catch (e) {
      // Error handled by hook
    }
  };

  const handleRemoveUser = async (membershipId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${userEmail} from this location?`)) {
      return;
    }
    try {
      await removeMembership(membershipId);
      handleRefresh();
    } catch (e) {
      // Error handled by hook
    }
  };

  const handleSetDefault = async (membershipId: string, userEmail: string, locationId: string) => {
    try {
      await assignLocation(locationId, userEmail, true);
      handleRefresh();
    } catch (e) {
      // Error handled by hook
    }
  };

  // Get unique users from memberships
  const uniqueUsers = Array.from(
    new Set(memberships?.map(m => m.userKey) || [])
  );

  // Create user-location mapping
  const userLocationMap = new Map<string, LocationUserMembership[]>();
  memberships?.forEach(membership => {
    const existing = userLocationMap.get(membership.userKey) || [];
    existing.push(membership);
    userLocationMap.set(membership.userKey, existing);
  });

  // Filter users by search
  const filteredUsers = uniqueUsers.filter(userKey =>
    userKey.toLowerCase().includes(searchEmail.toLowerCase())
  );

  // Get location name by ID
  const getLocationName = (locationId: string) => {
    const location = locationsData?.items.find(loc => loc.id === locationId);
    return location?.name || 'Unknown Location';
  };

  return (
    <Page
      title="User Associations"
      description="Manage user assignments to locations"
      actions={
        <Button variant="primary" onClick={() => setAddModalOpen(true)}>
          <UserPlus size={16} className="mr-2" />
          Add Association
        </Button>
      }
    >
      {error && (
        <Alert variant="error" title="Error loading memberships">
          {error.message}
        </Alert>
      )}

      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="mb-4">
            <Input
              value={searchEmail}
              onChange={setSearchEmail}
              placeholder="Search users by email..."
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'user',
                label: 'User',
                sortable: true,
                render: (_, row) => (
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span className="font-medium">{row.userKey as string}</span>
                  </div>
                ),
              },
              {
                key: 'locations',
                label: 'Locations',
                render: (_, row) => {
                  const userMemberships = userLocationMap.get(row.userKey as string) || [];
                  return (
                    <div className="flex flex-wrap gap-2">
                      {userMemberships.map((membership) => (
                        <div
                          key={membership.id}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md"
                        >
                          <MapPin size={12} />
                          <span className="text-sm">{getLocationName(membership.locationId)}</span>
                          {membership.isDefault && (
                            <span className="ml-1">
                              <Badge variant="success">
                                <Check size={10} />
                              </Badge>
                            </span>
                          )}
                        </div>
                      ))}
                      {userMemberships.length === 0 && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">No locations</span>
                      )}
                    </div>
                  );
                },
              },
              {
                key: 'actions',
                label: '',
                align: 'right' as const,
                sortable: false,
                hideable: false,
                render: (_, row) => {
                  const userMemberships = userLocationMap.get(row.userKey as string) || [];
                  return (
                    <div className="flex items-center justify-end gap-2">
                      {userMemberships.map((membership) => (
                        <div key={membership.id} className="flex items-center gap-1">
                          {!membership.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetDefault(membership.id, membership.userKey, membership.locationId)}
                              disabled={mutating}
                            >
                              <Check size={16} />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveUser(membership.id, membership.userKey)}
                            disabled={mutating}
                          >
                            <UserMinus size={16} className="text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  );
                },
              },
            ]}
            data={filteredUsers.map(userKey => ({
              userKey,
            }))}
            emptyMessage="No users found"
            loading={loading}
            exportable
            showColumnVisibility
          />
        )}
      </Card>

      {/* Add Association Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setUserEmail('');
          setSelectedLocationId('');
        }}
        title="Add User to Location"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              User Email
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  handleAddUser();
                }
              }}
              placeholder="user@example.com"
              className="w-full h-10 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Location
            </label>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full h-10 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select a location</option>
              {locationsData?.items.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setAddModalOpen(false);
                setUserEmail('');
                setSelectedLocationId('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddUser}
              disabled={!userEmail.trim() || !selectedLocationId || mutating}
            >
              Add Association
            </Button>
          </div>
        </div>
      </Modal>
    </Page>
  );
}

export default LocationUserAssociations;

