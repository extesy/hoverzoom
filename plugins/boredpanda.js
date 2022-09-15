var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'boredpanda',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://static.boredpanda.com/blog/wp-content/uploads/2020/05/5eb14ca75feb8__30.jpg
        // zoomed: https://static.boredpanda.com/blog/wp-content/uploads/2020/05/5eb14ca75feb8.jpg
        hoverZoom.urlReplace(res,
            'img[src]',
            /__.*\./,
            '.'
        );

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
