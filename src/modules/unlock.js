// Unlock animation module
export function performUnlock() {
  const slider = document.getElementById("slider");
  const sliderContainer = document.querySelector(".slider-container");
  const unlockScreen = document.getElementById("unlockScreen");
  const mainScreen = document.getElementById("mainScreen");
  const logo = document.querySelector(".logo");
  const allClouds = document.querySelectorAll(".cloud");
  const maxX = sliderContainer.offsetWidth - slider.offsetWidth - 8;
  
  const tl = gsap.timeline();

  // Complete slider movement
  tl.to(slider, {
    x: maxX,
    duration: 0.2,
    ease: "power2.out",
  })

    // Kill all existing cloud animations first
    .add(() => {
      gsap.killTweensOf(allClouds);
    })

    // Animate clouds quickly off screen with fade
    .to(allClouds, {
      left: (index, target) => {
        // Send clouds off screen quickly based on their current position
        const currentLeft = parseFloat(gsap.getProperty(target, "left")) || 0;
        if (currentLeft > window.innerWidth / 2) {
          return window.innerWidth + 400; // Exit right
        } else {
          return -400; // Exit left
        }
      },
      bottom: (index) => `+=${100 + (index * 20)}`, // Quick upward movement
      opacity: 0,
      duration: 0.8, // Much faster exit
      ease: "power2.in",
      stagger: 0.05 // Faster stagger
    })

    // Fade out gradient background
    .to(".gradient-bg", {
      opacity: 0,
      duration: 0.6,
      ease: "power2.in",
    }, "-=0.8")

    // Fade out slider
    .to(
      ".slider-container",
      {
        y: 50,
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
      },
      "-=0.6",
    )

    // Transition screens
    .to(unlockScreen, {
      opacity: 0,
      duration: 0.4,
      onComplete: () => {
        unlockScreen.style.display = "none";
        mainScreen.style.visibility = "visible";
      },
    })

    .to(mainScreen, {
      opacity: 1,
      duration: 0.4,
    })

    // Animate logo
    .from(
      logo,
      {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.5)",
      },
      "-=0.2",
    );
}