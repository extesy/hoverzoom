var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'shirt.woot.com',
    version: '0.1',
    prepareImgLinks(callback) {
        const res = [];
        hoverZoom.urlReplace(res,
            'a img',
            '._SX240_.',
            '.');

        callback($(res), this.name);
    },
});
