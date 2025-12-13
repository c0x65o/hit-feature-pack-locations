/**
 * LocationUsers Component
 *
 * Manages user associations with a location.
 * Allows adding and removing users from a location.
 * Includes user autocomplete when auth module is available.
 */
interface LocationUsersProps {
    locationId: string;
    onRefresh?: () => void;
}
export declare function LocationUsers({ locationId, onRefresh, }: LocationUsersProps): import("react/jsx-runtime").JSX.Element;
export default LocationUsers;
//# sourceMappingURL=LocationUsers.d.ts.map