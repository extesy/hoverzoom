var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'media-amazon.com',
    version:'1.0',
    prepareImgLinks:function (callback) {
        var res = [];

        // Sample: https://m.media-amazon.com/images/I/817lsQFcS2L._SL1500_.jpg
        //      -> https://m.media-amazon.com/images/I/817lsQFcS2L.jpg

        $('img[src*="media-amazon.com/images"]').each(function () {
            const src = this.src;
            const fullsizeUrl = src.replace(/\._.*_\.(jpg)$/, '.$1');

            if (fullsizeUrl !== src) {
                var link = $(this);
                link.data().hoverZoomSrc = [fullsizeUrl, fullsizeUrl.replace(/jpg$/, 'jpeg')];
                res.push(link);
            }
        });

        callback($(res), this.name);
    }
});
