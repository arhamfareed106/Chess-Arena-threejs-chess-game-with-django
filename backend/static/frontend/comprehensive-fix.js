// Comprehensive Fix for TI Chess - Prevents all variable conflicts
(function() {
  'use strict';
  
  // Prevent multiple execution
  if (window._tiChessComprehensiveFixApplied) {
    return;
  }
  
  console.log('🔧 Applying comprehensive TI Chess fixes...');
  
  // Global configuration
  window.TI_CHESS_CONFIG = window.TI_CHESS_CONFIG || {
    API_BASE_URL: '',
    WS_BASE_URL: `ws://${window.location.host}`,
    TIMEOUT: 30000,
    DEBUG: true
  };
  
  // 1. URL Fixing Function
  function fixUrl(url) {
    if (typeof url === 'string' && url.includes('8001')) {
      const fixed = url.replace('localhost:8001', window.location.host)
                      .replace('127.0.0.1:8001', window.location.host)
                      .replace(':8001', `:${window.location.port}`);
      console.log('🔧 URL Fixed:', url, '→', fixed);
      return fixed;
    }
    return url;
  }
  
  // 2. Fetch Override
  if (!window._tiChessFetchPatched) {
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      return originalFetch.call(this, fixUrl(url), options);
    };
    window._tiChessFetchPatched = true;
  }
  
  // 3. XMLHttpRequest Override
  if (!window._tiChessXHRPatched) {
    const OriginalXHRClass = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
      const xhr = new OriginalXHRClass();
      const originalOpen = xhr.open;
      
      xhr.open = function(method, url, async, user, password) {
        const fixedUrl = fixUrl(url);
        const result = originalOpen.call(this, method, fixedUrl, async, user, password);
        
        // Set 30-second timeout
        if (fixedUrl && (fixedUrl.includes('/api/') || fixedUrl.includes('localhost') || fixedUrl.includes('127.0.0.1'))) {
          this.timeout = 30000;
        }
        
        return result;
      };
      
      return xhr;
    };
    window._tiChessXHRPatched = true;
  }
  
  // 4. Axios Timeout Enforcement
  function enforceAxiosTimeout() {
    if (window.axios) {
      // Set defaults
      if (window.axios.defaults) {
        window.axios.defaults.timeout = 30000;
      }
      
      // Override create method
      if (window.axios.create && !window.axios.create._tiChessPatched) {
        const originalCreate = window.axios.create;
        window.axios.create = function(config = {}) {
          config.timeout = 30000;
          const instance = originalCreate.call(this, config);
          if (instance.defaults) {
            instance.defaults.timeout = 30000;
          }
          return instance;
        };
        window.axios.create._tiChessPatched = true;
      }
      
      // Add request interceptor
      if (window.axios.interceptors && window.axios.interceptors.request) {
        window.axios.interceptors.request.use(
          function (config) {
            config.timeout = 30000;
            config.url = fixUrl(config.url);
            return config;
          },
          function (error) {
            return Promise.reject(error);
          }
        );
      }
      
      return true;
    }
    return false;
  }
  
  // 5. Run Axios enforcement
  if (!enforceAxiosTimeout()) {
    let attempts = 0;
    const maxAttempts = 200;
    const interval = setInterval(() => {
      attempts++;
      if (enforceAxiosTimeout() || attempts >= maxAttempts) {
        clearInterval(interval);
        if (attempts < maxAttempts) {
          console.log('✅ Axios timeout enforcement successful');
        }
      }
    }, 50);
  }
  
  // 6. Array Safety for API responses
  window.ensureArray = function(data) {
    return Array.isArray(data) ? data : [];
  };
  
  // 7. Console error handling
  if (!window._tiChessConsolePatched) {
    const originalConsoleError = console.error;
    console.error = function(...args) {
      originalConsoleError.apply(console, args);
      
      const errorMessage = args.join(' ');
      if (errorMessage.includes('map is not a function')) {
        console.warn('🔧 Array mapping error detected - check data structure');
      } else if (errorMessage.includes('timeout')) {
        console.warn('⏱️ Timeout detected - using 30s timeout');
      }
    };
    window._tiChessConsolePatched = true;
  }
  
  // Mark as applied
  window._tiChessComprehensiveFixApplied = true;
  console.log('✅ Comprehensive TI Chess fixes applied successfully');
})();