// Copyright (c) 2013 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Instagram',
    prepareImgLinks:function (callback) {
        var res = [],
            search = /.*(?:instagr\.am|instagram\.com)\/p\/([^\/]+).*/i,
            replace = 'http://instagr.am/p/$1/media/?size=l';
        $('a[href*="instagr.am/p/"], a[href*="instagram.com/p/"], a[data-expanded-url*="nstagr.am/p/"], a[data-expanded-url*="nstagram.com/p/"]').each(function () {
            var link = $(this), data = link.data(), url = this.dataset['expandedUrl'] || this.href;
            if (!data.hoverZoomSrc && !link.hasClass('compFrontside') && !link.hasClass('compFlipside')) {
                data.hoverZoomSrc = [url.replace(search, replace)];
                res.push(link);
            }
        });
        if (res.length) {
            callback($(res));
        }
    }
});