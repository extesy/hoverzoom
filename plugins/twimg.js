var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Twimg.com',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="twimg.com"]',
            /_(normal|mini)/,
            ''
        );
        hoverZoom.urlReplace(res,
            'img[src*="twimg.com"]',
            /_bigger/,
            '_400x400'
        );
        $('a[aria-haspopup="false"] > div:nth-child(2)').css('pointer-events', 'none');
        callback($(res));
    }
});
