// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'GameSpot',
    version:'0.1',
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
        callback($(res));
    }
});