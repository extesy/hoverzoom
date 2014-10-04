// Copyright (c) 2014 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Vox Media',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*=".vox-cdn.com"], [style*=".vox-cdn.com"]',
            /_(medium|epic|small)/,
            options.showHighRes ? '' : '_epic'
        );
        callback($(res));
    }
});