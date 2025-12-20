/**
 * Location Types API hooks
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface LocationType {
  id: string;
  name: string;
  code: string;
  icon: string;
  color: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
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

export function useLocationTypes() {
  const [types, setTypes] = useState<LocationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchApi<{ items: LocationType[] }>('/types');
      // Handle both { items: [...] } and direct array responses
      const items = Array.isArray(response) ? response : (response?.items || []);
      setTypes(Array.isArray(items) ? items : []);
      setError(null);
    } catch (e) {
      setError(e as Error);
      setTypes([]); // Reset to empty array on error
    } finally {
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
  const [error, setError] = useState<Error | null>(null);

  const createType = async (data: Partial<LocationType>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchApi<LocationType>('/types', {
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

  const updateType = async (id: string, data: Partial<LocationType>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchApi<LocationType>(`/types/${id}`, {
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

  const deleteType = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await fetchApi(`/types/${id}`, {
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
    createType,
    updateType,
    deleteType,
    loading,
    error,
  };
}

