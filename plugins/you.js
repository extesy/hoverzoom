var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'You',
    version:'1.1',
    prepareImgLinks:function (callback) {

        var res = [];

        var initData = null;
        var hzFetchData = sessionStorage.getItem('HZFetchData');
        var hzOpenData = sessionStorage.getItem('HZOpenData');
        var hzSendData = sessionStorage.getItem('HZSendData');

        // Hook 'Fetch' requests and 'Open' & 'Send' XMLHttpRequests to catch data & metadata associated with pictures or videos displayed
        // These client/server requests are issued when user scrolls down to retrieve more data
        // Catched data is stored in sessionStorage for later use by plug-in

        // Fetch
        // https://stackoverflow.com/questions/45425169/intercept-fetch-api-requests-and-responses-in-javascript
        if ($('script.hoverZoomFetch').length == 0) { // Inject hook script in document if not already there
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
                            let data = JSON.stringify(body);
                            if (data.indexOf("searchResults") != -1) {
                                // store response in sessionStorage for later use by plug-in
                                sessionStorage.setItem('HZFetchData', data);
                                triggerHZ();
                            }
                        })
                        .catch(err => console.error(err))
                    ;
                    // the original response can be resolved unmodified:
                    return response;
                }
            `;
            fetchScript.classList.add('hoverZoomFetch');
            (document.head || document.documentElement).appendChild(fetchScript);
        };

        // Open
        if ($('script.hoverZoomOpen').length == 0) { // Inject hook script in document if not already there
            var openScript = document.createElement('script');
            openScript.type = 'text/javascript';
            openScript.text = `if (typeof origXHROpen !== 'function') { // Hook only once!
                origXHROpen = window.XMLHttpRequest.prototype.open;
                window.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
                    // catch responses
                    this.addEventListener('load', function() {
                        try {
                            let data = this.responseText;
                            if (data.indexOf("search_results") != -1) {
                                // store response in sessionStorage for later use by plug-in
                                sessionStorage.setItem('HZOpenData', data);
                                triggerHZ();
                            }
                        } catch {}
                    });
                    // Proceed with original function
                    return origXHROpen.apply(this, arguments);
                }
            }`;
            openScript.classList.add('hoverZoomOpen');
            (document.head || document.documentElement).appendChild(openScript);
        }

        // Send
        if ($('script.hoverZoomSend').length == 0) { // Inject hook script in document if not already there
            var sendScript = document.createElement('script');
            sendScript.type = 'text/javascript';
            sendScript.text = `if (typeof origXHRSend !== 'function') { // Hook only once!
                origXHRSend = window.XMLHttpRequest.prototype.send;
                window.XMLHttpRequest.prototype.send = function(data) {
                    try {
                        if (data.indexOf("search_results") != -1) {
                            // store response in sessionStorage for later use by plug-in
                            sessionStorage.setItem('HZSendData', data);
                            triggerHZ();
                        }
                    } catch {}
                    // Proceed with original function
                    return origXHRSend.apply(this, arguments);
                }
            }`;
            sendScript.classList.add('hoverZoomSend');
            (document.head || document.documentElement).appendChild(sendScript);
        }

        // Add & remove empty <a> element to/from DOM to trigger HoverZoom, so data stored in sessionstorage can be used
        if ($('script.hoverZoomTrigger').length == 0) { // Inject hook script in document if not already there
            var triggerScript = document.createElement('script');
            triggerScript.type = 'text/javascript';
            triggerScript.text = `
                function triggerHZ() {
                    let fakeA = document.createElement('a');
                    (document.head || document.documentElement).appendChild(fakeA);
                    (document.head || document.documentElement).removeChild(fakeA);
                }
            `;
            triggerScript.classList.add('hoverZoomTrigger');
            (document.head || document.documentElement).appendChild(triggerScript);
        }

        function cleanUrl(url) {
            if (url != undefined) {
                url = url.replace(/\\\\/g, '\\');
                url = url.replace(/\\[uU]00/g, '%');
                try {
                    url = decodeURIComponent(decodeURIComponent(url));
                } catch {}
            }
            return url;
        }

        $('img[src]').each(function() {

            const link = $(this);
            let src = this.src;
            src = decodeURIComponent(src);
            // sample: https://you.com/proxy?url=https://tse3.mm.bing.net/th?id=OIP.IagGmkSmwDtu7hQxAIoF4wHaJQ&pid=Api
            src = src.replace(/^.*url=/, '');

            if (hzSendData && hzSendData.indexOf(src) != -1) {
                try {
                    const sendData = JSON.parse(hzSendData);
                    let search_results = sendData.eventData.search_results;
                    search_results = JSON.parse(search_results);
                    let result = search_results.results.find(r => r.thumbnailUrl == src);
                    if (result) {
                        link.data().hoverZoomSrc = [result.url];
                        res.push(link);
                    }
                } catch {}
            }

            if (hzFetchData && hzFetchData.indexOf(src) != -1) {
                try {
                    const fetchData = JSON.parse(hzFetchData);
                    const result = fetchData.searchResults.results.find(r => r.thumbnailUrl == src);
                    if (result) {
                        link.data().hoverZoomSrc = [result.url];
                        res.push(link);
                    }
                } catch {}
            }
        });

        callback($(res), this.name);
    }
});
