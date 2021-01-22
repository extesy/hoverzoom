var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'nasa.gov',
    version:'2.0',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src]',
            ['~thumb', '~small', '~medium', '~large'],
            ['~orig', '~orig', '~orig', '~orig']
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            ['~thumb', '~small', '~medium'],
            ['~large', '~large', '~large']
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            ['~thumb', '~small'],
            ['~medium', '~medium']
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/files\/styles\/.*\/public\//,
            '/files/'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            ['-640x350.', '/wallpaper/', '/default.', '_normal'],
            ['_hires.', '/largesize/', '/maxresdefault.', '']
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            ['_th.', '_tn.', '_wide.', '_front.'],
            ['_lrg.', '_lrg.', '_lrg.', '_lrg.']
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            '/thumb/',
            '/jpeg/'
        );

        callback($(res), this.name);
    }
});