'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useLocation, useLocationMutations } from '../hooks/useLocations';
import { useGeocode } from '../hooks/useGeocoding';
import { LocationSelector } from '../components/LocationSelector';
import { LocationMap } from '../components/LocationMap';
export function LocationEdit({ id, onNavigate, }) {
    const { Page, Card, Button, Input, TextArea, Alert, Spinner, Checkbox } = useUi();
    const isNew = !id || id === 'new';
    const { location, loading: loadingLocation, error: loadError } = useLocation(isNew ? undefined : id);
    const { createLocation, updateLocation, loading: saving, error: saveError } = useLocationMutations();
    const { geocode, loading: geocoding } = useGeocode();
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [parentId, setParentId] = useState(null);
    const [isPrimary, setIsPrimary] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [fieldErrors, setFieldErrors] = useState({});
    // Populate form when location loads
    useEffect(() => {
        if (location) {
            setName(location.name);
            setCode(location.code || '');
            setAddress(location.address || '');
            setCity(location.city || '');
            setState(location.state || '');
            setPostalCode(location.postalCode || '');
            setCountry(location.country || '');
            setLatitude(location.latitude || '');
            setLongitude(location.longitude || '');
            setParentId(location.parentId);
            setIsPrimary(location.isPrimary);
            setIsActive(location.isActive);
        }
    }, [location]);
    const navigate = (path) => {
        if (onNavigate) {
            onNavigate(path);
        }
        else if (typeof window !== 'undefined') {
            window.location.href = path;
        }
    };
    const validateForm = () => {
        const errors = {};
        if (!name.trim()) {
            errors.name = 'Name is required';
        }
        if (latitude && isNaN(parseFloat(latitude))) {
            errors.latitude = 'Latitude must be a valid number';
        }
        if (longitude && isNaN(parseFloat(longitude))) {
            errors.longitude = 'Longitude must be a valid number';
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleGeocode = async () => {
        const fullAddress = [
            address,
            city,
            state,
            postalCode,
            country,
        ].filter(Boolean).join(', ');
        if (!fullAddress.trim()) {
            alert('Please enter an address to geocode');
            return;
        }
        try {
            const result = await geocode(fullAddress);
            setLatitude(result.latitude.toString());
            setLongitude(result.longitude.toString());
        }
        catch (error) {
            alert(`Failed to geocode address: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        const locationData = {
            name,
            code: code || null,
            address: address || null,
            city: city || null,
            state: state || null,
            postalCode: postalCode || null,
            country: country || null,
            latitude: latitude || null,
            longitude: longitude || null,
            parentId,
            isPrimary,
            isActive,
        };
        try {
            if (isNew) {
                const newLocation = await createLocation(locationData);
                navigate(`/locations/${newLocation.id}`);
            }
            else if (id) {
                await updateLocation(id, locationData);
                navigate(`/locations/${id}`);
            }
        }
        catch {
            // Error handled by hook
        }
    };
    const handleCancel = () => {
        if (isNew) {
            navigate('/locations');
        }
        else {
            navigate(`/locations/${id}`);
        }
    };
    // Loading state for edit mode
    if (!isNew && loadingLocation) {
        return (_jsx(Page, { title: "Loading...", children: _jsx(Card, { children: _jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Spinner, { size: "lg" }) }) }) }));
    }
    // Error loading location
    if (!isNew && loadError) {
        return (_jsx(Page, { title: "Location Not Found", actions: _jsxs(Button, { variant: "secondary", onClick: () => navigate('/locations'), children: [_jsx(ArrowLeft, { size: 16, className: "mr-2" }), "Back to Locations"] }), children: _jsx(Alert, { variant: "error", title: "Error", children: loadError.message }) }));
    }
    const currentLocation = {
        name,
        latitude: latitude || null,
        longitude: longitude || null,
    };
    return (_jsxs(Page, { title: isNew ? 'New Location' : 'Edit Location', actions: _jsxs(Button, { variant: "secondary", onClick: handleCancel, children: [_jsx(ArrowLeft, { size: 16, className: "mr-2" }), "Cancel"] }), children: [saveError && (_jsx(Alert, { variant: "error", title: "Error saving location", children: saveError.message })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs(Card, { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Basic Information" }), _jsxs("div", { className: "space-y-4", children: [_jsx(Input, { label: "Name", value: name, onChange: setName, placeholder: "Enter location name...", required: true, error: fieldErrors.name }), _jsx(Input, { label: "Code", value: code, onChange: setCode, placeholder: "Optional location code..." })] })] }), _jsxs(Card, { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Address" }), _jsxs("div", { className: "space-y-4", children: [_jsx(TextArea, { label: "Street Address", value: address, onChange: setAddress, placeholder: "Enter street address...", rows: 2 }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(Input, { label: "City", value: city, onChange: setCity, placeholder: "City" }), _jsx(Input, { label: "State/Province", value: state, onChange: setState, placeholder: "State or Province" }), _jsx(Input, { label: "Postal Code", value: postalCode, onChange: setPostalCode, placeholder: "ZIP/Postal Code" }), _jsx(Input, { label: "Country", value: country, onChange: setCountry, placeholder: "Country" })] }), _jsxs("div", { className: "flex items-end gap-2", children: [_jsxs("div", { className: "flex-1 grid grid-cols-2 gap-2", children: [_jsx(Input, { label: "Latitude", value: latitude, onChange: setLatitude, placeholder: "Auto-filled via geocoding", error: fieldErrors.latitude }), _jsx(Input, { label: "Longitude", value: longitude, onChange: setLongitude, placeholder: "Auto-filled via geocoding", error: fieldErrors.longitude })] }), _jsxs(Button, { type: "button", variant: "secondary", onClick: handleGeocode, disabled: geocoding, children: [_jsx(MapPin, { size: 16, className: "mr-2" }), geocoding ? 'Geocoding...' : 'Lookup Coordinates'] })] })] })] }), (latitude || longitude) && (_jsxs(Card, { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Map Preview" }), _jsx(LocationMap, { location: currentLocation, height: "300px" })] })), _jsxs(Card, { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Settings" }), _jsxs("div", { className: "space-y-4", children: [_jsx(LocationSelector, { value: parentId, onChange: setParentId, placeholder: "Select parent location (optional)", excludeId: id, allowClear: true }), _jsxs("div", { className: "space-y-2", children: [_jsx(Checkbox, { checked: isPrimary, onChange: setIsPrimary, label: "Set as primary/HQ location" }), _jsx(Checkbox, { checked: isActive, onChange: setIsActive, label: "Active" })] })] })] }), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-800", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCancel, children: "Cancel" }), _jsxs(Button, { type: "submit", variant: "primary", loading: saving, children: [_jsx(Save, { size: 16, className: "mr-2" }), isNew ? 'Create Location' : 'Save Changes'] })] })] })] }));
}
export default LocationEdit;
//# sourceMappingURL=Edit.js.map