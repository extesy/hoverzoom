var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Flickr',
    version:'1.3',
    prepareImgLinks:function (callback) {
        cLog('Plug-In: ' + this.name);

        var name = this.name;
        var res = [];

        var enableApiCalls = true;
        var modelExport = null;
        var modelExportJson = null;
        var hookedData = null;
        var hookedDataJsonA = [];

        // init
        hookedData = sessionStorage.getItem('hookedData');
        if (hookedData) {
            // split hookedData: {data}<HOOKED_DATA_SPLITTER>{data}<HOOKED_DATA_SPLITTER>...<HOOKED_DATA_SPLITTER>{data}
            let hookedDataA = hookedData.split('<HOOKED_DATA_SPLITTER>');
            hookedDataA.forEach(function(h) {
                try {
                    let hookedDataJson = JSON.parse(h);
                    hookedDataJsonA.unshift(hookedDataJson);
                } catch (e) {}
            });
        }

        // Hook Flickr 'Open' XMLHttpRequests to catch data & metadata associated with pictures displayed
        // These requests are issued by client side to Flickr servers in order to obtain new data when user scrolls down
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
                            if (/url/.test(this.responseText)) {

                                // store response as plain text in a sessionStorage for later usage by plug-in
                                // responses are concatenated & separated by this tag: <HOOKED_DATA_SPLITTER>
                                let sep = '<HOOKED_DATA_SPLITTER>';
                                let oldHookedData = sessionStorage.getItem('hookedData');
                                if (oldHookedData) {
                                    // if more than 10 responses then only keep 10 latest responses
                                    let oldHookedDataA = oldHookedData.split(sep);
                                    let newHookedData = oldHookedDataA.slice(Math.max(0, oldHookedDataA.length - 10)).join(sep);
                                    sessionStorage.setItem('hookedData', newHookedData + sep + this.responseText);
                                }
                                else sessionStorage.setItem('hookedData', this.responseText);

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

        function findClosingBracketMatchIndex(str, pos, openBracket = '{', closeBracket = '}') {
            let openBracketCount = 0;
            let givenBracketPosition = -1;
            let index = -1;
            for (let i = 0; i < str.length; i++) {
                let char = str[i];
                if (char === openBracket) {
                    openBracketCount++;
                    if (i === pos) {
                        givenBracketPosition = openBracketCount;
                  }
                } else if (char === closeBracket) {
                      if (openBracketCount === givenBracketPosition) {
                          index = i;
                          break;
                      }
                  openBracketCount--;
                }
            }
            return index;
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
                        r.depth = currDeepLevel;
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
            if (!path || path.length < 4) return objJson;
            const keys = path.substr(2, path.length-4).split('"]["');
            let result = objJson;
            keys.forEach(key => result = result[key]);
            return result;
        }

        // Find node with good id
        function FindNode(nodes, id) {
            node = null;
            $(nodes).each(function() { if (this.value.id == id) { node = this.value; return false; } });
            return node;
        }

        // Search id through values from modelExportJson (stored in page in a script)
        function searchModelExport(id) {
            cLog('searchModelExport');
            var valueWithUrl = null;
            if (modelExportJson == null) {
                if (document.scripts == undefined) return null;
                let scripts = Array.from(document.scripts);
                let goodScripts = scripts.filter(script => /modelExport/.test(script.text));
                if (goodScripts.length != 1) return null;
                let dataFromScript = goodScripts[0].text;
                let idxJsonBegin = dataFromScript.indexOf('modelExport: ');
                idxJsonBegin = dataFromScript.indexOf('{', idxJsonBegin);
                let idxJsonEnd = findClosingBracketMatchIndex(dataFromScript, idxJsonBegin);
                var json2parse = dataFromScript.substring(idxJsonBegin - 1, idxJsonEnd + 1);
                try {
                    modelExportJson = JSON.parse(json2parse);
                } catch (e) {}
            }
            let values = getValuesInObject(modelExportJson, id); // look for an exact match
            if (values.length == 0) return null;

            // look for url
            $(values).each(function() {
                let o = getObjectFromPath(modelExportJson, this.path.substring(0, this.path.lastIndexOf('['))); // get parent object
                let valuesWithUrl = getValuesInObject(o, id + '_', true);
                if (valuesWithUrl.length > 0) {
                    valueWithUrl = o;
                    return false;
                }
            });

            return valueWithUrl;
        }

        // Search id through data from one XHR response
        function searchHookedData(id, hookedDataJson) {
            cLog('searchHookedData');
            if (hookedDataJson == null) return null;

            var valueWithUrl = null;

            let values = getValuesInObject(hookedDataJson, id); // look for an exact match
            if (values.length == 0) return null;

            // look for url
            $(values).each(function() {
                let o = getObjectFromPath(hookedDataJson, this.path.substring(0, this.path.lastIndexOf('['))); // get parent object
                let valuesWithUrl = getValuesInObject(o, id + '_', true);
                if (valuesWithUrl.length > 0) {
                    valueWithUrl = o;
                    return false;
                }
            });
            return valueWithUrl;
        }

        // Search id through data from all XHR responses
        function searchHookedDataA(id) {
            cLog('searchHookedDataA');
            if (hookedDataJsonA == []) return null;
            var valueWithUrl = null;
            hookedDataJsonA.some(function(h) {
                valueWithUrl = searchHookedData(id, h);
                return valueWithUrl != null;
            });
            return valueWithUrl;
        }

        // sample urls:
        // live.staticflickr.com/8154/7179847951_1e25e9d7e8_z.jpg
        // https://i0.wp.com/live.staticflickr.com/65535/49917571842_b85341933a_c.jpg?resize=450%2C300
        // live.staticflickr.com/456/buddyicons/71402340@N00_r.jpg?1485566646#71402340@N00
        // live.staticflickr.com/5549/coverphoto/71402340@N00_h.jpg?1478371839#71402340@N00
        // https://combo.staticflickr.com/pw/images/coverphoto00_h.jpg.v3

        function fetchPhoto(link, url) {

            // extract photo id from url
            let regexImg = /\/([0-9]{4,})_[0-9a-f]{4,}/; //sample: //live.staticflickr.com/8154/7179847951_1e25e9d7e8_z.jpg -> 7179847951
            let matchesImg = url.match(regexImg);
            let idImg = null;
            if (matchesImg) idImg = matchesImg.length > 1 ? matchesImg[1] : null;

            let regexImgBuddy = /buddyicons\/([0-9]{4,}@N[0-9]{1,})/; //sample: //live.staticflickr.com/456/buddyicons/71402340@N00_r.jpg?1485566646#71402340@N00 -> 71402340@N00
            let matchesImgBuddy = url.match(regexImgBuddy);
            let idImgBuddy = null;
            if (matchesImgBuddy) idImgBuddy = matchesImgBuddy.length > 1 ? matchesImgBuddy[1] : null;

            let regexImgCover = /coverphoto\/([0-9]{4,}@N[0-9]{1,})/; //sample: //live.staticflickr.com/5549/coverphoto/71402340@N00_h.jpg?1478371839#71402340@N00 -> 71402340@N00
            let matchesImgCover = url.match(regexImgCover);
            let idImgCover = null;
            if (matchesImgCover) idImgCover = matchesImgCover.length > 1 ? matchesImgCover[1] : null;

            let id = null;
            if (idImg) id = idImg;
            else if (idImgBuddy) id = idImgBuddy;
            else if (idImgCover) id = idImgCover;
            if (id == null) return;

            cLog('id: ' + id);

            // check sessionStorage in case url was already found through API call
            let storedDataJson = sessionStorage.getItem(id);

            if (storedDataJson == null) {
                var dataFromModelExportJson = null;
                var dataFromHookedDataJson = null;
                dataFromModelExportJson = searchModelExport(id);
                if (dataFromModelExportJson == null) dataFromHookedDataJson = searchHookedDataA(id);
            }

            // extract url & metadata
            if (storedDataJson) extractData(link, storedDataJson, id);
            else if (dataFromModelExportJson) extractData(link, dataFromModelExportJson, id);
            else if (dataFromHookedDataJson) extractData(link, dataFromHookedDataJson, id);
        }

        function extractData(link, dataJson, id) {
            cLog('extractData');
            let url = null;

            // extract url

            if (id.indexOf('@') != -1) {
                if (dataJson.iconurls) {
                    url = dataJson.iconurls.retina;
                } else if (dataJson.buddyicon) {
                    url = dataJson.buddyicon.retina;
                }
            } else if (dataJson.sizes) {
                if (dataJson.sizes['o']) {
                    url = dataJson.sizes['o'].url;
                } else if (dataJson.sizes['6k']) {
                    url = dataJson.sizes['6k'].url;
                } else if (dataJson.sizes['5k']) {
                    url = dataJson.sizes['5k'].url;
                } else if (dataJson.sizes['4k']) {
                    url = dataJson.sizes['4k'].url;
                } else if (dataJson.sizes['3k']) {
                    url = dataJson.sizes['3k'].url;
                } else if (dataJson.sizes['k']) {
                    url = dataJson.sizes['k'].url;
                } else if (dataJson.sizes['h']) {
                    url = dataJson.sizes['h'].url;
                } else if (dataJson.sizes['l']) {
                    url = dataJson.sizes['l'].url;
                } else if (dataJson.sizes['b']) {
                    url = dataJson.sizes['b'].url;
                }
            } else {
                if (dataJson.url_o) {
                    url = dataJson.url_o;
                } else if (dataJson.url_6k) {
                    url = dataJson.url_6k;
                } else if (dataJson.url_5k) {
                    url = dataJson.url_5k;
                } else if (dataJson.url_4k) {
                    url = dataJson.url_4k;
                } else if (dataJson.url_3k) {
                    url = dataJson.url_3k;
                } else if (dataJson.url_k) {
                    url = dataJson.url_k;
                } else if (dataJson.url_h) {
                    url = dataJson.url_h;
                } else if (dataJson.url_l) {
                    url = dataJson.url_l;
                } else if (dataJson.url_b) {
                    url = dataJson.url_b;
                }
            }

            if (url == null) {
                cLog('no fullsize url found for id: ' + id);
            } else {
                cLog('fullsize url: ' + url);
            }

            // extract metadata
            var meta = {};
            if (link.data().meta) meta = link.data().meta;
            try {

               if (typeof dataJson.description == 'string') meta.description = dataJson.description;
               if (typeof dataJson.description == 'object' && typeof dataJson.description._content == 'string') meta.description = dataJson.description._content;
               if (dataJson.title) meta.title = dataJson.title;
               if (dataJson.subject) meta.subject = dataJson.subject;
               if (typeof dataJson.owner == 'string') meta.owner = dataJson.owner;
               if (dataJson.username) meta.username = dataJson.username;
               if (dataJson.ownername) meta.ownername = dataJson.ownername;
               if (dataJson.realname) meta.realname = dataJson.realname;
               if (dataJson.authorName) meta.authorName = dataJson.authorName;
               if (dataJson.license) meta.license = dataJson.license.toString();
               if (dataJson.count_views) meta.views = dataJson.count_views.toString();
               if (dataJson.viewCount) meta.views = dataJson.viewCount.toString();
               if (dataJson.count_faves) meta.faves = dataJson.count_faves.toString();
               if (dataJson.faveCount) meta.faves = dataJson.faveCount.toString();
               if (dataJson.count_comments) meta.comments = dataJson.count_comments.toString();
               if (dataJson.commentCount) meta.comments = dataJson.commentCount.toString();
               if (dataJson.datetaken) meta.datetaken = dataJson.datetaken;

            } catch (e) {}
            link.data().meta = meta;

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(url) == -1) {
                link.data().hoverZoomSrc.unshift(url);
            }
            res.push(link);

            if (enableApiCalls) {
                if (id.indexOf('@') == -1) {
                    if (!dataJson.secret_k && !dataJson.secret_h) {

                        let fullsizeUrl = sessionStorage.getItem(id);
                        if (fullsizeUrl == undefined) {

                            cLog('Proceed with API call for id: ' + id);
                            // no data found  locally so proceed with API call
                            // WARNING: CORB error (Cross-Origin Read Blocking) raised when calling the API from the content script.
                            // cf https://www.chromium.org/Home/chromium-security/extension-content-script-fetches
                            // Workaround: call the API from background page.
                            var requestUrl = 'https://api.flickr.com/services/rest/?photo_id=' + id + '&method=flickr.photos.getSizes&format=json&nojsoncallback=1&api_key=9bb671af308f509d0c82146cbc936b3c';

                            chrome.runtime.sendMessage({action:'ajaxGet', url:requestUrl}, function (response) {

                                if (response == null) { return; }

                                try {
                                    var responseJson = JSON.parse(response);
                                } catch (e) { return; }

                                // sort by height
                                let sortedsizes = responseJson.sizes.size.sort(function(a,b) { if (parseInt(a.height) > parseInt(b.height)) return -1; if (parseInt(a.height) < parseInt(b.height)) return 1; return 0; })
                                let fullsizeUrl = sortedsizes[0].source;

                                // store fullsizeUrl in sessionStorage
                                sessionStorage.setItem(id, fullsizeUrl);

                                cLog('photo fullsizeUrl (from API call):' + fullsizeUrl);

                                if (fullsizeUrl != undefined) {

                                    if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                                    if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                                        link.data().hoverZoomSrc.unshift(fullsizeUrl);
                                    }
                                    callback(link, name);
                                }
                            });
                        }
                        else {
                            cLog('photo fullsizeUrl (from sessionStorage):' + fullsizeUrl);
                            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                                link.data().hoverZoomSrc.unshift(fullsizeUrl);
                            }
                            callback(link, name);
                        }
                    }
                }
            }
        }
        
        // maps & expos images
        hoverZoom.urlReplace(res,
            'img[src]',
            /_[sq].jpg/,
            '_b.jpg'
        );

        // remove resize constraint
        // sample: https://i0.wp.com/live.staticflickr.com/4097/4930864108_cd9fcb7a57_b.jpg?resize=450%2C300
        hoverZoom.urlReplace(res,
            'img[src]',
            /\?resize.*/,
            ''
        );
        
        $('img[src]:not(.hoverZoomPI1)').addClass('hoverZoomPI1').each(function() {

            // extract url from link
            let link = $(this);
            let url = link[0].src;
            fetchPhoto(link, url);
        });

        $('[style*=url]:not(.hoverZoomPI2)').addClass('hoverZoomPI2').each(function() {

            // extract url from link
            let link = $(this);
            let backgroundImage = link[0].style.backgroundImage;
            let reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            let url = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,""); // remove leading & trailing quotes
            fetchPhoto(link, url);
        });

        callback($(res), name);
    }

});
