var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Plurk',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="avatars.plurk.com"]',
            [/(small|medium)/, '.gif'],
            ['big', '.jpg']
        );
        callback($(res));
    }
});
