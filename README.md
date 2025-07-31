# Cloud Intelligence Website

Marketing website for Cloud Intelligence built with Astro, React, and Tailwind CSS.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Adding Content

### Pages
Create new `.astro` files in `src/pages/`. Pages support:
- Static Astro components for performance
- React components with `client:load` for interactivity
- Markdown/MDX for blog content

### Content Collections
Add markdown files to `src/content/` directories:

#### Blog Posts (`src/content/blog/`)
```markdown
---
title: "Your Blog Title"
description: "Brief description"
pubDate: 2024-01-20
author: "Author Name"
tags: ["cloud", "security"]
heroImage: "/path/to/image.jpg"
---

Your blog content here...
```

#### Case Studies (`src/content/caseStudies/`)
```markdown
---
title: "Case Study Title"
description: "Brief overview"
pubDate: 2024-01-20
client: "Client Name"
industry: "Technology"
challenge: "The challenge faced"
solution: "How we solved it"
results: ["Result 1", "Result 2"]
technologies: ["React", "AWS"]
---

Case study content...
```

#### Live Demos (`src/content/liveDemos/`)
```markdown
---
title: "Demo Title"
description: "What this demo shows"
pubDate: 2024-01-20
category: "AI/ML"
complexity: "Intermediate"
duration: "5 minutes"
features: ["Feature 1", "Feature 2"]
demoUrl: "https://demo.example.com"
videoUrl: "https://video.example.com"
screenshot: "/path/to/screenshot.jpg"
interactive: true
---

Demo description...
```

### Components
- **Astro Components**: `src/components/*.astro` - For static content
- **React Components**: `src/components/*.tsx` - For interactive features
- **UI Components**: `src/components/ui/` - shadcn/ui component library

### Styling
- Use Tailwind utilities for quick styling
- Custom styles in `src/styles/components/`
- Brand colors: `#3366FF` (primary), `#2952CC` (secondary)

## Feature Flags

Control features via `feature-flags.json`:

```json
{
  "CHAT_WIDGET": false,
  "BETA_FEATURES": true
}
```

Or use environment variables:
```bash
FEATURE_CHAT_WIDGET=false npm run build
```

## Project Structure

```
src/
├── pages/          # Routes and pages
├── components/     # Reusable components
├── layouts/        # Page layouts
├── styles/         # SCSS and CSS files
└── config/         # Configuration files
```

## Key Features
- **Unlock Screen**: Interactive slider animation
- **Responsive Design**: Mobile-first approach
- **SEO Optimized**: Built-in meta tags and structured data
- **Performance**: Static generation with selective hydration
- **Animations**: GSAP for smooth transitions

## Deployment
Configured for GitHub Pages at `/webtest` path. Commits to main branch auto-deploy via GitHub Actions.
