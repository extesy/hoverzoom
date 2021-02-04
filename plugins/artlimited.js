var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'artlimited.net',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src]',
            ['_s', '_m', '-medium-', '-small-'],
            ['', '', '-large-', '-large-']
        );
        callback($(res), this.name);
    }
});