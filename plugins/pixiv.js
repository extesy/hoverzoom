var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Pixiv',
    prepareImgLinks: function (callback) {
        var res = [],
            filter = 'a img[src*="pixiv.net/img"]',
            search = [/_(\d+(ms)?|\d+x\d+)\./, '/mobile/'];
        hoverZoom.urlReplace(res, filter, search, ['_m.', '/']);
        if (options.showHighRes) {
            hoverZoom.urlReplace(res, filter, search, ['.', '/']);
        }
        hoverZoom.urlReplace(res, 'a img[src*="pixiv.net/profile/"]', search, ['.', '/']);
        callback($(res));

        $('a[href*="member_illust.php"]').on('mouseover', function () {
            var link = $(this);
            if (link.data().hoverZoomSrc) return;
            $.get(link.attr('href'), function (data) {
                if (link.data().hoverZoomSrc) return;
                try {
                    // extract JSON data from embedded script
                    let idx = data.indexOf('{"illustId"');
                    if (idx < 0) return;
                    let idx2 = data.indexOf('},user:', idx);
                    if (idx2 < 0) return;
                    let json = JSON.parse(data.slice(idx, idx2));
                    let imgCount = json.pageCount;
                    if (imgCount != 1) {
                        link.data().hoverZoomGallerySrc = [];
                        link.data().hoverZoomGalleryCaption = [];
                        for (let i = 0; i < imgCount; i++) {
                            if (options.showHighRes)
                                src = json.urls.original;
                            else
                                src = json.urls.regular;
                            let url = src.replace("_p0", "_p" + i);
                            let urls = [url], caption = '';
                            link.data().hoverZoomGalleryCaption.push(i);
                            link.data().hoverZoomGallerySrc.push(urls);
                            link.data().hoverZoomSrc = undefined;
                        }
                        callback($([link]));
                        // galleryView(json);
                    }
                    else {
                        if (options.showHighRes)
                            src = json.urls.original;
                        else
                            src = json.urls.regular;
                        hoverZoom.prepareLink(link, src);
                    }
                } catch (e) {
                    cLog('Pixiv has probably changed JSON format.');
                }
            });
        });
    }
});