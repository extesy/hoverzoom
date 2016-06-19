var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'Weibo',
    version: '0.1',
    prepareImgLinks: function(callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="sinaimg.cn/thumbnail/"]',
            /thumbnail\/([0-9a-z]+)\.jpg/,
            'large/$1.jpg'
        );
        hoverZoom.urlReplace(res,
            'img[src*="sinaimg.cn"]',
            /50/,
            '180'
        );
        hoverZoom.urlReplace(res,
            'img[src*="thumbnail"]',
            /thumbnail/,
            'bmiddle'
        );
        callback($(res));
    }
});
