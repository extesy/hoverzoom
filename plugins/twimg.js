var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Twimg.com',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        // Same link without "_x96" loads the large version of the profile image.
        hoverZoom.urlReplace(res,
            'img[src*="twimg.com"]',
            /_x96/,
            ''
        );
        // Links to profiles found on the main page or a Twitter list have "data-focusable=true".
        $('a[data-focusable="true"] > div:nth-child(2)').css('pointer-events', 'none');
        // Links to profiles found in the profile popup have "aria-hidden=true".
        $('a[aria-hidden="true"] > div:nth-child(2)').css('pointer-events', 'none');
        callback($(res));
    }
});
