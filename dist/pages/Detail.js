'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { ArrowLeft, Edit, Trash2, MapPin, Building2, Calendar, Clock, } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useLocation, useLocationMutations } from '../hooks/useLocations';
import { useLocationTypes } from '../hooks/useLocationTypes';
import { LocationMap } from '../components/LocationMap';
import { LocationUsers } from '../components/LocationUsers';
import { resolveLucideIconStrict } from '../utils/lucide-allowlist';
export function LocationDetail({ id, onNavigate, }) {
    const { Page, Card, Button, Alert, Spinner, Badge } = useUi();
    const { location, loading, error } = useLocation(id);
    const { deleteLocation, loading: mutating } = useLocationMutations();
    const { types } = useLocationTypes();
    const typesArray = Array.isArray(types) ? types : [];
    const [parentLocation, setParentLocation] = useState(null);
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
        }
        else {
            setParentLocation(null);
        }
    }, [location?.parentId]);
    // Get location type - handle both camelCase and snake_case from API
    const locationTypeId = location?.locationTypeId || location?.location_type_id;
    const locationType = locationTypeId
        ? typesArray.find(t => t.id === locationTypeId)
        : null;
    // Get icon component for location type
    const LocationTypeIcon = locationType?.icon
        ? resolveLucideIconStrict(locationType.icon)
        : Building2;
    const navigate = (path) => {
        if (onNavigate) {
            onNavigate(path);
        }
        else if (typeof window !== 'undefined') {
            window.location.href = path;
        }
    };
    const handleDelete = async () => {
        if (!location)
            return;
        if (!confirm(`Are you sure you want to delete "${location.name}"? This cannot be undone.`)) {
            return;
        }
        try {
            await deleteLocation(location.id);
            navigate('/locations');
        }
        catch {
            // Error handled by hook
        }
    };
    const formatAddress = () => {
        if (!location)
            return 'No address';
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
        return (_jsx(Page, { title: "Loading...", children: _jsx(Card, { children: _jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Spinner, { size: "lg" }) }) }) }));
    }
    // Error State
    if (error) {
        return (_jsx(Page, { title: "Location Not Found", actions: _jsxs(Button, { variant: "secondary", onClick: () => navigate('/locations'), children: [_jsx(ArrowLeft, { size: 16, className: "mr-2" }), "Back to Locations"] }), children: _jsx(Alert, { variant: "error", title: "Error", children: error.message }) }));
    }
    if (!location) {
        return null;
    }
    const breadcrumbs = [
        { label: 'Locations', href: '/locations', icon: _jsx(MapPin, { size: 14 }) },
        { label: location.name },
    ];
    return (_jsxs(Page, { title: location.name, breadcrumbs: breadcrumbs, onNavigate: navigate, actions: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Button, { variant: "primary", onClick: () => navigate(`/locations/${location.id}/edit`), children: [_jsx(Edit, { size: 16, className: "mr-2" }), "Edit"] }), _jsxs(Button, { variant: "danger", onClick: handleDelete, disabled: mutating, children: [_jsx(Trash2, { size: 16, className: "mr-2" }), "Delete"] })] }), children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [location.isActive ? (_jsx(Badge, { variant: "success", children: "Active" })) : (_jsx(Badge, { variant: "error", children: "Inactive" })), (location.isPrimary || location.is_primary) && (_jsx(Badge, { variant: "info", children: "Primary Location" })), locationType && (_jsxs("span", { style: {
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: locationType.color || '#3b82f6',
                            color: 'white',
                        }, children: [_jsx(LocationTypeIcon, { size: 14, className: "mr-1 inline" }), locationType.name] }))] }), _jsx("div", { className: "mb-4", children: _jsxs(Card, { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Location Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Name" }), _jsx("p", { className: "text-gray-900 dark:text-gray-100", children: location.name })] }), location.code && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Code" }), _jsx("p", { className: "text-gray-900 dark:text-gray-100", children: _jsx("code", { className: "text-sm", children: location.code }) })] })), locationType && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Location Type" }), _jsxs("p", { className: "text-gray-900 dark:text-gray-100 flex items-center gap-2", children: [_jsx(LocationTypeIcon, { size: 16, style: { color: locationType.color } }), locationType.name] })] })), location.parentId && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Parent Location" }), loadingParent ? (_jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "Loading..." })) : parentLocation ? (_jsx("p", { className: "text-gray-900 dark:text-gray-100", children: _jsx("button", { onClick: () => navigate(`/locations/${parentLocation.id}`), className: "text-blue-600 dark:text-blue-400 hover:underline", children: parentLocation.name }) })) : (_jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "Not found" }))] })), location.address && (_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Street Address" }), _jsx("p", { className: "text-gray-900 dark:text-gray-100", children: location.address })] })), location.city && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "City" }), _jsx("p", { className: "text-gray-900 dark:text-gray-100", children: location.city })] })), location.state && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "State/Province" }), _jsx("p", { className: "text-gray-900 dark:text-gray-100", children: location.state })] })), location.postalCode && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Postal Code" }), _jsx("p", { className: "text-gray-900 dark:text-gray-100", children: location.postalCode })] })), location.country && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Country" }), _jsx("p", { className: "text-gray-900 dark:text-gray-100", children: location.country })] })), !location.address && !location.city && !location.state && !location.postalCode && !location.country && (_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Address" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "No address" })] })), location.latitude && location.longitude && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Latitude" }), _jsx("p", { className: "text-gray-900 dark:text-gray-100", children: location.latitude })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Longitude" }), _jsx("p", { className: "text-gray-900 dark:text-gray-100", children: location.longitude })] })] })), _jsxs("div", { children: [_jsxs("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1", children: [_jsx(Calendar, { size: 14 }), "Created"] }), _jsx("p", { className: "text-gray-900 dark:text-gray-100", children: new Date(location.createdAt).toLocaleString() })] }), _jsxs("div", { children: [_jsxs("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1", children: [_jsx(Clock, { size: 14 }), "Last Updated"] }), _jsx("p", { className: "text-gray-900 dark:text-gray-100", children: new Date(location.updatedAt).toLocaleString() })] })] })] }) }), location.latitude && location.longitude && (_jsx("div", { className: "mb-4", children: _jsxs(Card, { children: [_jsxs("h3", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [_jsx(MapPin, { size: 20 }), "Map View"] }), _jsx(LocationMap, { location: location, height: "400px" })] }) })), _jsx("div", { className: "mb-4", children: _jsx(LocationUsers, { locationId: location.id }) })] }));
}
export default LocationDetail;
//# sourceMappingURL=Detail.js.map