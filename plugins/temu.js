var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'temu',
    version:'0.1',
    prepareImgLinks:function (callback) {

        var rawData = null;

        var res = [];

        // sample: https://rewimg-us.kwcdn.com/review-image/1ea26c38d9/4a9d3e35-3033-4d54-9089-ab30fae2e50d_960x1280.jpeg.compressed.jpeg?imageMogr2/auto-orient%7CimageView2/2/w/100/q/70/format/webp
        //   full: https://rewimg-us.kwcdn.com/review-image/1ea26c38d9/4a9d3e35-3033-4d54-9089-ab30fae2e50d_960x1280.jpeg

        hoverZoom.urlReplace(res,
            'img[src*="imageMogr2"], img[src*="imageView2"]',
            /(.*)\?image.*/,
            '$1'
        );

        callback($(res), this.name);

        // Hook 'Open' XMLHttpRequests to catch data & metadata associated with pictures or videos displayed
        // These client/server requests are issued when user scrolls down to retrieve more data
        // Catched data is stored in sessionStorage for later use by plug-in

        if ($('script.HZTemuOpen').length == 0) { // Inject hook script in document if not already there
            var hookScript = document.createElement('script');
            hookScript.type = 'text/javascript';
            hookScript.text = `if (typeof oldXHROpen !== 'function') { // Hook only once!
                oldXHROpen = window.XMLHttpRequest.prototype.open;
                window.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
                    // catch responses
                    this.addEventListener('load', function() {
                        try {
                            let data = this.responseText;
                            // store relevant data as plain text in sessionStorage for later usage by plug-in
                            if (data.indexOf('cover_image_url') != -1) {
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
                            }
                        } catch {}
                    });
                    // Proceed with original function
                    return oldXHROpen.apply(this, arguments);
                }
            }`;
            hookScript.classList.add('HZTemuOpen');
            (document.head || document.documentElement).appendChild(hookScript);
        }

        // Extract fullsize url from window.rawData
        function extractRawData(imgId) {
            if (rawData == null) {
                if (document.scripts == undefined) return null;
                let scripts = Array.from(document.scripts);
                let goodScripts = scripts.filter(script => /window.rawData/.test(script.text));
                if (goodScripts.length != 1) return null;
                let dataFromScript = goodScripts[0].text;
                let idxJsonBegin = dataFromScript.indexOf('window.rawData');
                let idxJsonEnd = dataFromScript.indexOf('};', idxJsonBegin);
                let json2parse = dataFromScript.substring(dataFromScript.indexOf('{', idxJsonBegin), idxJsonEnd + 1);
                try {
                    rawData = JSON.parse(json2parse);
                } catch {}
            }
            const values = hoverZoom.getValuesInJsonObject(rawData, imgId, false, true, true); // look for a partial match & stop after 1st match
            if (values.length) {
                // extract object
                const o = hoverZoom.getJsonObjectFromPath(rawData, values[0].path.substring(0, values[0].path.lastIndexOf('[')));
                // if a video url is present use it, otherwise use img url
                if (o.videoUrl) return o.videoUrl;
                return values[0].value.replace(/(.*)\?image.*/, '$1');
            }
            return null;
        }

        function extractOpenData(imgId) {
            const openData = sessionStorage.getItem('HZOpenData');
            try {
                var fullssize = null;
                const o = JSON.parse(openData);
                o.every(oo => {
                    oo = JSON.parse(oo);
                    const values = hoverZoom.getValuesInJsonObject(oo, imgId, false, true, true); // look for a partial match & stop after 1st match
                    if (values.length) {
                        // extract object
                        const ooo = hoverZoom.getJsonObjectFromPath(oo, values[0].path.substring(0, values[0].path.lastIndexOf('[')));
                        if (ooo.url) {
                            fullsize = ooo.url;
                            return false;
                        }
                    }
                    return true;
                });
            } catch {}
            return fullsize;
        }

        // video
        $('img[class*=playBtn]').one('mouseover', function() {
            var link = $(this);
            const img = $(this).siblings('img')[0];
            if (!img) return;
            const src = img.src;
            const imgName = src.replace(/.*\/([^\/]{1,})\?image.*/, '$1');
            const imgId = imgName.replace(/(.*?)\..*/, '$1');
            var fullsize = extractRawData(imgId);
            if (!fullsize) fullsize = extractOpenData(imgId);
            if (!fullsize) fullsize = src.replace(/(.*)\?image.*/, '$1');
            link.data().hoverZoomSrc = [fullsize];
            link.addClass('hoverZoomLink');
            hoverZoom.displayPicFromElement(link);
        });

    }
});
