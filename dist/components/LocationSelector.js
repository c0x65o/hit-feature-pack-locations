/**
 * LocationSelector Component
 *
 * Dropdown/select component for choosing locations.
 * Supports hierarchical display and search.
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useUi } from '@hit/ui-kit';
import { useLocations, useLocationTree } from '../hooks/useLocations';
export function LocationSelector({ value, onChange, placeholder = 'Select a location...', excludeId, showHierarchy = true, allowClear = true, required = false, error, }) {
    const { Spinner, Alert, Input } = useUi();
    const { tree, loading, error: treeError } = useLocationTree();
    const { data, loading: listLoading } = useLocations({ pageSize: 1000 });
    const [searchTerm, setSearchTerm] = useState('');
    // Flatten tree for simple select, or use hierarchical display
    const locations = showHierarchy && tree
        ? flattenTree(tree)
        : data?.items.filter(loc => !excludeId || loc.id !== excludeId) || [];
    // Filter by search term
    const filteredLocations = searchTerm
        ? locations.filter(loc => loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loc.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loc.city?.toLowerCase().includes(searchTerm.toLowerCase()))
        : locations;
    if (loading || listLoading) {
        return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Spinner, { size: "sm" }), _jsx("span", { className: "text-sm text-gray-500", children: "Loading locations..." })] }));
    }
    if (treeError) {
        return (_jsx(Alert, { variant: "error", title: "Error loading locations", children: treeError.message }));
    }
    return (_jsxs("div", { className: "space-y-2", children: [filteredLocations.length > 10 && (_jsx(Input, { value: searchTerm, onChange: setSearchTerm, placeholder: "Search locations..." })), _jsxs("select", { value: value || '', onChange: (e) => onChange(e.target.value || null), required: required, className: "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100", children: [!required && _jsx("option", { value: "", children: placeholder }), filteredLocations.map(loc => (_jsxs("option", { value: loc.id, children: [showHierarchy && loc.parentId ? `  ${loc.name}` : loc.name, loc.code && ` (${loc.code})`] }, loc.id)))] }), error && (_jsx("p", { className: "text-sm text-red-500", children: error }))] }));
}
function flattenTree(tree, result = []) {
    for (const node of tree) {
        result.push(node.location);
        if (node.children && node.children.length > 0) {
            flattenTree(node.children, result);
        }
    }
    return result;
}
export default LocationSelector;
//# sourceMappingURL=LocationSelector.js.map