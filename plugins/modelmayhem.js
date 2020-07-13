var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'ModelMayhem',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="/photos/"], img[src*="/covers/"], img[src*="/potd/entrants/"]',
            '_m.jpg',
            '.jpg'
        );
        hoverZoom.urlReplace(res,
            'img[src*="/avatars/"]',
            ['_t.jpg', '_xt.jpg'],
            ['_m.jpg', '_m.jpg']
        );
        hoverZoom.urlReplace(res,
            'img[src*="/photos/"], img[src*="/covers/"], img[src*="/potd/entrants/"], img[src*="/avatars/"]',
            '-small',
            '-big'
        );
        callback($(res));
    }
});