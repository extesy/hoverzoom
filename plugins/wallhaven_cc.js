var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'wallhaven.cc',
    version:'3.1',
    prepareImgLinks: function (callback) {

        var res = [];

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/avatar\/\d+\//,
            '/avatar/200/'
        );

        $('body').on('mouseenter', 'figure.thumb', function() {
            const img = $(this),
                search = /\/th.wallhaven.cc\/(.*)\/(.*)\/(.*)\.(.*)$/,
                replace = '/w.wallhaven.cc/full/$2/wallhaven-$3.';
            let url = img.find('img').attr('src');
            if (url && url.match(search)) {
                url = url.replace(search, replace);
                img.data().hoverZoomSrc = [url + 'jpg', url + 'png'];
                console.log(img.data().hoverZoomSrc);
                img.addClass('hoverZoomLink');
                hoverZoom.displayPicFromElement(img);
            }
        });

        $('body').on('mouseenter', 'img[src*="/th.wallhaven.cc/"]', function() {
            const img = $(this),
                search = /\/th.wallhaven.cc\/(.*)\/(.*)\/(.*)\.(.*)$/,
                replace = '/w.wallhaven.cc/full/$2/wallhaven-$3.';
            let url = img.attr('src');
            if (url.match(search)) {
                url = url.replace(search, replace);
                img.data().hoverZoomSrc = [url + 'jpg', url + 'png'];
                img.addClass('hoverZoomLink');
                hoverZoom.displayPicFromElement(img);
            }
        });

        callback($(res));
    },
});
