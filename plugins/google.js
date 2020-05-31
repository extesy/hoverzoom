var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Google',
    version:'3.0',
    prepareImgLinks:function (callback) {
        var res = [];
        var initData = null;

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
        // These requests are issued by client to Google servers in order to obtain new data when user scrolls down
        // Hooked data is stored in scripts in DOM with class='hoverZoomHookedData'
        if ($('script.hoverZoomHook').length == 0) { // Inject hook script in document if not already there
            var hookScript = document.createElement('script');
            hookScript.type = 'text/javascript';
            hookScript.text = `if (typeof oldXHROpen !== 'function') { // Hook only once!
                console.log('Hooking XHROpen');
                oldXHROpen = window.XMLHttpRequest.prototype.open;
                window.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
                    // catch responses
                    this.addEventListener('load', function() {
                        try {
                            //console.log('load: ' + this.responseText);
                            // store response as plain text in a <script> element for later usage by plug-in
                            var hookedDataScript = document.createElement('script');
                            hookedDataScript.type = 'text';
                            hookedDataScript.text = this.responseText;
                            hookedDataScript.classList.add('hoverZoomHookedData'); // add specific class for easier retrieval
                            (document.head || document.documentElement).appendChild(hookedDataScript);
                            // Add & remove empty <a> element to/from DOM to trigger HoverZoom,
                            // so data & metadata just added to DOM in <script> element can be exploited
                            var fakeA = document.createElement('a');
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
                url = decodeURIComponent(decodeURIComponent(url));
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

        // Extract data in initDataCallback
        function extractInitData(tbnid) {
            console.log('extractInitData');
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
            url = cleanUrl(url);
            return url;
        }

        // Extract hooked data stored in <script> elements appended to DOM
        function extractHookedData(tbnid) {
            console.log('extractHookedData');
            let url = undefined;
            if (document.scripts == undefined) return url;
            let scripts = Array.from($('script.hoverZoomHookedData'));
            let goodScripts = scripts.filter(script => script.text.indexOf(tbnid) != -1);
            if (goodScripts.length == 0) return url;
            let dataFromScript = goodScripts[0].text;
            dataFromScript = dataFromScript.replace(/\\n/g, '').replace(/\\"/g, '"');
            let tbnidq = '"' + tbnid + '",';
            if (dataFromScript.indexOf(tbnidq) != -1) {
                let firstquoteIndex = dataFromScript.indexOf('[', dataFromScript.indexOf('[', dataFromScript.indexOf(tbnidq)) + 1) + 1;
                let lastquoteIndex = dataFromScript.indexOf('"', firstquoteIndex + 1);
                url = dataFromScript.substring(firstquoteIndex + 1, lastquoteIndex);
            }
            url = cleanUrl(url);
            return url;
        }

        // Loop through thumbnails and when possible add hrefs = images urls found in scripts
        // tbnid = thumbnail id referenced in scripts'data
        $('div[data-tbnid]').each(function() {

            if ($(this).find('a.hoverZoomLink').length > 0) return;

            let tbnid = this.dataset.tbnid;
            let hrefPage = undefined;
            let url = undefined;
            let imageLink = undefined;

            // check if url is already stored
            url = sessionStorage.getItem('url_' + tbnid);
            if (url != undefined) {
                console.log('photo fullsizeUrl (from sessionStorage):' + url);
            }

            // if not stored then lookup data extracted from scripts
            if (url == undefined) {
                url = extractInitData(tbnid);
                if (url != undefined) {
                    console.log('photo fullsizeUrl (from initData):' + url);
                    sessionStorage.setItem('url_' + tbnid, url);
                } else {
                    url = extractHookedData(tbnid);
                    if (url != undefined) {
                        console.log('photo fullsizeUrl (from hookedData):' + url);
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
