// Copyright (c) 2013 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Imgur',
    prepareImgLinks:function (callback) {

        var res = [];

        function createUrls(hash) {
            var srcs = ['http://i.imgur.com/' + hash + '.jpg'];
            // Same array duplicated several times so that a retry is done if an image fails to load
            //return srcs.concat(srcs).concat(srcs).concat(srcs);
            return srcs;
        }
        
        function htmlDecode(input){
            var e = document.createElement('div');
            e.innerHTML = input;
            return e.textContent;
        }

        function prepareImgLink() {
            var link = $(this), data = link.data(), href = link.attr('href');
            if (href.indexOf('gallery') == -1 && data.hoverZoomSrc) {
                return;
            }
            if (href.indexOf('gallery') != -1 && data.hoverZoomGallerySrc) {
                return;
            }

            if (options.zoomVideos && (href.substr(-3) == 'gif' || href.substr(-4) == 'gifv')) {
                data.hoverZoomSrc = [href.replace(/\.gif.?/, '.mp4'), href];
                res.push(link);
            } else {
                var matches = href.match(/(?:\/(a|gallery|signin))?\/([^\W_]{5,7})(?:\/|\.[a-zA-Z]+|#([^\W_]{5,7}|\d+))?(\/new)?$/);
                if (matches && matches[2]) {

                    var view = matches[1];
                    var hash = matches[2];
                    var excl = ['imgur', 'forum', 'stats', 'signin', 'upgrade'];
                    if (excl.indexOf(hash) > -1) {
                        return;
                    }
                    
                    switch (view) {
                        case 'signin':
                            return;
                        case 'a': // album view:
                        case 'gallery':
                            var anchor = matches[3];
                            if (!anchor || anchor.match(/^\d+$/)) { // whole album or indexed image
                                data.hoverZoomGallerySrc = [];
                                data.hoverZoomGalleryCaption = [];

                                var albumUrl = 'https://api.imgur.com/2/album/' + hash + '.json';
                                $.get(albumUrl, function (imgur) {
                                    if (imgur.error) {
                                        data.hoverZoomSrc = createUrls(hash);
                                        res.push(link);
                                    } else {
                                        imgur.album.images.forEach(function (img) {
                                            var urls = createUrls(img.image.hash),
                                                caption = img.image.title,
                                                alreadyAdded = false;
                                            for (var i=0, l=data.hoverZoomGallerySrc.length; i<l; i++) {
                                                if (data.hoverZoomGallerySrc[i].indexOf(urls[0]) != -1) {
                                                    alreadyAdded = true;
                                                    break;
                                                }
                                            }
                                            if (!alreadyAdded) {
                                                if (caption != '' && img.image.caption != '') {
                                                    caption += ';\n';
                                                }
                                                caption += img.image.caption;
                                                data.hoverZoomGalleryCaption.push(htmlDecode(caption));
                                                data.hoverZoomGallerySrc.push(urls);
                                                data.hoverZoomSrc = undefined;
                                            }
                                        });
                                        callback($([link]));
                                    }
                                }).fail(function() {
                                    data.hoverZoomSrc = createUrls(hash);
                                    link.addClass('hoverZoomLink');
                                });
                                break;
                            } else { // image of an album (hash as anchor)
                                hash = anchor; // fall through
                            }
                        case undefined:
                        default: // single pic view
                            data.hoverZoomSrc = createUrls(hash);
                            res.push(link);
                    }
                }
            }
        }

        // Every sites
        $('a[href*="//imgur.com/"], a[href*="//www.imgur.com/"], a[href*="//i.imgur.com/"], a[href*="//m.imgur.com/"]').each(prepareImgLink);

        // On imgur.com (galleries, etc)
        if (window.location.host.indexOf('imgur.com') > -1) {
            hoverZoom.urlReplace(res, 'a img[src*="b."]', 'b.', '.');
            $('a[href*="/gallery/"]').each(prepareImgLink);
        }

        if (res.length) {
            callback($(res));
        }
    }

});
