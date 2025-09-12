// Comprehensive Axios Timeout Patch for TI Chess
(function() {
  console.log('Applying Axios timeout patch...');
  
  // Function to patch axios when it becomes available
  function patchAxios() {
    if (window.axios) {
      // Override default timeout
      window.axios.defaults.timeout = 30000;
      
      // Override create method to ensure new instances use correct timeout
      const originalCreate = window.axios.create;
      window.axios.create = function(config = {}) {
        config.timeout = config.timeout || 30000;
        return originalCreate.call(this, config);
      };
      
      console.log('✅ Axios timeout patched to 30 seconds');
      return true;
    }
    return false;
  }
  
  // Try to patch immediately
  if (!patchAxios()) {
    // If axios not available yet, wait for it
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds max wait
    
    const intervalId = setInterval(() => {
      attempts++;
      if (patchAxios() || attempts >= maxAttempts) {
        clearInterval(intervalId);
        if (attempts >= maxAttempts) {
          console.warn('Could not find axios to patch timeout');
        }
      }
    }, 100);
  }
  
  // Also patch XMLHttpRequest as a fallback
  const OriginalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    const xhr = new OriginalXHR();
    const originalOpen = xhr.open;
    
    xhr.open = function(method, url, async, user, password) {
      // Fix any 8001 references before making the request
      if (url && url.includes('8001')) {
        console.warn('🔧 Axios Patch: Fixing 8001 URL:', url);
        url = url.replace('localhost:8001', window.location.host)
                .replace('127.0.0.1:8001', window.location.host)
                .replace(':8001', `:${window.location.port}`);
        console.log('✅ Axios Patch: Fixed URL:', url);
      }
      
      const result = originalOpen.call(this, method, url, async, user, password);
      
      // Set longer timeout for API requests
      if (url && (url.includes('/api/') || url.includes('localhost') || url.includes('127.0.0.1'))) {
        this.timeout = 30000;
      }
      
      return result;
    };
    
    return xhr;
  };
  
  console.log('✅ XMLHttpRequest timeout patch applied');
})();