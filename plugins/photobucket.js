var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Photobucket',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="th_"]',
            ['//th', '/th_'],
            ['//i', '/'],
            ':first'
        );
        callback($(res));
    }
});
