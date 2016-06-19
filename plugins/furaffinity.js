var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'FurAffinity',
    prepareImgLinks:function (callback) {
        var res = [];
        $('a[href*="/view/"]').filter(function() {
			return this.href.match(/\/view\/\d+\/$/);
		}).one('mouseover', function() {
            hoverZoom.prepareFromDocument($(this), this.href, function(doc) {
                var srcLink = doc.querySelector('a[href*="d.facdn.net"]');
                return srcLink ? srcLink.href : false;
            });
        });
        callback($(res));
    }
});