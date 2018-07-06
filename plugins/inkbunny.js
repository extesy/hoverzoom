var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Inkbunny',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        $('img[src*="thumbnails/"], img[src*="preview/"]').each(function() {
            var img = $(this),
                multipage = img.next(),
                src = img.attr('src'),
                thumbSrc = src;

            src = prepareThumbnailSrc(src);
            img.data().hoverZoomSrc = getPossibleImgSrcs(src, thumbSrc);

            // console.log("1:");
            // console.log(img.data());

            if (multipage.length && multipage.attr('style').includes('multipage')) {
                img.data().hoverZoomGallerySrc = [];
                img.data().hoverZoomGallerySrc.push(img.data().hoverZoomSrc);
                //img.data().hoverZoomGalleryCaption = [];

                //var url = img.parent().attr('href');
                /* $.when().done(function() {

                }); */
                pushMultipageImgDataAsync(img);

                res.push(img);
                /* $(document).ajaxStop(function() {
                    console.log('ajaxStop');
                    res.push(img);
                    $(document).unbind('ajaxStop');
                }); */
            } else {
                res.push(img);
            }
        });

        function prepareThumbnailSrc(src) {
            if (/\/thumbnails\/\w*/.test(src))
                src = src.replace(/\/thumbnails\/\w*/, '/files/screen');
            if (/\/preview/.test(src))
                src = src.replace(/\/preview/, '/screen');
            if (/\/private_thumbnails\/\w*/.test(src))
                src = src.replace(/\/private_thumbnails\/\w*/, '/private_files/screen');
            src = src.replace(/(_noncustom)?\.\w*$/, '.');
            return src;
        }

        function pushMultipageImgDataAsync(img) {
            var url = img.parent().attr('href');
            $.ajax(url).done(function(response) {
                var i = 0;
                $('img[alt*="page "][src*="thumbnails/"]', response).each(function() {
                    if (i > 0) {
                        var page = $(this),
                            pageSrc = page.attr('src'),
                            pageThumbSrc = pageSrc;
                        pageSrc = prepareThumbnailSrc(pageSrc);
                        // console.log("pageSrc: " + pageSrc);
                        img.data().hoverZoomGallerySrc.push(getPossibleImgSrcs(pageSrc, pageThumbSrc));
                    }
                    i++;
                });
                // console.log("2:");
                // console.log(img.data());

                callback($([img]));
            });
        }

        function getPossibleImgSrcs(src, thumbSrc) {
            return [//src + 'png'];
                src + 'jpg', src + 'png', src + 'gif',
                thumbSrc.replace(/thumbnails\/\w*/, 'thumbnails/huge'),
                thumbSrc.replace(/thumbnails\/\w*/, 'thumbnails/large')
            ];
        }

        $('a[href*="inkbunny.net/s/"]').each(function() {
            var link = $(this),
                url = link.attr('href');
            $.ajax({
                url: url,
                success: function(response) {
                    var img = $('img[src*="files/screen/"]:not(a > img)', response);
                    hoverZoom.urlReplace(res,
                        'a[href*="inkbunny.net/s/"]',
                        /^.+$/,
                        img.attr('src')
                    );
                    link.addClass('hoverZoomLink');
                }
            });
        });

        //console.log(res);
        callback($(res));
    }
});