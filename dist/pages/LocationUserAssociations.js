'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { UserPlus, UserMinus, Users, Check, MapPin, } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useLocations, useLocationMemberships, useLocationMembershipMutations, } from '../hooks/useLocations';
export function LocationUserAssociations({ onNavigate, }) {
    const { Page, Card, Button, Badge, Alert, Input, Modal, Spinner, DataTable } = useUi();
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [selectedLocationId, setSelectedLocationId] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const { data: locationsData } = useLocations({ page: 1, pageSize: 1000 });
    const { memberships, loading, error, refresh } = useLocationMemberships();
    const { assignLocation, removeMembership, loading: mutating } = useLocationMembershipMutations();
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
        if (!userEmail.trim() || !selectedLocationId) {
            return;
        }
        try {
            await assignLocation(selectedLocationId, userEmail.trim(), false);
            setAddModalOpen(false);
            setUserEmail('');
            setSelectedLocationId('');
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
    const handleSetDefault = async (membershipId, userEmail, locationId) => {
        try {
            await assignLocation(locationId, userEmail, true);
            handleRefresh();
        }
        catch (e) {
            // Error handled by hook
        }
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
    // Filter users by search
    const filteredUsers = uniqueUsers.filter(userKey => userKey.toLowerCase().includes(searchEmail.toLowerCase()));
    // Get location name by ID
    const getLocationName = (locationId) => {
        const location = locationsData?.items.find(loc => loc.id === locationId);
        return location?.name || 'Unknown Location';
    };
    return (_jsxs(Page, { title: "User Associations", description: "Manage user assignments to locations", actions: _jsxs(Button, { variant: "primary", onClick: () => setAddModalOpen(true), children: [_jsx(UserPlus, { size: 16, className: "mr-2" }), "Add Association"] }), children: [error && (_jsx(Alert, { variant: "error", title: "Error loading memberships", children: error.message })), _jsxs(Card, { children: [_jsx("div", { className: "p-4 border-b border-gray-200 dark:border-gray-800", children: _jsx("div", { className: "mb-4", children: _jsx(Input, { value: searchEmail, onChange: setSearchEmail, placeholder: "Search users by email..." }) }) }), loading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx(Spinner, {}) })) : (_jsx(DataTable, { columns: [
                            {
                                key: 'user',
                                label: 'User',
                                sortable: true,
                                render: (_, row) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { size: 16, className: "text-gray-400" }), _jsx("span", { className: "font-medium", children: row.userKey })] })),
                            },
                            {
                                key: 'locations',
                                label: 'Locations',
                                render: (_, row) => {
                                    const userMemberships = userLocationMap.get(row.userKey) || [];
                                    return (_jsxs("div", { className: "flex flex-wrap gap-2", children: [userMemberships.map((membership) => (_jsxs("div", { className: "flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md", children: [_jsx(MapPin, { size: 12 }), _jsx("span", { className: "text-sm", children: getLocationName(membership.locationId) }), membership.isDefault && (_jsx("span", { className: "ml-1", children: _jsx(Badge, { variant: "success", children: _jsx(Check, { size: 10 }) }) }))] }, membership.id))), userMemberships.length === 0 && (_jsx("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No locations" }))] }));
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
                                    return (_jsx("div", { className: "flex items-center justify-end gap-2", children: userMemberships.map((membership) => (_jsxs("div", { className: "flex items-center gap-1", children: [!membership.isDefault && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleSetDefault(membership.id, membership.userKey, membership.locationId), disabled: mutating, children: _jsx(Check, { size: 16 }) })), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleRemoveUser(membership.id, membership.userKey), disabled: mutating, children: _jsx(UserMinus, { size: 16, className: "text-red-500" }) })] }, membership.id))) }));
                                },
                            },
                        ], data: filteredUsers.map(userKey => ({
                            userKey,
                        })), emptyMessage: "No users found", loading: loading, exportable: true, showColumnVisibility: true }))] }), _jsx(Modal, { open: addModalOpen, onClose: () => {
                    setAddModalOpen(false);
                    setUserEmail('');
                    setSelectedLocationId('');
                }, title: "Add User to Location", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "User Email" }), _jsx("input", { type: "email", value: userEmail, onChange: (e) => setUserEmail(e.target.value), onKeyDown: (e) => {
                                        if (e.key === 'Enter') {
                                            handleAddUser();
                                        }
                                    }, placeholder: "user@example.com", className: "w-full h-10 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Location" }), _jsxs("select", { value: selectedLocationId, onChange: (e) => setSelectedLocationId(e.target.value), className: "w-full h-10 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx("option", { value: "", children: "Select a location" }), locationsData?.items.map((location) => (_jsx("option", { value: location.id, children: location.name }, location.id)))] })] }), _jsxs("div", { className: "flex items-center gap-2 justify-end", children: [_jsx(Button, { variant: "secondary", onClick: () => {
                                        setAddModalOpen(false);
                                        setUserEmail('');
                                        setSelectedLocationId('');
                                    }, children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleAddUser, disabled: !userEmail.trim() || !selectedLocationId || mutating, children: "Add Association" })] })] }) })] }));
}
export default LocationUserAssociations;
//# sourceMappingURL=LocationUserAssociations.js.map