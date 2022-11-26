var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Badoo',
    version:'0.3',
    favicon:'badoo.svg',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img',
            /_[^\/]*\.(jpg|png)$/,
            '_300.$1'
        );

        hoverZoom.urlReplace(res,
            'img[src*="wm_size"]',
            /&.*/,
            '',
            ['.user-card__content', '.photo-list__item', 'div']
        );

        // sample: https://am1.badoo.com/profile/0zAhMACjE4MjYzNjA1OTEAIIj1AHOJhDHYEQMU_ex_NRWG8crfKc7KzOUTx9qqIIQM?from=spotlight
        $('a[href*="/profile/"]').one('mouseenter', function() {
            hoverZoom.prepareFromDocument($(this), this.href, function (doc) {
                let link = $(this);
                let data = link.data();
                var ogImg = doc.head.querySelector('meta[property="og:image"]');
                if (ogImg) {
                    return ogImg.content;
                }
            });
        });

        callback($(res), this.name);
    }
});