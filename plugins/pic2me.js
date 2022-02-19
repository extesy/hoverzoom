var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'pic2me',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var res = [];

        // sample:   https://storge.pic2.me/w/280x175/593/55dcdfc79cc19.webp
        // fullsize: https://storge.pic2.me/upload/593/55dcdfc79cc19.jpg
        hoverZoom.urlReplace(res,
            'img[src*="pic2.me"]',
            /\/.\/\d+x\d+\/(.*)\.(.*)/,
            '/upload/$1.jpg'
        );

        callback($(res), this.name);
    }
});
