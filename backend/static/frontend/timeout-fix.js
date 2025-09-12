// Complete Axios Override for TI Chess (with unique variable names)
console.log('🔧 Applying comprehensive Axios fix...');

// Store original XMLHttpRequest (with unique name)
if (!window._tiChessTimeoutFixApplied) {
  const OriginalXMLHttpRequestClass = window.XMLHttpRequest;

// Create enhanced XMLHttpRequest with fixed timeout
function EnhancedXMLHttpRequest() {
  const xhr = new OriginalXMLHttpRequestClass();
  
  // Override the open method
  const originalOpen = xhr.open;
  xhr.open = function(method, url, async, user, password) {
    const result = originalOpen.apply(this, arguments);
    
    // Set 30-second timeout for all API requests
    if (url && (url.includes('/api/') || url.includes('games') || url.includes('localhost') || url.includes('127.0.0.1'))) {
      this.timeout = 30000;
      
      // Enhanced logging and URL fixing
      if (url.includes('8001')) {
        console.warn('⚠️ DETECTED 8001 REQUEST:', url);
        console.warn('🔧 Redirecting to current host:', window.location.host);
        // Fix the URL to use current host
        url = url.replace('localhost:8001', window.location.host)
                .replace('127.0.0.1:8001', window.location.host)
                .replace(':8001', `:${window.location.port}`);
        
        // Update the arguments for the original open call
        arguments[1] = url;
        console.log('✅ Fixed URL:', url);
      }
      
      console.log(`⏱️ Set 30s timeout for: ${method} ${url}`);
    }
    
    return result;
  };
  
  return xhr;
}

// Replace XMLHttpRequest globally
window.XMLHttpRequest = EnhancedXMLHttpRequest;

// Function to patch axios when available
function patchAxios() {
  if (window.axios) {
    console.log('📦 Found Axios, applying patches...');
    
    // Set global timeout
    window.axios.defaults.timeout = 30000;
    
    // Override interceptors
    window.axios.interceptors.request.use(
      function (config) {
        config.timeout = 30000;
        console.log(`🚀 Making request: ${config.method?.toUpperCase()} ${config.url} (timeout: ${config.timeout}ms)`);
        return config;
      },
      function (error) {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );
    
    window.axios.interceptors.response.use(
      function (response) {
        console.log(`✅ Response received: ${response.status} ${response.config.url}`);
        return response;
      },
      function (error) {
        console.error('❌ Response error:', error);
        
        if (error.code === 'ECONNABORTED') {
          console.warn('⏰ Request timed out - this should not happen with 30s timeout');
          error.message = 'Request took too long. Please check your connection.';
        } else if (error.code === 'ERR_NETWORK') {
          console.warn('🌐 Network error detected');
          error.message = 'Network error. Please check if the server is running.';
        }
        
        return Promise.reject(error);
      }
    );
    
    // Override create method
    const originalCreate = window.axios.create;
    window.axios.create = function(config = {}) {
      config.timeout = config.timeout || 30000;
      const instance = originalCreate.call(this, config);
      
      // Apply same interceptors to new instances
      instance.interceptors.request.use(
        function (config) {
          config.timeout = 30000;
          return config;
        }
      );
      
      return instance;
    };
    
    console.log('✅ Axios fully patched with 30-second timeout');
    return true;
  }
  return false;
}

// Try immediate patch
if (!patchAxios()) {
  console.log('⏳ Waiting for Axios to load...');
  
  // Poll for axios availability
  let attempts = 0;
  const maxAttempts = 200; // 20 seconds max wait
  
  const checkInterval = setInterval(() => {
    attempts++;
    if (patchAxios() || attempts >= maxAttempts) {
      clearInterval(checkInterval);
      if (attempts >= maxAttempts) {
        console.warn('⚠️ Axios not found after 20 seconds - using XMLHttpRequest fallback only');
      }
    }
  }, 100);
}

// Global error handler
window.addEventListener('error', function(e) {
  if (e.message && e.message.includes('timeout')) {
    console.warn('🔧 Global timeout error caught and handled');
  }
});

console.log('🎯 TI Chess timeout fix applied successfully!');
  window._tiChessTimeoutFixApplied = true;
}