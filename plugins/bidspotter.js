var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'bidspotter',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var pluginName = this.name;
        var res = [];

        // auction url sample: https://www.bidspotter.com/en-us/auction-catalogues/bscmo/catalogue-id-bscmo10173/lot-09465c01-2db7-4716-a6c3-b2a7010a5636

        // load img gallery
        function loadGallery(link, href) {
            chrome.runtime.sendMessage({action:'ajaxGet', url:href}, function (response) {

                if (response == null) { return; }

                const parser = new DOMParser();
                const doc = $(parser.parseFromString(response, "text/html"));

                const imgs = doc.find('div.lot-details-image img[src]');
                if (imgs.length == 0) return;

                var gallery = [];
                imgs.each(i => gallery.push([imgs[i].src.replace(/(.*)\?.*/, '$1')]));
                var captions = [];
                imgs.each(i => captions.push([imgs[i].alt]));

                link.data().hoverZoomGallerySrc = gallery;
                link.data().hoverZoomGalleryCaption = captions;
                callback(link, pluginName);
                // Gallery is displayed iff cursor is still over the gallery
                if (link.data().hoverZoomMouseOver)
                    hoverZoom.displayPicFromElement(link);
            });
        }

        // catalog
        $('a[href*="/auction-catalogues/"]').one('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;
            const href = this.href;
            loadGallery(link, href);
        }).one('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // img
        $('div[data-slick-index] > img[src*="/images/"]').one('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;
            const src = this.src;
            const fullsizeUrl = src.replace(/(.*)\?.*/, '$1');

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.unshift(fullsizeUrl);
                link.data().hoverZoomJikeImgUrl = fullsizeUrl;
            }

            callback(link, pluginName);
            // Image or video is displayed iff the cursor is still over the link
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link);
        }).one('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        callback($(res), this.name);
    }
});
