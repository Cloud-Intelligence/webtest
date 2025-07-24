// Cloud animation module
export function animateClouds() {
  const allClouds = document.querySelectorAll(".cloud");
  
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