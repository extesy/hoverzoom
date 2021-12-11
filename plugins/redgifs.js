var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'redgifs.com',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];

        $('a[href^="https://redgifs.com/"],a[href^="https://www.redgifs.com/"]').one('mouseenter', function() {
            var link = $(this),
                gfyId = this.href.replace(/.*redgifs.com\/(..\/)?(watch\/)?(detail\/)?(\w+).*/, '$4');

            $.get('https://api.redgifs.com/v1/gfycats/' + gfyId, function (data) {
                if (data && data.gfyItem) {
                    link.data().hoverZoomSrc = [options.zoomVideos ? data.gfyItem.mp4Url : data.gfyItem.gifUrl]
                    link.addClass('hoverZoomLink');
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
            let srcs = $(this).find('source[src]');
            if (srcs.length != 1) return;
            let videoUrlMobile = srcs[0].src;
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
            callback($(res), this.name);
        }
    }
});
