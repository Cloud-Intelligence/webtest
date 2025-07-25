/**
 * Tab Visibility Manager
 * Handles dynamic title changes with animated banner text when user switches tabs
 */

class TabVisibilityManager {
  constructor() {
    this.originalTitle = document.title;
    this.isHidden = false;
    this.animationInterval = null;
    this.currentMessageIndex = 0;
    this.currentCharIndex = 0;
    this.isAnimating = false;
    
    // Banner messages that will rotate
    this.bannerMessages = [
      '👋 Come back! • Cloud Intelligence awaits • 🚀',
      '⚡ Don\'t miss out! • Enterprise solutions ready • 💼',
      '🔥 Still here! • Your cloud transformation awaits • ⭐',
      '💡 Innovation continues! • Join us for the future • 🌟',
      '🚀 Ready to launch? • Your success story starts here • ✨'
    ];
    
    this.init();
  }
  
  init() {
    // Check if Page Visibility API is supported
    if (typeof document.hidden !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    } else if (typeof document.webkitHidden !== 'undefined') {
      document.addEventListener('webkitvisibilitychange', this.handleVisibilityChange.bind(this));
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', this.cleanup.bind(this));
    window.addEventListener('unload', this.cleanup.bind(this));
  }
  
  handleVisibilityChange() {
    const isHidden = document.hidden || document.webkitHidden;
    
    if (isHidden && !this.isHidden) {
      // Tab became hidden - start animation
      this.isHidden = true;
      this.startBannerAnimation();
    } else if (!isHidden && this.isHidden) {
      // Tab became visible - restore original title
      this.isHidden = false;
      this.stopBannerAnimation();
      this.restoreOriginalTitle();
    }
  }
  
  startBannerAnimation() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.currentMessageIndex = 0;
    this.currentCharIndex = 0;
    
    // Start with first message
    this.animateMessage();
  }
  
  animateMessage() {
    if (!this.isHidden || !this.isAnimating) return;
    
    const currentMessage = this.bannerMessages[this.currentMessageIndex];
    const windowSize = 25;
    
    // Create a sliding window of 25 characters
    let displayText;
    if (currentMessage.length <= windowSize) {
      // If message is shorter than window, show the whole message
      displayText = currentMessage;
    } else {
      // Create sliding window effect
      const startIndex = this.currentCharIndex % (currentMessage.length + windowSize);
      
      if (startIndex <= currentMessage.length - windowSize) {
        // Normal sliding within the message
        displayText = currentMessage.substring(startIndex, startIndex + windowSize);
      } else {
        // Handle wrapping at the end - create seamless loop
        const endChars = currentMessage.substring(startIndex);
        const beginChars = currentMessage.substring(0, windowSize - endChars.length);
        displayText = endChars + ' • ' + beginChars;
      }
    }
    
    document.title = displayText;
    
    this.currentCharIndex++;
    
    // Move to next message after full cycle
    const totalCycles = currentMessage.length + windowSize;
    if (this.currentCharIndex >= totalCycles) {
      setTimeout(() => {
        if (!this.isHidden || !this.isAnimating) return;
        
        // Move to next message
        this.currentMessageIndex = (this.currentMessageIndex + 1) % this.bannerMessages.length;
        this.currentCharIndex = 0;
        
        // Continue animation with next message
        this.animateMessage();
      }, 1000); // Pause for 1 second between messages
    } else {
      // Continue sliding animation
      setTimeout(() => this.animateMessage(), 150); // 150ms per slide step
    }
  }
  
  stopBannerAnimation() {
    this.isAnimating = false;
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  }
  
  restoreOriginalTitle() {
    document.title = this.originalTitle;
  }
  
  cleanup() {
    this.stopBannerAnimation();
    this.restoreOriginalTitle();
  }
  
  // Public method to update the original title if needed
  updateOriginalTitle(newTitle) {
    this.originalTitle = newTitle;
    if (!this.isHidden) {
      document.title = newTitle;
    }
  }
}

// Initialize and export
export function initTabVisibility() {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.tabVisibilityManager = new TabVisibilityManager();
    return window.tabVisibilityManager;
  }
  return null;
}

// Auto-initialize if script is loaded directly
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabVisibility);
  } else {
    initTabVisibility();
  }
}