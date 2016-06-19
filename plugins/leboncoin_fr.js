var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Le bon coin',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="thumbs"], span.thumbs',
            'thumbs',
            'images'
        );
        callback($(res));
    }
});
