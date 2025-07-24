# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with hot reload
- `npm run start` - Alias for `npm run dev`
- `npm run build` - Run Astro type checking and build for production
- `npm run preview` - Preview production build locally

### Dependencies
- `npm ci` - Install dependencies (production builds)
- `npm install` - Install dependencies (development)

## Architecture

This is an Astro-based landing page for Cloud Intelligence with a unique unlock screen interaction pattern.

## Philosophy
the goal is to create a highly performant mobile first marketing website for a professional software engineering company.
seo is vital.
fast load is vital.
coverage for all screen sizes is vital.
following of figma designs must be pixel perfect.


### Core Structure
- **Astro Framework**: Static site generator with component-based architecture
- **SCSS Styling**: Modular SCSS with base styles and component-specific styles
- **Unlock Screen Pattern**: Interactive unlock animation before showing main content
- **Component Architecture**: Reusable Astro components for each page section

### Key Components Flow
1. **UnlockScreen**: Initial animated screen with slider interaction
2. **Hero**: Main landing section with gradient background  
3. **About**: Company description section
4. **Testimonials**: Client testimonials section
5. **Contact**: Contact information section

### Styling Architecture
- `src/styles/main.scss` - Main stylesheet entry point
- `src/styles/base/` - Global variables and reset styles
- `src/styles/components/` - Component-specific styles (gradient, clouds, slider, screens, landing)

### Deployment
- Configured for GitHub Pages deployment via `.github/workflows/deploy.yml`
- Site URL: `https://cloud-intelligence.github.io/webtest`
- Uses `/webtest` base path for GitHub Pages subpath

### Animation System
- GSAP library included for advanced animations
- Custom unlock slider interaction using vanilla JavaScript events
- Cloud animations and gradient backgrounds

### Layout System
- Single main layout (`Layout.astro`) with SEO meta tags and structured data
- Conditional navbar display controlled by `showNavbar` prop
- Mobile-responsive design with breakpoints

### Asset Management
- Public assets in `/public/` directory with `/webtest/` path prefix
- Logo and cloud SVG assets for animations
- Google Fonts integration (Inter, Press Start 2P, Roboto)
