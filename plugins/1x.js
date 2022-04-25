var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'1x.com',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a[href*=".1x.com/photo/"]',
            /\/photo\/(\d+)\/$/,
            '/images/$1-F.jpg'
        );
        hoverZoom.urlReplace(res,
            'a[href*="/photos/"]:has(img[src*="/nude."])',
            /^.*\/(\d+)\/$/,
            'http://imghost.1x.com/$1.jpg'
        );
        hoverZoom.urlReplace(res,
            'img[src*="/pictures/"], img[src*="/tiny/"], img[src*="/medium/"]',
            /1x\.com\/.+\/(\d+)[^\.]*(.*)/,
            'imghost.1x.com/$1$2'
        );
        hoverZoom.urlReplace(res,
            'img[src*="/queue/"]',
            '-thumb.',
            '-fullsize.'
        );
        hoverZoom.urlReplace(res,
            'img[src]',
            '-ld.',
            '-sd.'
        );
        hoverZoom.urlReplace(res,
            'img[src]',
            '-ld.',
            '-hd2.'
        );
        hoverZoom.urlReplace(res,
            'img[src]',
            '-ld.',
            '-hd4.'
        );
        hoverZoom.urlReplace(res,
            'img[src]',
            '-sq.',
            '-sd.'
        );
        hoverZoom.urlReplace(res,
            'img[src]',
            '-sq.',
            '-hd2.'
        );
        hoverZoom.urlReplace(res,
            'img[src]',
            '-sq.',
            '-hd4.'
        );
        hoverZoom.urlReplace(res,
            'img[src]',
            '-square.',
            '.'
        );

        callback($(res), this.name);
    }
});