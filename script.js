// Initialize GSAP
gsap.registerPlugin(Draggable);

// Get elements
const slider = document.getElementById("slider");
const sliderText = document.getElementById("sliderText");
const sliderContainer = document.querySelector(".slider-container");
const unlockScreen = document.getElementById("unlockScreen");
const mainScreen = document.getElementById("mainScreen");
const logo = document.querySelector(".logo");
const gradientBg = document.querySelector(".gradient-bg");
const allClouds = document.querySelectorAll(".cloud");

// Calculate boundaries
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

function performUnlock() {
  const tl = gsap.timeline();

  // Complete slider movement
  tl.to(slider, {
    x: maxX,
    duration: 0.2,
    ease: "power2.out",
  })

    // Animate clouds back offscreen (to where they came from)
    .to(allClouds, {
      left: (index, target) => {
        // Return clouds to their original offscreen positions based on class
        const className = target.className;
        if (className.includes('cloud-right')) {
          return window.innerWidth + 300; // Exit right (further for larger scale)
        } else {
          return -500; // Exit left (further for larger scale)
        }
      },
      bottom: (index) => `+=${50 + (index * 10)}`, // Slight upward drift as they exit
      rotation: (index) => (index % 2 === 0) ? 8 : -8,
      opacity: 0,
      duration: 2,
      ease: "power2.in",
      stagger: 0.15
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

// Slider handle is now static (no floating animation)

// Smooth infinite gradient animation using GSAP
function animateGradient() {
  // Create properties to animate
  const gradientProps = {
    angle: 0,
    positionX: 0,
    positionY: 50,
    size: 300,
    gradientType: 0 // 0 = linear, 1 = radial
  };
  
  // Function to update gradient based on current properties
  function updateGradient() {
    const colors = 'deepskyblue 0%, skyblue 15%, white 25%, lightblue 35%, blue 50%, white 65%, #87ceeb 75%, #1d71d4 85%, white 100%';
    
    // Interpolate between linear and radial gradient
    if (gradientProps.gradientType <= 0.5) {
      // More linear gradient
      const mixRatio = gradientProps.gradientType * 2; // 0 to 1
      gradientBg.style.backgroundImage = `linear-gradient(${gradientProps.angle}deg, ${colors})`;
    } else {
      // More radial gradient
      const mixRatio = (gradientProps.gradientType - 0.5) * 2; // 0 to 1
      gradientBg.style.backgroundImage = `radial-gradient(ellipse at ${gradientProps.positionX}% ${gradientProps.positionY}%, ${colors})`;
    }
    
    gradientBg.style.backgroundPosition = `${gradientProps.positionX}% ${gradientProps.positionY}%`;
    gradientBg.style.backgroundSize = `${gradientProps.size}% ${gradientProps.size}%`;
  }
  
  // Create smooth infinite timeline
  const tl = gsap.timeline({ repeat: -1, ease: "none" });
  
  // Start with linear gradient, transition to radial
  tl.to(gradientProps, {
    duration: 45,
    angle: 180,
    positionX: 50,
    positionY: 25,
    size: 400,
    gradientType: 0.8, // Transition to radial
    ease: "sine.inOut",
    onUpdate: updateGradient
  })
  // Stay radial, move center around
  .to(gradientProps, {
    duration: 45,
    angle: 270,
    positionX: 75,
    positionY: 75,
    size: 350,
    gradientType: 1,
    ease: "sine.inOut",
    onUpdate: updateGradient
  })
  // Move radial center to different position
  .to(gradientProps, {
    duration: 45,
    angle: 360,
    positionX: 25,
    positionY: 50,
    size: 500,
    gradientType: 0.9,
    ease: "sine.inOut",
    onUpdate: updateGradient
  })
  // Transition back to linear
  .to(gradientProps, {
    duration: 45,
    angle: 540,
    positionX: 0,
    positionY: 50,
    size: 300,
    gradientType: 0.2,
    ease: "sine.inOut",
    onUpdate: updateGradient
  })
  // Complete cycle back to linear
  .to(gradientProps, {
    duration: 45,
    angle: 720,
    positionX: 0,
    positionY: 50,
    size: 300,
    gradientType: 0,
    ease: "sine.inOut",
    onUpdate: updateGradient
  });
}

// Cloud animations using GSAP
function animateClouds() {
  // Get screen dimensions for random movement
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // Generate random positions within screen bounds (constrained to bottom 50%)
  function getRandomPosition() {
    return {
      x: Math.random() * screenWidth, // Full width for left positioning
      y: Math.random() * (screenHeight * 0.5) // Bottom 50% of screen only
    };
  }

  // Animate each cloud - start all at the same time
  allClouds.forEach((cloud, index) => {
    // Move to initial random position immediately
    moveCloudToPoint(cloud, getRandomPosition());
    
    // Add continuous scale animation between 1 and 5
    gsap.to(cloud, {
      scale: 1 + Math.random() * 4, // Random scale between 1-5
      duration: 20 + Math.random() * 15, // 20-35 seconds duration
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: Math.random() * 5 // Random start delay 0-5 seconds
    });
  });
  
  // Function to move a cloud to a specific point, then pick a new random point
  function moveCloudToPoint(cloud, targetPoint) {
    gsap.to(cloud, {
      left: targetPoint.x,
      bottom: targetPoint.y,
      opacity: 0.7 + Math.random() * 0.3,
      rotation: (Math.random() - 0.5) * 2,
      duration: 25 + Math.random() * 15, // Much slower: 25-40 seconds to reach point
      ease: "none", // Linear movement for very slow, steady drift
      onComplete: () => {
        // Once reached, pick a new random point and continue
        const nextPoint = getRandomPosition();
        moveCloudToPoint(cloud, nextPoint);
      }
    });
  }
  
  // Click handler - redirect random cloud to click position
  document.addEventListener('click', (e) => {
    // Pick a random cloud
    const randomCloud = allClouds[Math.floor(Math.random() * allClouds.length)];
    
    // Get click position (convert to bottom positioning)
    const clickPoint = {
      x: e.clientX, // Use click X directly for left positioning
      y: screenHeight - e.clientY // Convert to bottom positioning (flip Y coordinate)
    };
    
    // Make sure click position is within bounds (constrained to bottom 50%)
    clickPoint.x = Math.max(0, Math.min(clickPoint.x, screenWidth));
    clickPoint.y = Math.max(0, Math.min(clickPoint.y, screenHeight * 0.5));
    
    // Redirect the cloud to click position (this will interrupt current movement)
    moveCloudToPoint(randomCloud, clickPoint);
  });
}

// Start animations
animateGradient();
animateClouds();