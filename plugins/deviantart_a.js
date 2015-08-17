// Copyright (c) 2012 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'deviantART',
    version:'0.1',
    prepareImgLinks:function (callback) {
//        if (location.host.indexOf('deviantart.com') == -1) {
            $('a[href*=".deviantart.com/art/"], a[href^="http://fav.me/"]').one('mouseenter', function () {
                hoverZoom.prepareOEmbedLink(this, 'https://backend.deviantart.com/oembed?url=', this.href);
            });
//        }
    }
});