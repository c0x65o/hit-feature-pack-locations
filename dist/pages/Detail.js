'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ArrowLeft, Edit, Trash2, MapPin, Building2, } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useLocation, useLocationMutations } from '../hooks/useLocations';
import { LocationMap } from '../components/LocationMap';
export function LocationDetail({ id, onNavigate, }) {
    const { Page, Card, Button, Alert, Spinner, Badge } = useUi();
    const { location, loading, error } = useLocation(id);
    const { deleteLocation, loading: mutating } = useLocationMutations();
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
    return (_jsxs(Page, { title: location.name, actions: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Button, { variant: "secondary", onClick: () => navigate('/locations'), children: [_jsx(ArrowLeft, { size: 16, className: "mr-2" }), "Back"] }), _jsxs(Button, { variant: "primary", onClick: () => navigate(`/locations/${location.id}/edit`), children: [_jsx(Edit, { size: 16, className: "mr-2" }), "Edit"] }), _jsxs(Button, { variant: "danger", onClick: handleDelete, disabled: mutating, children: [_jsx(Trash2, { size: 16, className: "mr-2" }), "Delete"] })] }), children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [location.isPrimary && (_jsxs(Badge, { variant: "success", children: [_jsx(Building2, { size: 14, className: "mr-1" }), "Primary Location"] })), location.isActive ? (_jsx(Badge, { variant: "success", children: "Active" })) : (_jsx(Badge, { variant: "error", children: "Inactive" }))] }), _jsx("div", { className: "mb-4", children: _jsxs(Card, { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Location Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Name" }), _jsx("p", { className: "text-gray-900 dark:text-gray-100", children: location.name })] }), location.code && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Code" }), _jsx("p", { className: "text-gray-900 dark:text-gray-100", children: _jsx("code", { className: "text-sm", children: location.code }) })] })), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Address" }), _jsx("p", { className: "text-gray-900 dark:text-gray-100", children: formatAddress() })] }), location.latitude && location.longitude && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Latitude" }), _jsx("p", { className: "text-gray-900 dark:text-gray-100", children: location.latitude })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Longitude" }), _jsx("p", { className: "text-gray-900 dark:text-gray-100", children: location.longitude })] })] }))] })] }) }), location.latitude && location.longitude && (_jsxs(Card, { children: [_jsxs("h3", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [_jsx(MapPin, { size: 20 }), "Map View"] }), _jsx(LocationMap, { location: location, height: "400px" })] }))] }));
}
export default LocationDetail;
//# sourceMappingURL=Detail.js.map