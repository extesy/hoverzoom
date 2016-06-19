var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'PosterRevolution',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(
            res,
            'a img[src*="pix.posterrevolution.com/pr/"], a img[src*="pixcdn.posterrevolution.com/pr/"]',
            /(\d+)(t\.jpg)/i,
            '$1f.jpg'
        );
        callback($(res));
    }
});
