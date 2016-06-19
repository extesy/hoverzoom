var hoverZoomPlugins = hoverZoomPlugins || [];

hoverZoomPlugins.push( {
    name: 'kenmarcus',
    prepareImgLinks: function(callback) {
        var res = [];
        hoverZoom.urlReplace(res, 'a img[src*="preview"]', /preview/, 'source/image');
        callback($(res));
    }
});
