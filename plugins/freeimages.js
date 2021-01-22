var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'_freeimages.com',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];   
    
        hoverZoom.urlReplace(res,
            'img[src]',
            ['/small-thumbs/', '/thumbs/', '/large-thumbs/', '/home-grids/', '/small-previews/', '/previews/'],
            ['/large-previews/', '/large-previews/', '/large-previews/', '/large-previews/', '/large-previews/']
        );
                
        callback($(res), this.name);
    }
});