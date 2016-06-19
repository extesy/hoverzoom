var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Funny Junk',
    version:'0.1',
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
        callback($(res));
    }
});