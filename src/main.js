// Main entry point - imports and initializes all modules
import './styles/main.scss';
import { loadPartials } from './modules/partials.js';
import { animateGradient } from './modules/gradient.js';
import { animateClouds } from './modules/clouds.js';
import { initializeSlider } from './modules/slider.js';

// Initialize GSAP
gsap.registerPlugin(Draggable);

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
  // Load HTML partials first
  const partialsLoaded = await loadPartials();
  
  if (partialsLoaded) {
    // Start gradient animation
    animateGradient();
    
    // Start cloud animations
    animateClouds();
    
    // Initialize slider
    initializeSlider();
  }
});