var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'FurAffinity',
    version:'0.2',
    prepareImgLinks:function (callback) {
        let res = [];
        $('a[href*="/view/"]:not(.hoverZoomMouseover)').filter(function() {
			return this.href.match(/\/view\/\d+\/$/);
		}).addClass('hoverZoomMouseover').one('mouseover', function() {
            hoverZoom.prepareFromDocument($(this), this.href, function(doc) {
                const img = doc.querySelector('img[data-fullview-src]');
                return img ? 'https:' + img.dataset.fullviewSrc : null;
            });
        });
        callback($(res), this.name);
    }
});