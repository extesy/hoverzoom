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
        $('div.css-1dbjc4n.r-1twgtwe.r-sdzlij.r-rs99b7.r-1p0dtai.r-1mi75qu.r-1d2f490.r-u8s1d.r-zchlnj.r-ipm5af').css('pointer-events', 'none');
        callback($(res));
    }
});
