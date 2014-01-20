// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Skyrock (a)',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a img[src*=".skyrock.net"]',
            /\/(\d+)_(0|1)_(\d+)\./,
            '/$1_2_$3.'
        );
        callback($(res));
    }
});