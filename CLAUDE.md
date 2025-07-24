# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a simple static website project for "Cloud Intelligence" featuring an interactive unlock screen with pixel-art styling. The project consists of a single HTML file with embedded CSS and JavaScript.

## Architecture

**Single-file structure**: The entire application is contained in `index.html` with:
- Embedded CSS using Google Fonts (Press Start 2P) for retro pixel styling
- GSAP animation library loaded from CDN for smooth animations and draggable interactions
- Vanilla JavaScript for unlock screen functionality

**Key Components**:
- **Unlock Screen**: Interactive slider-to-unlock interface with animated pixel clouds and gradient background
- **Main Screen**: Simple logo display after successful unlock
- **Animation System**: GSAP-powered transitions, dragging, and floating animations

## Development

Since this is a static HTML file, development is straightforward:

**Local Development**: Open `index.html` directly in a web browser or serve it with any static file server.

**No Build Process**: This project has no package.json, build scripts, or dependencies beyond the CDN-loaded GSAP library.

## Code Structure

**Styling**: 
- Uses CSS custom properties and flexbox for responsive design
- Pixel-art aesthetic with retro 8-bit styling
- Mobile-responsive with media queries

**JavaScript Logic**:
- GSAP Draggable plugin for slider interaction
- Timeline-based animations for screen transitions
- Progress-based unlock mechanism (95% slide threshold)

## Key Features

- Interactive unlock slider with visual feedback
- Animated pixel clouds with CSS keyframe animations
- Smooth screen transitions using GSAP timelines
- Mobile-responsive design
- Retro gaming aesthetic