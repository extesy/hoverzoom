var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Inkbunny',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        //? sometimes a multipage submission gallery won't work until after you re-hover
        //  hoverzoom canvas doesn't appear until after you move the mouse after it's done preparing
        //- only retrieves the first row of pages in multipage submissions
        //- put back the last resort to icons
        //  prevent multipage submissions from loading the entire gallery at the same time

        //find all submission links
        $('a[href*="s/"]').filter(function() {
            return /s\/\d+(-p\d+-)?(#pictop)?\/?$/.test($(this).attr('href'));
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
                    /* if (/\/images78\/overlays/.test(thumbSrc))
                        link.data().hoverZoomSrc = [thumbSrc];
                    else  */if (!(/_noncustom\.\w+$/.test(thumbSrc)))
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

                    var galleryIndex = url.replace(/^(.*s\/\d+)-p(\d+)?.*$/, '$2');
                    galleryIndex = (galleryIndex === url) ? 0 : parseInt(galleryIndex) - 1;
                    link.data().hoverZoomGalleryIndex = galleryIndex;

                    var i = 0;
                    multipageLinks.each(function() {
                        var multipageURL = $(this).attr('href');
                        //console.log(multipageURL);

                        link.data().hoverZoomGallerySrc.push([]);
                        link.data().hoverZoomGalleryCaption.push(link.data().hoverZoomCaption);
                        (function(index) {
                            $.ajax(multipageURL).done(function(nestedResponse) {
                                var multipageImg = $('img[src*="files/screen/"]', nestedResponse).first();
                                if (multipageImg.length) {
                                    link.data().hoverZoomGallerySrc[index] = [multipageImg.attr('src')];
                                } else {
                                    var thumbSrc = link.find('img').attr('src');
                                    if (/\/images78\/overlays/.test(thumbSrc))
                                        link.data().hoverZoomGallerySrc[index] = [thumbSrc];
                                    else if (!(/_noncustom\.\w+$/.test(thumbSrc)))
                                        link.data().hoverZoomGallerySrc[index] = [thumbSrc.replace(/thumbnails\/\w+/, 'thumbnails/huge')];
                                }

                                /* console.log("multipage ajax");
                                console.log("i = " + index);
                                console.log("original link: " + link.attr('href'));
                                console.log("multipageURL: " + multipageURL);
                                console.log("multipageImg: " + multipageImg);
                                console.log(link.data()); */
                                //callback($([link]));
                            });
                        }(i));
                        i++;
                    });
                }
                link.addClass('hoverZoomLink');
                //callback($([link]));
                res.push(link);
            });
        });

        //console.log(res);
        callback($(res));
    }
});