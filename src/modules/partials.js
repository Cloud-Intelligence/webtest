// Load HTML partials
export async function loadPartials() {
  try {
    // Load unlock screen partial
    const unlockResponse = await fetch('/src/partials/unlock-screen.html');
    const unlockHTML = await unlockResponse.text();
    
    // Load main screen partial
    const mainResponse = await fetch('/src/partials/main-screen.html');
    const mainHTML = await mainResponse.text();
    
    // Inject into body
    document.body.insertAdjacentHTML('beforeend', unlockHTML);
    document.body.insertAdjacentHTML('beforeend', mainHTML);
    
    return true;
  } catch (error) {
    console.error('Error loading partials:', error);
    return false;
  }
}