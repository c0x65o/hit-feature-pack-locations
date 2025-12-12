/**
 * LocationUsers Component
 * 
 * Manages user associations with a location.
 * Allows adding and removing users from a location.
 */

'use client';

import React, { useState } from 'react';
import {
  UserPlus,
  UserMinus,
  Users,
  X,
  Check,
} from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import {
  useLocationMemberships,
  useLocationMembershipMutations,
  type LocationUserMembership,
} from '../hooks/useLocations';

interface LocationUsersProps {
  locationId: string;
  onRefresh?: () => void;
}

interface User {
  email: string;
  name?: string;
}

export function LocationUsers({
  locationId,
  onRefresh,
}: LocationUsersProps) {
  const { Card, Button, Badge, Alert, Input, Modal, Spinner } = useUi();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [searchEmail, setSearchEmail] = useState('');

  const { memberships, loading, error, refresh } = useLocationMemberships(locationId);
  const { assignLocation, removeMembership, loading: mutating } = useLocationMembershipMutations();

  // Filter memberships for this location
  const locationMemberships = memberships?.filter(m => m.locationId === locationId) || [];

  const handleRefresh = () => {
    refresh();
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleAddUser = async () => {
    if (!userEmail.trim()) {
      return;
    }
    try {
      await assignLocation(locationId, userEmail.trim(), false);
      setAddModalOpen(false);
      setUserEmail('');
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

  const handleSetDefault = async (membershipId: string, userEmail: string) => {
    try {
      // Re-assign as default - API should handle unsetting other defaults
      await assignLocation(locationId, userEmail, true);
      handleRefresh();
    } catch (e) {
      // Error handled by hook
    }
  };

  // Filter memberships by search
  const filteredMemberships = locationMemberships.filter(m =>
    m.userKey.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <Card>
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users size={20} />
            Associated Users
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage users assigned to this location
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setAddModalOpen(true)}
          disabled={mutating}
        >
          <UserPlus size={16} className="mr-2" />
          Add User
        </Button>
      </div>

      {error && (
        <div className="p-4">
          <Alert variant="error" title="Error loading memberships">
            {error.message}
          </Alert>
        </div>
      )}

      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <>
            {locationMemberships.length > 0 && (
              <div className="mb-4">
                <Input
                  value={searchEmail}
                  onChange={setSearchEmail}
                  placeholder="Search users by email..."
                />
              </div>
            )}

            {filteredMemberships.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {locationMemberships.length === 0
                  ? 'No users assigned to this location'
                  : 'No users match your search'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMemberships.map((membership) => (
                  <div
                    key={membership.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{membership.userKey}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {membership.isDefault ? 'Default location' : 'Assigned location'}
                        </div>
                      </div>
                      {membership.isDefault && (
                        <Badge variant="success">
                          <Check size={12} className="mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!membership.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(membership.id, membership.userKey)}
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
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add User Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setUserEmail('');
        }}
        title="Add User to Location"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              User Email
            </label>
            <Input
              type="email"
              value={userEmail}
              onChange={setUserEmail}
              placeholder="user@example.com"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddUser();
                }
              }}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter the email address of the user to add
            </p>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setAddModalOpen(false);
                setUserEmail('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddUser}
              disabled={!userEmail.trim() || mutating}
            >
              Add User
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

export default LocationUsers;

