var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Qwant',
    version:'1.0',
    prepareImgLinks:function (callback) {
        var res = [];
        var initData = null;
        var initDataJson = {};
        var fetchedData = null;
        var fetchedDataJson = {};

        // Hook Qwant fetch requests to catch data & metadata associated with pictures displayed
        // These requests are issued by client side to Qwant servers in order to obtain new data when user scrolls down
        // Hooked data is stored in sessionStorage
        if ($('script.hoverZoomFetch').length == 0) { // Inject hook script in document if not already there

            var fetchScript = document.createElement('script');
            fetchScript.type = 'text/javascript';
            fetchScript.text = `if (typeof oldFetch !== 'function') { // Hook only once!
                oldFetch = window.fetch;
                window.fetch = function(resource, init) {

                    oldFetch(resource)
                    .then(response => response.json())
                    .then(fetched => {
                        // check if data received is usefull
                        if (fetched && fetched.data && fetched.data.result && fetched.data.result.items) {
                            // store items in sessionStorage for later usage by plug-in
                            try {
                                sessionStorage.setItem('fetchedData', JSON.stringify(fetched.data.result.items));
                                // Add & remove empty <a> element to/from DOM to trigger HoverZoom,
                                // so data & metadata just added to DOM in <script> element can be exploited
                                let fakeA = document.createElement('a');
                                (document.head || document.documentElement).appendChild(fakeA);
                                (document.head || document.documentElement).removeChild(fakeA);
                            } catch {}
                        }
                    });

                    // Proceed with native fetch function
                    return oldFetch.apply(this, arguments);
                }
            }`;
            fetchScript.classList.add('hoverZoomFetch');
            (document.head || document.documentElement).appendChild(fetchScript);
        }

        // Find value(s) in JSON object and return corresponding key(s) and path(s)
        // If value not found then return []
        // ref: https://gist.github.com/killants/569c4af5f2983e340512916e15a48ac0
        function getValuesInObject(jsonObj, searchValue, isRegex, maxDeepLevel, currDeepLevel) {

            var bShowInfo = false;

            maxDeepLevel = ( maxDeepLevel || maxDeepLevel == 0 ) ? maxDeepLevel : 100;
            currDeepLevel = currDeepLevel ? currDeepLevel : 1 ;
            isRegex = isRegex ? isRegex : false;

            // check RegEx validity if needed
            var re;
            if (isRegex) {
                try {
                    re = new RegExp(searchValue);
                } catch (e) {
                    cLog(e);
                    return [];
                }
            }

            if( currDeepLevel > maxDeepLevel ) {
                return [];
            } else {

                var keys = [];

                for(var curr in jsonObj) {
                    var currElem = jsonObj[curr];

                    if( currDeepLevel == 1 && bShowInfo ) { cLog("getValuesInObject : Looking property \"" + curr + "\" ") }

                    if( typeof currElem == "object" ) { // object is "object" and "array" is also in the eyes of "typeof"
                        // search again :D
                        var deepKeys = getValuesInObject( currElem, searchValue, isRegex, maxDeepLevel, currDeepLevel + 1 );
                        for(var e = 0 ; e < deepKeys.length; e++) {
                            // update path backwards
                            deepKeys[e].path = '["' + curr + '"]' + deepKeys[e].path;
                            keys.push( deepKeys[e] );
                        }
                    } else {

                        if( isRegex ? re.test(currElem) : currElem === searchValue ){

                            var r = {};
                            r.key = curr;
                            r.value = currElem;
                            r.path = '["' + curr + '"]';
                            r.depth = currDeepLevel;
                            keys.push( r );
                        }
                    }
                }
                return keys;
            }
        }

        // Return JSON object corresponding to path, without using the Evil eval
        // path syntax: [key1][key2][key3]...
        function getObjectFromPath(objJson, path) {
            return new Function('return ' + JSON.stringify(objJson) + path)();
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

        // Search fetched data
        // Return object with _id = id or null if not found
        function searchFetchedData(id) {

            if (fetchedData == null) {
                fetchedData = sessionStorage.getItem('fetchedData');
                sessionStorage.removeItem('fetchedData');
                try {
                    fetchedDataJson = JSON.parse(fetchedData);
                } catch {}
            }
            if (fetchedDataJson) {
                let values = getValuesInObject(fetchedDataJson, id); // look for an exact match
                if (values.length == 0) return null;

                let o = getObjectFromPath(fetchedDataJson, values[0].path.substring(0, values[0].path.lastIndexOf('[')));
                return o;
            }
            return null;
        }

        // Search init data
        // first 50 search results are stored in INITIAL_PROPS varaiable
        // next search results are fetched from server
        // Return object with _id = id or null if not found
        function searchInitData(id) {

            if (initData == null) {
                let scripts = Array.from(document.scripts);
                let initScript = scripts.filter(script => /INITIAL_PROPS/.test(script.text));
                if (initScript.length != 1) return null;
                let initText = initScript[0].text;
                initData = initText.substring(initText.indexOf('{'), initText.lastIndexOf('}') + 1);
                try {
                    initDataJson = JSON.parse(initData);
                } catch {}
            }
            if (initDataJson) {
                let values = getValuesInObject(initDataJson, id); // look for an exact match
                if (values.length == 0) return null;

                let o = getObjectFromPath(initDataJson, values[0].path.substring(0, values[0].path.lastIndexOf('[')));
                return o;
            }
            return null;
        }

        // Extract infos (url, href, caption) from object found in JSON data
        function extractInfos(o, link) {
            if (o.media) {
                let fullsrc = o.media;
                if (link.data().hoverZoomSrc == undefined) link.data().hoverZoomSrc = [fullsrc];
                else if (link.data().hoverZoomSrc.indexOf(fullsrc) == -1) link.data().hoverZoomSrc.unshift(fullsrc);
            }
            if (o.url) {
                link.data().href = o.url;
            }
            if (o.title) {
                link.data().hoverZoomCaption = o.title;
            }
            res.push(link);
        }

        // Loop through thumbnails and when possible add hrefs = images urls found in init data or fetched data
        // sample: https://www.qwant.com/?l=fr&sr=fr&r=FR&q=giana&t=images&o=0%3AA8371EC4EF8CE14580DCD7008C574F993E1C72C9
        //  => id: A8371EC4EF8CE14580DCD7008C574F993E1C72C9
        $('a[href*="%3A"]').each(function() {
            let _this = $(this);
            if (_this.hasClass('hoverZoomLink') || _this.hasClass('hoverZoomLinkFromPlugIn')) return;

            let re = /&o=\d+%3A(.*)/i
            let m = this.href.match(re);
            if (!m) return;
            let id = m[1];
            let hrefPage = undefined;
            let url = undefined;
            let imageLink = undefined;

            // search for id in init data
            let o = searchInitData(id);
            if (o) {
                extractInfos(o, _this);
            } else {
                // search for id in fetched data
                o = searchFetchedData(id);
                if (o) {
                    extractInfos(o, _this);
                }
            }
        });

        // Fallback for images with no ids
        //  sample: https://s2.qwant.com/thumbr/0x168/5/a/821083f15bf3a820fad41163796124b8e49c6958412b4bd079f47b6e24e58e/1_letizia_premios_retina-kIaG--1200x630@abc.jpg?u=https%3A%2F%2Fstatic2.abc.es%2Fmedia%2Festilo%2F2021%2F09%2F07%2F1_letizia_premios_retina-kIaG--1200x630%40abc.jpg&q=0&b=1&p=0&a=0
        // fullsrc: https://static2.abc.es/media/estilo/2021/09/07/1_letizia_premios_retina-kIaG--1200x630%40abc.jpg
        $('a:not([href*="%3A"]) img[src*="u=http"]').each(function() {

            let _this = $(this);
            let src = this.src;
            let m = src.match(/.*\?u=(.*)(&q=.*)/);
            if (m == null) return;
            let fullsrc = m[1];
            fullsrc = decodeURIComponent(fullsrc);
            let link = _this.parents('a')[0];
            if (link) {
                let _link = $(link);
                if (_link.data().hoverZoomSrc == undefined) _link.data().hoverZoomSrc = [fullsrc];
                else if (_link.data().hoverZoomSrc.indexOf(fullsrc) == -1) _link.data().hoverZoomSrc.unshift(fullsrc);
                res.push(_link);
            }
        });

        callback($(res));
    }
});
