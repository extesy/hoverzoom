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
        
        // New in 2020, I guess: <img> tags with "srcset" attribute.
        // The "src" attribute is empty.
        $('img[srcset*="media.tumblr.com/"]').one('mouseenter', function () {
            var img = $(this), link = img.parents('a:eq(0)'),
                link = link.length ? link : img,
                data = link.data();
            if (data.hoverZoomSrc) {
                return;
            }

            // If this image is also a link to a post, don't extract the image.
            // Let the code that handles links to posts extract /all/ images in the post.
            // This can happen when hovering over the three previews in a user profile popup.
            var href = link.attr("href");
            if (href && href.includes("tumblr.com/post/")) {
                return;
            }
            
            // The "srcset" attribute contains the available versions of the image,
            // in the format "url1 size1, url2 size2, urlN sizeN", sorted by size, largest last.
            var srcset = img.attr('srcset').split(" ");
            
            link.data().hoverZoomSrc = [srcset[srcset.length - 2]];
            link.addClass('hoverZoomLink');
            hoverZoom.displayPicFromElement(link);
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

            // Send "npf=true" so that we receive the post in "Neue Post Format" (New Post Format),
            // which provides the URL for the original image size.
            $.getJSON('https://api.tumblr.com/v2/blog/' + aHref[2] + '/posts?id=' + aHref[4] + '&api_key=GSgWCc96GxL3x2OlEtMUE56b8gjbFHSV5wf8Zm8Enr1kNcjt3U&npf=true', function (data) {
                if (data && data.response && data.response.posts && data.response.posts[0]) {
                    var post = data.response.posts[0];

                    var images = [];
                    
                    // If the post is a reblog, the content from the original post(s)
                    // may be found in the reblog "trail", sorted by age, oldest first.
                    if (post.trail) {
                        post.trail.forEach(function (trail_post) {
                            trail_post.content.forEach(function (content_block) {
                                if (content_block.type == "image") {
                                    images.push(content_block.media[0].url);
                                }
                            });
                        });
                    }
                    
                    // Then the content of the post itself, if any, is in here.
                    post.content.forEach(function (content_block) {
                        if (content_block.type == "image") {
                            // The available versions of an image are in the "media" array.
                            // They seem to be sorted by size, largest first.
                            images.push(content_block.media[0].url);
                            
                            // According to the Tumblr API docs, content_block.alt_text
                            // should contain the image description, but alt_text is missing,
                            // and there is no image description anywhere else in content_block.
                        }
                    });
                    
                    if (images.length == 1) {
                        lData.hoverZoomSrc = [images[0]];
                    } else if (images.length > 1) {
                        lData.hoverZoomGallerySrc = [];
                        
                        images.forEach(function (image) {
                            lData.hoverZoomGallerySrc.push([image]);
                        });
                    }
                    
                    if (images.length > 0) {
                        link.addClass('hoverZoomLink');
                        callback($([link]));
                        hoverZoom.displayPicFromElement(link);
                    }
                }
            });
        });
    }
});
