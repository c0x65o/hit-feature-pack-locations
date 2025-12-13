'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { UserPlus, UserMinus, Users, MapPin, AlertCircle, Check, } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useLocations, useLocationMemberships, useLocationMembershipMutations, } from '../hooks/useLocations';
import { useUserDirectory, useUserSearch, } from '../hooks/useUserDirectory';
export function LocationUserAssociations({ onNavigate, }) {
    const { Page, Card, Button, Badge, Alert, Modal, Spinner, DataTable, Tabs } = useUi();
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [selectedLocationId, setSelectedLocationId] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const { data: locationsData } = useLocations({ page: 1, pageSize: 1000 });
    // Fetch ALL memberships (admin mode)
    const { memberships, loading, error, refresh } = useLocationMemberships({ all: true });
    const { assignLocation, removeMembership, loading: mutating } = useLocationMembershipMutations();
    // User directory integration
    const { users: directoryUsers, enabled: userDirectoryEnabled, loading: directoryLoading, error: directoryError } = useUserDirectory({ limit: 1000 });
    // User search for autocomplete
    const { suggestions, loading: searchLoading } = useUserSearch(userEmail);
    const navigate = (path) => {
        if (onNavigate) {
            onNavigate(path);
        }
        else if (typeof window !== 'undefined') {
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
        }
        catch (e) {
            // Error handled by hook
        }
    };
    const handleRemoveUser = async (membershipId, userEmail) => {
        if (!confirm(`Are you sure you want to remove ${userEmail} from this location?`)) {
            return;
        }
        try {
            await removeMembership(membershipId);
            handleRefresh();
        }
        catch (e) {
            // Error handled by hook
        }
    };
    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setUserEmail(user.email);
    };
    // Get unique users from memberships
    const uniqueUsers = Array.from(new Set(memberships?.map(m => m.userKey) || []));
    // Create user-location mapping
    const userLocationMap = new Map();
    memberships?.forEach(membership => {
        const existing = userLocationMap.get(membership.userKey) || [];
        existing.push(membership);
        userLocationMap.set(membership.userKey, existing);
    });
    // Calculate missing users (users in directory but not assigned to any location)
    const assignedUserKeys = useMemo(() => new Set(uniqueUsers), [uniqueUsers]);
    const missingUsers = useMemo(() => {
        if (!userDirectoryEnabled || !directoryUsers)
            return [];
        return directoryUsers.filter(user => !assignedUserKeys.has(user.userKey));
    }, [directoryUsers, assignedUserKeys, userDirectoryEnabled]);
    // Get location name by ID
    const getLocationName = (locationId) => {
        const location = locationsData?.items.find(loc => loc.id === locationId);
        return location?.name || 'Unknown Location';
    };
    // Get display name for a userKey
    const getUserDisplayInfo = (userKey) => {
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
            return (_jsx(Alert, { variant: "info", title: "User Directory Not Available", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(AlertCircle, { size: 16, className: "mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("p", { children: "Auth module is not configured. User autocomplete and \"missing users\" features are disabled." }), _jsx("p", { className: "text-sm mt-1 opacity-75", children: "You can still manually enter user emails to create associations." })] })] }) }));
        }
        return null;
    };
    const allUsersContent = (_jsx(DataTable, { columns: [
            {
                key: 'user',
                label: 'User',
                sortable: true,
                render: (_, row) => {
                    const userInfo = getUserDisplayInfo(row.userKey);
                    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { size: 16, className: "text-gray-400" }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: userInfo.email }), userInfo.displayName && (_jsxs("span", { className: "text-sm text-gray-500 ml-2", children: ["(", userInfo.displayName, ")"] }))] })] }));
                },
            },
            {
                key: 'locations',
                label: 'Locations',
                render: (_, row) => {
                    const userMemberships = userLocationMap.get(row.userKey) || [];
                    return (_jsxs("div", { className: "flex flex-wrap gap-2", children: [userMemberships.map((membership) => (_jsxs("div", { className: "flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md", children: [_jsx(MapPin, { size: 12 }), _jsx("span", { className: "text-sm", children: getLocationName(membership.locationId) })] }, membership.id))), userMemberships.length === 0 && (_jsx("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No locations" }))] }));
                },
            },
            {
                key: 'actions',
                label: '',
                align: 'right',
                sortable: false,
                hideable: false,
                render: (_, row) => {
                    const userMemberships = userLocationMap.get(row.userKey) || [];
                    return (_jsx("div", { className: "flex items-center justify-end gap-2", children: userMemberships.map((membership) => (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleRemoveUser(membership.id, membership.userKey), disabled: mutating, children: _jsx(UserMinus, { size: 16, className: "text-red-500" }) }, membership.id))) }));
                },
            },
        ], data: uniqueUsers.map((userKey) => ({ userKey })), emptyMessage: "No users found", loading: loading, exportable: true, showColumnVisibility: true }));
    const missingUsersContent = (_jsx(DataTable, { columns: [
            {
                key: 'user',
                label: 'User',
                sortable: true,
                render: (_, row) => {
                    const user = row;
                    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { size: 16, className: "text-gray-400" }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: user.email }), user.displayName && (_jsxs("span", { className: "text-sm text-gray-500 ml-2", children: ["(", user.displayName, ")"] }))] })] }));
                },
            },
            {
                key: 'role',
                label: 'Role',
                render: (_, row) => {
                    const user = row;
                    return (_jsx(Badge, { variant: user.role === 'admin' ? 'info' : 'default', children: user.role || 'user' }));
                },
            },
            {
                key: 'actions',
                label: '',
                align: 'right',
                sortable: false,
                hideable: false,
                render: (_, row) => {
                    const user = row;
                    return (_jsxs(Button, { variant: "primary", size: "sm", onClick: () => {
                            setSelectedUser(user);
                            setUserEmail(user.email);
                            setAddModalOpen(true);
                        }, children: [_jsx(UserPlus, { size: 16, className: "mr-1" }), "Assign Location"] }));
                },
            },
        ], data: missingUsers, emptyMessage: "All users have location assignments!", loading: directoryLoading, exportable: true, showColumnVisibility: true }));
    return (_jsxs(Page, { title: "User Associations", description: "Manage user assignments to locations", actions: _jsxs(Button, { variant: "primary", onClick: () => setAddModalOpen(true), children: [_jsx(UserPlus, { size: 16, className: "mr-2" }), "Add Association"] }), children: [error && (_jsx(Alert, { variant: "error", title: "Error loading memberships", children: error.message })), renderDirectoryAlert(), _jsx(Card, { children: loading || directoryLoading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx(Spinner, {}) })) : userDirectoryEnabled ? (_jsx(Tabs, { activeTab: activeTab, onChange: (tabId) => setActiveTab(tabId), tabs: [
                        { id: 'all', label: `All Users (${uniqueUsers.length})`, content: allUsersContent },
                        { id: 'missing', label: `Missing Associations (${missingUsers.length})`, content: missingUsersContent },
                    ] })) : (allUsersContent) }), _jsx(Modal, { open: addModalOpen, onClose: () => {
                    setAddModalOpen(false);
                    setUserEmail('');
                    setSelectedLocationId('');
                    setSelectedUser(null);
                }, title: "Add User to Location", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "User Email" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "email", value: userEmail, onChange: (e) => {
                                                setUserEmail(e.target.value);
                                                setSelectedUser(null);
                                            }, onKeyDown: (e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddUser();
                                                }
                                            }, placeholder: "Search or enter email...", className: "w-full h-10 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" }), searchLoading && (_jsx("div", { className: "absolute right-3 top-1/2 -translate-y-1/2", children: _jsx(Spinner, {}) }))] }), userDirectoryEnabled && suggestions.length > 0 && !selectedUser && (_jsx("div", { className: "mt-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-lg max-h-48 overflow-y-auto", children: suggestions.map(user => (_jsxs("button", { type: "button", onClick: () => handleSelectUser(user), className: "w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2", children: [_jsx(Users, { size: 14, className: "text-gray-400" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900 dark:text-gray-100", children: user.email }), user.displayName && (_jsx("div", { className: "text-sm text-gray-500", children: user.displayName }))] })] }, user.userKey))) })), selectedUser && (_jsxs("div", { className: "mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md flex items-center gap-2", children: [_jsx(Check, { size: 14, className: "text-blue-500" }), _jsxs("span", { className: "text-sm text-blue-700 dark:text-blue-300", children: ["Selected: ", selectedUser.displayName || selectedUser.email] })] })), !userDirectoryEnabled && (_jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Enter the email address of the user to add" }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Location" }), _jsxs("select", { value: selectedLocationId, onChange: (e) => setSelectedLocationId(e.target.value), className: "w-full h-10 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx("option", { value: "", children: "Select a location" }), locationsData?.items.map((location) => (_jsx("option", { value: location.id, children: location.name }, location.id)))] })] }), _jsxs("div", { className: "flex items-center gap-2 justify-end", children: [_jsx(Button, { variant: "secondary", onClick: () => {
                                        setAddModalOpen(false);
                                        setUserEmail('');
                                        setSelectedLocationId('');
                                        setSelectedUser(null);
                                    }, children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleAddUser, disabled: !userEmail.trim() || !selectedLocationId || mutating, children: "Add Association" })] })] }) })] }));
}
export default LocationUserAssociations;
//# sourceMappingURL=LocationUserAssociations.js.map