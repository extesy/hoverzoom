var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Inkbunny',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        //  TODO
        //  hoverzoom canvas doesn't appear until after you move the mouse after it's done preparing
        //  scrolling to an image that hasn't been loaded yet will freeze until you scroll back to
        //      a loaded image and then back to the previously unloaded image
        //  change to full size image, not screen

        //find all submission links
        $('a[href*="s/"]').filter(function() {
            return /s\/\d+(-p\d+)?(-latest)?(-?#pictop)?\/?$/.test($(this).attr('href'));
        }).one('mouseover', function() {
            var link = $(this),
                url = link.attr('href');

            //follow a submission link
            $.ajax(url).done(function(response) {
                //console.log("url: " + url);

                //get the submission's src
                var img = $('img[src*="files/screen/"]', response).first();
                //console.log(img);

                if (img.length) {
                    link.data().hoverZoomSrc = [img.attr('src')];
                } else {
                    var thumbSrc = link.find('img').attr('src');
                    if (!(/_noncustom\.\w+$/.test(thumbSrc)))
                        link.data().hoverZoomSrc = [thumbSrc.replace(/thumbnails\/\w+/, 'thumbnails/huge')];
                    else
                        link.data().hoverZoomSrc = [thumbSrc];
                }
                link.data().hoverZoomCaption = $(response).text().replace(/^\s*(.*) <[\s\S]*/, '$1');

                //console.log(link.data());
                //console.log("mainSrc: " + img.attr('src'));

                //check if the submission has other pages. these are found in links
                //that contain the base url and have an img child
                var multipageContainer = $('#files_area ~ div', response),
                    firstPage = url.replace(/^(.*s\/\d+).*$/, '$1'),
                    multipageLinks = $('a[href*="' + firstPage + '"]:has(img)', multipageContainer);

                /* console.log("firstPage: " + firstPage);
                console.log("multipageLinks:");
                console.log(multipageLinks); */

                //submission has multiple pages
                if (multipageLinks.length) {
                    //console.log("multipageLinks URLs:");

                    link.data().hoverZoomGallerySrc = [];
                    link.data().hoverZoomGalleryCaption = [];

                    var startIndex = url.replace(/^(.*s\/\d+)-p(\d+)?.*$/, '$2');
                    startIndex = (startIndex === url) ? 0 : parseInt(startIndex) - 1;
                    link.data().hoverZoomGalleryIndex = startIndex;

                    var i = 0, loopData = {
                        start: mod(startIndex - 2, multipageLinks.length),
                        end: mod(startIndex + 2, multipageLinks.length) };
                    link.on('mousewheel', {arg1: loopData, arg2: multipageLinks}, onMouseWheel);
                    multipageLinks.each(function() {
                        var multipageLink = $(this).attr('href');
                        //console.log(multipageLink);

                        link.data().hoverZoomGallerySrc.push([]);
                        link.data().hoverZoomGalleryCaption.push(link.data().hoverZoomCaption);

                        if (multipageLinks.length > 4) {
                            if (inCircularRange(loopData.start, loopData.end, i)) {
                                prepareMultipageSrcAsync(link, multipageLink, i);
                            } else {
                                /* multipageLink.on('updateRange', function() {
                                    if (!inCircularRange(start, end, i) &&
                                            galleryIndexNearEdge(start, end,
                                                link.data().hoverZoomGalleryIndex,
                                                multipageLinks.length)) {
                                        prepareMultipageSrcAsync(link, multipageLink, start, end, i);
                                        multipageLink.off('updateRange');
                                    }
                                }); */

                            }

                            /* var promise = new Promise(function(resolve, reject) {
                                if (Math.abs(i - start) < 3) {
                                    resolve(i, -1);
                                } else if (Math.abs(end - i) < 3) {
                                    resolve(i, 1);
                                }
                            });

                            promise.then(function(index, dir) {
                                if (dir === -1)
                                    console.log("Load more images from start");
                                else if (dir === 1)
                                    console.log("Load more images from end");


                            }); */
                        } else {
                            prepareMultipageSrcAsync(link, multipageLink, i);
                        }

                        i++;
                    });
                }
                link.addClass('hoverZoomLink');
                //callback($([link]));
                res.push(link);
            });
        });

        function prepareMultipageSrcAsync(origLink, multipageLink, i) {
            $.ajax(multipageLink).done(function(nestedResponse) {
                var multipageImg = $('img[src*="files/screen/"]', nestedResponse).first();
                if (multipageImg.length) {
                    origLink.data().hoverZoomGallerySrc[i] = [multipageImg.attr('src')];
                } else {
                    var thumbSrc = origLink.find('img').attr('src');
                    if (/\/images78\/overlays/.test(thumbSrc))
                        origLink.data().hoverZoomGallerySrc[i] = [thumbSrc];
                    else if (!(/_noncustom\.\w+$/.test(thumbSrc)))
                        origLink.data().hoverZoomGallerySrc[i] = [thumbSrc.replace(/thumbnails\/\w+/, 'thumbnails/huge')];
                }

                /* console.log("multipage ajax");
                console.log("i = " + i);
                console.log("original link: " + link.attr('href'));
                console.log("multipageLink: " + multipageLink);
                console.log("multipageImg: " + multipageImg);
                console.log(link.data()); */
                //callback($([link]));
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
            return inCircularRange(start, mod(start + 2, galleryLength), galleryIndex) ||
                inCircularRange(mod(end - 2, galleryLength), end, galleryIndex);
        }

        function onMouseWheel(event) {
            var loopData = event.data.arg1,
                multipageLinks = event.data.arg2,
                link = hoverZoom.currentLink,
                data = link.data();
            console.log("start: " + loopData.start);
            console.log("end: " + loopData.end);

            if (data.hoverZoomGallerySrc && data.hoverZoomGallerySrc.length > 1) {
                var rot;
                if (event.originalEvent.wheelDeltaY > 0) {
                    rot = -1;
                    console.log("scrolling up to " + (data.hoverZoomGalleryIndex + rot));

                    /* if (!inCircularRange(loopData.start, loopData.end, nextIndex) &&
                            galleryIndexNearEdge(loopData.start, loopData.end, nextIndex, data.hoverZoomGallerySrc.length)) {
                        prepareMultipageSrcAsync(link, multipageLink, nextIndex);
                        loopData.start--;
                    } */

                    /* if (galleryIndexNearEdge(start, end, galleryIndex - 1, multipageLinks.length)) {
                        prepareMultipageSrcAsync(link, multipageLink, start, end, i);
                        multipageLink.off('updateRange');
                    } */
                } else {
                    rot = 1;
                    console.log("scrolling down to " + (data.hoverZoomGalleryIndex + rot));

                    /* if (!inCircularRange(loopData.start, loopData.end, nextIndex) &&
                            galleryIndexNearEdge(loopData.start, loopData.end, nextIndex, data.hoverZoomGallerySrc.length)) {
                        prepareMultipageSrcAsync(link, multipageLink, nextIndex);
                        loopData.start++;
                    } */

                    /* if (galleryIndexNearEdge(start, end, galleryIndex + 1, multipageLinks.length)) {
                        prepareMultipageSrcAsync(link, multipageLink, start, end, i);
                        multipageLink.off('updateRange');
                    } */
                }
                var nextIndex = mod(data.hoverZoomGalleryIndex + rot, multipageLinks.length),
                    loadIndex = mod(data.hoverZoomGalleryIndex + 3 * rot, multipageLinks.length);
                console.log("load " + loadIndex + "?");
                if (!inCircularRange(loopData.start, loopData.end, loadIndex) &&
                        galleryIndexNearEdge(loopData.start, loopData.end, nextIndex, multipageLinks.length)) {
                    console.log("doing ajax");
                    prepareMultipageSrcAsync(link, multipageLinks[loadIndex].href, loadIndex);
                    if (rot === -1)
                        loopData.start = mod(loopData.start - 1, multipageLinks.length);
                    else
                        loopData.end = mod(loopData.end + 1, multipageLinks.length);
                } else if (Math.abs(loopData.end - loopData.start) === 1) {
                    link.off('mousewheel');
                }
            }
        }

        //console.log(res);
        callback($(res));
    }
});