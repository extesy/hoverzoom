var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Tumblr',
    prepareImgLinks:function (callback) {
        var res = [];
        $('img[src*="media.tumblr.com/"]').one('mouseenter', function () {
            var img = $(this), link = img.parents('a:eq(0)'),
                link = link.length ? link : img,
                data = link.data();
            if (data.hoverZoomSrc) {
                return;
            }

            var url = img.attr('src'),
                width = img.width(),
                urls = [];

            if ((url.indexOf('_1280.') > -1 && width >= 1280) || url.indexOf('.gif') > -1) {
                return;
            }
            
            url = url.replace(/_[0-9a-z]*\.(.*)$/, '_maxwidth.$1');
                
            var url1280 = url.replace('maxwidth', '1280');
            $.get(url1280)
                .done(function() { urls.push(url1280); })
                .always(function() {
                    if (width < 500) {
                        urls.push(url.replace('maxwidth', '500'));
                    }            
                    link.data().hoverZoomSrc = urls;
                    link.addClass('hoverZoomLink');
                    hoverZoom.displayPicFromElement(link);
                });
        });
        hoverZoom.urlReplace(res,
            'a[href*="tumblr.com/photo/"]',
            '',
            ''
        );
        callback($(res));
        $('a[href*="tumblr.com/post/"], a[href*="tumblr.com/image/"]').one('mouseenter', function () {
            var link = $(this), lData = link.data(), aHref = this.href.split('/');
            if (lData.hoverZoomSrc) {
                return;
            }

            $.getJSON('https://api.tumblr.com/v2/blog/' + aHref[2] + '/posts?id=' + aHref[4] + '&api_key=GSgWCc96GxL3x2OlEtMUE56b8gjbFHSV5wf8Zm8Enr1kNcjt3U', function (data) {
                if (data && data.response && data.response.posts && data.response.posts[0]) {
                    var post = data.response.posts[0];
                    if (post.photos && post.photos[0]) {
                        if (post.photos.length > 1) {
                            lData.hoverZoomGallerySrc = [];
                            lData.hoverZoomGalleryCaption = [];
                            post.photos.forEach(function (photo) {
                                lData.hoverZoomGallerySrc.push([photo.alt_sizes[0].url]);
                                lData.hoverZoomGalleryCaption.push(photo.caption);
                            });
                        } else {
                            lData.hoverZoomSrc = [post.photos[0].alt_sizes[0].url];
                        }
                        link.addClass('hoverZoomLink');
                        callback($([link]));
                        hoverZoom.displayPicFromElement(link);
                    }
                }
            });
        });
    }
});
