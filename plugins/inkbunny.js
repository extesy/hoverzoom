var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Inkbunny',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        $('a[href*="s/"]').filter(function() {
            return /s\/\d+(-p\d+)?(-latest)?(-?#pictop)?\/?$/.test($(this).attr('href'));
        }).one('mouseover', function() {
            var link = $(this),
                url = link.attr('href');
            $.ajax(url).done(function(response) {
                prepareSrc(link, response);
                var multipageContainer = $('#files_area ~ div', response),
                    firstPage = url.replace(/^(.*s\/\d+).*$/, '$1'),
                    multipageLinks = $('a[href*="' + firstPage + '"]:has(img)', multipageContainer);

                if (multipageLinks.length) {
                    link.data().hoverZoomGallerySrc = [];
                    link.data().hoverZoomGalleryCaption = [];
                    var startIndex = url.replace(/^(.*s\/\d+)-p(\d+)?.*$/, '$2');

                    if (startIndex === url) {
                        var updated = $('[style*="/overlays/updated.png"]', link);
                        if (updated.length) {
                            var highlightedImg = $('div ~ a[href*="' + firstPage + '"]:has(img)', multipageContainer);
                            startIndex = highlightedImg.attr('href').replace(/^(.*s\/\d+)-p(\d+)?.*$/, '$2');
                            startIndex = parseInt(startIndex) - 1;
                        } else {
                            startIndex = 0;
                        }
                    } else {
                        startIndex = parseInt(startIndex) - 1;
                    }
                    link.data().hoverZoomGalleryIndex = startIndex;

                    var i = 0, loopData = {
                        start: mod(startIndex - 2, multipageLinks.length),
                        end: mod(startIndex + 2, multipageLinks.length) };
                    link.on('wheel', {arg1: loopData, arg2: multipageLinks}, onMouseWheel);
                    link.hover(function() {
                        link.focus();
                    }, function() {
                        link.blur();
                    }).on('keydown', {arg1: loopData, arg2: multipageLinks}, onKeyDown);
                    link.focus();
                    multipageLinks.each(function() {
                        var multipageLink = $(this);
                        link.data().hoverZoomGallerySrc.push([]);
                        link.data().hoverZoomGalleryCaption.push(link.data().hoverZoomCaption);
                        if (multipageLinks.length > 4) {
                            if (inCircularRange(loopData.start, loopData.end, i)) {
                                prepareMultipageSrcAsync(link, multipageLink, i);
                            }
                        } else {
                            prepareMultipageSrcAsync(link, multipageLink, i);
                        }
                        i++;
                    });
                }
                link.addClass('hoverZoomLink');
                res.push(link);
                hoverZoom.displayPicFromElement(link);
            });
        });

        function prepareSrc(link, response) {
            var fullImg = $('a[href*="files/full/"]', response);
            if (fullImg.length && /\.(png|jpg|gif)$/.test(fullImg.attr('href'))) {
                link.data().hoverZoomSrc = [fullImg.attr('href')];
            } else {
                var screenImg = $('img[src*="files/screen/"]', response);
                if (screenImg.length) {
                    link.data().hoverZoomSrc = [screenImg.attr('src')];
                } else {
                    var thumbSrc = link.find('img').attr('src');
                    if (!(/_noncustom\.\w+$/.test(thumbSrc)))
                        link.data().hoverZoomSrc = [thumbSrc.replace(/thumbnails\/\w+/, 'thumbnails/huge')];
                    else
                        link.data().hoverZoomSrc = [thumbSrc];
                }
            }
            link.data().hoverZoomCaption = $(response).text().replace(/^\s*(.*) <[\s\S]*/, '$1');
        }

        function prepareMultipageSrcAsync(link, multipageLink, i) {
            $.ajax(multipageLink.attr('href')).done(function(response) {
                var fullImg = $('a[href*="files/full/"]', response);
                if (fullImg.length && /\.(png|jpg|gif)$/.test(fullImg.attr('href'))) {
                    link.data().hoverZoomGallerySrc[i] = [fullImg.attr('href')];
                } else {
                    var screenImg = $('img[src*="files/screen/"]', response);
                    if (screenImg.length) {
                        link.data().hoverZoomGallerySrc[i] = [screenImg.attr('src')];
                    } else {
                        var thumbSrc = multipageLink.find('img').attr('src');
                        if (!(/_noncustom\.\w+$/.test(thumbSrc)))
                            link.data().hoverZoomGallerySrc[i] = [thumbSrc.replace(/thumbnails\/\w+/, 'thumbnails/huge')];
                        else
                            link.data().hoverZoomGallerySrc[i] = [thumbSrc];
                    }
                }
            });
        }

        function mod(m, n) {
            return ((m % n) + n) % n;
        }

        function inCircularRange(start, end, i) {
            if (start <= end)
                return (i >= start && i <= end);
            else
                return (i >= start || i <= end);
        }

        function galleryIndexNearEdge(start, end, galleryIndex, galleryLength) {
            return inCircularRange(end, mod(start + 2, galleryLength), galleryIndex) ||
                inCircularRange(mod(end - 2, galleryLength), start, galleryIndex);
        }

        function onMouseWheel(event) {
            var loopData = event.data.arg1,
                multipageLinks = event.data.arg2;
            if (event.originalEvent.wheelDeltaY > 0)
                multipageSrcHelper(loopData, multipageLinks, -1);
            else if (event.originalEvent.wheelDeltaY < 0)
                multipageSrcHelper(loopData, multipageLinks, 1);
        }

        function onKeyDown(event) {
            var loopData = event.data.arg1,
                multipageLinks = event.data.arg2;
            if (event.which == options.prevImgKey)
                multipageSrcHelper(loopData, multipageLinks, -1);
            else if (event.which == options.nextImgKey)
                multipageSrcHelper(loopData, multipageLinks, 1);
        }

        function multipageSrcHelper(loopData, multipageLinks, rot) {
            var totalLinks = multipageLinks.length,
                link = hoverZoom.currentLink,
                data = link.data(),
                nextIndex = mod(data.hoverZoomGalleryIndex + rot, totalLinks),
                loadIndex = mod(data.hoverZoomGalleryIndex + 3 * rot, totalLinks);
            if (!data.hoverZoomGallerySrc[nextIndex].length) {
                data.hoverZoomGalleryIndex = mod(data.hoverZoomGalleryIndex - rot, totalLinks);
                return;
            }
            if (data.hoverZoomGallerySrc && data.hoverZoomGallerySrc.length > 1) {
                if (!inCircularRange(loopData.start, loopData.end, loadIndex) &&
                        galleryIndexNearEdge(loopData.start, loopData.end, nextIndex, totalLinks)) {
                    prepareMultipageSrcAsync(link, multipageLinks.eq(loadIndex), loadIndex);
                    if (rot === -1)
                        loopData.start = mod(loopData.start - 1, totalLinks);
                    else if (rot === 1)
                        loopData.end = mod(loopData.end + 1, totalLinks);
                } else if (Math.abs(loopData.end - loopData.start) === 1) {
                    link.off();
                }
            }
        }

        callback($(res));
    }
});