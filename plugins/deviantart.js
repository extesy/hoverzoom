var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'deviantART',
    version:'0.4',
    prepareImgLinks:function (callback) {

        var res = [];

        $('a[data-super-img], span[data-super-img], div[data-super-img]').each(function () {
            var _this = $(this),
                url = this.dataset.superImg;
            if (options.showHighRes && this.dataset.superFullImg)
                url = this.dataset.superFullImg;
            _this.data().hoverZoomSrc = [url];
            res.push(_this);
        });

        hoverZoom.urlReplace(res,
            'a:not([data-super-img]) img[src*="deviantart.net/fs"], [style*="deviantart.net/fs"]',
            /\/(fs\d+)\/\d+\w+\//,
            '/$1/',
            ':eq(0)'
        );

        hoverZoom.urlReplace(res,
            'img[src*=avatars]',
            /\/avatars.*?\//,
            '/avatars-original/'
        );

        // basic method: remove size & quality indications from url, it works in some cases
        //
        //sample url: https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/287eab66-0f73-4b97-8e74-849c5f06d542/ddv9veu-e46d9f50-4eff-444c-a6a2-cdbcd0524e8e.jpg/v1/fill/w_376,h_250,q_70,strp/enter_by_anthonypresley_ddv9veu-250t.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTk4IiwicGF0aCI6IlwvZlwvMjg3ZWFiNjYtMGY3My00Yjk3LThlNzQtODQ5YzVmMDZkNTQyXC9kZHY5dmV1LWU0NmQ5ZjUwLTRlZmYtNDQ0Yy1hNmEyLWNkYmNkMDUyNGU4ZS5qcGciLCJ3aWR0aCI6Ijw9MTUwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.qOxFA-ajBwFDRuEhxq3iApUgLIEvXR_QHgonRToMETw
        // -> https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/287eab66-0f73-4b97-8e74-849c5f06d542/ddv9veu-e46d9f50-4eff-444c-a6a2-cdbcd0524e8e.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTk4IiwicGF0aCI6IlwvZlwvMjg3ZWFiNjYtMGY3My00Yjk3LThlNzQtODQ5YzVmMDZkNTQyXC9kZHY5dmV1LWU0NmQ5ZjUwLTRlZmYtNDQ0Yy1hNmEyLWNkYmNkMDUyNGU4ZS5qcGciLCJ3aWR0aCI6Ijw9MTUwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.qOxFA-ajBwFDRuEhxq3iApUgLIEvXR_QHgonRToMETw
        var reToken = /(.*)\/v1\/(.*)(\?token=.*)/;
        hoverZoom.urlReplace(res,
            'img[src]',
            reToken,
            '$1$3'
        );

        $('[style*=background]').each(function() {
            var link = $(this);
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf("url") != -1) {
                var reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                var backgroundImageUrl = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,"");

                $([reToken]).each(function() {

                    var fullsizeUrl = backgroundImageUrl.replace(this, '$1$3');
                    if (fullsizeUrl != backgroundImageUrl) {

                        if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                        if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                            link.data().hoverZoomSrc.unshift(fullsizeUrl);
                            res.push(link);
                        }
                    }
                });
            }
        });

        // https://gist.github.com/killants/569c4af5f2983e340512916e15a48ac0
        function getKeysInObject(obj, searchKey, isRegex, maxDeepLevel, currDeepLevel) {

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
                    console.log(e);
                    return [];
                }
            }

            if( currDeepLevel > maxDeepLevel ) {
                return [];
            } else {

                var keys = [];

                for(var curr in obj) {
                    var currElem = obj[curr];

                    if( currDeepLevel == 1 && bShowInfo ) { console.log("getKeysInObject : Looking property \"" + curr + "\" ") }

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

        function getValuesInObject(obj, searchValue, isRegex, maxDeepLevel, currDeepLevel) {

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
                    console.log(e);
                    return [];
                }
            }

            if( currDeepLevel > maxDeepLevel ) {
                return [];
            } else {

                var keys = [];

                for(var curr in obj) {
                    var currElem = obj[curr];

                    if( currDeepLevel == 1 && bShowInfo ) { console.log("getKeysInObject : Looking property \"" + curr + "\" ") }

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

        // Extract data in window.__INITIAL_STATE__
        function parseScripts() {
            console.log('parseScripts');
            if (document.scripts == undefined) return [];
            scripts = Array.from(document.scripts);
            goodScript = scripts.filter(script => /__INITIAL_STATE__/.test(script.text));
            if (goodScript.length != 1) return [];
            dataFromScript = goodScript[0].text;
            idxInitialState = dataFromScript.indexOf('__INITIAL_STATE__');
            idxJsonBegin = dataFromScript.indexOf('JSON.parse(', idxInitialState);
            idxJsonEnd = dataFromScript.indexOf(');', idxJsonBegin);
            json2parse = dataFromScript.substring(dataFromScript.indexOf('(', idxJsonBegin) + 2, idxJsonEnd - 1);

            j = JSON.parse(JSON.parse('"' + json2parse + '"'));
            return j;
        };

        // Find a media using token or baseUri
        function findMedia(token, baseUri) {

            var media = [];

            media = $.map(medias, function(m) {
                try {
                    if (m.value.token.includes(token)) return m;
                    if (m.value.baseUri == baseUri) return m;
                } catch(e) { }
            });

            return media;
        }

        // Find best image's url available for Deviation
        // url format sample: v1/fill/w_1920,h_1081,q_80,strp/<prettyName>-fullview.jpg
        function findUrl(media, token) {

            var prettyName = media.value.prettyName;
            var maxH = -1;
            var maxW = -1;
            var url = '';
            var c = '';
            var token2 = '';
            if (media.value.token) token2 = media.value.token[0];
            $.map(media.value.types, function(type) {
                if (type.c && type.h > maxH && type.w > maxW) { maxH = type.h; maxW = type.w; c = type.c; }
            });

            url = media.value.baseUri;
            if (/<prettyName>/.test(c)) url += '/' + c.replace('<prettyName>', prettyName);
            url = url.replace(/\/$/, '');
            if (token) url += '?token=' + token;
            else if (token2) url += '?token=' + token2;
            // improve quality
            url = url.replace(/q_[0-9]{1,2}/,'q_100');

            return url;
        }

        j = parseScripts();
        medias = getKeysInObject(j, 'media');

        $('img[src]:not(.hoverZoomPI)').addClass('hoverZoomPI').each(function() {

            var link = $(this);
            var src = this.src;
            var parent, href;
            parent = link.parents('[href]');
            if (parent.length == 1) href = parent[0].href;
            else {
                parent = $(this).parent()[0];
                sibling = $(parent).siblings('[href]');
                if (sibling.length == 1) href = sibling[0].href;
                else href = '';
            }

            // extract token & baseUri from src
            // extract deviationId from href
            var token, baseUri, deviationId;
            var reToken = /.*\?token=(.*)/
            var mToken = src.match(reToken);
            if (mToken) token = mToken[1];
            var reBaseUri = /(^http.*?(jpe?g|svg|png))/
            var mBaseUri = src.match(reBaseUri);
            if (mBaseUri) baseUri = mBaseUri[1];
            var reDeviationId = /-(\d+)$/
            var mDeviationId = href.match(reDeviationId);
            if (mDeviationId) deviationId = mDeviationId[1];

            if (!mToken && !mBaseUri && !mDeviationId) return;

            // check if url is already stored
            var url;
            if (mToken) {
                url = sessionStorage.getItem(token);
            }
            if (url == null) {
                if (mBaseUri) url = sessionStorage.getItem(baseUri);
            }
            if (url == null) {
                if (mDeviationId) url = sessionStorage.getItem(deviationId);
            }

            // if url is not stored then lookup data extracted from scripts
            if (url == null) {
                var media = findMedia(token, baseUri);
                if (media[0]) {
                    url = findUrl(media[0], token);
                    console.log('photo fullsizeUrl (from scripts data):' + url);

                    // store url
                    sessionStorage.setItem(mToken ? token : baseUri, url);

                    if (url) {
                        if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                        if (link.data().hoverZoomSrc.indexOf(url) == -1) {
                            link.data().hoverZoomSrc.unshift(url);
                            res.push(link);
                        }
                    }
                }
            } else {
                console.log('photo fullsizeUrl (from sessionStorage):' + url);

                if (url) {
                    if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                    if (link.data().hoverZoomSrc.indexOf(url) == -1) {
                        link.data().hoverZoomSrc.unshift(url);
                        res.push(link);
                    }
                }
            }

            if (url == null && mDeviationId) {

                // still no url found so proceed with API call
                // WARNING: CORB error (Cross-Origin Read Blocking) when calling the API from the content script.
                // cf https://www.chromium.org/Home/chromium-security/extension-content-script-fetches
                // Workaround: call the API from background page.

                var requestUrl = 'https://www.deviantart.com/_napi/shared_api/deviation/fetch?deviationid=' + deviationId + '&type=art';

                chrome.runtime.sendMessage({action:'ajaxGet', url:requestUrl}, function (response) {

                    if (response == null) { return; }

                    try {
                        var data = JSON.parse(response);
                    } catch (e) { return; }

                    mediasFromAPI = getKeysInObject(data, 'media');
                    if (mediasFromAPI[0]) {
                        url = findUrl(mediasFromAPI[0]);
                        console.log('photo fullsizeUrl (from API data):' + url);
                        // store url
                        sessionStorage.setItem(deviationId, url);

                        if (url != undefined) {

                            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                            if (link.data().hoverZoomSrc.indexOf(url) == -1) {
                                link.data().hoverZoomSrc.unshift(url);
                            }
                            callback(link);
                        }
                    }
                });
            }
        });

        callback($(res), this.name);
    }
});
