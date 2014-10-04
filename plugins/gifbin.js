// Copyright (c) 2013 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Twitter',
    prepareImgLinks:function (callback) {
        $('a[href*="gifbin.com/"').one('mouseover', function() {
            hoverZoom.prepareFromDocument($(this), this.href, function(doc) {
                var img = doc.getElementById('gif');
                return img ? img.src : false;
            });
        });
    }
});
