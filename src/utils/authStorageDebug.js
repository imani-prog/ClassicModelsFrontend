// Debug utility to help with authentication testing
// Open browser console and run these commands

// 1. Check what's currently stored
function checkAuthStorage() {
  console.log('🔍 Current Auth Storage:');
  console.log('Token:', localStorage.getItem('authToken'));
  console.log('UserData:', localStorage.getItem('userData'));
  
  // Check if token looks like JWT
  const token = localStorage.getItem('authToken');
  if (token) {
    console.log('Token parts:', token.split('.').length);
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);
      console.log('Token expires:', new Date(payload.exp * 1000));
      console.log('Current time:', new Date());
      console.log('Is expired:', payload.exp < Date.now() / 1000);
    } catch (e) {
      console.log('Token is not a valid JWT:', e.message);
    }
  }
}

// 2. Clear all auth data
function clearAuthStorage() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  console.log('✅ Auth storage cleared. Refresh page to see login screen.');
}

// 3. Set fake data for testing
function setFakeAuthData() {
  localStorage.setItem('authToken', 'fake.token.here');
  localStorage.setItem('userData', JSON.stringify({email: 'test@test.com', name: 'Test User'}));
  console.log('⚠️ Fake auth data set. Refresh page to test validation.');
}

// Make functions available globally for console use
window.checkAuthStorage = checkAuthStorage;
window.clearAuthStorage = clearAuthStorage;
window.setFakeAuthData = setFakeAuthData;

console.log('🛠️ Auth debug functions loaded:');
console.log('- checkAuthStorage() - See what\'s stored');
console.log('- clearAuthStorage() - Clear all auth data');
console.log('- setFakeAuthData() - Set fake data for testing');
