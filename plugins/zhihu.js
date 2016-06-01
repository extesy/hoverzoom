var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'Zhihu',
    prepareImgLinks: function(callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="zhimg.com"]',
            /_(m|s|is)/,
            '_l'
        );
        callback($(res));
    }
});
