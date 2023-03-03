var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'head-fi',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];

        // thumbnail: https://cdn.head-fi.org/a/11981118_thumb.jpg?1675889657
        //  fullsize: https://cdn.head-fi.org/a/11981118.jpg?1675889657
        hoverZoom.urlReplace(res,
            'img[src*="_thumb"], [style*="url"]',
            '_thumb.',
            '.'
        );

        // thumbnail: https://cdn.head-fi.org/avatars/s/141/141452.jpg?1649188084
        //  fullsize: https://cdn.head-fi.org/avatars/o/141/141452.jpg?1649188084
        hoverZoom.urlReplace(res,
            'img[src*="/avatars/"]',
            /\/avatars\/[sml]\//,
            '/avatars/o/'
        );

        callback($(res), this.name);
    }
});
