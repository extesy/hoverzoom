var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'hibid',
    version: '0.1',
    prepareImgLinks: function(callback) {
        var res = [];

        // sample: https://hibid.com/catalog/276060/disney-store-displays-online-auction/
        // thumbnail : https://media.sandhills.com/img.axd?id=7012043483&wid=&p=&ext=&w=0&h=0&t=&lp=&c=True&wt=False&sz=Max&rt=0&checksum=Hs1tP94XcplrEJyjQ9%2fJ5YEF8QVcG3Fo&h=200&w=200
        //  fullsize : https://media.sandhills.com/img.axd?id=7012043483&wid=&p=&ext=&w=0&h=0&t=&lp=&c=True&wt=False&sz=Max&rt=0&checksum=Hs1tP94XcplrEJyjQ9%2fJ5YEF8QVcG3Fo

         $('img[src*="img.axd"]').each(function() {

            var src = this.src;
            var fullsizeUrl = src.replace(/&h=\d+&w=\d+/, '');
            if (fullsizeUrl != src) {
                var link = $(this);
                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    res.push(link);
                }
            }
        });

        callback($(res), this.name);
    }
});
