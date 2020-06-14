var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Google',
    version:'3.0',
    prepareImgLinks:function (callback) {
        var res = [];
        var initData = null;
        var hookedData = sessionStorage.getItem('hookedData');
        sessionStorage.removeItem('hookedData');

        // Google+ full page viewer
        if (location.search.indexOf('pid=') > -1) {
            return;
        }

        hoverZoom.urlReplace(res,
            'img[src*=".googleusercontent.com/"], img[src*=".ggpht.com/"]',
            /(\/|=)(w\d{2,}-h\d{2,}|[hws]\d{2,})(-[npckorw]+)*(\/|$)/,
            options.showHighRes ? '$1s0$4' : '$1s800$4'
        );
        /*hoverZoom.urlReplace(res,
            'img[src*=".googleusercontent.com/"], img[src*=".ggpht.com/"]',
            /(\/|=)(w\d{2,}-h\d{2,}|[hws]\d{2,})(-[npcko]+)*(\/|$)/,
            options.showHighRes ? '$1s0$4' : '$1s800$4'
        );*/
        hoverZoom.urlReplace(res,
            'a[href*="imgurl="]',
            /.*imgurl=([^&]+).*/,
            '$1'
        );

        // Hook Google 'Open' XMLHttpRequests to catch data & metadata associated with pictures displayed
        // These requests are issued by client side to Google servers in order to obtain new data when user scrolls down
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
                            // store response as plain text in a sessionStorage for later usage by plug-in
                            let storedHookedData = sessionStorage.getItem('hookedData');
                            if (storedHookedData == undefined) sessionStorage.setItem('hookedData', this.responseText);
                            else sessionStorage.setItem('hookedData', storedHookedData + this.responseText);

                            // Add & remove empty <a> element to/from DOM to trigger HoverZoom,
                            // so data & metadata just added to DOM in <script> element can be exploited
                            let fakeA = document.createElement('a');
                            (document.head || document.documentElement).appendChild(fakeA);
                            (document.head || document.documentElement).removeChild(fakeA);
                        } catch {}
                    });
                    // Proceed with original function
                    return oldXHROpen.apply(this, arguments);
                }
            }`;
            hookScript.classList.add('hoverZoomHook');
            (document.head || document.documentElement).appendChild(hookScript);
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

        // Extract direct links for images:
        // - extract the data for the first ≈ 100 images out of the <script> element embedded in the page
        // - then use data received from server when user scrolls down (catched & stored in <script> elements appended to DOM)
        // Mostly inspired from chocolatebot's userscript : Google DWIMages
        // You can find it here: https://greasyfork.org/fr/scripts/29420-google-dwimages
        // Data structure:
        // "data-tbnid",["thumbnail url",h,w],["image url we are looking for",h,w]
        // for instance:
        // "zEevaU3QYshNNM",["https://encrypted-tbn0.gstatic.com/images?q\u003dtbn%3AANd9GcS2TiJ5s8_9L8dtcfU8uhN7eBaJXUPU8Macpmkjs-HZDAOdiJtz\u0026usqp\u003dCAU",225,225],["https://www.savethedeco.com/12079-large_default/ballon-tete-de-singe-87-cm.jpg",800,800]

        // Search data associated with tbnid in initDataCallback
        function searchInitData(tbnid) {
            cLog('searchInitData');
            let url = undefined;
            if (initData == null) {
                if (document.scripts == undefined) return url;
                let scripts = Array.from(document.scripts);
                let goodScripts = scripts.filter(script => /^AF_initDataCallback\b/.test(script.text));
                if (goodScripts.length != 2) return url;
                initData = goodScripts.pop().text;
            }
            let tbnidq = '"' + tbnid + '",';
            if (initData.indexOf(tbnidq) != -1) {
                let firstquoteIndex = initData.indexOf('[', initData.indexOf('[', initData.indexOf(tbnidq)) + 1) + 1;
                let lastquoteIndex = initData.indexOf('"', firstquoteIndex + 1);
                url = initData.substring(firstquoteIndex + 1, lastquoteIndex);
            }
            return cleanUrl(url);
        }

        // Search data associated with tbnid in hooked data (=intercepted responses to XMLHttpRequests 'Open' issued by client side)
        function searchHookedData(tbnid) {
            cLog('searchHookedData');
            let url = undefined;
            if (hookedData == undefined) return url;
            let data2parse = hookedData.replace(/\\n/g, '').replace(/\\"/g, '"');
            let tbnidq = '"' + tbnid + '",';
            if (data2parse.indexOf(tbnidq) != -1) {
                let firstquoteIndex = data2parse.indexOf('[', data2parse.indexOf('[', data2parse.indexOf(tbnidq)) + 1) + 1;
                let lastquoteIndex = data2parse.indexOf('"', firstquoteIndex + 1);
                url = data2parse.substring(firstquoteIndex + 1, lastquoteIndex);
            }
            return cleanUrl(url);
        }

        // Loop through thumbnails and when possible add hrefs = images urls found in init data or hooked data
        // tbnid = thumbnail id reference
        $('div[data-tbnid]').each(function() {

            if ($(this).find('a.hoverZoomLink').length > 0) return;

            let tbnid = this.dataset.tbnid;
            let hrefPage = undefined;
            let url = undefined;
            let imageLink = undefined;

            // check if url is already stored
            url = sessionStorage.getItem('url_' + tbnid);
            if (url != undefined) {
                cLog('photo fullsizeUrl (from sessionStorage):' + url);
            }

            // if not stored then lookup data from init data or XHR responses
            if (url == undefined) {
                url = searchInitData(tbnid);
                if (url != undefined) {
                    cLog('photo fullsizeUrl (from initData):' + url);
                    sessionStorage.setItem('url_' + tbnid, url);
                } else {
                    url = searchHookedData(tbnid);
                    if (url != undefined) {
                        cLog('photo fullsizeUrl (from hookedData):' + url);
                        sessionStorage.setItem('url_' + tbnid, url);
                    }
                }
            }

           links = $(this).find('a');
           if (links.length > 0) {
               // update image link (1st link) with url
               imageLink = links.eq(0);
               imageLink.attr('href', url);
           }
        });

        callback($(res));

        // remove this when old google image is retired
        function prepareImgLink(img) {
            var img = $(this);
            if (this.id != 'rg_hi' && img.data().hoverZoomSrc) { return; }
            var link = this.parentNode,
                href = link.href,
                imgUrlIndex = href.indexOf('imgurl=');
            href = href.substring(imgUrlIndex + 7, href.indexOf('&', imgUrlIndex));
            try {
                while (decodeURIComponent(href) != href)
                    href = decodeURIComponent(href);
            } catch (e) {
            }
            link.classList.remove('hoverZoomLink');
            img.data().hoverZoomSrc = [href];
            img.addClass('hoverZoomLink');
        }
        $('a[href*="imgurl="] > img').each(prepareImgLink);
        $('.rg_ic').on('load',prepareImgLink);
    }
});
