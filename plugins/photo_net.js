var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'photo.net',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src]',
            ['thumbs.', '-sm', '-md', '-lg'],
            ['gallery.', '-orig', '-orig', '-orig']
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /\?.*$/,
            ''
        );

        callback($(res), this.name);
    }
});