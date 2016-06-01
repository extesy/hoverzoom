var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Choualbox',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res, 'img[src*="/Img_resize/"]', 'Img_resize', 'Img');
        hoverZoom.urlReplace(res, 'img[src*="/mini.php"]', /\/mini\.php\?src=(.*?)&.*/, '$1');
        callback($(res));
    }
});