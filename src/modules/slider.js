// Slider functionality module
import { performUnlock } from './unlock.js';

export function initializeSlider() {
  // Get elements
  const slider = document.getElementById("slider");
  const sliderText = document.getElementById("sliderText");
  const sliderContainer = document.querySelector(".slider-container");

  // Calculate boundaries (accounting for container padding of 4px on each side and handle position)
  const maxX = sliderContainer.offsetWidth - slider.offsetWidth - 8;

  // Create draggable slider
  let unlocked = false;

  Draggable.create(slider, {
    type: "x",
    bounds: { minX: 0, maxX: maxX },
    onDrag: updateProgress,
    onRelease: checkUnlock,
  });

  function updateProgress() {
    const progress = this.x / maxX;
    sliderText.style.opacity = 1 - progress;

    // Check if reached the end
    if (progress > 0.95 && !unlocked) {
      unlocked = true;
      this.disable();
      performUnlock();
    }
  }

  function checkUnlock() {
    if (!unlocked && this.x < maxX * 0.95) {
      // Snap back if not far enough
      gsap.to(slider, {
        x: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }
}