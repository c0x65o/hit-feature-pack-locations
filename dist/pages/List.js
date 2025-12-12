'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Building2, } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useLocations, useLocationMutations } from '../hooks/useLocations';
export function LocationList({ onNavigate, }) {
    const { Page, Card, Button, DataTable, Badge, Alert, Input } = useUi();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const { data, loading, error, refresh } = useLocations({
        page,
        pageSize: 25,
        sortBy: 'name',
        sortOrder: 'asc',
        search: search || undefined,
    });
    const { deleteLocation, setPrimaryLocation, loading: mutating } = useLocationMutations();
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
    const handleSetPrimary = async (id) => {
        try {
            await setPrimaryLocation(id);
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
    return (_jsxs(Page, { title: "Locations", description: "Manage your business locations", actions: _jsxs(Button, { variant: "primary", onClick: () => navigate('/locations/new'), children: [_jsx(Plus, { size: 16, className: "mr-2" }), "New Location"] }), children: [error && (_jsx(Alert, { variant: "error", title: "Error loading locations", children: error.message })), _jsxs(Card, { children: [_jsx("div", { className: "p-4 border-b border-gray-200 dark:border-gray-800", children: _jsx(Input, { value: search, onChange: setSearch, placeholder: "Search locations..." }) }), _jsx(DataTable, { columns: [
                            {
                                key: 'name',
                                label: 'Name',
                                sortable: true,
                                render: (_, row) => (_jsx("div", { className: "flex items-center gap-2", children: _jsxs("button", { onClick: () => navigate(`/locations/${row.id}`), className: "font-medium hover:text-blue-500 transition-colors text-left flex items-center gap-2", children: [Boolean(row.isPrimary) && (_jsx("span", { title: "Primary/HQ Location", className: "inline-flex", children: _jsx(Building2, { size: 16, className: "text-yellow-500" }) })), row.name] }) })),
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
                                key: 'isPrimary',
                                label: 'Status',
                                render: (value) => value ? (_jsx(Badge, { variant: "success", children: "Primary" })) : (_jsx(Badge, { variant: "default", children: "Standard" })),
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
                                render: (_, row) => (_jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => navigate(`/locations/${row.id}`), children: _jsx(Eye, { size: 16 }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => navigate(`/locations/${row.id}/edit`), children: _jsx(Edit, { size: 16 }) }), !row.isPrimary && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleSetPrimary(row.id), disabled: mutating, children: _jsx(Building2, { size: 16 }) })), _jsx(Button, { variant: "ghost", size: "sm", disabled: mutating, onClick: () => handleDelete(row.id, row.name), children: _jsx(Trash2, { size: 16, className: "text-red-500" }) })] })),
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
                            isPrimary: loc.isPrimary,
                            isActive: loc.isActive,
                        })) || [], emptyMessage: "No locations found", loading: loading, exportable: true, showColumnVisibility: true, pageSize: 25 })] })] }));
}
export default LocationList;
//# sourceMappingURL=List.js.map