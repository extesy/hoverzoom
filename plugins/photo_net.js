var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'photo.net',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src]',
            ['thumbs.', '-sm', '-md', '-lg'],
            ['gallery.', '-orig', '-orig', '-orig']
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /\?.*$/,
            ''
        );

        // gallery
        $('a[href*="photo.net/gallery/"]').one('mouseenter', function() {
            hoverZoom.prepareFromDocument($(this), this.href, function (doc) {
                var ogImg = doc.head.querySelector('meta[property="og:image"]');
                if (ogImg) {
                    return ogImg.content;
                }
            });
        });

        // profile
        $('a[href*="photo.net/profile/"]').one('mouseenter', function() {
            hoverZoom.prepareFromDocument($(this), this.href, function (doc) {
                var userPhoto = doc.body.querySelector('a.ipsUserPhoto');
                if (userPhoto) {
                    return userPhoto.href;
                }
            });
        });

        // files
        $('a[href*="photo.net/files/"]').one('mouseenter', function() {
            hoverZoom.prepareFromDocument($(this), this.href, function (doc) {
                var file = doc.body.querySelector('span.ipsThumb');
                if (file) {
                    return file.dataset.fullurl;
                }
            });
        });

        callback($(res), this.name);
    }
});