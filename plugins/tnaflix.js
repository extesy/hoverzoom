var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'tnaflix',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // small img:    https://img.tnaflix.com/a1:1q80w150r/pics/alpha/969085578/1468504708/1451436226.jpg
        // fullsize img: https://img.tnaflix.com/pics/alpha/969085578/1468504708/1451436226.jpg
        hoverZoom.urlReplace(res,
            'img[src*="tnaflix.com"]',
            /(^.*tnaflix.com)\/(.*)\/pics\/(.*)/,
            '$1/pics/$3',
            'a'
        );

        callback($(res), this.name);
    }
});