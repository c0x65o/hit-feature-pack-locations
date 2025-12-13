'use client';

import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  UserMinus,
  Users,
  MapPin,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import {
  useLocations,
  useLocationMemberships,
  useLocationMembershipMutations,
  type LocationUserMembership,
} from '../hooks/useLocations';
import {
  useUserDirectory,
  useUserSearch,
  type DirectoryUser,
} from '../hooks/useUserDirectory';

interface LocationUserAssociationsProps {
  onNavigate?: (path: string) => void;
}

export function LocationUserAssociations({
  onNavigate,
}: LocationUserAssociationsProps) {
  const { Page, Card, Button, Badge, Alert, Modal, Spinner, DataTable, Tabs } = useUi();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [userEmail, setUserEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<DirectoryUser | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'missing'>('all');

  const { data: locationsData } = useLocations({ page: 1, pageSize: 1000 });
  // Fetch ALL memberships (admin mode)
  const { memberships, loading, error, refresh } = useLocationMemberships({ all: true });
  const { assignLocation, removeMembership, loading: mutating } = useLocationMembershipMutations();

  // User directory integration
  const { 
    users: directoryUsers, 
    enabled: userDirectoryEnabled, 
    loading: directoryLoading,
    error: directoryError 
  } = useUserDirectory({ limit: 1000 });

  // User search for autocomplete
  const { suggestions, loading: searchLoading } = useUserSearch(userEmail);

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
    const emailToAdd = selectedUser?.email || userEmail.trim();
    if (!emailToAdd || !selectedLocationId) {
      return;
    }
    try {
      await assignLocation(selectedLocationId, emailToAdd, false);
      setAddModalOpen(false);
      setUserEmail('');
      setSelectedLocationId('');
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

  const handleSelectUser = (user: DirectoryUser) => {
    setSelectedUser(user);
    setUserEmail(user.email);
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

  // Calculate missing users (users in directory but not assigned to any location)
  const assignedUserKeys = useMemo(() => new Set(uniqueUsers), [uniqueUsers]);
  const missingUsers = useMemo(() => {
    if (!userDirectoryEnabled || !directoryUsers) return [];
    return directoryUsers.filter(user => !assignedUserKeys.has(user.userKey));
  }, [directoryUsers, assignedUserKeys, userDirectoryEnabled]);

  // Get location name by ID
  const getLocationName = (locationId: string) => {
    const location = locationsData?.items.find(loc => loc.id === locationId);
    return location?.name || 'Unknown Location';
  };

  // Get display name for a userKey
  const getUserDisplayInfo = (userKey: string) => {
    const dirUser = directoryUsers?.find(u => u.userKey === userKey);
    return {
      displayName: dirUser?.displayName || null,
      email: dirUser?.email || userKey,
      profilePictureUrl: dirUser?.profilePictureUrl || null,
    };
  };

  // Render user directory not available alert
  const renderDirectoryAlert = () => {
    if (userDirectoryEnabled === false) {
      return (
        <Alert variant="info" title="User Directory Not Available">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <div>
              <p>Auth module is not configured. User autocomplete and "missing users" features are disabled.</p>
              <p className="text-sm mt-1 opacity-75">You can still manually enter user emails to create associations.</p>
            </div>
          </div>
        </Alert>
      );
    }
    return null;
  };

  const allUsersContent = (
    <DataTable
      columns={[
        {
          key: 'user',
          label: 'User',
          sortable: true,
          render: (_, row) => {
            const userInfo = getUserDisplayInfo(row.userKey as string);
            return (
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-400" />
                <div>
                  <span className="font-medium">{userInfo.email}</span>
                  {userInfo.displayName && (
                    <span className="text-sm text-gray-500 ml-2">({userInfo.displayName})</span>
                  )}
                </div>
              </div>
            );
          },
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
                  <Button
                    key={membership.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveUser(membership.id, membership.userKey)}
                    disabled={mutating}
                  >
                    <UserMinus size={16} className="text-red-500" />
                  </Button>
                ))}
              </div>
            );
          },
        },
      ]}
      data={uniqueUsers.map((userKey) => ({ userKey }))}
      emptyMessage="No users found"
      loading={loading}
      exportable
      showColumnVisibility
    />
  );

  const missingUsersContent = (
    <DataTable
      columns={[
        {
          key: 'user',
          label: 'User',
          sortable: true,
          render: (_, row) => {
            const user = row as unknown as DirectoryUser;
            return (
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-400" />
                <div>
                  <span className="font-medium">{user.email}</span>
                  {user.displayName && (
                    <span className="text-sm text-gray-500 ml-2">({user.displayName})</span>
                  )}
                </div>
              </div>
            );
          },
        },
        {
          key: 'role',
          label: 'Role',
          render: (_, row) => {
            const user = row as unknown as DirectoryUser;
            return (
              <Badge variant={user.role === 'admin' ? 'info' : 'default'}>
                {user.role || 'user'}
              </Badge>
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
            const user = row as unknown as DirectoryUser;
            return (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedUser(user);
                  setUserEmail(user.email);
                  setAddModalOpen(true);
                }}
              >
                <UserPlus size={16} className="mr-1" />
                Assign Location
              </Button>
            );
          },
        },
      ]}
      data={missingUsers as unknown as Record<string, unknown>[]}
      emptyMessage="All users have location assignments!"
      loading={directoryLoading}
      exportable
      showColumnVisibility
    />
  );

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

      {renderDirectoryAlert()}

      <Card>
        {loading || directoryLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : userDirectoryEnabled ? (
          <Tabs
            activeTab={activeTab}
            onChange={(tabId) => setActiveTab(tabId as 'all' | 'missing')}
            tabs={[
              { id: 'all', label: `All Users (${uniqueUsers.length})`, content: allUsersContent },
              { id: 'missing', label: `Missing Associations (${missingUsers.length})`, content: missingUsersContent },
            ]}
          />
        ) : (
          allUsersContent
        )}
      </Card>

      {/* Add Association Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setUserEmail('');
          setSelectedLocationId('');
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
                placeholder="Search or enter email..."
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

            {!userDirectoryEnabled && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter the email address of the user to add
              </p>
            )}
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
                setSelectedUser(null);
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
