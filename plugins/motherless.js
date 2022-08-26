var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'motherless',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src]:not(img[src*="small"]):not(img[src*="avatar"])',
            /\/thumbs\/(.*?)(-zoom){0,1}\.(.*)/,
            '/images/$1.$3',
            'a'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /-(small|tiny)-avatar/,
            '-big-avatar',
            'a'
        );

        hoverZoom.urlReplace(res,
            'img[src*="small"]',
            /(\/thumbs\/)(.*)(-small.*)/,
            '/videos/$2.mp4',
            'a'
        );

        hoverZoom.urlReplace(res,
            'img[src*="images"]',
            '.thumb.',
            '.',
            'a'
        );

        // quickies
        hoverZoom.urlReplace(res,
            'a[data-show-quickie] img',
            /(\/thumbs\/)(.*)\.(.*)/,
            '/videos/$2-720p.mp4',
            'a'
        );

        callback($(res), this.name);
    }
});
