var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'celebs-place',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var res = [];

        // sample:   https://celebs-place.com/cache/gallery/50cent/art_of_elysium_red_c-47-gthumb-ghdata240.jpg
        // fullsize: https://celebs-place.com/gallery/50cent/art_of_elysium_red_c-47.jpg
        hoverZoom.urlReplace(res,
            'img[src*="cache"]',
            /\/cache\/(.*)-gthumb.*/,
            '/$1.jpg'
        );

        callback($(res), this.name);
    }
});
