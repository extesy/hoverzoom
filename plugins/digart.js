var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'DigArt',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="digart.img.digart.pl"]',
            /(miniaturki|SQmin)(\d+)/,
            'download'
        );
        callback($(res));
    }
});