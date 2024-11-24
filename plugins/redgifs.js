var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'redgifs.com',
    version:'0.4',
    prepareImgLinks:function (callback) {
        var self = this;
        var res = [];
        var name = this.name;
        var apiUrl = 'https://api.redgifs.com/v2';

        if (!self.redgifsToken) {
            $.get(`${apiUrl}/auth/temporary`, function(data) {
                if (data && data.token) {
                    self.redgifsToken = data.token;
                }
            });
        }

        $('a[href*="redgifs.com/"]').one('mouseenter', function () {
            const link = $(this);
            const gfyId = this.href.replace(/.*redgifs.com\/(..\/)?(\w+\/)?(\w+)(?:\.\w+)?/, '$3');

            chrome.runtime.sendMessage({
                action: 'ajaxGet',
                url: `${apiUrl}/gifs/${gfyId}`,
                headers: [{
                    header: 'Authorization',
                    value: `Bearer ${self.redgifsToken}`,
                }],
            }, (response) => {
                let data;

                try {
                    data = JSON.parse(response);
                } catch (e) {
                    return;
                }

                if (data && data.gif) {
                    link.data().hoverZoomSrc = [options.zoomVideos ? data.gif.urls.hd : data.gif.urls.gif];
                    callback(link, name);
                    hoverZoom.displayPicFromElement(link);
                }
            });
        });

        // sample:   https://thumbs2.redgifs.com/StickySereneMoray-small.jpg
        // fullsize: https://thumbs2.redgifs.com/StickySereneMoray-large.jpg
        hoverZoom.urlReplace(res,
            'img[src]',
            /-(small|medium)/,
            '-large'
        );

        // mobile version:   https://thumbs2.redgifs.com/CookedUprightAfricanparadiseflycatcher-mobile.mp4
        // best quality version: https://thumbs2.redgifs.com/CookedUprightAfricanparadiseflycatcher.mp4
        $('video:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function() {
            let link = $(this);
            let src = this.src;
            if (src == "") {
                let srcs = $(this).find('source[src]');
                if (srcs.length != 1) return;
                src = srcs[0].src;
            }
            let videoUrlMobile = src;
            let videoUrlBestQuality = videoUrlMobile.replace('-mobile', '');
            let videoUrl = videoUrlMobile + '.video';
            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(videoUrl) == -1) {
                link.data().hoverZoomSrc.unshift(videoUrl);
            }
            videoUrl = videoUrlBestQuality + '.video';
            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(videoUrl) == -1) {
                link.data().hoverZoomSrc.unshift(videoUrl);
            }
            callback(link, name);
            hoverZoom.displayPicFromElement(link);
        });

        if (res.length) {
            callback($(res), name);
        }
    }
});
