var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'metmuseum.org',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src]',
            ['mobile-thumb', 'web-thumb', 'mobile-additional', 'web-additional'],
            ['mobile-large', 'web-large', 'mobile-large', 'web-large']
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            ['mobile-thumb', 'web-thumb', 'mobile-additional', 'web-additional', 'mobile-large', 'web-large'],
            ['original', 'original', 'original', 'original', 'original', 'original']
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            ['/h5/h5_', '/h4/h4_', '/h3/h3_', '/h2/h2_'],
            ['/hb/hb_', '/hb/hb_', '/hb/hb_', '/hb/hb_']
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            ['/h5/h5_', '/h4/h4_', '/h3/h3_', '/hb/hb_'],
            ['/h2/h2_', '/h2/h2_', '/h2/h2_', '/h2/h2_']
        );

        hoverZoom.urlReplace(res,
            'img[src], img[srcset]',
            /\?.*/,
            ''
        );

        hoverZoom.urlReplace(res,
            'img[src], img[srcset]',
            /\/render\/.*?\//,
            '/render/9999/'
        );

        callback($(res), this.name);
    }
});