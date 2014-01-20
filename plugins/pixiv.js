// Copyright (c) 2013 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Pixiv',
    prepareImgLinks:function (callback) {
        var res = [],
            filter = 'a img[src*="pixiv.net/img"]',
            search = [/_(\d+(ms)?|\d+x\d+)\./, '/mobile/'];
        hoverZoom.urlReplace(res, filter, search, ['_m.', '/']);
        if (options.showHighRes) {
            hoverZoom.urlReplace(res, filter, search, ['.', '/']);
        }
        hoverZoom.urlReplace(res, 'a img[src*="pixiv.net/profile/"]', search, ['.', '/']);
        callback($(res));
        $('a[href*="/member_illust.php?"] img').one('mouseover', function() {
            var link = parentNodeName(this, 'a');
            hoverZoom.prepareFromDocument($(link), link.href, function(doc) {
                var img = doc.querySelector('div.works_display img');
                return img ? img.src : false;
            });
        });
    }
});