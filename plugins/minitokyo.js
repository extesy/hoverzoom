var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Minitokyo',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="/view/"], img[src*="/thumbs/"], [style*="/view/"], [style*="/thumbs/"]',
            /(view|thumbs)/,
            'downloads'
        );
        callback($(res));
    }
});
