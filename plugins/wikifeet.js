var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Wikifeet',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src*="wikifeet"],[style*="url"]',
            'thumbs.',
            'pics.'
        );

        hoverZoom.urlReplace(res,
            'img[src*="/t"],[style*="url"]',
            /\/t(\d+)/,
            '/$1'
        );

        callback($(res), this.name);
    }
});
