var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Craigslist',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="images.craigslist.org"]',
            /300x300/,
            '600x450'
        );
        callback($(res));
    }
});
