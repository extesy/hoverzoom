var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Yelp',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="photo/"]',
            /\/(?:xss|ss|s|m|ms)\./,
            '/l.'
        );
        callback($(res));
    }
});
