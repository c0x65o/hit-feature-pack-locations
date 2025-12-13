/**
 * User Directory Hook
 * 
 * Provides access to the app-level user directory API.
 * This allows the Locations feature pack to:
 * - Search/autocomplete users for assignment
 * - Show "missing" users (users without location assignments)
 * - Gracefully handle apps without auth module
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface DirectoryUser {
  userKey: string;  // email or JWT sub - the unique identifier
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  role?: string;
  profilePictureUrl?: string | null;
}

interface DirectoryResponse {
  enabled: boolean;
  users?: DirectoryUser[];
  total?: number;
  error?: string;
}

// API endpoint - lives in the app, not the feature pack
const API_ENDPOINT = '/api/user-directory';

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  const token = localStorage.getItem('hit_token');
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
}

/**
 * Hook to check if user directory is enabled (auth module exists)
 * Returns a cached result to avoid repeated API calls
 */
export function useUserDirectoryStatus() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_ENDPOINT}?limit=1`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      const data: DirectoryResponse = await res.json();
      setEnabled(data.enabled);
      setError(data.error || null);
    } catch (e) {
      setEnabled(false);
      setError('Failed to check user directory status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return { enabled, loading, error, refresh: checkStatus };
}

/**
 * Hook to fetch all users from the directory
 */
export function useUserDirectory(options: { search?: string; limit?: number } = {}) {
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [total, setTotal] = useState(0);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { search, limit = 100 } = options;

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: String(limit) });
      if (search) params.set('search', search);

      const res = await fetch(`${API_ENDPOINT}?${params}`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      const data: DirectoryResponse = await res.json();
      
      setEnabled(data.enabled);
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setError(data.error ? new Error(data.error) : null);
    } catch (e) {
      setError(e as Error);
      setEnabled(false);
    } finally {
      setLoading(false);
    }
  }, [search, limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { users, total, enabled, loading, error, refresh };
}

/**
 * Hook to search users with debounce (for autocomplete)
 */
export function useUserSearch(searchTerm: string, debounceMs: number = 300) {
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [suggestions, setSuggestions] = useState<DirectoryUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState<boolean | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  // Fetch suggestions when debounced search changes
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          search: debouncedSearch,
          limit: '10',
        });

        const res = await fetch(`${API_ENDPOINT}?${params}`, {
          credentials: 'include',
          headers: getAuthHeaders(),
        });

        const data: DirectoryResponse = await res.json();
        setEnabled(data.enabled);
        setSuggestions(data.users || []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearch]);

  return { suggestions, loading, enabled };
}

/**
 * Hook to get users missing location assignments
 * Compares directory users against existing memberships
 */
export function useMissingLocationUsers(assignedUserKeys: string[]) {
  const { users: allUsers, enabled, loading, error, refresh } = useUserDirectory({ limit: 1000 });

  const assignedSet = useMemo(() => new Set(assignedUserKeys), [assignedUserKeys]);

  const missingUsers = useMemo(() => {
    if (!enabled || !allUsers) return [];
    return allUsers.filter(user => !assignedSet.has(user.userKey));
  }, [allUsers, assignedSet, enabled]);

  return { 
    missingUsers, 
    allUsers,
    enabled, 
    loading, 
    error, 
    refresh 
  };
}

export type { DirectoryResponse };
