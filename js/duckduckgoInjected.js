// Hook DuckDuckGo 'Fetch' XMLHttpRequests to catch data & metadata associated with images & videos
// Fetched data is stored in sessionStorage for later use by plug-in: duckduckgo.js
if (document.querySelector('script.HZduckduckgoFetch') == undefined) { // Inject hook script in document if not already there
    var fetchScript = document.createElement('script');
    fetchScript.type = 'text/javascript';
    fetchScript.text = `  
        const {fetch: origFetch} = window;
        window.fetch = async (...args) => {
            const response = await origFetch(...args);
            // work with the cloned response in a separate promise chain -- could use the same chain with await.
            response
                .clone()
                .json()
                .then(body => {
                    const bodyStr = JSON.stringify(body);
                    if (bodyStr.indexOf('results') != -1) {
                        var HZduckduckgoFetch = sessionStorage.getItem('HZduckduckgoFetch') || '[]';
                            HZduckduckgoFetch = JSON.parse(HZduckduckgoFetch);
                            HZduckduckgoFetch.push(body);
                            // update sessionStorage, if no more room then reset
                            try {
                                sessionStorage.setItem('HZduckduckgoFetch', JSON.stringify(HZduckduckgoFetch));
                            } catch {
                                // reset sessionStorage
                                HZduckduckgoFetch = [];
                                HZduckduckgoFetch.push(body);
                                sessionStorage.setItem('HZduckduckgoFetch', JSON.stringify(HZduckduckgoFetch));
                            }
                        }
                    
                })
                .catch(err => console.error('[HoverZoom+] DuckDuckGo fetch hook error:', err))
            ;
            // the original response can be resolved unmodified:
            return response;
        }
    `;
    fetchScript.classList.add('HZduckduckgoFetch');
    (document.head || document.documentElement).appendChild(fetchScript);
};