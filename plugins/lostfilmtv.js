var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'lostfilm.tv',
    version:'2.0',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src]',
            ['/t_', '/m_'],
            ['/', '/']
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            ['/icon.jpg', '/image.jpg'],
            ['/poster.jpg', '/poster.jpg']
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/t(\d+)/,
            '/m$1'
        );

        callback($(res), this.name);
    }
});
