var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'theguardian',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        var old_width = /width=[0-9]*/;
        var new_width = 'width=2000';

        // This handles article thumbnails on the main page, and images
        // inside articles.
        $('a[href^="/"], a[href^="#img"], a[href*="theguardian.com"').one('mouseenter', function () {
            var a = $(this);
            var data = a.data();

            if (data.hoverZoomSrc) {
                return;
            }

            var img = a.parent().find('img[src*="i.guim.co.uk/"]');
            var url = img.get(0).src;

            data.hoverZoomSrc = [url.replace(old_width, new_width)];

            a.addClass('hoverZoomLink');
            hoverZoom.displayPicFromElement(a);
        });

        // This handles the profile picture of the article's author.
        // The width parameter is necessary. It doesn't accept
        // ridiculously large numbers, like 2100 and larger, but 2000
        // seems fine.
        hoverZoom.urlReplace(res,
            'img[src*="i.guim.co.uk/"]',
            old_width,
            new_width,
        );

        callback($(res), this.name);
    }
});
