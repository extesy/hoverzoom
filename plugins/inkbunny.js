var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Inkbunny',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        //sometimes a multipage submission gallery won't work until after you re-hover?
        //hoverzoom canvas doesn't appear until after you move the mouse after it's done preparing

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
                var img = $('img[src*="files/screen/"]', response);
                link.data().hoverZoomSrc = [img.attr('src')];
                link.data().hoverZoomCaption = $(response).text().replace(/^\s*(.*) <[\s\S]*/, '$1');

                //console.log("mainSrc: " + img.attr('src'));

                //check if the submission has other pages. these are found in links
                //that contain the base url and have an img child
                var multipageContainer = $('#files_area + div', response),
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
                                var multipageImg = $('img[src*="files/screen/"]', nestedResponse).attr('src');
                                link.data().hoverZoomGallerySrc[index] = [multipageImg];

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
                //callback($([link]));
                link.addClass('hoverZoomLink');
                res.push(link);
            });
        });

        //console.log(res);
        callback($(res));
    }
});