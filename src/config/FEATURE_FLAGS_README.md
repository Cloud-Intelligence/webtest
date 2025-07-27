# Feature Flags System

This directory contains the build-time feature flag system for controlling feature visibility in the application.

## Quick Start

### Using JSON Configuration (Recommended)

1. **Edit the main config file** `feature-flags.json`:
```json
{
  "CHAT_WIDGET": false,
  "PRODUCTS_SECTION": true
}
```

2. **Create a local override** `feature-flags.local.json` (gitignored):
```json
{
  "CHAT_WIDGET": false,
  "BETA_FEATURES": true
}
```

3. **Build the app**:
```bash
npm run build
```

### Using Environment Variables

Environment variables override JSON configs:
```bash
FEATURE_CHAT_WIDGET=false npm run build
```

## Configuration Priority

Feature flag values are determined in this order (highest to lowest priority):

1. **Environment Variables** - `FEATURE_<FLAG_NAME>=true/false`
2. **Local Override File** - `feature-flags.local.json` (gitignored)
3. **Default Config File** - `feature-flags.json` (committed to repo)
4. **Code Defaults** - Fallback values in `feature-flags.ts`

## How It Works

Feature flags are evaluated at **BUILD TIME**, not runtime. This means:
- ✅ Zero runtime overhead
- ✅ Smaller bundle size (disabled features are not included)
- ✅ Better performance
- ❌ Cannot change flags without rebuilding

## Adding a New Feature Flag

1. **Define the flag** in `feature-flags.ts`:
```typescript
export interface FeatureFlags {
  CHAT_WIDGET: boolean;
  MY_NEW_FEATURE: boolean; // Add your flag here
}

const defaultFlags: FeatureFlags = {
  CHAT_WIDGET: true,
  MY_NEW_FEATURE: false, // Set default value
};
```

2. **Use the flag** in your components:
```typescript
// In Astro components
import { isFeatureEnabled } from '../config/feature-flags';

{isFeatureEnabled('MY_NEW_FEATURE') && <MyNewComponent />}

// In React/TypeScript
if (isFeatureEnabled('MY_NEW_FEATURE')) {
  // Feature-specific code
}
```

3. **Build with the flag**:
```bash
FEATURE_MY_NEW_FEATURE=true npm run build
```

## Current Feature Flags

| Flag Name | Default | Description |
|-----------|---------|-------------|
| `CHAT_WIDGET` | `true` | AI chat widget in bottom-right corner |
| `PRODUCTS_SECTION` | `true` | Products navigation menu and pages |
| `AI_CHAT_DEMO` | `true` | AI chat demo on product page |
| `ANALYTICS_DASHBOARD` | `false` | Analytics dashboard feature (coming soon) |
| `BETA_FEATURES` | `false` | Enable beta/experimental features |
| `MAINTENANCE_MODE` | `false` | Show maintenance message |

## Environment Variable Format

- Pattern: `FEATURE_<FLAG_NAME>`
- Values: `'true'`, `'false'`, `'1'`, `'0'`
- Case-sensitive flag names

## Examples

### Using JSON Config

```bash
# Edit feature-flags.json then build
npm run build

# Create local override for development
echo '{"CHAT_WIDGET": false}' > feature-flags.local.json
npm run dev
```

### Using Environment Variables

```bash
# Disable chat for development
FEATURE_CHAT_WIDGET=false npm run dev

# Production without chat
FEATURE_CHAT_WIDGET=false npm run build

# Multiple flags via env vars
FEATURE_CHAT_WIDGET=false FEATURE_BETA_FEATURES=true npm run build
```

### Mixed Approach

```bash
# JSON config + env var override
# If feature-flags.json has CHAT_WIDGET=true, this overrides it
FEATURE_CHAT_WIDGET=false npm run build
```

## Debugging

Feature flags are logged in development mode. Check the console to see active flags:
```
🚀 Feature Flags: { CHAT_WIDGET: false, ... }
```