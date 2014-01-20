// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Skyrock',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a img[src*="small"]',
            ['/small.', '_small_'],
            ['/big.', '_']
        );
        hoverZoom.urlReplace(res,
            'a img[src*="_avatar_"]',
            '_avatar_',
            '_'
        );
        hoverZoom.urlReplace(res,
            '#photolist a img[src*="big"]',
            /\?.*$/,
            ''
        );
        callback($(res));
    }
});