var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Live.com',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res, 'img[src*="maxwidth="]', /&max(width|height)=\d+/g, '');
        callback($(res));
    }
});
