var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Sogou',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];
        var SogouData = null;
        var SogouDataLowerCase = null;
        var SogouDataJson = {};

        // This script is injected into Sogou results page in order to gain access to Sogou internal data: window.__INITIAL_STATE__
        // When triggered (page load or state change) it stores Sogou internal data into sessionStorage for later usage by plug-in
        $('.hoverZoomScript').remove();
        var hoverZoomScript = document.createElement('script');
        hoverZoomScript.type = 'text/javascript';
        hoverZoomScript.text = `
            var Sogoucallback = function() {
                // skip storage if Sogou internal data has not been modified
                let SogouDataOld = sessionStorage.getItem('SogouData');
                let SogouDataNew = JSON.stringify(window.__INITIAL_STATE__);
                if (SogouDataNew != SogouDataOld) {
                    sessionStorage.setItem('SogouData', SogouDataNew);
                    // Add & remove empty <a> element to/from DOM to trigger HoverZoom,
                    // so data just added to sessionStorage can be used
                    let fakeA = document.createElement('a');
                    (document.head || document.documentElement).appendChild(fakeA);
                    (document.head || document.documentElement).removeChild(fakeA);
                }
            };
            if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
                Sogoucallback();
            } else {
                document.addEventListener("DOMContentLoaded", Sogoucallback);
            }
        `;
        hoverZoomScript.classList.add('hoverZoomScript');
        (document.head || document.documentElement).appendChild(hoverZoomScript);

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

            if ( currDeepLevel > maxDeepLevel ) {
                return [];
            } else {

                var keys = [];

                for ( var curr in jsonObj ) {
                    var currElem = jsonObj[curr];

                    if ( currDeepLevel == 1 && bShowInfo ) { cLog("getKeysInObject : Looking property \"" + curr + "\" ") }

                    if ( isRegex ? re.test(curr) : curr.toLowerCase() === searchKey.toLowerCase() ){
                        var r = {};
                        r.key = curr;
                        r.value = currElem;
                        r.path = '["' + curr + '"]';
                        r.depth = currDeepLevel;
                        keys.push( r );
                    }

                    if ( typeof currElem == "object" ) { // object is "object" and "array" is also in the eyes of "typeof"
                        // search again :D
                        var deepKeys = getKeysInObject( currElem, searchKey, isRegex, maxDeepLevel, currDeepLevel + 1 );

                        for ( var e = 0; e < deepKeys.length; e++ ) {
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
        function getValuesInObject(jsonObj, searchValue, isRegex, isPartialMatch, isFirstMatchOnly, maxDeepLevel, currDeepLevel) {

            var bShowInfo = false;

            maxDeepLevel = ( maxDeepLevel || maxDeepLevel == 0 ) ? maxDeepLevel : 100;
            currDeepLevel = currDeepLevel ? currDeepLevel : 1 ;
            isRegex = isRegex ? isRegex : false;

            // check RegEx validity if needed
            var re;
            if ( isRegex ) {
                try {
                    re = new RegExp(searchValue);
                } catch (e) {
                    cLog(e);
                    return [];
                }
            } else {
                searchValue = searchValue.toString().toLowerCase();
            }

            if ( currDeepLevel > maxDeepLevel ) {
                return [];
            } else {

                var keys = [];

                for ( var curr in jsonObj ) {
                    var currElem = jsonObj[curr];

                    if ( currDeepLevel == 1 && bShowInfo ) { cLog("getValuesInObject : Looking property \"" + curr + "\" ") }

                    if ( typeof currElem == "undefined" ) continue;

                    if ( typeof currElem == "object" ) { // object is "object" and "array" is also in the eyes of "typeof"
                        // search again :D
                        var deepKeys = getValuesInObject( currElem, searchValue, isRegex, isPartialMatch, isFirstMatchOnly, maxDeepLevel, currDeepLevel + 1 );
                        for ( var e = 0; e < deepKeys.length; e++ ) {
                            // update path backwards
                            deepKeys[e].path = '["' + curr + '"]' + deepKeys[e].path;
                            keys.push( deepKeys[e] );
                        }
                    } else {

                        if ( isRegex ? re.test(currElem) : ( isPartialMatch ? currElem.toString().toLowerCase().indexOf(searchValue) != -1 : currElem.toString().toLowerCase() === searchValue ) ){

                            var r = {};
                            r.key = curr;
                            r.value = currElem;
                            r.path = '["' + curr + '"]';
                            r.depth = currDeepLevel;
                            keys.push( r );
                            if (isFirstMatchOnly) return keys;
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

        // return true if thumbnail found among internal data from Sogou
        function searchForThumbnail(_this, thumbnail) {
         // search for thumbnail among Sogou internal data
            if (!SogouData) {

                SogouData = sessionStorage.getItem('SogouData') || '';
                SogouDataLowerCase = SogouData.toString().toLowerCase();
                try {
                    SogouDataJson = JSON.parse(SogouData);
                } catch {}
            }
            if (SogouDataJson) {

                if (SogouDataLowerCase.indexOf(thumbnail.toString().toLowerCase()) == -1) return false;

                let values = getValuesInObject(SogouDataJson, thumbnail, false, true, true); // look for a partial match & stop after 1st match
                if (values.length == 0) return;
                let o = getObjectFromPath(SogouDataJson, values[0].path.substring(0, values[0].path.lastIndexOf('[')));

                if (o.picUrl) {
                    if (_this.data().hoverZoomSrc == undefined) _this.data().hoverZoomSrc = [o.picUrl];
                    else _this.data().hoverZoomSrc.unshift(o.picUrl);
                }
                if (o.oriPicUrl) {
                    if (_this.data().hoverZoomSrc == undefined) _this.data().hoverZoomSrc = [o.oriPicUrl];
                    else _this.data().hoverZoomSrc.unshift(o.oriPicUrl);
                }
                if (o.image) {
                    if (_this.data().hoverZoomSrc == undefined) _this.data().hoverZoomSrc = [o.image];
                    else _this.data().hoverZoomSrc.unshift(o.image);
                }
                //if (o.originImage) {
                //    if (_this.data().hoverZoomSrc == undefined) _this.data().hoverZoomSrc = [o.originImage];
                //    else _this.data().hoverZoomSrc.unshift(o.originImage);
                //}

                if (o.url) {
                    _this.data().href = o.url;
                }

                if (o.title) {
                    _this.data().hoverZoomCaption = o.title;
                }

                _this.addClass('hoverZoomLinkSogou');
                res.push(_this);
                return true;
            }
            return false;
        }

        $('img[data-src]:not(.hoverZoomLinkSogou), img[drag-img]:not(.hoverZoomLinkSogou), [style*=url]:not(.hoverZoomLinkSogou)').each(function() {

            var _this = $(this);

            // extract thumbnail from link, it might be an image or a background-image
            let thumbnail = '';

            if (_this.data().src != undefined) {
                thumbnail = _this.data().src;
            } else if (_this.attr('drag-img') != undefined) {
                thumbnail = _this.attr('drag-img');
            } else {
                let backgroundImage = this.style.backgroundImage;
                reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                thumbnail = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,""); // remove leading & trailing quotes
            }

            searchForThumbnail(_this, thumbnail);
        });

        // thumbnail: https://img01.sogoucdn.com/net/a/04/link?appid=100520033&url=http://mmbiz.qpic.cn/mmbiz/cvdsRVHsY7dOU0iaSevbPVOPDK5BWJx4sR5BHearPAfTEufEy8oOzxJN1iba6bPouDibPP2MKoXjEJXdiaiaqOSr0Lg/0?wx_fmt=jpeg
        //  fullsize: http://mmbiz.qpic.cn/mmbiz/cvdsRVHsY7dOU0iaSevbPVOPDK5BWJx4sR5BHearPAfTEufEy8oOzxJN1iba6bPouDibPP2MKoXjEJXdiaiaqOSr0Lg/0
        $('img[src*=url\\=http]:not(.hoverZoomLinkSogou)').each(function() {

            let _this = $(this);
            let src = this.src;
            src = decodeURIComponent(src);
            let m = src.match(/.*?url=([^&\?]{1,})/);
            if (m == null) return;
            src = m[1];

            if (searchForThumbnail(_this, src)) return; // if search was successful then stop

            if (_this.data().hoverZoomSrc == undefined) _this.data().hoverZoomSrc = [src];
            else if (_this.data().hoverZoomSrc.indexOf(src) == -1) _this.data().hoverZoomSrc.unshift(src);
            _this.addClass('hoverZoomLinkSogou');
            res.push(_this);
        });

        callback($(res), this.name);
    }
});
