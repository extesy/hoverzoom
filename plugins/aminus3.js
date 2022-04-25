var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'aminus3.com',
    version:'1.0',
    prepareImgLinks:function (callback) {
        var res = [];   
        
        hoverZoom.urlReplace(res,
            'img[src]',
            ['_small.', '_large.', '_thumb.', '_index.', '_burst.'],
            ['_giant.', '_giant.', '_giant.', '_giant.', '_giant.']
        );

        callback($(res), this.name);
    }
});