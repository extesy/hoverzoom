var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'polona',
    version:'0.1',
    prepareImgLinks:function (callback) {

        const pluginName = this.name;

        var HZpolona = sessionStorage.getItem('HZpolona');
        if (HZpolona == null) {
            HZpolona = {};
        } else {
            HZpolona = JSON.parse(HZpolona);
        }

        function displayGallery(link, gallery) {
            link.data().hoverZoomSrc = undefined;
            link.data().hoverZoomGallerySrc = gallery;
            link.data().hoverZoomGalleryIndex = 0;
            callback(link, pluginName);
            // Gallery is displayed iff the cursor is still over the link
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link);
        }

        function displayImage(link, gallery, page) {
            link.data().hoverZoomSrc = [gallery[page]];
            page++;
            link.data().hoverZoomCaption = `${page} / ${gallery.length}`;
            callback(link, pluginName);
            // Image is displayed iff the cursor is still over the link
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link);
        }

        // gallery
        // link: https://polona.pl/preview/304624d8-ba58-4959-9f00-5aaa14e49551
        //    => https://polona.pl/api/search-index/search/iiif/304624d8-ba58-4959-9f00-5aaa14e49551/manifest.json
        $('a[href*="/preview/"]').one('mouseover', function() {

            const link = $(this);
            const href = this.href;
            let data = link.data();

            if (data.hoverZoomMouseOver) return;
            data.hoverZoomMouseOver = true;

            const re = /\/(preview)\/([^\/\?]{1,})/;
            const m = href.match(re);
            if (m == null) return;
            const id = m[2];

            // reuse previous results
            var gallery = HZpolona[id];
            if (gallery) {
                displayGallery(link, gallery);
                return;
            }

            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:`https://polona.pl/api/search-index/search/iiif/${id}/manifest.json`
                                       }, function (response) {
                                            if (response == null) { return; }

                                            var j = undefined;
                                            try {
                                                j = JSON.parse(response);
                                                var gallery = [];
                                                j.items.forEach(i => gallery.push([i.items[0].items[0].id]));
                                                HZpolona[id] = gallery;
                                                sessionStorage.setItem('HZpolona', JSON.stringify(HZpolona));
                                                displayGallery(link, gallery);
                                            } catch (e) { return; }
                                        }
            );
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // detail
        // https://polona.pl/item-view/2c5033bb-e42c-40e6-899c-6246285a9d27?page=6
        // => display 7th item from gallery as pages are 0-based
        $('a[href*="/item-view/"]').one('mouseover', function() {

            const link = $(this);
            const href = this.href;
            let data = link.data();

            if (data.hoverZoomMouseOver) return;
            data.hoverZoomMouseOver = true;

            const re = /\/(item-view)\/([^\/\?]{1,})/;
            const m = href.match(re);
            if (m == null) return;
            const id = m[2];
            const re2 = /\?page=(\d+)/;
            const m2 = href.match(re2);
            if (m2 == null) return;
            const page = m2[1];

            // reuse previous results
            var gallery = HZpolona[id];
            if (gallery && gallery[page]) {
                displayImage(link, gallery, page);
                return;
            }

            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:`https://polona.pl/api/search-index/search/iiif/${id}/manifest.json`
                                       }, function (response) {
                                            if (response == null) { return; }

                                            var j = undefined;
                                            try {
                                                j = JSON.parse(response);
                                                var gallery = [];
                                                j.items.forEach(i => gallery.push([i.items[0].items[0].id]));
                                                HZpolona[id] = gallery;
                                                sessionStorage.setItem('HZpolona', JSON.stringify(HZpolona));
                                                displayImage(link, gallery, page);
                                            } catch (e) { return; }
                                        }
            );
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

    }
});
