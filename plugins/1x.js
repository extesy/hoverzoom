// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'1x.com',
    version:'0.1',
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
        callback($(res));
    }
});