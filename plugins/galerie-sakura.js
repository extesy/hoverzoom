var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'galerie-sakura.com',
    version:'1.1',
    prepareImgLinks:function (callback) {
        var res = [];   
        
        hoverZoom.urlReplace(res,
            'img[src]',
            ['-md.', '-sm.'],
            ['-lg.', '-lg.']
        );

        callback($(res), this.name);
    }
});