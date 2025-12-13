/**
 * User Directory Hook
 *
 * Provides access to the app-level user directory API.
 * This allows the Locations feature pack to:
 * - Search/autocomplete users for assignment
 * - Show "missing" users (users without location assignments)
 * - Gracefully handle apps without auth module
 */
export interface DirectoryUser {
    userKey: string;
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
/**
 * Hook to check if user directory is enabled (auth module exists)
 * Returns a cached result to avoid repeated API calls
 */
export declare function useUserDirectoryStatus(): {
    enabled: boolean | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
};
/**
 * Hook to fetch all users from the directory
 */
export declare function useUserDirectory(options?: {
    search?: string;
    limit?: number;
}): {
    users: DirectoryUser[];
    total: number;
    enabled: boolean | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
/**
 * Hook to search users with debounce (for autocomplete)
 */
export declare function useUserSearch(searchTerm: string, debounceMs?: number): {
    suggestions: DirectoryUser[];
    loading: boolean;
    enabled: boolean | null;
};
/**
 * Hook to get users missing location assignments
 * Compares directory users against existing memberships
 */
export declare function useMissingLocationUsers(assignedUserKeys: string[]): {
    missingUsers: DirectoryUser[];
    allUsers: DirectoryUser[];
    enabled: boolean | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
export type { DirectoryResponse };
//# sourceMappingURL=useUserDirectory.d.ts.map