var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Streamable',
    prepareImgLinks: function (callback) {
        if (!options.zoomVideos) return;
        $('a[href*="//streamable.com/"]:not(.hoverZoomMouseOver)').addClass('hoverZoomMouseOver').one('mouseenter', function () {
            hoverZoom.prepareFromDocument($(this), this.href, function(doc) {
                // the fetched page is parsed into doc.body (see prepareFromDocument),
                // so its meta tags must be looked up in the whole document, not in doc.head
                var meta = doc.querySelector('meta[property="og:video"][content]') ||
                           doc.querySelector('meta[property="og:video:url"][content]');
                return meta ? meta.content : false;
            });
        });
    }
});