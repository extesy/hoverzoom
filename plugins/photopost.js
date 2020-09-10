var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'photopost.cz',
    version:'1.0',
    prepareImgLinks:function (callback) {
        var res = [];   
        
        hoverZoom.urlReplace(res,
            'img[src]',
            ['/small/', '/smallcube/'],
            ['/', '/']
        );

        callback($(res), this.name);
    }
});