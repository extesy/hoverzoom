var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'beautify.it',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a img.photo',
            /^.*src=\.(.*)&.*/,
            '$1'
        );
        callback($(res));
    }
});