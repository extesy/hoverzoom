var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'kotnauction',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var name = this.name;
        var res = [];

        $('img[src]').each(function () {
            var link = $(this);
            const src = this.src;
            link.data().hoverZoomSrc = [src + '?123456'];
            res.push(link);
        });

        callback($(res), this.name);
    }
});
