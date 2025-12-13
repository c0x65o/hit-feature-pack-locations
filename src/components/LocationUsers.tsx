/**
 * LocationUsers Component
 * 
 * Manages user associations with a location.
 * Allows adding and removing users from a location.
 * Includes user autocomplete when auth module is available.
 */

'use client';

import React, { useState } from 'react';
import {
  UserPlus,
  UserMinus,
  Users,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import {
  useLocationMemberships,
  useLocationMembershipMutations,
  type LocationUserMembership,
} from '../hooks/useLocations';
import {
  useUserSearch,
  useUserDirectoryStatus,
  type DirectoryUser,
} from '../hooks/useUserDirectory';

interface LocationUsersProps {
  locationId: string;
  onRefresh?: () => void;
}

export function LocationUsers({
  locationId,
  onRefresh,
}: LocationUsersProps) {
  const { Card, Button, Badge, Alert, Input, Modal, Spinner } = useUi();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<DirectoryUser | null>(null);

  // Fetch memberships for this location - use admin mode to get all users assigned here
  const { memberships, loading, error, refresh } = useLocationMemberships({ locationId, all: true });
  const { assignLocation, removeMembership, loading: mutating } = useLocationMembershipMutations();

  // User directory integration
  const { enabled: userDirectoryEnabled, loading: directoryStatusLoading } = useUserDirectoryStatus();
  const { suggestions, loading: searchLoading } = useUserSearch(userEmail);

  // Filter memberships for this location
  const locationMemberships = memberships?.filter(m => m.locationId === locationId) || [];

  const handleRefresh = () => {
    refresh();
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleAddUser = async () => {
    const emailToAdd = selectedUser?.email || userEmail.trim();
    if (!emailToAdd) {
      return;
    }
    try {
      await assignLocation(locationId, emailToAdd, false);
      setAddModalOpen(false);
      setUserEmail('');
      setSelectedUser(null);
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

  const handleSelectUser = (user: DirectoryUser) => {
    setSelectedUser(user);
    setUserEmail(user.email);
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
          setSelectedUser(null);
        }}
        title="Add User to Location"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              User Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={userEmail}
                onChange={(e) => {
                  setUserEmail(e.target.value);
                  setSelectedUser(null);
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    handleAddUser();
                  }
                }}
                placeholder={userDirectoryEnabled ? "Search or enter email..." : "user@example.com"}
                className="w-full h-10 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Spinner />
                </div>
              )}
            </div>

            {/* Autocomplete suggestions */}
            {userDirectoryEnabled && suggestions.length > 0 && !selectedUser && (
              <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map(user => (
                  <button
                    key={user.userKey}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Users size={14} className="text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{user.email}</div>
                      {user.displayName && (
                        <div className="text-sm text-gray-500">{user.displayName}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedUser && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md flex items-center gap-2">
                <Check size={14} className="text-blue-500" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Selected: {selectedUser.displayName || selectedUser.email}
                </span>
              </div>
            )}

            {!userDirectoryEnabled && !directoryStatusLoading && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter the email address of the user to add
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setAddModalOpen(false);
                setUserEmail('');
                setSelectedUser(null);
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
