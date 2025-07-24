# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Essential commands for this project:**
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Dependencies:** The project uses Vite + Sass as dev dependencies, with GSAP loaded from CDN.

## Architecture Overview

This is a **Cloud Intelligence unlock screen application** built with a **modular ES6 + Vite + SCSS architecture**. The app displays an animated unlock screen that transitions to a main screen when the slider is dragged to completion.

### Core Application Flow
1. **Initialization:** HTML partials are dynamically loaded via fetch API
2. **Animation Systems:** GSAP-powered gradient, cloud, and slider animations start
3. **User Interaction:** Draggable slider with 95% completion threshold
4. **Unlock Sequence:** Coordinated timeline animation transitions screens

### Modular JavaScript Architecture

**Entry Point:** `src/main.js` - Coordinates all module loading and initialization

**Key Modules:**
- `modules/partials.js` - Loads HTML fragments from `src/partials/` directory
- `modules/slider.js` - GSAP Draggable slider with completion logic
- `modules/clouds.js` - Complex 9-cloud animation system with click interactions
- `modules/gradient.js` - Morphing gradient background (225s cycle, 9 colors)
- `modules/unlock.js` - Screen transition timeline orchestration

**HTML Partials System:** The app dynamically loads `unlock-screen.html` and `main-screen.html` from `src/partials/` using fetch API, avoiding the need for a framework while maintaining modularity.

### SCSS Organization

**Structure:** `src/styles/main.scss` imports from organized `base/` and `components/` directories

**Key Features:**
- Variable-driven design (`base/_variables.scss`)
- Component-based styling (screens, slider, clouds, gradient)
- Pixel-art aesthetic with Press Start 2P font
- Responsive design with modern CSS (clamp, inset)

### Animation Systems

**GSAP Integration:** All animations use GSAP with CDN loading. Key systems:
- **Cloud System:** 9 SVG clouds with scale animations (1-5x), randomized movement, click-to-redirect
- **Gradient Animation:** Smooth transitions between linear/radial gradients over 225s
- **Slider Animation:** Draggable with visual feedback, snap-back if incomplete
- **Unlock Timeline:** Coordinated sequence of cloud exits and screen transitions

**Critical Detail:** Clouds are constrained to bottom 50% of screen and use point-to-point movement logic.

### File Organization Notes

- **Static Assets:** Cloud SVGs and logo.png in `/public/`
- **Modular CSS:** Each component has its own SCSS file
- **ES6 Modules:** Clean separation of concerns across animation systems
- **HTML Partials:** Separate unlock and main screen templates

The codebase prioritizes modularity and maintainability while delivering sophisticated animations and interactions.