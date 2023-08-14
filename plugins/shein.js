var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'shein',
    version: '1.1',
    favicon:'shein.ico',
    prepareImgLinks: function(callback) {

        $('img[data-src], img[src*="_thumbnail"]').one('mouseover', function() {
            const src = this.dataset.src || this.src;
            const link = $(this);
            const largeUrl = src.replace(/_thumbnail.*\./, '.');
            link.data().hoverZoomSrc = [largeUrl];
            link.addClass('hoverZoomLink');
            callback(link, this.name);
            hoverZoom.displayPicFromElement(link);
        });

        // deals with cover-protection (#1203)
        $('.cover-frame').one('mouseover', function() {
            const link = $(this);
            if (link.siblings('img:not(.lazyload)').length != 1) return;
            const img = link.siblings('img:not(.lazyload)')[0];
            const src = img.dataset.src || img.src;
            const largeUrl = src.replace(/_thumbnail.*\./, '.');
            link.data().hoverZoomSrc = [largeUrl];
            link.addClass('hoverZoomLink');
            callback(link, this.name);
            hoverZoom.displayPicFromElement(link);
        });

    }
});
