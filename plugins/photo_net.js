var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'photo.net',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];   
    
        hoverZoom.urlReplace(res,
            'img[src*="photo.net"]',
            ['thumbs.', '-sm', '-md'],
            ['gallery.', '-lg', '-lg']
        );
        callback($(res));
    }
});