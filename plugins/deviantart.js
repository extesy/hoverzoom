var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'deviantART',
    version:'1.0',
    favicon:'deviantart.svg',
    prepareImgLinks:function (callback) {

        var name = this.name;
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
            '/avatars-big/'
        );

        // Extract data in window.__INITIAL_STATE__
        function parseScripts() {
            if (document.scripts == undefined) return [];
            scripts = Array.from(document.scripts);
            goodScript = scripts.filter(script => /__INITIAL_STATE__/.test(script.text));
            if (goodScript.length != 1) return [];
            dataFromScript = goodScript[0].text;
            idxInitialState = dataFromScript.indexOf('__INITIAL_STATE__');
            idxJsonBegin = dataFromScript.indexOf('JSON.parse(', idxInitialState);
            idxJsonEnd = dataFromScript.indexOf(');', idxJsonBegin);
            json2parse = dataFromScript.substring(dataFromScript.indexOf('(', idxJsonBegin) + 2, idxJsonEnd - 1);
            //json2parse = json2parse.replace(/\\/g, '').replace(/u002F/ig, '/').replace(/u003C/ig, '<').replace(/u003E/ig, '>').replace(/\"\[{/g, '[{').replace(/}]"/g, '}]').replace(/\"\{/g, '{').replace(/}"/g, '}');
            json2parse = hoverZoom.decodeUnicode(json2parse);
            var j = {};
            try {
                j = JSON.parse(json2parse);
            } catch(e) { }
            return j;
        };

        // Extract csrf_token from scripts
        function getCsrfToken() {
            if (document.scripts == undefined) return [];
            scripts = Array.from(document.scripts);
            goodScript = scripts.filter(script => /csrfToken/.test(script.text));
            if (goodScript.length != 1) return [];
            dataFromScript = goodScript[0].text;
            idxCsrfToken = dataFromScript.indexOf('csrfToken');
            idxBegin = dataFromScript.indexOf(':', idxCsrfToken);
            idxEnd = dataFromScript.indexOf(',', idxBegin);
            let csrfToken = dataFromScript.substring(idxBegin + 1, idxEnd);
            csrfToken = csrfToken.replace(/[\"\\]/g, '');
            return csrfToken;
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

        // Find a media using deviation id
        function findDeviationIdMedia(deviationId) {
            let media = {};
            if (document.scripts == undefined) return media;
            let scripts = Array.from(document.scripts);
            let token = `"deviationId":${deviationId}`;
            scripts = scripts.filter(script => /token/.test(script.text));
            if (scripts.length != 1) return media;
            let scriptText = scripts[0].text.replaceAll('\\', '');
            let tokenPos = scriptText.indexOf(token);
            let openBracketPos = scriptText.lastIndexOf('{', tokenPos);
            let matchingBracketPos = hoverZoom.matchBracket(scriptText, openBracketPos);
            if (matchingBracketPos < 0) return media;
            let mediaText = scriptText.substring(openBracketPos, matchingBracketPos + 1);
            mediaText = hoverZoom.decodeUnicode(mediaText);
            try {
                let j = JSON.parse(mediaText);
                media = j.media || {};
            } catch {}
            return media;
        }

        // Find best video or image url available for Deviation
        // url format sample: v1/fill/w_1920,h_1081,q_80,strp/<prettyName>-fullview.jpg
        function findUrl(media, token) {
            var prettyName = media.prettyName;
            var maxH = -1;
            var maxW = -1;
            var url = '';
            var b = ''; // video
            var c = ''; // image
            var token2 = '';
            if (media.token) token2 = media.token[0];
            // find best image
            $.map(media.types, function(type) {
                if (type.c && type.h > maxH && type.w > maxW) { maxH = type.h; maxW = type.w; c = type.c; }
            });
            // find best video
            maxH = maxW = -1;
            $.map(media.types, function(type) {
                if (type.b && type.h > maxH && type.w > maxW) { maxH = type.h; maxW = type.w; b = type.b; }
            });

            url = media.baseUri;
            if (url) {
                if (url.indexOf('.gif') != -1) { // GIF
                    url = url.replace(/\/$/, '');
                    if (token) url += '?token=' + token;
                    else if (token2) url += '?token=' + token2;
                } else if (b) { // video
                    url = b;
                } else if (c) { // image
                    if (/<prettyName>/.test(c)) url += (c.startsWith('/') ? '' : '/') + c.replace('<prettyName>', prettyName);
                    url = url.replace(/\/$/, '');
                    if (token) url += '?token=' + token;
                    else if (token2) url += '?token=' + token2;
                    // improve quality
                    url = url.replace(/q_[0-9]{1,2}/, 'q_100');
                }
            }
            return url;
        }

        const jFromScript = parseScripts();
        const medias = hoverZoom.getKeysInJsonObject(jFromScript, 'media');

        var csrf_token = undefined; //window.__CSRF_TOKEN__;
        const valuesFromScript = hoverZoom.getKeysInJsonObject(jFromScript, 'csrfToken');
        if (valuesFromScript[0]) csrf_token = valuesFromScript[0].value;
        // fallback
        if (csrf_token == undefined) csrf_token = getCsrfToken();

        // deviation
        // sample: https://www.deviantart.com/arthatter/art/rage-701181664
        // => deviationId : 701181664
        // =>    userName : arthatter
        $('a[href*=".deviantart.com/"]').filter(function() { return $(this).prop('href').indexOf('/art/') != -1 }).one('mouseenter', function () {

            const href = this.href;
            const link = $(this);

            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            var deviationId = null;
            const regexDeviationId = /\/art\/.*-(\d+)/;
            let matches = href.match(regexDeviationId);
            if (matches) deviationId = matches.length > 1 ? matches[1] : null;
            if (deviationId == null) return;
            cLog(`deviationId: ${deviationId}`);

            // lookup sessionStorage
            var fullsize = sessionStorage.getItem(deviationId);
            if (fullsize)
                cLog('photo fullsizeUrl (from sessionStorage):' + fullsize);
            else {
                // lookup scripts data
                var media = findDeviationIdMedia(deviationId);
                fullsize = findUrl(media);
                if (fullsize) {
                    cLog('photo fullsizeUrl (from scripts data):' + fullsize);
                    // store url
                    sessionStorage.setItem(deviationId, fullsize);
                }
            }

            if (fullsize) {
                link.data().hoverZoomSrc = [fullsize];
                var res = [];
                res.push(link);
                callback($(res), this.name);
                // Image is displayed if the cursor is still over the link
                if (link.data().hoverZoomMouseOver)
                    hoverZoom.displayPicFromElement(link);
                return;
            }

            // fullsize not found in storageSession or scripts => proceed with API call
            var userName = null;
            const regexUserName = /deviantart.com\/(.*)\/art\//;
            matches = href.match(regexUserName);
            if (matches) userName = matches.length > 1 ? matches[1] : null;
            if (userName == null) return;
            cLog(`userName: ${userName}`);

            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:`https://www.deviantart.com/_puppy/dadeviation/init?deviationid=${deviationId}&username=${userName}&type=art&include_session=false&csrf_token=${csrf_token}`,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},
                                        function (response) {
                                            try {
                                                let j = JSON.parse(response);
                                                fullsize = findUrl(j.deviation.media);
                                                // store url
                                                sessionStorage.setItem(deviationId, fullsize);
                                                link.data().hoverZoomSrc = [fullsize];
                                                var res = [];
                                                res.push(link);
                                                callback($(res), this.name);
                                                // Image is displayed if the cursor is still over the link
                                                if (link.data().hoverZoomMouseOver)
                                                    hoverZoom.displayPicFromElement(link);
                                            } catch {}
                                        });

        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        callback($(res), name);
    }
});
