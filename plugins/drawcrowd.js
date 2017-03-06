var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'drawcrowd.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src]',
            ['/small/', '/medium/'],
            ['/large/', '/large/']
        );

        callback($(res));
    }
});