// Gradient animation module
export function animateGradient() {
  const gradientBg = document.querySelector(".gradient-bg");
  
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
      gradientBg.style.backgroundImage = `linear-gradient(${gradientProps.angle}deg, ${colors})`;
    } else {
      // More radial gradient
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