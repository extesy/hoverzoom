var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Imgur_a',
    version:'1.5',
    favicon:'imgur.png',
    prepareImgLinks:function (callback) {

        var name = this.name;
        var res = [];

        var HZimgur = sessionStorage.getItem('HZimgur');
        if (HZimgur == null) {
            HZimgur = {};
        } else {
            HZimgur = JSON.parse(HZimgur);
        }

        function createUrls(hash) {
            var srcs = [window.location.protocol + '//i.imgur.com/' + hash + '.jpg'];
            // Same array duplicated several times so that a retry is done if an image fails to load
            return srcs;
        }

        function htmlDecode(input){
            var e = document.createElement('div');
            e.innerHTML = input;
            return e.textContent;
        }

        function prepareImgLink() {
            var link = $(this), data = link.data(), href = link.attr('href');

            // special case for Google Docs
            if (window.location.host == 'docs.google.com') {
                data.hoverZoomSrc = [href];
                data.hoverZoomCaption = href;
                res.push(link);
                return;
            } else if (data.hoverZoomSrc || data.hoverZoomGallerySrc) {
                return;
            }

            // special case for StackOverflow custom subdomain
            if (-1 !== href.indexOf('i.stack.imgur.com')) {
                data.hoverZoomSrc = [href.replace('http:', window.location.protocol)];
                res.push(link);
                return;
            }

            // strip query parameters
            href = href.split("?")[0];

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
                                    callback($([link]), name);
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

        function displayGallery(link, gallery, captions) {
            link.data().hoverZoomSrc = undefined;
            link.data().hoverZoomGallerySrc = gallery;
            link.data().hoverZoomGalleryCaption = captions;
            link.data().hoverZoomGalleryIndex = 0;
            callback(link, name);
            // Gallery is displayed iff the cursor is still over the link
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link);
        }

        /*
          Escape JSON
          From: https://medium.com/@akhilanand.ak01/safely-handling-escape-sequences-in-json-parsing-c6a0c4721fe1
        */
        function escapeJSON(json) {
            // Unescape JSON strings to handle double-escaped characters
            return json.replace(/\\./g, (match) => {
                                                    switch (match) {
                                                        case '\\"': return '"';
                                                        case '\\n': return '\n';
                                                        case '\\t': return '\t';
                                                        // Add more escape sequences as needed
                                                        default: return match[1]; // Remove the backslash
                                                    }
                                                });
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
            if (backgroundImage && backgroundImage.indexOf("url") !== -1 && backgroundImage.indexOf("imgur") !== -1) {
                var reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                var backgroundImageUrl = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,"");
                // check if url is a thumbnail url
                //ex: "//i.imgur.com/N8hBuw7b.jpg"
                var reThumb = /(.*imgur.*\/.*)b\./i
                var fullsizeUrl = backgroundImageUrl.replace(reThumb, '$1.').replace('_d.', '.');
                if (fullsizeUrl !== backgroundImageUrl) {
                    var link = $(this);
                    if (link.data().hoverZoomSrc === undefined) { link.data().hoverZoomSrc = [] }
                    if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) === -1) {
                        link.data().hoverZoomSrc.unshift(fullsizeUrl);
                        res.push(link);
                    }
                }
            }
        });

        hoverZoom.urlReplace(res,
            'img[src*="imgur"]',
            '_d.',
            '.'
        );

        hoverZoom.urlReplace(res,
            'img[src*="imgur"]',
            /\?s=.*/,
            ''
        );

        // profil picture
        $('img[src*="imgur"]').one('mouseover', function() {
            if ($(this).parents('a').length != 0) return;

            const link = $(this);
            const src = this.src;
            let data = link.data();

            if (data.hoverZoomMouseOver) return;
            data.hoverZoomMouseOver = true;

            link.data().hoverZoomSrc = [src];

            callback(link, name);
            // Gallery is displayed iff the cursor is still over the link
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link);

        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // gallery
        // sample: https://imgur.com/gallery/bees-honey-2zggnrU
        $('a[href*="/gallery/"]').filter(function() { return (/imgur\.com\/gallery/.test($(this).prop('href'))) }).one('mouseover', function() {

            const link = $(this);
            const href = this.href;
            let data = link.data();

            if (data.hoverZoomMouseOver) return;
            data.hoverZoomMouseOver = true;

            const re = /\/gallery\/.*-(.*)/;
            const m = href.match(re);
            if (m == null) return;
            const id = m[1];

            // reuse previous results
            const idData = HZimgur[id];
            if (idData) {
                const gallery = idData.gallery;
                const captions = idData.captions;
                displayGallery(link, gallery, captions);
                return;
            }

            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:href
                                       }, function (response) {
                                            if (response == null) { return; }

                                            const parser = new DOMParser();
                                            const doc = parser.parseFromString(response, "text/html");
                                            if (doc.scripts == undefined) return;
                                            let scripts = Array.from(doc.scripts);
                                            scripts = scripts.filter(script => /window.postDataJSON=/.test(script.text));
                                            if (scripts.length != 1) return;

                                            const scriptText = scripts[0].text;
                                            const index1 = scriptText.indexOf('{');
                                            const index2 = scriptText.lastIndexOf('}');
                                            var jsonData = scriptText.substring(index1, index2 + 1);

                                            var j = undefined;
                                            try {
                                                jsonData = escapeJSON(jsonData);
                                                j = JSON.parse(jsonData);
                                                var gallery = [];
                                                var captions = [];
                                                j.media.forEach(i => gallery.push([i.url]));
                                                j.media.forEach(i => {
                                                    let caption = i.metadata.title + i.metadata.description || j.title;
                                                    captions.push(caption);
                                                });
                                                HZimgur[id] = {};
                                                HZimgur[id].gallery = gallery;
                                                HZimgur[id].captions = captions;
                                                sessionStorage.setItem('HZimgur', JSON.stringify(HZimgur));
                                                displayGallery(link, gallery, captions);
                                            } catch (e) { return; }
                                        }
            );
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        if (res.length) {
            callback($(res), name);
        }
    }

});
