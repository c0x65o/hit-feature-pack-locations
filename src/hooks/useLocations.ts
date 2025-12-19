/**
 * Locations API hooks
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Location {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  latitude: string | null;
  longitude: string | null;
  parentId: string | null;
  locationTypeId: string | null;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocationUserMembership {
  id: string;
  userKey: string;
  locationId: string;
  isDefault: boolean;
  createdAt: string;
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface UseQueryOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  parentId?: string | null;
  isActive?: boolean;
  locationTypeId?: string | null;
}

interface LocationTree {
  location: Location;
  children: LocationTree[];
}

// API base - uses project's local API routes
const API_BASE = '/api/locations';

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  const token = localStorage.getItem('hit_token');
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
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

export function useLocations(options: UseQueryOptions = {}) {
  const [data, setData] = useState<PaginatedResponse<Location> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { page = 1, pageSize = 25, search, sortBy, sortOrder, parentId, isActive, locationTypeId } = options;

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (search) params.set('search', search);
      if (sortBy) params.set('sortBy', sortBy);
      if (sortOrder) params.set('sortOrder', sortOrder);
      if (parentId !== undefined) params.set('parentId', parentId || '');
      if (isActive !== undefined) params.set('isActive', String(isActive));
      if (locationTypeId !== undefined) params.set('locationTypeId', locationTypeId || '');

      const result = await fetchApi<PaginatedResponse<Location>>(`?${params}`);
      setData(result);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, sortBy, sortOrder, parentId, isActive, locationTypeId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useLocation(id: string | undefined) {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!id || id === 'new') {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await fetchApi<Location>(`/${id}`);
      setLocation(data);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { location, loading, error, refresh };
}

export function useLocationTree() {
  const [tree, setTree] = useState<LocationTree[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchApi<LocationTree[]>('/tree');
      setTree(data);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
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
  const [error, setError] = useState<Error | null>(null);

  const createLocation = async (data: Partial<Location>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchApi<Location>('', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return result;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (id: string, data: Partial<Location>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchApi<Location>(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return result;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const deleteLocation = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await fetchApi(`/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    createLocation,
    updateLocation,
    deleteLocation,
    loading,
    error,
  };
}

interface UseMembershipOptions {
  locationId?: string;
  /** If true, fetches all memberships (admin only). Default: false */
  all?: boolean;
}

export function useLocationMemberships(options: UseMembershipOptions | string = {}) {
  // Support legacy signature: useLocationMemberships(locationId?: string)
  const opts = typeof options === 'string' ? { locationId: options } : options;
  const { locationId, all = false } = opts;

  const [memberships, setMemberships] = useState<LocationUserMembership[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (locationId) params.set('locationId', locationId);
      if (all) params.set('all', 'true');
      
      const queryString = params.toString();
      const endpoint = queryString ? `/memberships?${queryString}` : '/memberships';
      const response = await fetchApi<{ items: LocationUserMembership[] }>(endpoint);
      // API returns { items: [...] }, extract the items array
      const data = Array.isArray(response) ? response : (response.items || []);
      setMemberships(data);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [locationId, all]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { memberships, loading, error, refresh };
}

export function useLocationMembershipMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const assignLocation = async (locationId: string, userKey: string, isDefault?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchApi<LocationUserMembership>('/memberships', {
        method: 'POST',
        body: JSON.stringify({ locationId, userKey, isDefault }),
      });
      return result;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const removeMembership = async (membershipId: string) => {
    setLoading(true);
    setError(null);
    try {
      await fetchApi(`/memberships/${membershipId}`, {
        method: 'DELETE',
      });
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
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

export type { PaginatedResponse, UseQueryOptions, LocationTree };
