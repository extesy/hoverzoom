var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Art UK',
    version:'2.0',
    favicon:'artuk.png',
    prepareImgLinks:function (callback) {

        var res = [];

        $('div.credit').each(function () {
            $(this).css("pointer-events", "none");
        });

        hoverZoom.urlReplace(res,
            'img[src]',
            /w\d+(?:h\d+)?(.*)/,
            'w800h800$1?'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /w\d+(?:h\d+)?(.*)/,
            'w1200h1200$1?'
        );

        callback($(res), this.name);
    }
});