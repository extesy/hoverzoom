var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Yahoo',
    version:'1.3',
    prepareImgLinks:function (callback) {

        var res = [];

        var initData = '';
        const hzOpenDataJson = sessionStorage.getItem('HZOpenData') || '[]';
        var hzOpenData;
        try {
            hzOpenData = JSON.parse(hzOpenDataJson);
        } catch {}

        // Hook 'Open' XMLHttpRequests to catch data & metadata associated with pictures or videos displayed
        // These client/server requests are issued when user scrolls down to retrieve more data
        // Catched data is stored in sessionStorage for later use by plug-in

        // Open
        if ($('script.hoverZoomOpen').length == 0) { // Inject hook script in document if not already there
            var openScript = document.createElement('script');
            openScript.type = 'text/javascript';
            openScript.text = `if (typeof origXHROpen !== 'function') { // Hook only once!
                origXHROpen = window.XMLHttpRequest.prototype.open;
                window.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
                    // catch responses
                    this.addEventListener('load', function() {
                        try {
                            let data = this.responseText;
                            if (data.indexOf('{"html":') != -1) {
                                // update sessionStorage
                                let storedHookedDataJson = sessionStorage.getItem('HZOpenData') || '[]';
                                let storedHookedData = JSON.parse(storedHookedDataJson);
                                // make some room by removing oldest data
                                while (storedHookedDataJson.length > 1000000) {
                                    storedHookedData.pop();
                                    storedHookedDataJson = JSON.stringify(storedHookedData);
                                }
                                storedHookedData.unshift(data);
                                // store response in sessionStorage for later use by plug-in
                                sessionStorage.setItem('HZOpenData', JSON.stringify(storedHookedData));
                                triggerHZ();
                            }
                        } catch {}
                    });
                    // Proceed with original function
                    return origXHROpen.apply(this, arguments);
                }
            }`;
            openScript.classList.add('hoverZoomOpen');
            (document.head || document.documentElement).appendChild(openScript);
        }

        // Add & remove empty <a> element to/from DOM to trigger HoverZoom, so data stored in sessionStorage can be used
        if ($('script.hoverZoomTrigger').length == 0) { // Inject hook script in document if not already there
            var triggerScript = document.createElement('script');
            triggerScript.type = 'text/javascript';
            triggerScript.text = `
                function triggerHZ() {
                    let fakeA = document.createElement('a');
                    (document.head || document.documentElement).appendChild(fakeA);
                    (document.head || document.documentElement).removeChild(fakeA);
                }
            `;
            triggerScript.classList.add('hoverZoomTrigger');
            (document.head || document.documentElement).appendChild(triggerScript);
        }

        // get init data (before user first scroll)
        chrome.runtime.sendMessage({action:'ajaxRequest',
                                    method:'GET',
                                    url:window.location.href},
                                    function (response) {
                                        initData = response;
                                        $('img[src*="/th?id="]').each(function() {

                                            const link = $(this);
                                            let src = this.src;
                                            let fullsize;
                                            src = decodeURIComponent(src);
                                            // sample: https://tse1.mm.bing.net/th?id=OIP.n2TMZMmSB9xZkLzohW3u5gHaLI&pid=Api&P=0
                                            //  => id: OIP.n2TMZMmSB9xZkLzohW3u5gHaLI
                                            const re = /.*\/th\?id=([^&]{1,})/
                                            const m = src.match(re);
                                            const id = m[1];
                                            fullsize = findFullsizeUrl(id, initData);
                                            if (fullsize) {
                                                link.data().hoverZoomSrc = [fullsize.replace(/\\/g, '')];
                                                res.push(link);
                                            } else if (hzOpenData) {
                                                hzOpenData.find(data => {
                                                    fullsize = findFullsizeUrl(id, data);
                                                    if (fullsize) return true;
                                                });
                                                if (fullsize) {
                                                    link.data().hoverZoomSrc = [fullsize.replace(/\\/g, '').replace(/"/g, '')];
                                                    res.push(link);
                                                }
                                            }

                                        });
                                    });

        // search "id" in data and return associated "ourl" or "iurl" value
        // sample:
        // data='{..."iurl":"https:\/\/pbs.twimg.com\/media\/Cs6_TuxUkAAmvx-.jpg","sigi":"hcM8a0GED5BD","ourl":"https:\/\/pbs.twimg.com\/media\/Cs6_TuxUkAAmvx-.jpg","ith":"https:\/\/tse4.mm.bing.net\/th?id=OIP.IgVIbT-lr0NE3TIMIa-QoAHaLH\u0026pid=Api\u0026P=0\u0026w=300\u0026h=300"...}'
        //      id: OIP.IgVIbT-lr0NE3TIMIa-QoAHaLH
        // => ourl: https://pbs.twimg.com/media/Cs6_TuxUkAAmvx-.jpg
        function findFullsizeUrl(id, data) {
            let url;
            const idIdx = data.indexOf(id);
            if (idIdx != -1) {
                const ourlIdx = data.lastIndexOf('ourl', idIdx);
                if (ourlIdx != -1) {
                    urlIdx = ourlIdx + 4 + 2;
                    url = data.substring(urlIdx + 1, data.indexOf('",', urlIdx));
                } else {
                    const iurlIdx = data.lastIndexOf('iurl', idIdx);
                    if (iurlIdx != -1) {
                        urlIdx = iurlIdx + 4 + 2;
                        url = data.substring(urlIdx + 1, data.indexOf('",', urlIdx));
                    }
                }
            }
            return url;
        }

        hoverZoom.urlReplace(res,
            'img[src*="/http"]',
            [/.*\/(http.*)(\.cf\..*)/, /.*\/(http.*)(?!(\.cf\..*))/],
            ['$1', '$1']
        );

        $('a[href*=imgurl]').each(function() {

            var fullsizeUrl = this.href.replace(/(.*)imgurl=(.*?)&(.*)/i, '$2');
            if (! fullsizeUrl.startsWith('http')) fullsizeUrl = "https://" + fullsizeUrl;

            try {
                fullsizeUrl = decodeURIComponent(fullsizeUrl);
                var link = $(this);
                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    res.push(link);
                }
                // patch Bing's results
                var imgChild = $(this).find('img')[0];
                if (imgChild != undefined) {
                    $(imgChild).data().hoverZoomSrc = [fullsizeUrl];
                }

            } catch(e) {}
        });

        $('[style*=url]').each(function() {
            let link = $(this);
            // extract url from style
            let backgroundImage = this.style.backgroundImage;
            let reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            let backgroundImageUrl = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");
            let fullsizeUrl = backgroundImageUrl.replace(/.*\/(http.*)/, '$1').replace(/\.cf\..*/, '');
            if (fullsizeUrl != backgroundImageUrl) {

                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    res.push(link);
                }
            }
        });

        $('a[href*="rurl="]').each(function () {
            var link = $(this),
                href = this.getAttribute('href');

            imgUrlIndex = href.indexOf('rurl=');
            href = href.substring(imgUrlIndex + 5, href.indexOf('&', imgUrlIndex));
            link.data().href = unescape(href);
            res.push(link);
        });

        callback($(res), this.name);
    }
});
