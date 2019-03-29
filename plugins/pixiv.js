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
                    if (imgCount != 1)
                        galleryView(link, link.attr('href').replace("=medium", "=manga"), imgCount);
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

        function galleryView(link, href, imgCount) {
            let linkData = link.data();
            linkData.hoverZoomGallerySrc = [];
            linkData.hoverZoomGalleryCaption = [];
            $.get(href, function (data) {
                if (link.data().hoverZoomSrc) return;
                try {
                    for (let i = 0; i < imgCount; i++) {
                        let idxStartStrign = 'pixiv.context.images[' + i + '] = "';
                        let idx = data.indexOf(idxStartStrign) + idxStartStrign.length;
                        let idx2 = data.indexOf('";pixiv.context.thumbnailImages[' + i + ']');
                        let url = data.slice(idx, idx2).replace(/\\/g, '');
                        let urls = [url], caption = '';
                        linkData.hoverZoomGalleryCaption.push(i);
                        linkData.hoverZoomGallerySrc.push(urls);
                        linkData.hoverZoomSrc = undefined;
                    }
                } catch (e) {
                    cLog('Pixiv has probably changed HTML code for where galleries are');
                }
                callback($([link]));
            });
        }
    }
});