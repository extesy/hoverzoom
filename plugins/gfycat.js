var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'gfycat.com',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];

        $('a[href*="gfycat.com/"]').one('mouseenter', function() {
            var link = $(this),
                gfyId = this.href.replace(/.*gfycat.com\/(..\/)?(gifs\/)?(detail\/)?(\w+).*/, '$4');
                $.get('https://api.gfycat.com/v1/gfycats/' + gfyId, function (data) {
                    if (data && data.gfyItem) {
                        link.data().hoverZoomSrc = [options.zoomVideos ? data.gfyItem.webmUrl : data.gfyItem.gifUrl]
                        link.addClass('hoverZoomLink');
                        hoverZoom.displayPicFromElement(link);
                    }
                }).fail(function() {
                    $.get('https://api.redgifs.com/v1/gfycats/' + gfyId, function (data) {
                        if (data && data.gfyItem) {
                            link.data().hoverZoomSrc = [options.zoomVideos ? data.gfyItem.webmUrl : data.gfyItem.gifUrl]
                            link.addClass('hoverZoomLink');
                            hoverZoom.displayPicFromElement(link);
                        }
                    })
                });
        });

        // sample:   https://thumbs.gfycat.com/BronzePiercingCrownofthornsstarfish-mobile.jpg
        // fullsize: https://zippy.gfycat.com/BronzePiercingCrownofthornsstarfish.mp4
        hoverZoom.urlReplace(res,
            'a img[src*="thumbs"]',
            /https:\/\/thumbs\.gfycat\.com\/([^.-]{1,}).*/,
            'https://zippy.gfycat.com/$1.mp4',
            'a'
        );

        // sample:   https://thumbs.gfycat.com/AstonishingThatGrizzlybear-mobile.jpg
        // fullsize: https://fat.gfycat.com/AstonishingThatGrizzlybear.mp4
        hoverZoom.urlReplace(res,
            'a img[src*="thumbs"]',
            /https:\/\/thumbs\.gfycat\.com\/([^.-]{1,}).*/,
            'https://fat.gfycat.com/$1.mp4',
            'a'
        );

        // sample:   https://thumbs.gfycat.com/VagueSingleGermanwirehairedpointer-mobile.jpg
        // fullsize: https://giant.gfycat.com/VagueSingleGermanwirehairedpointer.mp4
        hoverZoom.urlReplace(res,
            'a img[src*="thumbs"]',
            /https:\/\/thumbs\.gfycat\.com\/([^.-]{1,}).*/,
            'https://giant.gfycat.com/$1.mp4',
            'a'
        );

        callback($(res), this.name);
    }
});
