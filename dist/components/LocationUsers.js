/**
 * LocationUsers Component
 *
 * Manages user associations with a location.
 * Allows adding and removing users from a location.
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { UserPlus, UserMinus, Users, Check, } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useLocationMemberships, useLocationMembershipMutations, } from '../hooks/useLocations';
export function LocationUsers({ locationId, onRefresh, }) {
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
    const handleSetDefault = async (membershipId, userEmail) => {
        try {
            // Re-assign as default - API should handle unsetting other defaults
            await assignLocation(locationId, userEmail, true);
            handleRefresh();
        }
        catch (e) {
            // Error handled by hook
        }
    };
    // Filter memberships by search
    const filteredMemberships = locationMemberships.filter(m => m.userKey.toLowerCase().includes(searchEmail.toLowerCase()));
    return (_jsxs(Card, { children: [_jsxs("div", { className: "p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold flex items-center gap-2", children: [_jsx(Users, { size: 20 }), "Associated Users"] }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: "Manage users assigned to this location" })] }), _jsxs(Button, { variant: "primary", size: "sm", onClick: () => setAddModalOpen(true), disabled: mutating, children: [_jsx(UserPlus, { size: 16, className: "mr-2" }), "Add User"] })] }), error && (_jsx("div", { className: "p-4", children: _jsx(Alert, { variant: "error", title: "Error loading memberships", children: error.message }) })), _jsx("div", { className: "p-4", children: loading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx(Spinner, {}) })) : (_jsxs(_Fragment, { children: [locationMemberships.length > 0 && (_jsx("div", { className: "mb-4", children: _jsx(Input, { value: searchEmail, onChange: setSearchEmail, placeholder: "Search users by email..." }) })), filteredMemberships.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500 dark:text-gray-400", children: locationMemberships.length === 0
                                ? 'No users assigned to this location'
                                : 'No users match your search' })) : (_jsx("div", { className: "space-y-2", children: filteredMemberships.map((membership) => (_jsxs("div", { className: "flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: membership.userKey }), _jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: membership.isDefault ? 'Default location' : 'Assigned location' })] }), membership.isDefault && (_jsxs(Badge, { variant: "success", children: [_jsx(Check, { size: 12, className: "mr-1" }), "Default"] }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [!membership.isDefault && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleSetDefault(membership.id, membership.userKey), disabled: mutating, children: _jsx(Check, { size: 16 }) })), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleRemoveUser(membership.id, membership.userKey), disabled: mutating, children: _jsx(UserMinus, { size: 16, className: "text-red-500" }) })] })] }, membership.id))) }))] })) }), _jsx(Modal, { open: addModalOpen, onClose: () => {
                    setAddModalOpen(false);
                    setUserEmail('');
                }, title: "Add User to Location", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "User Email" }), _jsx(Input, { type: "email", value: userEmail, onChange: setUserEmail, placeholder: "user@example.com", onKeyDown: (e) => {
                                        if (e.key === 'Enter') {
                                            handleAddUser();
                                        }
                                    } }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Enter the email address of the user to add" })] }), _jsxs("div", { className: "flex items-center gap-2 justify-end", children: [_jsx(Button, { variant: "secondary", onClick: () => {
                                        setAddModalOpen(false);
                                        setUserEmail('');
                                    }, children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleAddUser, disabled: !userEmail.trim() || mutating, children: "Add User" })] })] }) })] }));
}
export default LocationUsers;
//# sourceMappingURL=LocationUsers.js.map