(function(window, document) {
    // Configuration
    const CONFIG = {
        apiEndpoint: 'http://localhost:3000/collect',
        clickAttribute: 'data-track-click'
    };

    // Helper to get ISO timestamp
    const getTimestamp = () => new Date().toISOString();

    // Send event payload to Ingestion API
    const sendEvent = (eventData) => {
        const payload = JSON.stringify(eventData);

        if (navigator.sendBeacon) {
            // Use Blob to ensure application/json content-type is sent
            const blob = new Blob([payload], { type: 'application/json' });
            navigator.sendBeacon(CONFIG.apiEndpoint, blob);
        } else {
            fetch(CONFIG.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
                keepalive: true
            }).catch(console.error);
        }
    };

    // Auto-track Pageview
    const trackPageview = () => {
        const payload = {
            event_type: 'pageview',
            url: window.location.href,
            timestamp: getTimestamp(),
            user_agent: navigator.userAgent,
            element_metadata: ''
        };
        sendEvent(payload);
        console.log('[PulseAnalytics] Pageview tracked', payload);
    };

    // Track clicks on configured elements
    const setupClickTracking = () => {
        document.addEventListener('click', (e) => {
            const target = e.target.closest(`[${CONFIG.clickAttribute}]`);
            if (target) {
                // If it's a valid JSON string, pass it, otherwise build a simple metadata JSON
                let metadata = target.getAttribute(CONFIG.clickAttribute);
                if (!metadata) {
                    metadata = JSON.stringify({ id: target.id, class: target.className });
                }
                
                const payload = {
                    event_type: 'click',
                    url: window.location.href,
                    timestamp: getTimestamp(),
                    user_agent: navigator.userAgent,
                    element_metadata: metadata
                };
                sendEvent(payload);
                console.log('[PulseAnalytics] Click tracked', payload);
            }
        });
    };

    // Initialize Tracker
    const init = () => {
        trackPageview();
        setupClickTracking();
    };

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window, document);
