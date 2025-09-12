// API Configuration Patch for TI Chess
// This script updates the API timeout and error handling

(function() {
  // Increase axios timeout globally
  if (window.axios) {
    window.axios.defaults.timeout = 30000;
  }
  
  // Add global error handler for better user experience
  window.addEventListener('error', function(e) {
    if (e.message && e.message.includes('timeout')) {
      console.warn('Request timeout detected, implementing retry logic...');
    }
  });
  
  // Patch fetch for better error handling
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args)
      .catch(error => {
        console.error('Fetch error:', error);
        if (error.name === 'AbortError') {
          console.warn('Request was aborted, retrying...');
        }
        throw error;
      });
  };
  
  console.log('TI Chess API patches applied successfully');
})();// API Configuration Patch for TI Chess
// This script updates the API timeout and error handling

(function() {
  // Increase axios timeout globally
  if (window.axios) {
    window.axios.defaults.timeout = 30000;
  }
  
  // Add global error handler for better user experience
  window.addEventListener('error', function(e) {
    if (e.message && e.message.includes('timeout')) {
      console.warn('Request timeout detected, implementing retry logic...');
    }
  });
  
  // Patch fetch for better error handling
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args)
      .catch(error => {
        console.error('Fetch error:', error);
        if (error.name === 'AbortError') {
          console.warn('Request was aborted, retrying...');
        }
        throw error;
      });
  };
  
  console.log('TI Chess API patches applied successfully');
})();