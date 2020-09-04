var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Imgur',
    version:'1.1',
    prepareImgLinks:function (callback) {

        var res = [];

        function createUrls(hash) {
            var srcs = [window.location.protocol + '//i.imgur.com/' + hash + '.jpg'];
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
            if (data.hoverZoomSrc || data.hoverZoomGallerySrc) {
                return;
            }

            // special case for StackOverflow custom subdomain
            if (-1 !== href.indexOf('i.stack.imgur.com')) {
                data.hoverZoomSrc = [href.replace('http:', window.location.protocol)];
                res.push(link);

                return;
            }

            if (options.zoomVideos && (href.substr(-3) == 'gif' || href.substr(-4) == 'gifv')) {
                data.hoverZoomSrc = [href.replace(/\.gifv?/, '.mp4'), href.replace(/\.gifv?/, '.webm'), href];
                res.push(link);
            } else {
                var matches = href.match(/(?:\/(a|gallery|signin))?\/([^\W_]{5,8})(?:\/|\.[a-zA-Z]+|#([^\W_]{5,8}|\d+))?(\/new|\/all|\?.*)?$/);
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
                            data.hoverZoomGallerySrc = [];
                            data.hoverZoomGalleryCaption = [];

                            // Future alternative: https://imgur.com/ajaxalbums/getimages/{hash}/hit.json?all=true
                            var albumUrl = 'https://api.imgur.com/3/album/' + hash + '.json';
                            $.ajax(albumUrl, {headers: {"Authorization": "Client-ID 1d8d9b36339e0e2"}}).done(function (imgur) {
                                if (imgur.error) {
                                    data.hoverZoomSrc = createUrls(hash);
                                    res.push(link);
                                } else {
                                    imgur.data.images.forEach(function (img, index) {
                                        var urls = [img.link],
                                            caption = img.title != null ? img.title : '',
                                            alreadyAdded = false;
                                        for (var i=0, l=data.hoverZoomGallerySrc.length; i<l; i++) {
                                            if (data.hoverZoomGallerySrc[i].indexOf(urls[0]) != -1) {
                                                alreadyAdded = true;
                                                break;
                                            }
                                        }
                                        if (!alreadyAdded) {
                                            if (img.description != null) {
                                                if (caption != '' && img.description != '') {
                                                    caption += ';\n';
                                                }
                                                caption += img.description;
                                            }
                                            data.hoverZoomGalleryCaption.push(htmlDecode(caption));
                                            data.hoverZoomGallerySrc.push(urls);
                                            data.hoverZoomSrc = undefined;
                                        }
                                        if (anchor) {
                                            if ((anchor.match(/^\d+$/) && index == parseInt(anchor)) || anchor == img.id)
                                                data.hoverZoomGalleryIndex = index;
                                        }
                                    });
                                    callback($([link]), this.name);
                                }
                            }).fail(function(jqXHR) {
                                if (jqXHR.status === 429) {
                                    console.info("imgur.com is enforcing rate limiting on hoverzoom+ extension. Album preview won't work until this problem is resolved.");
                                    return;
                                }
                                // Unfortunately /gallery/ can be both album or a single image. If album is not found then try it as a single image instead.
                                if (view === 'gallery' && jqXHR.status === 404) {
                                    data.hoverZoomSrc = createUrls(hash);
                                    link.addClass('hoverZoomLink');
                                }
                            });
                            break;
                        case undefined:
                        default: // single pic view
                            data.hoverZoomSrc = createUrls(hash);
                            res.push(link);
                    }
                }
            }
        }

        // Every sites
        $('a[href*="//imgur.com/"], a[href*="//www.imgur.com/"], a[href*="//i.imgur.com/"], a[href*="//m.imgur.com/"], a[href*="//i.stack.imgur.com/"]').each(prepareImgLink);

        // On imgur.com (galleries, etc)
        if (window.location.host.indexOf('imgur.com') !== -1) {
            hoverZoom.urlReplace(res, 'a img[src*="b."]', 'b.', '.');
            $('a[href*="/gallery/"]').each(prepareImgLink);
        }

        $('[style]').each(function() {

            // extract url from style
            // ex: backgroundImage = url("http://site.net/image.png")
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf("url") != -1 && backgroundImage.indexOf("imgur") != -1) {
                var reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                var backgroundImageUrl = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,"");
                // check if url is a thumbnail url
                //ex: "//i.imgur.com/N8hBuw7b.jpg"
                var reThumb = /(.*imgur.*\/.*)b\./i
                var fullsizeUrl = backgroundImageUrl.replace(reThumb, '$1.').replace('_d.', '.');
                if (fullsizeUrl != backgroundImageUrl) {
                    var link = $(this);
                    if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                    if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                        link.data().hoverZoomSrc.unshift(fullsizeUrl);
                        res.push(link);
                    }
                }
            }
        });

        hoverZoom.urlReplace(res,
            'img[src]',
            '_d.',
            '.'
        );

        if (res.length) {
            callback($(res), this.name);
        }
    }

});
