/**
 * LocationSelector Component
 * 
 * Dropdown/select component for choosing locations.
 * Supports hierarchical display and search.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useUi } from '@hit/ui-kit';
import { useLocations, useLocationTree, type Location } from '../hooks/useLocations';

interface LocationSelectorProps {
  value?: string | null;
  onChange: (locationId: string | null) => void;
  placeholder?: string;
  excludeId?: string;
  showHierarchy?: boolean;
  allowClear?: boolean;
  required?: boolean;
  error?: string;
}

export function LocationSelector({
  value,
  onChange,
  placeholder = 'Select a location...',
  excludeId,
  showHierarchy = true,
  allowClear = true,
  required = false,
  error,
}: LocationSelectorProps) {
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
    ? locations.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.city?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : locations;

  if (loading || listLoading) {
    return (
      <div className="flex items-center gap-2">
        <Spinner size="sm" />
        <span className="text-sm text-gray-500">Loading locations...</span>
      </div>
    );
  }

  if (treeError) {
    return (
      <Alert variant="error" title="Error loading locations">
        {treeError.message}
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      {filteredLocations.length > 10 && (
        <Input
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search locations..."
        />
      )}
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        required={required}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        {!required && <option value="">{placeholder}</option>}
        {filteredLocations.map(loc => (
          <option key={loc.id} value={loc.id}>
            {showHierarchy && loc.parentId ? `  ${loc.name}` : loc.name}
            {loc.code && ` (${loc.code})`}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

function flattenTree(
  tree: Array<{ location: Location; children: Array<{ location: Location; children: any[] }> }>,
  result: Location[] = []
): Location[] {
  for (const node of tree) {
    result.push(node.location);
    if (node.children && node.children.length > 0) {
      flattenTree(node.children, result);
    }
  }
  return result;
}

export default LocationSelector;
