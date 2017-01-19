var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'artstation.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];   
        
        hoverZoom.urlReplace(res,
            'img[src*="artstation"]',
            /(\/[^0-9]*\/\d+\/\d+\/\d+\/)(\d+\/)?(small|smaller_square|small_square|micro_square|medium|medium_wide|default)\//,
            '$1original/'
        );
        
        hoverZoom.urlReplace(res,
            'img[src*="artstation"]',
            /(\/[^0-9]*\/\d+\/\d+\/\d+\/)(\d+\/)?(small|smaller_square|small_square|micro_square|medium|medium_wide|default)\//,
            '$1large/'
        );
                
        callback($(res));
    }
});