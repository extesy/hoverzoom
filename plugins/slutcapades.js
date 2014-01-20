// Copyright (c) 2011 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Slutcapades',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [],
            filter = 'a[href*="slutcapades.com/view/"]';
        hoverZoom.urlReplace(res, filter, ['view', /$/], ['img', '.jpg']);
        hoverZoom.urlReplace(res, filter, ['view', /$/], ['img', '.png']);
        callback($(res));
    }
});