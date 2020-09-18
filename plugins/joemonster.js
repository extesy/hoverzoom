var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'joemonster',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];

        hoverZoom.urlReplace(res,
            'img[src]',
            ['/thumb_', '/s_', '30.', '60.'],
            ['/', '/l_', '-full.', '-full.']
        );

        callback($(res), this.name);
    }
});
