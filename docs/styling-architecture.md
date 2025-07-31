# Styling Architecture Documentation

## Overview

This document explains the styling methods used in the Cloud Intelligence website project and how different styling systems interact with each other.

## Styling Methods

The project uses multiple styling approaches that work together:

### 1. **Tailwind CSS**
- **Purpose**: Utility-first CSS framework for rapid UI development
- **Location**: Applied directly in HTML/JSX as class names
- **Configuration**: `tailwind.config.js`
- **Base styles**: `src/styles/globals.css`

### 2. **SCSS Modules**
- **Purpose**: Component-specific styling with advanced features
- **Entry point**: `src/styles/main.scss`
- **Structure**:
  - `base/` - Variables and reset styles
  - `components/` - Component-specific styles
- **Compilation**: Handled by Astro's Vite integration

### 3. **Component-Scoped Styles (Astro)**
- **Purpose**: Component-specific styles that are scoped to the component
- **Location**: `<style>` or `<style lang="scss">` blocks in `.astro` files
- **Scoping**: Automatically scoped by Astro to prevent conflicts

### 4. **Inline Styles**
- **Purpose**: Dynamic or highly specific styling
- **Location**: `style` attribute on HTML elements
- **Use cases**: Dynamic values, JavaScript-controlled styles

### 5. **Critical CSS**
- **Purpose**: Above-the-fold styles for performance
- **Location**: Inlined in `src/layouts/Layout.astro`
- **Content**: Essential styles for initial render

### 6. **CSS-in-JS (React Components)**
- **Purpose**: Dynamic styling for React components
- **Location**: shadcn/ui components in `src/components/ui/`
- **Approach**: Uses CSS variables and Tailwind utilities

## Cascade and Specificity Order

From highest to lowest specificity:

1. **Inline styles** (`style` attribute)
   - Highest specificity
   - Overrides all other styles
   
2. **!important declarations**
   - Should be avoided unless absolutely necessary
   - Found in some utility overrides

3. **Component-scoped styles** (Astro `<style>` blocks)
   - Scoped to component via generated class names
   - Higher specificity than global styles

4. **SCSS component files**
   - Imported through `main.scss`
   - Applied globally but with specific selectors

5. **Tailwind utilities**
   - Applied via class names
   - Can be overridden by more specific selectors

6. **Tailwind @layer components**
   - Custom component classes defined in globals.css
   - Lower specificity than utilities

7. **Tailwind base styles**
   - Reset and normalize styles
   - Lowest specificity

8. **Browser defaults**
   - Only apply if not reset

## Common Conflicts and Solutions

### Issue 1: Pseudo-element styles being overridden
**Problem**: The `::after` content in UnlockSlider wasn't showing because:
- Incorrect asset path (`/arrow-icon.svg` vs `/webtest/arrow-icon.svg`)
- Potential conflicts between component styles and global SCSS

**Solution**: 
- Use correct asset paths based on the `base` configuration in `astro.config.mjs`
- Ensure component styles have sufficient specificity
- Consider using more specific selectors or nesting

### Issue 2: Tailwind utilities overriding component styles
**Problem**: Tailwind's reset or utilities can override custom styles

**Solutions**:
- Use more specific selectors in SCSS
- Apply Tailwind utilities with awareness of existing styles
- Use `!important` sparingly and only when necessary
- Consider using CSS custom properties for dynamic values

### Issue 3: SCSS imports order matters
**Problem**: Later imports override earlier ones

**Solution**: 
- Import order in `main.scss` is deliberate
- Component styles should be imported after base styles
- Use proper nesting and specificity rather than relying on order

## Best Practices

### 1. **Component Styling**
- Prefer component-scoped styles for component-specific styling
- Use BEM or similar naming conventions in SCSS
- Keep styles close to the component they affect

### 2. **Utility Classes**
- Use Tailwind utilities for common patterns
- Don't mix too many styling approaches in one element
- Be consistent within a component

### 3. **Asset Paths**
- Always use the base path prefix (`/webtest/`) for static assets
- Store assets in the `public` directory
- Use relative paths for SCSS imports

### 4. **Performance**
- Critical styles should be inlined
- Non-critical styles can be loaded asynchronously
- Use CSS custom properties for theme values

### 5. **Debugging Style Issues**
1. Check browser DevTools for computed styles
2. Look for conflicting selectors
3. Verify asset paths are correct
4. Check for typos in class names
5. Ensure proper build process

## File Structure

```
src/
├── styles/
│   ├── main.scss          # Main entry point
│   ├── globals.css        # Tailwind and global styles
│   ├── base/
│   │   ├── _variables.scss # SCSS variables
│   │   └── _reset.scss    # Reset styles
│   └── components/
│       ├── _slider.scss   # Slider component styles
│       ├── _screens.scss  # Screen components
│       └── ...           # Other components
├── components/
│   ├── *.astro           # Astro components with scoped styles
│   └── ui/               # React components with Tailwind
└── layouts/
    └── Layout.astro      # Critical CSS and global imports
```

## Configuration Files

- `tailwind.config.js` - Tailwind configuration
- `astro.config.mjs` - Build configuration affecting CSS processing
- `package.json` - Dependencies for styling tools

## Troubleshooting Checklist

When styles aren't working as expected:

- [ ] Check if the selector specificity is sufficient
- [ ] Verify the asset path includes the base path
- [ ] Look for typos in class names or selectors
- [ ] Check if styles are being purged by build tools
- [ ] Ensure the file is properly imported
- [ ] Look for conflicting inline styles
- [ ] Check browser console for 404 errors on assets
- [ ] Verify the build process completed successfully