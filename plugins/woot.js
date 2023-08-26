var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'woot.com',
    version: '0.1',
    prepareImgLinks(callback) {
        const res = [];
        hoverZoom.urlReplace(res,
            'a img',
            /\._.*_\./,
            '.');

        callback($(res), this.name);
    },
});
