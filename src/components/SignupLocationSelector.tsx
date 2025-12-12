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

'use client';

import React, { useState, useEffect } from 'react';
import { useUi } from '@hit/ui-kit';
import { LocationSelector } from './LocationSelector';
import { useLocationMembershipMutations } from '../hooks/useLocations';

interface SignupLocationSelectorProps {
  value?: string | null;
  onChange?: (locationId: string | null) => void;
  onSignupComplete?: (userEmail: string, locationId: string | null) => Promise<void>;
  required?: boolean;
}

/**
 * Get locations pack config from window.__HIT_CONFIG
 */
function getLocationsConfig(): {
  require_location_on_signup: boolean;
  default_new_user_strategy: 'primary' | 'first_location' | 'none';
} | null {
  if (typeof window === 'undefined') return null;
  
  const win = window as unknown as { __HIT_CONFIG?: any };
  const config = win.__HIT_CONFIG?.featurePacks?.locations;
  
  if (!config) return null;
  
  return {
    require_location_on_signup: config.require_location_on_signup ?? false,
    default_new_user_strategy: config.default_new_user_strategy ?? 'primary',
  };
}

export function SignupLocationSelector({
  value,
  onChange,
  onSignupComplete,
  required: propRequired,
}: SignupLocationSelectorProps) {
  const { Alert } = useUi();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(value || null);
  const [config, setConfig] = useState<ReturnType<typeof getLocationsConfig>>(null);
  const { assignLocation } = useLocationMembershipMutations();

  useEffect(() => {
    const locationsConfig = getLocationsConfig();
    setConfig(locationsConfig);
  }, []);

  // If locations pack is not installed or not configured, don't render
  if (!config) {
    return null;
  }

  const required = propRequired ?? config.require_location_on_signup;

  const handleChange = (locationId: string | null) => {
    setSelectedLocationId(locationId);
    if (onChange) {
      onChange(locationId);
    }
  };

  // Function to assign location after signup (called by parent component)
  const assignLocationToUser = async (userEmail: string, locationId: string | null) => {
    if (!locationId) {
      // If no location selected, use default strategy
      if (config.default_new_user_strategy === 'none') {
        return;
      }
      // For 'primary' or 'first_location', the API should handle this
      // This is a placeholder - actual implementation would fetch and assign
      return;
    }

    try {
      await assignLocation(locationId, userEmail, true); // Set as default
      if (onSignupComplete) {
        await onSignupComplete(userEmail, locationId);
      }
    } catch (error) {
      console.error('Failed to assign location to user:', error);
      // Don't throw - location assignment failure shouldn't block signup
    }
  };

  // Note: Parent component should call assignLocationToUser after successful signup
  // This component exposes the selectedLocationId via onChange callback

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Location {required && <span className="text-red-500">*</span>}
      </label>
      <LocationSelector
        value={selectedLocationId}
        onChange={handleChange}
        placeholder="Select your location..."
        required={required}
        allowClear={!required}
      />
      {required && !selectedLocationId && (
        <p className="text-sm text-red-500">Please select a location</p>
      )}
    </div>
  );
}

/**
 * Hook to check if location selection is required during signup
 */
export function useRequireLocationOnSignup(): boolean {
  const [required, setRequired] = useState(false);

  useEffect(() => {
    const config = getLocationsConfig();
    setRequired(config?.require_location_on_signup ?? false);
  }, []);

  return required;
}

export default SignupLocationSelector;
