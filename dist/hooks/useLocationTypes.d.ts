/**
 * Location Types API hooks
 */
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
export declare function useLocationTypes(): {
    types: LocationType[];
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
export declare function useLocationTypeMutations(): {
    createType: (data: Partial<LocationType>) => Promise<LocationType>;
    updateType: (id: string, data: Partial<LocationType>) => Promise<LocationType>;
    deleteType: (id: string) => Promise<void>;
    loading: boolean;
    error: Error | null;
};
//# sourceMappingURL=useLocationTypes.d.ts.map