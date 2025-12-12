/**
 * SignupLocationSelector Component
 *
 * Component for selecting a location during user signup.
 * This component checks if locations pack is installed and if location selection is required.
 *
 * Usage in auth-core signup page:
 * ```tsx
 * import { SignupLocationSelector } from '@hit/feature-pack-locations';
 *
 * // In signup form, after password fields:
 * <SignupLocationSelector
 *   value={selectedLocationId}
 *   onChange={setSelectedLocationId}
 *   onSignupComplete={handleLocationAssignment}
 * />
 * ```
 */
interface SignupLocationSelectorProps {
    value?: string | null;
    onChange?: (locationId: string | null) => void;
    onSignupComplete?: (userEmail: string, locationId: string | null) => Promise<void>;
    required?: boolean;
}
export declare function SignupLocationSelector({ value, onChange, onSignupComplete, required: propRequired, }: SignupLocationSelectorProps): import("react/jsx-runtime").JSX.Element | null;
/**
 * Hook to check if location selection is required during signup
 */
export declare function useRequireLocationOnSignup(): boolean;
export default SignupLocationSelector;
//# sourceMappingURL=SignupLocationSelector.d.ts.map