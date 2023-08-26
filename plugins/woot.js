var hoverZoomPlugins = hoverZoomPlugins || [];
console.log("loaded woot");
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
