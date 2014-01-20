// Copyright (c) 2013 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Twitter',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="_mini"]:not([src*="default_profile_"]), img[src*="_normal"]:not([src*="default_profile_"]), img[src*="_bigger"]:not([src*="default_profile_"])',
            /_(mini|normal|bigger)/,
            ''
        );
        hoverZoom.urlReplace(res,
            'img[src*=":thumb"]',
            ':thumb',
            ':large'
        );
        $('a[data-expanded-url], a[data-full-url], a[data-url]').each(function () {
            var link = $(this),
                url = this.getAttribute('data-expanded-url') || this.getAttribute('data-full-url') || this.getAttribute('data-url');
            if (url.match(/\/[^:]+\.(?:jpe?g|gif|png|svg|webp|bmp|ico|xbm)(?:[\?#:].*)?$/i)) {
                link.data().hoverZoomSrc = [url];
                res.push(link);
                link.addClass('hoverZoomLink');
            }
        });

        $('a:contains("pic.twitter.com/")').one('mouseover', function() {
            hoverZoom.prepareFromDocument($(this), this.href, function(doc) {
                var img = doc.querySelector('img[src*="twimg.com/media/"]');
                return img ? img.src + ':large' : false;
            });
        });
        

        callback($(res));
    }
});
