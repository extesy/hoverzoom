var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'stocksnap.io',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src]',
            '/280h/',
            '/960w/'
        );        
        
        callback($(res));
    }
});