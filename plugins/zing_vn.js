var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'me.zing.vn',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img.boderImg, [class*="imgAlbum"]',
            /_\d+_\d+\./,
            '.'
        );
        hoverZoom.urlReplace(res,
            'img[src*="avatar.me.zdn.vn"]',
            '_50_',
            '_180_',
            ':eq(0)'
        );
        callback($(res));
    }
});
