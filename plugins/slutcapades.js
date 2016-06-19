var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Slutcapades',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [],
            filter = 'a[href*="slutcapades.com/view/"]';
        hoverZoom.urlReplace(res, filter, ['view', /$/], ['img', '.jpg']);
        hoverZoom.urlReplace(res, filter, ['view', /$/], ['img', '.png']);
        callback($(res));
    }
});
