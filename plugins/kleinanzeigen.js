var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'kleinanzeigen.de',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var pluginName = this.name;
        var res = [];

        // load img gallery, e.g: https://www.kleinanzeigen.de/s-anzeige/esstisch-massive-eiche/2942601447-86-1757
        function loadGallery(link, href) {

            chrome.runtime.sendMessage({action:'ajaxGet', url:href}, function (response) {

                if (response == null) { return; }

                const parser = new DOMParser();
                const doc = $(parser.parseFromString(response, "text/html"));

                const metas = doc.find('div[data-ix] meta[itemProp*="contentUrl"]');
                const titles = doc.find('div[data-ix] img[title]');
                if (metas.length == 0) return;
                var gallery = [];
                metas.each(i => gallery.push([metas[i].content]));
                var captions = [];
                if (gallery.length == titles.length) {
                    titles.each(i => captions.push(titles[i].title));
                }

                link.data().hoverZoomGallerySrc = gallery;
                link.data().hoverZoomGalleryCaption = captions;
                callback(link, pluginName);
                // Gallery is displayed iff cursor is still over the gallery
                if (link.data().hoverZoomMouseOver)
                    hoverZoom.displayPicFromElement(link);
            });
        }

        $('a[href*="/s-anzeige/"]').one('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;
            const href = this.href;
            loadGallery(link, href);

        }).one('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        callback($(res), this.name);
    }
});
