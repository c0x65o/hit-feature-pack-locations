/**
 * Location Types API hooks
 */
'use client';
import { useState, useEffect, useCallback } from 'react';
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
export function useLocationTypes() {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetchApi('/types');
            // Handle both { items: [...] } and direct array responses
            const items = Array.isArray(response) ? response : (response?.items || []);
            setTypes(Array.isArray(items) ? items : []);
            setError(null);
        }
        catch (e) {
            setError(e);
            setTypes([]); // Reset to empty array on error
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        refresh();
    }, [refresh]);
    return { types, loading, error, refresh };
}
export function useLocationTypeMutations() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const createType = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchApi('/types', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            return result;
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
            setLoading(false);
        }
    };
    const updateType = async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchApi(`/types/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            return result;
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
            setLoading(false);
        }
    };
    const deleteType = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await fetchApi(`/types/${id}`, {
                method: 'DELETE',
            });
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
            setLoading(false);
        }
    };
    return {
        createType,
        updateType,
        deleteType,
        loading,
        error,
    };
}
//# sourceMappingURL=useLocationTypes.js.map