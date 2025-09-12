// Configure API base URL to use current location
window.TI_CHESS_CONFIG = {
  API_BASE_URL: '',  // Use relative URLs
  WS_BASE_URL: `ws://${window.location.host}`,
  TIMEOUT: 30000,
  DEBUG: true
};

// Log configuration for debugging
console.log('🎯 TI Chess Config:', window.TI_CHESS_CONFIG);
console.log('🌍 Current location:', window.location.href);

// Patch Axios default timeout immediately
if (typeof window !== 'undefined') {
  // Wait for axios to be available and patch it
  const patchAxios = () => {
    if (window.axios) {
      window.axios.defaults.timeout = 30000;
      console.log('Axios timeout patched to 30 seconds');
    } else {
      setTimeout(patchAxios, 100);
    }
  };
  patchAxios();
}

// Override XMLHttpRequest to fix timeout issues and URL problems
if (!window._tiChessXHRPatched) {
  const originalXHRConstructor = window.XMLHttpRequest;
  const originalXHROpen = XMLHttpRequest.prototype.open;
  
  window.XMLHttpRequest = function() {
    const xhr = new originalXHRConstructor();
    const xhrOpen = xhr.open;
    
    xhr.open = function(method, url, async, user, password) {
      // Fix 8001 URLs first
      if (typeof url === 'string' && url.includes('8001')) {
        console.warn('🔧 XHR: Fixing 8001 URL:', url);
        url = url.replace('localhost:8001', window.location.host)
                .replace('127.0.0.1:8001', window.location.host)
                .replace(':8001', `:${window.location.port}`);
        console.log('✅ XHR: Fixed to:', url);
      }
      
      const result = xhrOpen.call(this, method, url, async, user, password);
      
      // Set 30-second timeout for API requests
      if (url && url.includes('/api/')) {
        this.timeout = 30000;
      }
      
      return result;
    };
    
    return xhr;
  };
  
  window._tiChessXHRPatched = true;
}

// Override console.error for better error display (only if not already patched)
if (!window._tiChessConsolePatched) {
  const originalConsoleError = console.error;
  console.error = function(...args) {
    originalConsoleError.apply(console, args);
    
    // Check for specific API errors and provide user-friendly messages
    const errorMessage = args.join(' ');
    if (errorMessage.includes('timeout') || errorMessage.includes('ECONNABORTED')) {
      window.dispatchEvent(new CustomEvent('apiTimeout', {
        detail: { message: 'Server is taking longer than expected. Please wait...' }
      }));
    } else if (errorMessage.includes('ERR_NETWORK') || errorMessage.includes('ERR_CONNECTION_REFUSED')) {
      window.dispatchEvent(new CustomEvent('apiError', {
        detail: { message: 'Unable to connect to server. Please refresh the page.' }
      }));
    }
  };
  window._tiChessConsolePatched = true;
}

console.log('🎯 TI Chess configuration and patches applied successfully');

// Global URL interceptor to catch and fix any 8001 references
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (typeof url === 'string' && url.includes('8001')) {
    console.warn('⚠️ Intercepted 8001 request:', url);
    url = url.replace('localhost:8001', window.location.host)
            .replace('127.0.0.1:8001', window.location.host)
            .replace(':8001', `:${window.location.port}`);
    console.log('🔧 Redirected to:', url);
  }
  return originalFetch.call(this, url, options);
};

// Also patch XMLHttpRequest globally to intercept axios requests
if (!window._tiChessXHRPatched) {
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    if (typeof url === 'string' && url.includes('8001')) {
      console.warn('🔧 XHR: Fixing 8001 URL:', url);
      url = url.replace('localhost:8001', window.location.host)
              .replace('127.0.0.1:8001', window.location.host)
              .replace(':8001', `:${window.location.port}`);
      console.log('✅ XHR: Fixed to:', url);
    }
    return originalXHROpen.call(this, method, url, ...args);
  };
  window._tiChessXHRPatched = true;
}