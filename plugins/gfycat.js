// Copyright (c) 2013 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'gfycat.com',
    prepareImgLinks:function (callback) {
        $('a[href*="gfycat.com/"]').one('mouseenter', function() {
            var link = $(this),
                gfyId = this.href.replace(/.*gfycat.com\/(\w+).?/, '$1');
            $.get('http://gfycat.com/cajax/get/' + gfyId, function (data) {
                if (data && data.gfyItem) {
                    link.data().hoverZoomSrc = [data.gfyItem.webmUrl]
                    link.addClass('hoverZoomLink');
                    hoverZoom.displayPicFromElement(link);
                }            
            });
        });
    }
});
