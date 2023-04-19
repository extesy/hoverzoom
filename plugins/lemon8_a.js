var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'lemon8_a',
    version: '1.0',
    prepareImgLinks: function(callback) {

        if (window.location.host.indexOf('lemon8-app') !== -1) return;

        const pluginName = this.name;
        var res = [];

        // photos & videos
        $('a[href]:not(.hoverZoomMouseover)').filter(function() { return (/lemon8-app/.test($(this).prop('href'))) }).addClass('hoverZoomMouseover').one('mouseover', function() {

            var link = this;
            link = $(link);

            if (link.data().hoverZoomGallerySrc == undefined) {
                // load link
                hoverZoom.prepareFromDocument(link, this.href, function (doc, callback) {
                    // video
                    const video = doc.body.querySelector('video source');
                    if (video) {
                        callback(video.src + '.video');
                        hoverZoom.displayPicFromElement(link);
                    } else {
                        // images
                        const images = doc.body.querySelectorAll('ul.sharee-carousel-list-inner img');
                        if (images && images.length) {
                            var gallery = [];
                            images.forEach(i => gallery.unshift([i.src]));
                            link.data().hoverZoomSrc = undefined;
                            link.data().hoverZoomGallerySrc = gallery;
                            link.data().hoverZoomGalleryIndex = 0;
                            callback(gallery);
                            hoverZoom.displayPicFromElement(link);
                        }
                    }
                }, true); // get source async
            }
        });

        callback($(res), pluginName);
    }
});
