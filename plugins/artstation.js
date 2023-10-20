var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'artstation.com',
    version:'0.2',

    prepareImgLinks: function (callback) {
        const res = [];
        hoverZoom.urlReplace(res,
            'img[src]',
            /(\/[^0-9]*\/\d+\/\d+\/\d+\/)(\d+\/)?(small|smaller_square|small_square|micro_square|medium|medium_wide|default)\//,
            '$1original/',
            'a'
        );
        
        hoverZoom.urlReplace(res,
            'img[src]',
            /(\/[^0-9]*\/\d+\/\d+\/\d+\/)(\d+\/)?(small|smaller_square|small_square|micro_square|medium|medium_wide|default)\//,
            '$1large/',
            'a'
        );

        callback($(res), this.name);
    }
});
