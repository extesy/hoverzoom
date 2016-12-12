var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Funny Junk',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        $('img[src*="/thumbnails/pictures/"]').each(function () {
            var img = $(this),
                url = img.attr('src');
            url = url.replace('/thumbnails/', '/').replace(/_thum.*\./, '.');
            url = url.substr(0, url.lastIndexOf('.'));
            img.data().hoverZoomSrc = [url + '.jpg', url + '.jpeg', url + '.png'];
            res.push(img);
        });
        hoverZoom.urlReplace(res,
            'img[src*="/thumbnails/gifs/"]',
            ['/thumbnails/', /_thum.*\.jpg/],
            ['/', '.gif']
        );
        hoverZoom.urlReplace(res,
            'img[src*="/thumbnails_160x160/pictures/"]',
            '/thumbnails_160x160/',
            '/'
        );
        hoverZoom.urlReplace(res,
            'img[src*="/thumbnails/movies/"], img[src*="/thumbnails_160x160/movies/"]',
            ['/thumbnails/', '/thumbnails_160x160/'],
            ['/large/', '/large/']
        );
        hoverZoom.urlReplace(res,
            'img[src*="/thumbnails/hdgifs/"], img[src*="/thumbnails_160x160/hdgifs/"]',
            ['/thumbnails/', '/thumbnails_160x160/'],
            ['/large/', '/large/']
        );
        callback($(res));
    }
});