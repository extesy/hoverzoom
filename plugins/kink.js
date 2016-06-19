var hoverZoomPlugins = hoverZoomPlugins || [];

hoverZoomPlugins.push( {
    name: 'kink',
    prepareImgLinks: function(callback) {
        var res = [];
        hoverZoom.urlReplace(res, 'a img[src*="imagedb"]', /\/i\/h\/\d+/, '/i/h/830');
        callback($(res));
    }
});
