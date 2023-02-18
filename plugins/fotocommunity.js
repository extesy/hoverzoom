var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'fotocommunity',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var res = [];

        //   sample: https://img.fotocommunity.com/francoisarrighi-photographe-33a7b198-46ab-4d7e-89b1-88a72893dd60.jpg?width=80&height=80
        // fullsize: https://img.fotocommunity.com/francoisarrighi-photographe-33a7b198-46ab-4d7e-89b1-88a72893dd60.jpg?width=1920
        hoverZoom.urlReplace(res,
            'img[src*="fotocommunity"], [style*="url"]',
            /\?.*/,
            '?width=1920'
        );

        callback($(res), this.name);
    }
});
