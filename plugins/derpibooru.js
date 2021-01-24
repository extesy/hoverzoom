var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'derpibooru.org',
    version:'1.1',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src]',
            ['/small.', '/thumb.', '/thumb_tiny.'],
            ['/large.', '/large.', '/large.']
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            ['/small.', '/thumb.', '/thumb_tiny.'],
            ['/full.', '/full.', '/full.']
        );

        callback($(res), this.name);
    }
});