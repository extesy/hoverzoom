var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Yandex',
    version:'1.2',
    prepareImgLinks:function (callback) {
        var res = [];

        // Hook Yandex 'Open' XMLHttpRequests to catch data & metadata associated with videos
        // Catched data is stored in sessionStorage for later use by plug-in
        if ($('script.HZYandexOpen').length == 0) { // Inject hook script in document if not already there
            var sendScript = document.createElement('script');
            sendScript.type = 'text/javascript';
            sendScript.text = `if (typeof origXHROpen !== 'function') { // Hook only once!
                origXHROpen = window.XMLHttpRequest.prototype.open;
                window.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
                    // catch responses
                    this.addEventListener('load', function() {
                        try {
                            if (this.responseText.indexOf('"rld"') == -1) return; // no relevant data in response

                            // store response in sessionStorage for later usage by plug-in
                            let storedHookedData = sessionStorage.getItem('hookedData') || '[]';
                            storedHookedData = JSON.parse(storedHookedData);

                            // store 20 responses max, remove oldest ones if needed
                            storedHookedData = storedHookedData.slice(storedHookedData.length - 20);

                            // avoid duplicates
                            if (storedHookedData.find(s => s == this.responseText) != undefined) return;
                            storedHookedData.push(this.responseText);
                            sessionStorage.setItem('hookedData', JSON.stringify(storedHookedData));

                            // Add & remove empty <a> element to/from DOM to trigger HoverZoom,
                            // so data & metadata just added to DOM in <script> element can be exploited
                            let fakeA = document.createElement('a');
                            (document.head || document.documentElement).appendChild(fakeA);
                            (document.head || document.documentElement).removeChild(fakeA);
                        } catch {}
                    });
                    // proceed with original open function
                    return origXHROpen.apply(this, arguments);
                }
            }`;
            sendScript.classList.add('HZYandexOpen');
            (document.head || document.documentElement).appendChild(sendScript);
        }

        hoverZoom.urlReplace(res,
            'a.z-images__wraplink[href*="img_url="]',
            /.*img_url=([^&]*)(.*)/,
            '$1'
        );

        hoverZoom.urlReplace(res,
            'a img[src*="size="]',
            /[\?&]size=\d+/,
            ''
        );

        hoverZoom.urlReplace(res,
            'img[src*="resize.yandex."]',
            /.*url=([^&]*?).*/,
            '$1',
            'dt'
        );

        $('[onclick*="fitSize"]').each(function() {
            var url = this.getAttribute('onclick');
            if (url = url.match(/fitSize.*?url":"([^"]*)/)) {
                if (url = url[1]) {
                    var link = $(this).find('img');
                    link.data().hoverZoomSrc = [url];
                    res.push(link);
                }
            }
        });

        // store data-bems found in page
        var bems = [];
        $('[data-bem]').each(function() {
            let bem = this.dataset.bem;
            try {
                let o = JSON.parse(bem);
                if (o["serp-item"]) bems.push(o["serp-item"]);;
            } catch {}
        });

        function findBestUrl(item, link) {
            let all = [];
            let preview = item["preview"];
            if (preview != undefined) { preview.forEach(function(t) { all.push(t)}) }
            let dups = item["dups"];
            if (dups != undefined) { dups.forEach(function(t) { all.push(t)}) }
            all.sort(function(a,b) { return b.fileSizeInBytes - a.fileSizeInBytes });
            //select url with biggest filesize
            if (all[0] == undefined) return;
            url = all[0].url;
            link.data().hoverZoomSrc = [url];
            res.push(link);
        }

        $('img').each(function() {
            let link = $(this);
            p = $(this).parents('div[data-bem]')[0];
            if (p != undefined) {
                bem = p.dataset.bem;
                if (bem != undefined) {
                    o = JSON.parse(bem);
                    item = o["serp-item"];
                    if (item != undefined) {
                        findBestUrl(item, link);
                    }
                }
            } else {
                let src = this.src;
                let re = /\/i\?id=(.*?)-/; // sample: https://avatars.mds.yandex.net/i?id=4abd8e4037cb29f4381768a9888109dc-5887708-images-thumbs&n=13&exp=1
                var m = src.match(re);
                if (m == undefined) return;
                let tid = m[1];
                let storedHookedData = sessionStorage.getItem('hookedData') || '[]';
                try {
                    storedHookedData = JSON.parse(storedHookedData);
                    let tidData = storedHookedData.find(s => s.indexOf(tid) != -1);
                    if (tidData) {
                        let j = JSON.parse(tidData);
                        // search tid to find associated fullsize urls
                        let values = hoverZoom.getValuesInJsonObject(j, tid, false, false, true); // look for a full match & stop after 1st match
                        if (values.length == 0) {
                            return;
                        }
                        let o = hoverZoom.getJsonObjectFromPath(j, values[0].path.substring(0, values[0].path.lastIndexOf('[')));
                        let fullsize = o.s.sort(i => i.ih)[0].iu
                        link.data().hoverZoomSrc = [fullsize];
                        res.push(link);
                    }
                } catch {}
            }
        });

        // get-yapic
        // sample : https://avatars.mds.yandex.net/get-yapic/39803/enc-9e2a4aabfacf3d4ec7c780bce466a5e76f0819a1d43f4c2ae68c49e17d896dad/islands-middle
        //       -> https://avatars.mds.yandex.net/get-yapic/39803/enc-9e2a4aabfacf3d4ec7c780bce466a5e76f0819a1d43f4c2ae68c49e17d896dad/orig
        var regex1 = /(.*)\/.*/;
        var patch1 = '$1/orig';

        hoverZoom.urlReplace(res,
            'img[src*="avatars.mds.yandex.net/get-yapic"]',
            regex1,
            patch1
        );

        $('[style*=url]').each(function() {
            let link = $(this);
            // extract url from style
            let backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf("url") == -1) return;
            if (backgroundImage.indexOf("avatars.mds.yandex.net/get-yapic") == -1) return;

            let reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            let backgroundImageUrl = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");
            let fullsizeUrl = backgroundImageUrl.replace(regex1, patch1);
            if (fullsizeUrl != backgroundImageUrl) {

                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    res.push(link);
                }
            }
        });

        // thumbs
        // sample: https://avatars.mds.yandex.net/i?id=1527cbfcd21a5b5ebc673a71522e8d54-5482341-images-thumbs&n=13&exp=1
        $('[style*=url]').each(function() {
            let link = $(this);
            // extract url from style
            let backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf("url") == -1) return;
            if (backgroundImage.indexOf("avatars.mds.yandex.net/get-yapic") != -1) return;

            let reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            let backgroundImageUrl = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");
            let bem = bems.find(b => b["thumb"].url == backgroundImageUrl);
            if (bem) findBestUrl(bem, link);
        });

        callback($(res), this.name);
    }
});