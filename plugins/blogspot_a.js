var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Blogspot.com',
    version: '0.2',
    prepareImgLinks(callback) {
        const res = [];
        const filter_a = 'a img[src*=".blogspot.com"]';
        const filter_i = 'img[src*=".blogspot.com"]';
        const search = /\/s\d+(-[ch])?\//;

        hoverZoom.urlReplace(res, filter_a, search, '/s800/');
        hoverZoom.urlReplace(res, filter_i, search, '/s800/');
        if (options.showHighRes) {
            hoverZoom.urlReplace(res, filter_a, search, '/s0/');
            hoverZoom.urlReplace(res, filter_i, search, '/s0/');
        }

        callback($(res), this.name);
    },
});
