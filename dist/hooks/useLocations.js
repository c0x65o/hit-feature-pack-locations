/**
 * Locations API hooks
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
export function useLocations(options = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { page = 1, pageSize = 25, search, sortBy, sortOrder, parentId, isActive, isPrimary } = options;
    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: String(page),
                pageSize: String(pageSize),
            });
            if (search)
                params.set('search', search);
            if (sortBy)
                params.set('sortBy', sortBy);
            if (sortOrder)
                params.set('sortOrder', sortOrder);
            if (parentId !== undefined)
                params.set('parentId', parentId || '');
            if (isActive !== undefined)
                params.set('isActive', String(isActive));
            if (isPrimary !== undefined)
                params.set('isPrimary', String(isPrimary));
            const result = await fetchApi(`?${params}`);
            setData(result);
            setError(null);
        }
        catch (e) {
            setError(e);
        }
        finally {
            setLoading(false);
        }
    }, [page, pageSize, search, sortBy, sortOrder, parentId, isActive, isPrimary]);
    useEffect(() => {
        refresh();
    }, [refresh]);
    return { data, loading, error, refresh };
}
export function useLocation(id) {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const refresh = useCallback(async () => {
        if (!id || id === 'new') {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await fetchApi(`/${id}`);
            setLocation(data);
            setError(null);
        }
        catch (e) {
            setError(e);
        }
        finally {
            setLoading(false);
        }
    }, [id]);
    useEffect(() => {
        refresh();
    }, [refresh]);
    return { location, loading, error, refresh };
}
export function useLocationTree() {
    const [tree, setTree] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchApi('/tree');
            setTree(data);
            setError(null);
        }
        catch (e) {
            setError(e);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        refresh();
    }, [refresh]);
    return { tree, loading, error, refresh };
}
export function useLocationMutations() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const createLocation = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchApi('', {
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
    const updateLocation = async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchApi(`/${id}`, {
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
    const deleteLocation = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await fetchApi(`/${id}`, {
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
    const setPrimaryLocation = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchApi(`/${id}/set-primary`, {
                method: 'POST',
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
    return {
        createLocation,
        updateLocation,
        deleteLocation,
        setPrimaryLocation,
        loading,
        error,
    };
}
export function useLocationMemberships() {
    const [memberships, setMemberships] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchApi('/memberships');
            setMemberships(data);
            setError(null);
        }
        catch (e) {
            setError(e);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        refresh();
    }, [refresh]);
    return { memberships, loading, error, refresh };
}
export function useLocationMembershipMutations() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const assignLocation = async (locationId, isDefault) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchApi('/memberships', {
                method: 'POST',
                body: JSON.stringify({ locationId, isDefault }),
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
    const removeMembership = async (membershipId) => {
        setLoading(true);
        setError(null);
        try {
            await fetchApi(`/memberships/${membershipId}`, {
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
        assignLocation,
        removeMembership,
        loading,
        error,
    };
}
//# sourceMappingURL=useLocations.js.map