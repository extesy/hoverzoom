var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'itaku_a',
    version:'1.0',
    prepareImgLinks:function (callback) {
        var name = this.name;
        var res = [];

        // image/video
        //       sample: https://itaku.ee/images/533225
        // Itaku (img/video) id: 533225
        $('a[href*="/images/"]').filter(function() { return (/itaku\.ee\/images\/\d+/.test($(this).prop('href'))) }).one('mouseover', function() {
            const href = this.href;
            var link = $(this);

            const re = /itaku\.ee\/images\/(\d+)/;
            m = href.match(re);
            if (m == undefined) return;
            const itakuId = m[1];

            // reuse previous result
            if (link.data().hoverZoomItakuId == itakuId) {
                if (link.data().hoverZoomItakuUrl) {
                    link.data().hoverZoomSrc = link.data().hoverZoomItakuUrl;
                    link.data().hoverZoomCaption = link.data().hoverZoomItakuCaption;
                }
                return;
            }

            link.data().hoverZoomItakuId = itakuId;
            link.data().hoverZoomItakuUrl = undefined;
            link.data().hoverZoomItakuCaption = undefined;

            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:'https://itaku.ee/api/galleries/images/' + itakuId},
                                        function (response) {
                                            try {
                                                const j = JSON.parse(response);
                                                const itakuUrl = j.video?.video || j.image;
                                                if (itakuUrl) {
                                                    link.data().hoverZoomSrc = link.data().hoverZoomItakuUrl = [itakuUrl];
                                                    link.data().hoverZoomCaption = link.data().hoverZoomItakuCaption = j.title;
                                                    callback(link, name);
                                                    hoverZoom.displayPicFromElement(link);
                                                }
                                            } catch {}
                                        });
        });

        // commission
        // sample: https://itaku.ee/commissions/1212
        $('a[href*="/commissions/"]').filter(function() { return (/itaku\.ee\/commissions\/\d+/.test($(this).prop('href'))) }).one('mouseover', function() {
            const href = this.href;
            var link = $(this);

            const re = /itaku\.ee\/commissions\/(\d+)/;
            m = href.match(re);
            if (m == undefined) return;
            const itakuId = m[1];

            // reuse previous result
            if (link.data().hoverZoomItakuId == itakuId) {
                if (link.data().hoverZoomItakuGallery) {
                    link.data().hoverZoomGallerySrc = link.data().hoverZoomItakuGallery;
                    link.data().hoverZoomGalleryCaption = link.data().hoverZoomItakuCaptions;
                }
                return;
            }

            link.data().hoverZoomItakuId = itakuId;
            link.data().hoverZoomItakuGallery = undefined;
            link.data().hoverZoomItakuCaptions = undefined;

            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:'https://itaku.ee/api/commissions/' + itakuId},
                                        function (response) {
                                            try {
                                                const j = JSON.parse(response);
                                                const images = j.reference_gallery_images.map(r => [r.image_xl]);
                                                const captions = j.reference_gallery_images.map(r => r.title);
                                                if (images) {
                                                    link.data().hoverZoomSrc = undefined;
                                                    link.data().hoverZoomGallerySrc = link.data().hoverZoomItakuGallery = images;
                                                    link.data().hoverZoomGalleryCaption = link.data().hoverZoomItakuCaptions = captions;
                                                    link.data().hoverZoomGalleryIndex = 0;
                                                    callback(link, name);
                                                    hoverZoom.displayPicFromElement(link);
                                                }
                                            } catch {}
                                        });
        });

        // profile
        hoverZoom.urlReplace(res,
            'img[src*="itaku.ee/api/media/profile_pics/"]',
            '/sm.',
            '/md.'
        );

        // cover
        hoverZoom.urlReplace(res,
            'img[src*="itaku.ee/api/media/cover_pics/"]',
            '/sm.',
            '/lg.'
        );

        callback($(res), name);
    }
});
