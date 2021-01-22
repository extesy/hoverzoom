var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'_free-images.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];   
    
        hoverZoom.urlReplace(res,
            'img[src]',
            ['/tn/', '/sm/', '/md/', '/lg/'],
            ['/or/', '/or/', '/or/', '/or/']
        );
                
        callback($(res), this.name);
    }
});