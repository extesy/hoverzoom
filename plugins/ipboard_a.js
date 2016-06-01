var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'IP.Board',
    version:'0.1',
    prepareImgLinks:function (callback) {
        if (document.body && document.body.id != 'ipboard_body') {
            return;
        }
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="_thumb."]',
            '_thumb.',
            '.'
        );
        callback($(res));
    }
});
