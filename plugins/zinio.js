var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Zinio',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(
            res,
            'a img[src*="http://imgs.zinio.com/magimages"], a img[src*="zinio.com/img?"]',
            /(_|size=)(\d{3})((.jpg)?)/i,
            '$1370$3'
        );

        hoverZoom.urlReplace(
            res,
            'img[src*="zinio"]',
            /\?.*/,
            ''
        );

        callback($(res), this.name);
    }
});
