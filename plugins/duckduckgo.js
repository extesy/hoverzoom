var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'duckduckgo',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];
        var DDGData = null;
        var DDGDataJson = {};

        // This script is injected into DDG results page in order to gain access to DDG internal data
        // When triggered (page load or state change) it stores DDG internal data into sessionStorage for later usage by plug-in
        $('.hoverZoomScript').remove();
        var hoverZoomScript = document.createElement('script');
        hoverZoomScript.type = 'text/javascript';
        hoverZoomScript.text = `
            var DDGcallback = function() {
                // skip storage if DDG internal data has not been modified
                let DDGDataOld = sessionStorage.getItem('DDGData');
                let DDGDataNew = JSON.stringify(window.DDG.Data.answers._definitions[1].model.items);
                if (DDGDataNew != DDGDataOld) {
                    sessionStorage.setItem('DDGData', DDGDataNew);
                    // Add & remove empty <a> element to/from DOM to trigger HoverZoom,
                    // so data just added to sessionStorage can be used
                    let fakeA = document.createElement('a');
                    (document.head || document.documentElement).appendChild(fakeA);
                    (document.head || document.documentElement).removeChild(fakeA);
                }
            };
            if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
                DDGcallback();
            } else {
                document.addEventListener("DOMContentLoaded", DDGcallback);
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
        function getValuesInObject(jsonObj, searchValue, isRegex, isPartialMatch, maxDeepLevel, currDeepLevel) {

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
                        var deepKeys = getValuesInObject( currElem, searchValue, isRegex, isPartialMatch, maxDeepLevel, currDeepLevel + 1 );
                        for ( var e = 0; e < deepKeys.length; e++ ) {
                            // update path backwards
                            deepKeys[e].path = '["' + curr + '"]' + deepKeys[e].path;
                            keys.push( deepKeys[e] );
                        }
                    } else {

                        if ( isRegex ? re.test(currElem) : ( isPartialMatch ? currElem.toString().toLowerCase().indexOf(searchValue.toString().toLowerCase()) != -1 : currElem.toString().toLowerCase() === searchValue.toString().toLowerCase() ) ){

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

        //        src: https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.7U2iajPXuu6D4PSvAoI1wQHaFu%26pid%3DApi&f=1
        //  thumbnail: https://tse1.mm.bing.net/th?id=OIP.7U2iajPXuu6D4PSvAoI1wQHaFu
        $('img[src]:not(.hoverZoomLinkDDG), [style*=url]:not(.hoverZoomLinkDDG)').each(function() {

            let _this = $(this);
            _this.addClass('hoverZoomLinkDDG');

            // extract src from link, it might be an image or a background-image
            let src = '';

            if (this.src != undefined) {
                src = this.src;
            } else {
                let backgroundImage = this.style.backgroundImage;
                reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                src = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,""); // remove leading & trailing quotes
            }

            src = decodeURIComponent(src);
            let m = src.match(/.*\?u=([^&]{1,})/);
            if (m == null) return;
            let thumbnail = m[1];

            // search for thumbnail among DDG internal data
            if (!DDGData) {

                DDGData = sessionStorage.getItem('DDGData');
                try {
                    DDGDataJson = JSON.parse(DDGData);
                } catch {}
            }
            if (DDGDataJson) {
                let values = getValuesInObject(DDGDataJson, thumbnail, false, true); // look for a partial match
                if (values.length == 0) return;
                let o = getObjectFromPath(DDGDataJson, values[0].path.substring(0, values[0].path.lastIndexOf('[')));
                if (o.image) {
                    _this.data().hoverZoomSrc = [o.image];
                }
                if (o.url) {
                    _this.data().href = o.url;
                }
                if (o.title) {
                    _this.data().hoverZoomCaption = o.title;
                }
                res.push(_this);
            }
        });

        $('div[data-id]').each(function() {

            let _this = $(this);
            _this.addClass('hoverZoomLinkDDG');
            let srcfull = _this.data().id;
            _this.data().hoverZoomSrc = [srcfull];
            res.push(_this);
        });

        $('[style*=url]').each(function() {

            let _this = $(this);
            _this.addClass('hoverZoomLinkDDG');
            let backgroundImage = this.style.backgroundImage;
            reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            let src = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,""); // remove leading & trailing quotes
            src = decodeURIComponent(src);
            let m = src.match(/.*\?u=([^&]{1,})/);
            if (m == null) return;
            let srcfull = m[1];
            _this.data().hoverZoomSrc = [srcfull];
            res.push(_this);
        });

        callback($(res), this.name);
    }
});
