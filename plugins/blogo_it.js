var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Blogo.it',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res, 'img[src*="/thn_"]', 'thn_', 'big_');
        callback($(res));
    }
});
