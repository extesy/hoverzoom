// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Image.aspx',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var links = $('a[href*="Image.aspx"]');
        links.each(function () {
            $(this).data().hoverZoomSrc = [$(this).attr('href')];
        });
        callback(links);
    }
});