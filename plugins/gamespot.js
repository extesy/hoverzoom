var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'GameSpot',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'a img[src*="_gum"]:not([src*="features/"]), a img[src*="_embed"], a img[src*="thumb"]:not([src*="features/"])',
            /_\d*(gum|thumb|embed)/,
            '_screen'
        );

        hoverZoom.urlReplace(res,
            'a:not([href*="/iphone/"]):not([href*="/android/"]):not([href*="/blackberry/"]):not([href*="/palm-webos/"]):not([href*="/windows-mobile/"]) img[src*="/boxshots"]',
            [/\d+\/all\/boxshots\d/, /\/(\d+)(\d)(_\d+)\.jpg/],
            ['bigboxshots', '/$2/$1$2$3_front.jpg']
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /(screen|scale|square)_(avatar|medium|mini|petite|small|tiny|large)/,
            'scale_super'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /(screen|scale|square)_(avatar|medium|mini|petite|small|tiny|large)/,
            'original'
        );

        callback($(res), this.name);
    }
});