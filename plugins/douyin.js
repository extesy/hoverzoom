var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'douyin',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var name = this.name;

        // Hook Douyin 'Open' XMLHttpRequests to catch data & metadata associated with videos
        // Catched data is stored in sessionStorage for later use by plug-in
        if ($('script.HZDouyinOpen').length == 0) { // Inject hook script in document if not already there
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
                            if (data.indexOf('cover') != -1) {
                                var HZDouyinOpenData = sessionStorage.getItem('HZDouyinOpenData') || '[]';
                                HZDouyinOpenData = JSON.parse(HZDouyinOpenData);
                                const j = JSON.parse(data);
                                HZDouyinOpenData.push(j);
                                // update sessionStorage, if no more room then reset
                                try {
                                    sessionStorage.setItem('HZDouyinOpenData', JSON.stringify(HZDouyinOpenData));
                                } catch {
                                    // reset sessionStorage
                                    HZDouyinOpenData = [];
                                    HZDouyinOpenData.push(j);
                                    sessionStorage.setItem('HZDouyinOpenData', JSON.stringify(HZDouyinOpenData));
                                }
                            }
                        } catch {}
                    });
                    // Proceed with original function
                    return oldXHROpen.apply(this, arguments);
                }
            }`;
            hookScript.classList.add('HZDouyinOpen');
            (document.head || document.documentElement).appendChild(hookScript);
        }

        // cover sample: https://p9-pc-sign.douyinpic.com/tos-cn-i-0813c001/8713aa6e959b4efbb7f862b1fab649b1~tplv-dy-cropcenter:323:430.jpeg?biz_tag=pcweb_cover&from=3213915784&s=PackSourceEnum_PUBLISH&sc=cover&se=true&sh=323_430&x-expires=1681236000&x-signature=uJOrtsKtenxvsMLqJj5Agtolwt4%3D
        //  => cover id: 8713aa6e959b4efbb7f862b1fab649b1

        // highlighted videos & lives
        $('img[src*="~tplv"]').on('mouseover', function() {  
            const src = this.src;
            const link = $(this);

            const re = /([^\/]{1,})~/;   // cover id (e.g. 8713aa6e959b4efbb7f862b1fab649b1)
            const m = src.match(re);
            if (m == undefined) return;
            const coverId = m[1];

            // search through scripts
            $(document.querySelectorAll('script[type="application/json"]')).each(function() {
                if (this == undefined) return true;
                const scriptData = unescape(this.text);
                try {
                    const j = JSON.parse(scriptData);
                    // find cover id among videos & lives
                    const values = hoverZoom.getValuesInJsonObject(j, coverId, false, true, true); // look for a partial match & stop after 1st match
                    if (values.length == 0) return true;
                    // video
                    var value = values.filter(v => v.path.indexOf('["video"]') != -1);
                    if (value.length) {
                        // build path to parent object
                        const path = value[0].path.split('["video"]')[0] + '["video"]';
                        // get video
                        var video = hoverZoom.getJsonObjectFromPath(j, path).play_addr.url_list[0];
                        video = video.replace('http:', 'https:') + '.video';
                        link.data().hoverZoomDouyinVideoUrl = video;
                        link.data().hoverZoomSrc = [video];
                        callback(link, name);
                        hoverZoom.displayPicFromElement(link);
                        return false; // stop searching through scripts
                    }
                    // live
                    value = values.filter(v => v.path.indexOf('["room"]') != -1);
                    if (value.length) {
                        // build path to parent object
                        const path = value[0].path.split('["room"]')[0] + '["room"]';
                        // get m3u8
                        var m3u8 = hoverZoom.getJsonObjectFromPath(j, path).stream_url.hls_pull_url;
                        m3u8 = m3u8.replace('http:', 'https:');
                        link.data().hoverZoomDouyinLiveUrl = m3u8;
                        link.data().hoverZoomSrc = [m3u8];
                        callback(link, name);
                        hoverZoom.displayPicFromElement(link);
                        return false; // stop searching through scripts
                    }
                } catch {}
            });

            if (link.data().hoverZoomDouyinVideoUrl) return;

            // search through sessionStorage
            var HZDouyinOpenData = sessionStorage.getItem('HZDouyinOpenData') || '[]';
            HZDouyinOpenData = JSON.parse(HZDouyinOpenData);
            const j = HZDouyinOpenData.filter(d => JSON.stringify(d).indexOf(coverId) != -1)[0];
            if (j == undefined) return; // cover id not found in sessionStorage
            // find cover id among videos & lives
            const values = hoverZoom.getValuesInJsonObject(j, coverId, false, true, true); // look for a partial match & stop after 1st match
            if (values.length == 0) return;
            // video
            var value = values.filter(v => v.path.indexOf('["video"]') != -1);
            if (value.length) {
                // build path to parent object
                const path = value[0].path.split('["video"]')[0] + '["video"]';
                // get video
                var video = hoverZoom.getJsonObjectFromPath(j, path).play_addr.url_list[0];
                video = video.replace('http:', 'https:') + '.video';
                link.data().hoverZoomDouyinVideoUrl = video;
                link.data().hoverZoomSrc = [video];
                callback(link, name);
                hoverZoom.displayPicFromElement(link);
                return;
            }
            // live
            value = values.filter(v => v.path.indexOf('["room"]') != -1);
            if (value.length) {
                // build path to parent object
                const path = value[0].path.split('["room"]')[0] + '["room"]';
                // get m3u8
                var m3u8 = hoverZoom.getJsonObjectFromPath(j, path).stream_url.hls_pull_url;
                m3u8 = m3u8.replace('http:', 'https:');
                link.data().hoverZoomDouyinLiveUrl = m3u8;
                link.data().hoverZoomSrc = [m3u8];
                callback(link, name);
                hoverZoom.displayPicFromElement(link);
                return;
            }
        });
    }
});
