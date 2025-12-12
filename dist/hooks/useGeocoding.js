/**
 * Geocoding API hooks
 */
'use client';
import { useState, useCallback } from 'react';
// API base - uses project's local API routes
const API_BASE = '/api/locations';
function getAuthHeaders() {
    if (typeof window === 'undefined')
        return {};
    const token = localStorage.getItem('hit_token');
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    return {};
}
async function fetchApi(endpoint, options) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            ...options?.headers,
        },
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error.message || `Request failed: ${res.status}`);
    }
    return res.json();
}
/**
 * Geocode an address to coordinates
 */
export function useGeocode() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const geocode = useCallback(async (address, options) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchApi('/geocode', {
                method: 'POST',
                body: JSON.stringify({ address, ...options }),
            });
            return result;
        }
        catch (e) {
            const err = e;
            setError(err);
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);
    return { geocode, loading, error };
}
//# sourceMappingURL=useGeocoding.js.map