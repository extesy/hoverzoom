var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'wookmark.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="wookmark.com"]',
            [/images\d+\.wookmark/, /profile\/\d+\//],
            ['images.wookmark', 'profile/']
        );        
        
        callback($(res));
    }
});