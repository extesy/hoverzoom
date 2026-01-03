// Hook 'Open' XMLHttpRequests to catch data & metadata associated with pictures
// Hooked data is stored in sessionStorage for later use by plug-in
if (document.querySelector('script.hoverZoomXHROpen') == undefined) { // Inject hook script in document if not already there
    var hookScript = document.createElement('script');
    hookScript.type = 'text/javascript';
    hookScript.text = `if (typeof oldXHROpen !== 'function') { // Hook only once!
        oldXHROpen = window.XMLHttpRequest.prototype.open;
        window.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
            // catch responses
            this.addEventListener('load', function() {
                try {
                    // store response as plain text in a sessionStorage for later usage by plug-in
                    let hoverZoomXHROpenData = sessionStorage.getItem('hoverZoomXHROpenData');
                    if (hoverZoomXHROpenData == undefined) {
                        sessionStorage.setItem('hoverZoomXHROpenData', this.responseText);
                    } else {
                        // update sessionStorage, if no more room then reset
                        try {
                            sessionStorage.setItem('hoverZoomXHROpenData', hoverZoomXHROpenData + this.responseText);
                        } catch {
                            sessionStorage.setItem('hoverZoomXHROpenData', this.responseText);
                        }
                    }
                } catch {}
            });
            // Proceed with original function
            return oldXHROpen.apply(this, arguments);
        }
    }`;
    hookScript.classList.add('hoverZoomXHROpen');
    (document.head || document.documentElement).appendChild(hookScript);
}