var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Instagram',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];
        var sharedData = null;
        var hookedData = sessionStorage.getItem('hookedData');
        var hookedDataJson = null;
        try {
            hookedDataJson = JSON.parse(hookedData);
        } catch (e) {}

        // Hook Instagram 'Open' XMLHttpRequests to catch data & metadata associated with pictures displayed
        // These requests are issued by client side to Instagram servers in order to obtain new data when user scrolls down
        // Hooked data is stored in sessionStorage
        if ($('script.hoverZoomHook').length == 0) { // Inject hook script in document if not already there
            var hookScript = document.createElement('script');
            hookScript.type = 'text/javascript';
            hookScript.text = `if (typeof oldXHROpen !== 'function') { // Hook only once!
                oldXHROpen = window.XMLHttpRequest.prototype.open;
                window.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
                    // catch responses
                    this.addEventListener('load', function() {
                        try {
                            // filter responses
                            if (/shortcode/.test(this.responseText)) {
                                // store response as plain text in a sessionStorage for later usage by plug-in
                                sessionStorage.setItem('hookedData', this.responseText);

                                // Add & remove empty <a> element to/from DOM to trigger HoverZoom,
                                // so hooked data can be exploited
                                let fakeA = document.createElement('a');
                                (document.head || document.documentElement).appendChild(fakeA);
                                (document.head || document.documentElement).removeChild(fakeA);
                            }
                        } catch {}
                    });
                    // Proceed with original function
                    return oldXHROpen.apply(this, arguments);
                }
            }`;
            hookScript.classList.add('hoverZoomHook');
            (document.head || document.documentElement).appendChild(hookScript);
        }

        // Find key(s) in JSON object and return corresponding value(s) and path(s)
        // If key not found then return []
        // https://gist.github.com/killants/569c4af5f2983e340512916e15a48ac0
        function getKeysInObject(jsonObj, searchKey, isRegex, maxDeepLevel, currDeepLevel) {

            var bShowInfo = false;

            maxDeepLevel = ( maxDeepLevel || maxDeepLevel == 0 ) ? maxDeepLevel : 100;
            currDeepLevel = currDeepLevel ? currDeepLevel : 1 ;
            isRegex = isRegex ? isRegex : false;

            // check RegEx validity if needed
            var re;
            if (isRegex) {
                try {
                    re = new RegExp(searchKey);
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

                    if( currDeepLevel == 1 && bShowInfo ) { cLog("getKeysInObject : Looking property \"" + curr + "\" ") }

                    if( isRegex ? re.test(curr) : curr === searchKey ){
                        var r = {};
                        r.key = curr;
                        r.value = currElem;
                        r.path = '["' + curr + '"]';
                        keys.push( r );
                    }

                    if( typeof currElem == "object" ) { // object is "object" and "array" is also in the eyes of "typeof"
                        // search again :D
                        var deepKeys = getKeysInObject( currElem, searchKey, isRegex, maxDeepLevel, currDeepLevel + 1 );

                        for(var e = 0 ; e < deepKeys.length; e++) {
                            // update path backwards
                            deepKeys[e].path = '["' + curr + '"]' + deepKeys[e].path;
                            keys.push( deepKeys[e] );
                        }
                    }
                }
                return keys;
            }
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

                    if( currDeepLevel == 1 && bShowInfo ) { cLog("getKeysInObject : Looking property \"" + curr + "\" ") }

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
                            keys.push( r );
                        }
                    }
                }
                return keys;
            }
        }

        // Find node with good shortcode
        function FindNode(nodes, shortcode) {
            node = null;
            $(nodes).each(function() { if (this.value.shortcode == shortcode) { node = this.value; return false; } });
            return node;
        }

        // Extract data in window._sharedData
        function extractSharedData(shortcode) {
            cLog('extractSharedData');
            if (sharedData == null) {
                if (document.scripts == undefined) return null;
                let scripts = Array.from(document.scripts);
                let goodScripts = scripts.filter(script => /^window._sharedData /.test(script.text));
                if (goodScripts.length != 1) return null;
                let dataFromScript = goodScripts[0].text;
                let idxJsonBegin = dataFromScript.indexOf('window._sharedData ');
                let idxJsonEnd = dataFromScript.indexOf('};', idxJsonBegin);
                let json2parse = dataFromScript.substring(dataFromScript.indexOf('{', idxJsonBegin) - 1, idxJsonEnd + 1);
                try {
                    sharedData = JSON.parse(json2parse);
                } catch (e) {}
            }
            let nodes = getKeysInObject(sharedData, 'node');
            let data = FindNode(nodes, shortcode);
            return data;
        }

        // Extract hooked data from sessionStorage
        function extractHookedData(shortcode) {
            cLog('extractHookedData');
            if (hookedData == undefined) return null;
            if (hookedDataJson == undefined) return null;
            let nodes = getKeysInObject(hookedDataJson, 'node');
            let data = FindNode(nodes, shortcode);
            return data;
        }

        // Extract shortcode from link associated with each image, then use shortcode as a key to find url for larger image.
        // This url can be found in sharedData for first loaded images, or in hooked data for images displayed  after some scrolling
        // In last resort, an API call is issued.
        $('a[href]:has(img[src]):not(.hoverZoomLink)').each(function() {

            // extract href from link
            var link = $(this);
            link = $(link);
            var href = this.href;
            var fullsizeUrl;

            // extract shortcode from href
            var re = /.*\/p\/(.*)\//
            var m = href.match(re);
            if (m) {
                var shortcode = m[1];
                cLog('shortcode:' + shortcode);

                // check sessionStorage in case url was already found
                var dataFromSessionStorage = sessionStorage.getItem(shortcode);
                if (dataFromSessionStorage == null) {

                    // try to find shortcode in sharedData
                    data = extractSharedData(shortcode);
                    if (data) {
                        fullsizeUrl = data.display_url;
                        cLog('photo fullsizeUrl (from sharedData):' + fullsizeUrl);
                    }

                    // try to find shortcode in hooked data
                    if (data == null) {
                        data = extractHookedData(shortcode);
                        if (data) {
                            fullsizeUrl = data.display_url;
                            cLog('photo fullsizeUrl (from hookedData):' + fullsizeUrl);
                        }
                    }

                    // if data with good shortcode is found then store it
                    if (data) {
                        sessionStorage.setItem(shortcode, JSON.stringify(data));
                    }
                } else {
                    data = JSON.parse(dataFromSessionStorage);
                    fullsizeUrl = (data.display_url ? data.display_url : data.graphql.shortcode_media.display_url);
                    cLog('photo fullsizeUrl (from sessionStorage):' + fullsizeUrl);
                }

                if (fullsizeUrl != undefined) {
                    if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                    if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                        link.data().hoverZoomSrc.push(fullsizeUrl);
                        link.data().hoverZoomSrc.reverse();
                    }
                    link.addClass('hoverZoomLink');
                    callback(link);
                } else {

                    // no data found  locally so proceed with API call
                    // WARNING: CORB error (Cross-Origin Read Blocking) raised when calling the API from the content script.
                    // cf https://www.chromium.org/Home/chromium-security/extension-content-script-fetches
                    // Workaround: call the API from background page.
                    var requestUrl = 'https://www.instagram.com/p/' + shortcode + '/?__a=1';

                    chrome.runtime.sendMessage({action:'ajaxGet', url:requestUrl}, function (response) {

                        if (response == null) { return; }

                        try {
                            var data = JSON.parse(response);
                        } catch (e) { return; }

                        // store whole response in sessionStorage
                        sessionStorage.setItem(shortcode, response);

                        fullsizeUrl = data.graphql.shortcode_media.display_url;
                        cLog('photo fullsizeUrl (from API call):' + fullsizeUrl);

                        if (fullsizeUrl != undefined) {
                            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                                link.data().hoverZoomSrc.push(fullsizeUrl);
                                link.data().hoverZoomSrc.reverse();
                            }
                            link.addClass('hoverZoomLink');
                            callback(link);
                        }
                    });
                }
            }
        });
    }
});