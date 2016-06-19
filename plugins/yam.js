var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Yam',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res, 'img[src*="/t_"], img[src*="/s_"]', /\/[ts]_/, '/');
        hoverZoom.urlReplace(res, 'img[src*="/tindex"]', '/tindex', '/index');
        callback($(res));
    }
});
