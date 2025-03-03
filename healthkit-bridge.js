(function() {
  // Check if running in WKWebView
  if (!window.webkit || !window.webkit.messageHandlers) {
    return;
  }

  // Create custom events for HealthKit responses
  const createCustomEvent = (name, detail) => {
    return new CustomEvent(name, {
      detail,
      bubbles: true,
      cancelable: true
    });
  };

  // Handle messages from native iOS code
  window.handleHealthKitResponse = function(response) {
    const { type, data } = JSON.parse(response);
    
    switch (type) {
      case 'authorization':
        window.dispatchEvent(
          createCustomEvent('healthkit-auth-response', {
            authorized: data.authorized
          })
        );
        break;
        
      case 'workout-saved':
        window.dispatchEvent(
          createCustomEvent('healthkit-save-response', {
            success: data.success
          })
        );
        break;
        
      case 'workouts':
        window.dispatchEvent(
          createCustomEvent('healthkit-workouts-response', {
            workouts: data.workouts
          })
        );
        break;
        
      default:
        console.warn('Unknown HealthKit response type:', type);
    }
  };
})();
