var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'unlimphotos',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var res = [];

        // sample:   https://thumbnails.unlimphotos.com/7/495/7495152.jpg
        // fullsize: https://thumbnails.unlimphotos.com/1600/7/495/7495152.jpg
        hoverZoom.urlReplace(res,
            'img[src]:not(img[src*="/1600/"])',
            'unlimphotos.com/',
            'unlimphotos.com/1600/',
            'a'
        );

        // sample:   https://thumbnails.unlimphotos.com/7/495/7495152.jpg
        // fullsize: https://thumbnails.unlimphotos.com/1600/7/495/7495152.jpg
        hoverZoom.urlReplace(res,
             'img[src]:not(img[src*="/1600/"])',
            'unlimphotos.com/',
            'unlimphotos.com/1600/'
        );

        callback($(res), this.name);
    }
});
