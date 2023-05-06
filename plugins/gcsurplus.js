var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'gcsurplus',
    version: '1.0',
    prepareImgLinks: function(callback) {

        const pluginName = this.name;
        var res = [];

        $('a[href*="mn-eng"]:not(.hoverZoomMouseover), a[href*="mn-fra"]:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function() {
            var link = this;
            link = $(link);
            link.data().hoverZoomSrc = undefined;

            if (link.data().hoverZoomGallerySrc == undefined) {
                // load link
                hoverZoom.prepareFromDocument(link, this.href, function (doc, callback) {
                    const images = doc.body.querySelectorAll('.list-inline img');
                    if (images && images.length) {
                        var gallery = [];
                        images.forEach(i => gallery.push([i.src.replace(/(^.*)\/(.*?)\.(JPEG|jpg)/, '$1/FS$2.$3')]));
                        link.data().hoverZoomSrc = undefined;
                        link.data().hoverZoomGallerySrc = gallery;
                        link.data().hoverZoomGalleryIndex = 0;
                        callback(gallery);
                        hoverZoom.displayPicFromElement(link);
                    }
                }, true); // get source async
            }
        });

        callback($(res), pluginName);
    }
});
