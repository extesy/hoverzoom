var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'startpage',
    version:'0.1',
    prepareImgLinks:function (callback) {

        var name = this.name;
        var res = [];
        var jsonToken1 = 'UIStartpage.App,';
        var jsonToken2 = '}),';
        var spJson = undefined;
        var spData = extractJsonFromDoc();

        // links to fullsize imgs are stored in HTML document (JSON)
        function extractJsonFromDoc() {

            let innerHTML = document.documentElement.innerHTML;
            let index1 = innerHTML.indexOf(jsonToken1);
            if (index1 == -1) return undefined;
            let index2 = innerHTML.indexOf(jsonToken2, index1);
            spJson = innerHTML.substring(index1 + jsonToken1.length, index2 + 1);
            try {
               let sp = JSON.parse(spJson);
               return sp;
            } catch { return undefined }

            return undefined;
        }

        // Find key(s) in JSON object and return corresponding value(s) and path(s)
        // If key not found then return []
        // Search is NOT case-sensitive
        // https://gist.github.com/killants/569c4af5f2983e340512916e15a48ac0
        function getKeysInJsonObject(jsonObj, searchKey, isRegex, maxDeepLevel, currDeepLevel) {

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

                    if ( currDeepLevel == 1 && bShowInfo ) { cLog("getKeysInJsonObject : Looking property \"" + curr + "\" ") }

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
                        var deepKeys = getKeysInJsonObject( currElem, searchKey, isRegex, maxDeepLevel, currDeepLevel + 1 );

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
        // Search is NOT case-sensitive
        // ref: https://gist.github.com/killants/569c4af5f2983e340512916e15a48ac0
        function getValuesInJsonObject(jsonObj, searchValue, isRegex, isPartialMatch, isFirstMatchOnly, maxDeepLevel, currDeepLevel) {

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

                    if ( currDeepLevel == 1 && bShowInfo ) { cLog("getValuesInJsonObject : Looking property \"" + curr + "\" ") }

                    if ( typeof currElem == "undefined" ) continue;

                    if ( typeof currElem == "object" ) { // object is "object" and "array" is also in the eyes of "typeof"
                        // search again :D
                        var deepKeys = getValuesInJsonObject( currElem, searchValue, isRegex, isPartialMatch, isFirstMatchOnly, maxDeepLevel, currDeepLevel + 1 );
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
        function getJsonObjectFromPath(path) {
            return new Function('return ' + spJson + path)();
        }

        //$('link[href*="proxy-image"]:not(.hoverZoomFetched)').addClass('hoverZoomFetched').each(function () {
        $('img[src*="proxy-image"]:not(.hoverZoomFetched)').addClass('hoverZoomFetched').each(function () {
            let link = $(this);
            let src = link.attr('src');

            // search for thumbnail url among sp data
            if (spJson.indexOf(src) == -1) return;

            let values = getValuesInJsonObject(spData, src, false, true, true); // look for a partial match & stop after 1st match
            if (values.length == 0) return;
            let o = getJsonObjectFromPath(values[0].path.substring(0, values[0].path.lastIndexOf('[')));
            // extract fullsize url from Object
            let fullsizeUrl = o.clickUrl || o.anonImageViewUrl;
            fullsizeUrl = fullsizeUrl.replace(/.*piurl=(.*)&sp=.*/, '$1');
            fullsizeUrl = decodeURIComponent(fullsizeUrl);
            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.unshift(fullsizeUrl);
                res.push(link);
            }
        });

        callback($(res), name);
    }
});
