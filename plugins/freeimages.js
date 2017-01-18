var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'freeimages.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];   
    
        hoverZoom.urlReplace(res,
            'img[src*="freeimages"]',
            ['/large-thumbs/', '/thumbs/', '/home-grids/'],
            ['/previews/', '/previews/', '/previews/']
        );
                
        callback($(res));
    }
});