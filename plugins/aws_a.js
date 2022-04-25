var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'AWS_a',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src*="s3.amazonaws.com"],[style*="s3.amazonaws.com"]',
            /\?(crop|resize|fill).*/,
            ''
        );

        callback($(res), this.name);
    }
});