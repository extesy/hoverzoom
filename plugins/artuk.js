var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Art UK',
    prepareImgLinks:function (callback) {
        var res = [];
        $('div.credit').each(function () {
            $(this).css("pointer-events", "none");
        });
         hoverZoom.urlReplace(res,
            'img[src*="static.artuk.org"]',
            /w\d+(h\d+)?/,
            'w800h800'
        );
        callback($(res));
    }
});