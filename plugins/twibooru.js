var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'twibooru',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // use data-uris attribute when available
        $('[data-uris]').each(function () {
            var _this = $(this);
            var fullsrc = _this.data().uris.full;
            if (fullsrc == undefined) return;
            var img = _this.find('img');
            if (img.data().hoverZoomSrc == undefined) img.data().hoverZoomSrc = [fullsrc];
            else if (img.data().hoverZoomSrc.indexOf(fullsrc) == -1) img.data().hoverZoomSrc.unshift(fullsrc);
            res.push(img);
        });

        /*
        // sample:   https://cdn.twibooru.org/img/2021/8/4/2516087/thumb.webp
        // original: https://cdn.twibooru.org/img/2021/8/4/2516087/full.png
        hoverZoom.urlReplace(res,
            'img[src]',
            /\/(thumb_tiny|thumb_small|thumb|small|medium|large|tall)(\.)(jpeg|png|webp)/,
            '/full.png'
        );
        hoverZoom.urlReplace(res,
            'img[src]',
            /\/(thumb_tiny|thumb_small|thumb|small|medium|large|tall)(\.)(jpeg|png|webp)/,
            '/full.jpeg'
        );

        // sample:   https://cdn.twibooru.org/img/2021/7/18/2503661/thumb.gif
        // original: https://cdn.twibooru.org/img/2021/7/18/2503661/full.webm
        hoverZoom.urlReplace(res,
            'img[src]',
            /\/(thumb_tiny|thumb_small|thumb|small|medium|large|tall)(\.)(gif|webm)/,
            '/full.gif'
        );
        hoverZoom.urlReplace(res,
            'img[src]',
            /\/(thumb_tiny|thumb_small|thumb|small|medium|large|tall)(\.)(gif|webm)/,
            '/full.webm'
        );
        */

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
