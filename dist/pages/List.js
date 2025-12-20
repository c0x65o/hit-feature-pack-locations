'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Plus, Eye, Edit, Trash2, MapPin, } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useLocations, useLocationMutations } from '../hooks/useLocations';
import { useLocationTypes } from '../hooks/useLocationTypes';
import { LocationMap } from '../components/LocationMap';
export function LocationList({ onNavigate, }) {
    const { Page, Card, Button, DataTable, Badge, Alert } = useUi();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const { data, loading, error, refresh } = useLocations({
        page,
        pageSize: 25,
        sortBy: 'name',
        sortOrder: 'asc',
        search: search || undefined,
    });
    const { types } = useLocationTypes();
    const typesArray = Array.isArray(types) ? types : [];
    const { deleteLocation, loading: mutating } = useLocationMutations();
    const navigate = (path) => {
        if (onNavigate) {
            onNavigate(path);
        }
        else if (typeof window !== 'undefined') {
            window.location.href = path;
        }
    };
    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
            return;
        }
        try {
            await deleteLocation(id);
            refresh();
        }
        catch {
            // Error handled by hook
        }
    };
    const formatAddress = (location) => {
        const parts = [
            location.address,
            location.city,
            location.state,
            location.postalCode,
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'No address';
    };
    // Filter locations with coordinates for the map
    const locationsWithCoords = (data?.items || []).filter((loc) => loc.latitude && loc.longitude);
    return (_jsxs(Page, { title: "Locations", description: "Manage your business locations", actions: _jsxs(Button, { variant: "primary", onClick: () => navigate('/locations/new'), children: [_jsx(Plus, { size: 16, className: "mr-2" }), "New Location"] }), children: [error && (_jsx(Alert, { variant: "error", title: "Error loading locations", children: error.message })), locationsWithCoords.length > 0 && (_jsx("div", { className: "mb-6", children: _jsx(Card, { children: _jsx(LocationMap, { locations: locationsWithCoords, height: "500px", zoom: 10, onLocationClick: (loc) => navigate(`/locations/${loc.id}`) }) }) })), _jsx(Card, { children: _jsx(DataTable, { columns: [
                        {
                            key: 'name',
                            label: 'Name',
                            sortable: true,
                            render: (_, row) => {
                                const hasCoords = Boolean(row.latitude && row.longitude);
                                const typeId = row.locationTypeId || row.location_type_id;
                                const locationType = typesArray.find(t => t.id === typeId);
                                return (_jsx("div", { className: "flex items-center gap-2", children: _jsxs("button", { onClick: () => navigate(`/locations/${row.id}`), className: "font-medium hover:text-blue-500 transition-colors text-left flex items-center gap-2", children: [locationType && (_jsx("span", { title: locationType.name, className: "inline-flex", children: _jsx(MapPin, { size: 14, style: { color: locationType.color } }) })), hasCoords && !locationType && (_jsx("span", { title: "Has coordinates", className: "inline-flex", children: _jsx(MapPin, { size: 14, className: "text-blue-500" }) })), row.name] }) }));
                            },
                        },
                        {
                            key: 'code',
                            label: 'Code',
                            sortable: true,
                            render: (value) => value ? _jsx("code", { className: "text-sm", children: value }) : '-',
                        },
                        {
                            key: 'address',
                            label: 'Address',
                            render: (_, row) => formatAddress({
                                address: row.address,
                                city: row.city,
                                state: row.state,
                                postalCode: row.postalCode,
                            }),
                        },
                        {
                            key: 'locationTypeId',
                            label: 'Type',
                            render: (_, row) => {
                                const typeId = row.locationTypeId || row.location_type_id;
                                const locationType = typesArray.find(t => t.id === typeId);
                                return locationType ? (_jsx(Badge, { variant: "default", children: _jsx("span", { style: { color: locationType.color }, children: locationType.name }) })) : (_jsx(Badge, { variant: "default", children: "No Type" }));
                            },
                        },
                        {
                            key: 'isActive',
                            label: 'Active',
                            render: (value) => value ? (_jsx(Badge, { variant: "success", children: "Active" })) : (_jsx(Badge, { variant: "error", children: "Inactive" })),
                        },
                        {
                            key: 'actions',
                            label: '',
                            align: 'right',
                            sortable: false,
                            hideable: false,
                            render: (_, row) => (_jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => navigate(`/locations/${row.id}`), children: _jsx(Eye, { size: 16 }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => navigate(`/locations/${row.id}/edit`), children: _jsx(Edit, { size: 16 }) }), _jsx(Button, { variant: "ghost", size: "sm", disabled: mutating, onClick: () => handleDelete(row.id, row.name), children: _jsx(Trash2, { size: 16, className: "text-red-500" }) })] })),
                        },
                    ], data: data?.items.map((loc) => ({
                        id: loc.id,
                        name: loc.name,
                        code: loc.code,
                        address: loc.address,
                        city: loc.city,
                        state: loc.state,
                        postalCode: loc.postalCode,
                        country: loc.country,
                        latitude: loc.latitude,
                        longitude: loc.longitude,
                        locationTypeId: loc.locationTypeId || loc.location_type_id || null,
                        isActive: loc.isActive,
                    })) || [], emptyMessage: "No locations found", loading: loading, exportable: true, showColumnVisibility: true, pageSize: 25, onRefresh: refresh, refreshing: loading, tableId: "locations" }) })] }));
}
export default LocationList;
//# sourceMappingURL=List.js.map