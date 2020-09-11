var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'wallhaven.cc',
    version:'3.0',
    prepareImgLinks: function (callback) {

        var res = [];

        hoverZoom.urlReplace(res,
            'img[src*="/th.wallhaven.cc/"]',
            /\/th.wallhaven.cc\/(.*)\/(.*)\/(.*)\.(.*)$/,
            '/w.wallhaven.cc/full/$2/wallhaven-$3.jpg'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/avatar\/\d+\//,
            '/avatar/200/'
        );

        $('body').on('mouseenter', 'a[href*="/wallhaven.cc/w/"]', function () {
            hoverZoom.prepareFromDocument($(this), this.href, function (doc) {
                var img = doc.getElementById('wallpaper');
                return img ? img.src : false;
            });
        });

        callback($(res));
    },
});
