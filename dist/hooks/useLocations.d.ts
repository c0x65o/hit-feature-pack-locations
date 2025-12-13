/**
 * Locations API hooks
 */
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
export declare function useLocations(options?: UseQueryOptions): {
    data: PaginatedResponse<Location> | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
export declare function useLocation(id: string | undefined): {
    location: Location | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
export declare function useLocationTree(): {
    tree: LocationTree[] | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
export declare function useLocationMutations(): {
    createLocation: (data: Partial<Location>) => Promise<Location>;
    updateLocation: (id: string, data: Partial<Location>) => Promise<Location>;
    deleteLocation: (id: string) => Promise<void>;
    loading: boolean;
    error: Error | null;
};
export declare function useLocationMemberships(locationId?: string): {
    memberships: LocationUserMembership[] | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
export declare function useLocationMembershipMutations(): {
    assignLocation: (locationId: string, userKey: string, isDefault?: boolean) => Promise<LocationUserMembership>;
    removeMembership: (membershipId: string) => Promise<void>;
    loading: boolean;
    error: Error | null;
};
export type { PaginatedResponse, UseQueryOptions, LocationTree };
//# sourceMappingURL=useLocations.d.ts.map