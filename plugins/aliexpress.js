var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'aliexpress',
    version: '1.0',
    prepareImgLinks: function(callback) {
        const pluginName = this.name;
        const res = [];
        const reSearch = /(https.*?\.(jpg|png)).*/;
        const reReplace = '$1';

        // https://www.aliexpress.com/

        // sample:   https://ae-pic-a1.aliexpress-media.com/kf/S0c7a44c4fccc449890782ceddcda3fa3w.jpg_220x220q75.jpg_.avif
        // fullsize: https://ae-pic-a1.aliexpress-media.com/kf/S0c7a44c4fccc449890782ceddcda3fa3w.jpg
        hoverZoom.urlReplace(res,
            'a img[src*="aliexpress"]',
            reSearch,
            reReplace,
            'a'
        );
        
        hoverZoom.urlReplace(res,
            'img[src*="aliexpress"]',
            reSearch,
            reReplace
        );

        $('a.search-card-item, div.AIC-MI-container').one('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            // list imgs under link
            const imgs = link.find('img[src*="aliexpress"]');
            if (imgs.length == 0) return;

            const gallery = [];
            imgs.each(i => gallery.push([imgs[i].src.replace(reSearch, reReplace)]));
            link.data().hoverZoomGallerySrc = gallery;
            const captions = [];
            imgs.each(i => captions.push([imgs[i].alt]));
            link.data().hoverZoomGalleryCaption = captions;

            callback(link, pluginName);
            // Gallery is displayed iff cursor is still over the gallery
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link);
        }).one('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        callback($(res), pluginName);
    }
});
