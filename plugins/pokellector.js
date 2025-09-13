var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'pokellector',
    version: '1.0',
    prepareImgLinks: function(callback) {
        const pluginName = this.name;
        var res = [];

        // https://www.pokellector.com/

        // sample:   https://den-cards.pokellector.com/422/Grafaiai.MEG.92.59166.thumb.png
        // fullsize: https://den-cards.pokellector.com/422/Grafaiai.MEG.92.59166.png
        hoverZoom.urlReplace(res,
            'img[src*="pokellector.com"]',
            /\.thumb\./,
            '.'
        );

        callback($(res), pluginName);
    }
});
