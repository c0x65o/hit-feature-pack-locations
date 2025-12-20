'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Plus, MapPin, Building2, Package, ShoppingBag, Building, Cog, Tag, Users, } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useLocations, useLocationMemberships } from '../hooks/useLocations';
import { useLocationTypes } from '../hooks/useLocationTypes';
import { LocationMap } from '../components/LocationMap';
// Icon mapping for location types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap = {
    Building2,
    Package,
    ShoppingBag,
    Building,
    Cog,
    MapPin,
};
export function LocationDashboard({ onNavigate, }) {
    const { Page, Card, Button, Alert, Badge } = useUi();
    const { data, loading, error } = useLocations({
        page: 1,
        pageSize: 1000, // Get all for dashboard stats
    });
    const { types } = useLocationTypes();
    const { memberships } = useLocationMemberships();
    const navigate = (path) => {
        if (onNavigate) {
            onNavigate(path);
        }
        else if (typeof window !== 'undefined') {
            window.location.href = path;
        }
    };
    // Ensure types is always an array
    const typesArray = Array.isArray(types) ? types : [];
    // Calculate stats
    const totalLocations = data?.items.length || 0;
    const activeLocations = data?.items.filter(loc => loc.isActive).length || 0;
    const locationsWithCoords = data?.items.filter((loc) => loc.latitude && loc.longitude).length || 0;
    const totalLocationTypes = typesArray.length;
    // Calculate unassociated users
    // Get unique users from memberships
    const membershipsArray = Array.isArray(memberships) ? memberships : [];
    const associatedUsers = new Set(membershipsArray.map(m => m.userKey));
    const associatedUsersCount = associatedUsers.size;
    // Try to fetch total users to calculate unassociated count
    // This requires a /api/users endpoint to be available
    const [totalUsers, setTotalUsers] = React.useState(null);
    const [unassociatedUsers, setUnassociatedUsers] = React.useState(null);
    React.useEffect(() => {
        // Try to fetch users count if API is available
        const fetchUsers = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('hit_token') : null;
                const headers = {
                    'Content-Type': 'application/json',
                };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
                const res = await fetch('/api/users', {
                    credentials: 'include',
                    headers,
                });
                if (res.ok) {
                    const users = await res.json();
                    const total = Array.isArray(users) ? users.length : 0;
                    setTotalUsers(total);
                    setUnassociatedUsers(Math.max(0, total - associatedUsersCount));
                }
            }
            catch {
                // Users API not available, ignore
            }
        };
        fetchUsers();
    }, [associatedUsersCount]);
    // Group locations by type
    const locationsByType = typesArray.map(type => ({
        type,
        count: data?.items.filter(loc => {
            const typeId = loc.locationTypeId || loc.location_type_id;
            return typeId === type.id;
        }).length || 0,
    }));
    // Get HQ location (type code "hq")
    const hqType = typesArray.find(t => t.code === 'hq');
    const hqLocations = hqType ? data?.items.filter(loc => {
        const typeId = loc.locationTypeId || loc.location_type_id;
        return typeId === hqType.id;
    }) || [] : [];
    if (error) {
        return (_jsx(Page, { title: "Locations Dashboard", description: "Overview of your business locations", children: _jsx(Alert, { variant: "error", title: "Error loading locations", children: error.message }) }));
    }
    return (_jsxs(Page, { title: "Locations Dashboard", description: "Overview of your business locations", actions: _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "secondary", onClick: () => navigate('/locations/list'), children: "View All" }), _jsxs(Button, { variant: "primary", onClick: () => navigate('/locations/new'), children: [_jsx(Plus, { size: 16, className: "mr-2" }), "New Location"] })] }), children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [_jsx(Card, { children: _jsx("div", { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Total Locations" }), _jsx("p", { className: "text-2xl font-bold mt-1", children: totalLocations })] }), _jsx("div", { className: "p-3 bg-blue-100 dark:bg-blue-900 rounded-lg", children: _jsx(MapPin, { className: "w-6 h-6 text-blue-600 dark:text-blue-400" }) })] }) }) }), _jsx(Card, { children: _jsx("div", { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Location Types" }), _jsx("p", { className: "text-2xl font-bold mt-1", children: totalLocationTypes })] }), _jsx("div", { className: "p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg", children: _jsx(Tag, { className: "w-6 h-6 text-indigo-600 dark:text-indigo-400" }) })] }) }) }), _jsx(Card, { children: _jsx("div", { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: unassociatedUsers !== null ? 'Unassociated Users' : 'Associated Users' }), _jsx("p", { className: "text-2xl font-bold mt-1", children: unassociatedUsers !== null ? unassociatedUsers : associatedUsersCount }), unassociatedUsers !== null && (_jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [associatedUsersCount, " associated"] }))] }), _jsx("div", { className: `p-3 rounded-lg ${unassociatedUsers !== null && unassociatedUsers > 0
                                            ? 'bg-orange-100 dark:bg-orange-900'
                                            : 'bg-green-100 dark:bg-green-900'}`, children: _jsx(Users, { className: `w-6 h-6 ${unassociatedUsers !== null && unassociatedUsers > 0
                                                ? 'text-orange-600 dark:text-orange-400'
                                                : 'text-green-600 dark:text-green-400'}` }) })] }) }) }), _jsx(Card, { children: _jsx("div", { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Active Locations" }), _jsx("p", { className: "text-2xl font-bold mt-1", children: activeLocations })] }), _jsx("div", { className: "p-3 bg-emerald-100 dark:bg-emerald-900 rounded-lg", children: _jsx(Building2, { className: "w-6 h-6 text-emerald-600 dark:text-emerald-400" }) })] }) }) })] }), locationsWithCoords > 0 && (_jsx("div", { className: "mb-6", children: _jsxs(Card, { children: [_jsxs("div", { className: "p-4 border-b border-gray-200 dark:border-gray-800", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Location Map" }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: "Click on markers to view location details" })] }), _jsx(LocationMap, { locations: data?.items.filter(loc => loc.latitude && loc.longitude) || [], height: "500px", zoom: 10, onLocationClick: (loc) => navigate(`/locations/${loc.id}`) })] }) })), _jsxs(Card, { children: [_jsx("div", { className: "p-4 border-b border-gray-200 dark:border-gray-800", children: _jsx("h3", { className: "text-lg font-semibold", children: "Locations by Type" }) }), _jsx("div", { className: "p-4", children: locationsByType.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: locationsByType.map(({ type, count }) => {
                                const IconComponent = iconMap[type.icon] || MapPin;
                                return (_jsxs("div", { className: "flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer", onClick: () => navigate(`/locations/list?type=${type.id}`), children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded-lg", style: { backgroundColor: `${type.color}20` }, children: _jsx(IconComponent, { size: 20, style: { color: type.color } }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: type.name }), type.description && (_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: type.description }))] })] }), _jsx(Badge, { variant: "default", children: count })] }, type.id));
                            }) })) : (_jsx("p", { className: "text-gray-600 dark:text-gray-400 text-center py-8", children: "No location types configured" })) })] })] }));
}
export default LocationDashboard;
//# sourceMappingURL=Dashboard.js.map