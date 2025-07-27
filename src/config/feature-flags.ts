/**
 * Feature Flags Configuration
 *
 * This file manages feature flags for the application.
 * Flags are evaluated at BUILD TIME, not runtime.
 *
 * Priority order for flag values:
 * 1. Environment variables: FEATURE_<FLAG_NAME>=true/false
 * 2. Local override file: feature-flags.local.json (gitignored)
 * 3. Default config file: feature-flags.json
 * 4. Fallback defaults in code
 *
 * Example: FEATURE_CHAT_WIDGET=false npm run build
 */

// Import JSON config files
import defaultConfig from "./feature-flags.json";
// Try to import local override (this file is gitignored)
let localConfig: Partial<FeatureFlags> = {};

// Feature flag type definition
export interface FeatureFlags {
  // UI Features
  CHAT_WIDGET: boolean;
  PRODUCTS_SECTION: boolean;

  // Feature Toggles
  MAINTENANCE_MODE: boolean;

  // Add more feature flags here as needed
  [key: string]: boolean; // Allow dynamic keys
}

// Fallback default values (used if not in JSON)
const fallbackDefaults: FeatureFlags = {
  CHAT_WIDGET: true,
  PRODUCTS_SECTION: true,
  MAINTENANCE_MODE: false,
};

/**
 * Load feature flags from multiple sources with priority order:
 * 1. Environment variables (highest priority)
 * 2. Local JSON override file
 * 3. Default JSON config file
 * 4. Fallback defaults
 */
function loadFeatureFlags(): FeatureFlags {
  // Start with fallback defaults
  let flags: FeatureFlags = { ...fallbackDefaults };

  // Apply default JSON config
  if (defaultConfig) {
    flags = { ...flags, ...defaultConfig };
  }

  // Check environment variables (highest priority)
  Object.keys(flags).forEach((key) => {
    const envKey = `FEATURE_${key}`;
    const envValue = import.meta.env[envKey];

    if (envValue !== undefined) {
      // Convert string to boolean
      flags[key as keyof FeatureFlags] =
        envValue === "true" || envValue === "1";
    }
  });

  // Log active feature flags during build (only in dev)
  if (import.meta.env.DEV) {
    console.log("🚀 Feature Flags:", flags);
    if (Object.keys(localConfig).length > 0) {
      console.log("📝 Using local override:", Object.keys(localConfig));
    }
  }

  return flags;
}

// Export the feature flags (evaluated at build time)
export const featureFlags = loadFeatureFlags();

/**
 * Helper function to check if a feature is enabled
 * @param flagName - The name of the feature flag
 * @returns boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(flagName: keyof FeatureFlags): boolean {
  return featureFlags[flagName] ?? false;
}

/**
 * Helper function to get all enabled features
 * @returns Array of enabled feature names
 */
export function getEnabledFeatures(): string[] {
  return Object.entries(featureFlags)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);
}

/**
 * Helper function to get all disabled features
 * @returns Array of disabled feature names
 */
export function getDisabledFeatures(): string[] {
  return Object.entries(featureFlags)
    .filter(([_, enabled]) => !enabled)
    .map(([name]) => name);
}

