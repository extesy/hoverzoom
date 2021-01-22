var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Maxmodels',
    version:'0.4',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src*="galerie"][src*="/m"], img[src*="galerie"][src*="/k"]',
            /\/(m|k)(\d+\.)/,
            '/p$2'
        );

        hoverZoom.urlReplace(res,
            'img[src*="miniatury"]',
            '/miniatury',
            ''
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            ['_pthumb.', '_tinythumb.'],
            ['_profile.', '_profile.']
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /_thumbs?\./,
            '.'
        );

        callback($(res), this.name);
    }
});
