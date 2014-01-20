// Copyright (c) 2010 Shelby DeNike
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Pict.Mobi',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a[href*=pict.mobi]',
            /pict\.mobi\/([^\/]*)$/,
            'pict.mobi/show/med/med_$1'
        );
        callback($(res));
    }
});
