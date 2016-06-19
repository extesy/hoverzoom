var hoverZoomPlugins = hoverZoomPlugins || [];

hoverZoomPlugins.push( {
    name: 'intersecinteractive',
    prepareImgLinks: function(callback) {
        var res = [];
        hoverZoom.urlReplace(res, 'a img[src*="images"]', /\/(\d+)\.jpg/, '/images/$1.jpg');
        hoverZoom.urlReplace(res, 'a img[src*="images"]', /\/poster_thumbnail\.jpg/, '/poster.jpg');
        callback($(res));
    }
});
