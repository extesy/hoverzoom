var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'catawiki',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample:   https://cdn.catawiki.net/image/pr:cw_crop/w:98/h:76/sh:0.7/plain/assets/catawiki/assets/2021/5/15/6/9/6/696de2d5-5a9b-4a3d-9639-e878b25d418f.jpg
        // original: https://assets.catawiki.nl/assets/2021/5/15/6/9/6/696de2d5-5a9b-4a3d-9639-e878b25d418f.jpg
        hoverZoom.urlReplace(res,
            'img[src],[style*="url"]',
            /(.*catawiki\/assets\/)(.*$)/,
            'https://assets.catawiki.nl/assets/$2'
        );

        // sample:   https://assets.catawiki.nl/assets/2021/8/15/c/8/8/thumb5_c88fbb66-7096-4612-9756-1f6a7f935581.jpg
        // original: https://assets.catawiki.nl/assets/2021/8/15/c/8/8/c88fbb66-7096-4612-9756-1f6a7f935581.jpg
        hoverZoom.urlReplace(res,
            'img[src],[style*="url"]',
            /\/thumb.*?_/,
            '/'
        );

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
