/**
 * LocationSelector Component
 *
 * Dropdown/select component for choosing locations.
 * Supports hierarchical display and search.
 */
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
export declare function LocationSelector({ value, onChange, placeholder, excludeId, showHierarchy, allowClear, required, error, }: LocationSelectorProps): import("react/jsx-runtime").JSX.Element;
export default LocationSelector;
//# sourceMappingURL=LocationSelector.d.ts.map