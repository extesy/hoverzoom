var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Blogspot.com',
    version: '0.1',
    prepareImgLinks(callback) {
        const res = [];
        const filter = 'a img[src*=".blogspot.com"]';
        const search = /\/s\d+(-[ch])?\//;

        hoverZoom.urlReplace(res, filter, search, '/s800/');
        if (options.showHighRes) {
            hoverZoom.urlReplace(res, filter, search, '/s0/');
        }

        callback($(res));
    },
});
