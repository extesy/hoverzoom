var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'bakashots.me',
    version:'1.0',
    prepareImgLinks:function (callback) {
        var res = [];   
        
        hoverZoom.urlReplace(res,
            'img[src]',
            '.lth',
            ''
        );

        callback($(res));
    }
});