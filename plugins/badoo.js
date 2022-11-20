var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Badoo',
    version:'0.2',
    favicon:'badoo.svg',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img',
            /_[^\/]*\.(jpg|png)$/,
            '_300.$1'
        );

        hoverZoom.urlReplace(res,
            'img[src*="wm_size"]',
            /&.*/,
            '',
            ['.user-card__content', '.photo-list__item', 'div']
        );

        callback($(res), this.name);
    }
});