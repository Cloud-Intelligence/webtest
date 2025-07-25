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

This is an Astro-based website for Cloud Intelligence with a unique unlock screen interaction pattern, built for scalability across multiple pages and blog functionality.

## Philosophy
the goal is to create a highly performant mobile first marketing website for a professional software engineering company.
seo is vital.
fast load is vital.
coverage for all screen sizes is vital.
following of figma designs must be pixel perfect.


### Core Structure
- **Astro Framework**: Static site generator with component-based architecture
- **React Integration**: @astrojs/react for interactive components and UI library support
- **Tailwind CSS + SCSS**: Hybrid styling approach using Tailwind for utilities and SCSS for custom components
- **shadcn/ui Integration**: Modern React component library for consistent, accessible UI components
- **Unlock Screen Pattern**: Interactive unlock animation before showing main content
- **Component Architecture**: Hybrid of Astro components for static content and React components for interactive elements

### Key Components Flow
1. **UnlockScreen**: Initial animated screen with slider interaction
2. **Hero**: Main landing section with gradient background  
3. **About**: Company description section
4. **Testimonials**: Client testimonials section
5. **ContactSection**: Enhanced contact section with shadcn/ui form components

### Styling Architecture
- `src/styles/main.scss` - Main stylesheet entry point
- `src/styles/globals.css` - Tailwind CSS imports and shadcn/ui design system variables
- `src/styles/base/` - Global variables and reset styles
- `src/styles/components/` - Component-specific styles (gradient, clouds, slider, screens, landing)
- `tailwind.config.js` - Tailwind configuration with custom brand colors and shadcn/ui integration
- **Component Libraries**: 
  - `src/components/ui/` - shadcn/ui React components (Button, Card, Input, etc.)
  - `src/lib/utils.ts` - Utility functions for component styling (cn() helper)

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
- Optimized images using `astro:assets` with WebP format
- Logo and cloud SVG assets for animations
- Google Fonts integration (Inter, Manrope, Press Start 2P)

### UI Component System
- **shadcn/ui Components**: Modern, accessible React components built on Radix UI primitives
- **Brand Integration**: Custom theme with brand colors (#3366FF primary, #2952CC secondary)
- **Hybrid Approach**: Combines custom branded elements with standardized UI components
- **Form Components**: Enhanced contact forms with validation and accessibility
- **Scalable Architecture**: Ready for blog pages, multi-page expansion, and complex interactions

### Key Dependencies
- **Framework**: Astro 5 with React integration
- **Styling**: Tailwind CSS 3.4+ with shadcn/ui design system
- **Components**: shadcn/ui (Button, Card, Input, Textarea, Label)
- **Animations**: GSAP for custom animations and transitions
- **Build Optimization**: astro-compressor, @playform/compress for production builds
- **Utilities**: clsx, tailwind-merge, class-variance-authority
