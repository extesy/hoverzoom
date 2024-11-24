var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'FurAffinity',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        $('a[href*="/view/"]:not(.hoverZoomMouseover)').filter(function() {
			return this.href.match(/\/view\/\d+\/$/);
		}).addClass('hoverZoomMouseover').one('mouseover', function() {
            hoverZoom.prepareFromDocument($(this), this.href, function(doc) {
                var img = doc.querySelector('img[data-fullview-src]');
                return img ? img.dataset.fullviewSrc : null;
            });
        });
        callback($(res), this.name);
    }
});