var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'ecranlarge',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var res = [];

        //   sample: https://www.ecranlarge.com/media/cache/637x637/uploads/image/001/462/la-compagnie-rouge-photo-1462200.jpg
        // fullsize: https://www.ecranlarge.com/uploads/image/001/462/la-compagnie-rouge-photo-1462200.jpg
        hoverZoom.urlReplace(res,
            'img[src*="ecranlarge"], [style*="url"]',
            /\/media\/cache\/.*?\//,
            '/'
        );

        callback($(res), this.name);
    }
});
