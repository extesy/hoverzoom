var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'Tipeee',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var res = [];

        // sample:   https://www.tipeeestream.com/cdn-cgi/image/onerror=redirect,width=400,height=400,fit=cover/https://api.tipeee.com/uploads/media/image/png/20211019/20211019616f1c0af1baf.png
        // fullsize: https://api.tipeee.com/uploads/media/image/png/20211019/20211019616f1c0af1baf.png
        hoverZoom.urlReplace(res,
            'img[src],[style*="url"]',
            /.*\/(http.*)/,
            '$1'
        );

        callback($(res), this.name);
    }
});
