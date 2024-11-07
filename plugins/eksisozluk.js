var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'eksisozluk',
    version: '1.0',
    prepareImgLinks: function(callback) {
        const res = [];
        
        // page hosting link to img: https://eksisozluk.com/entry/140581590
        // link to img:              https://soz.lk/i/3jadcz74
        // fullsize img:             https://cdn.eksisozluk.com/2022/7/28/3/3jadcz74.jpg
        $('a[href*="/soz.lk/"]:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function() {

            let link = undefined;
            let href = undefined;

            href = this.href;
            link = $(this);

            // clean previous result
            link.data().hoverZoomSrc = [];
            hoverZoom.prepareFromDocument($(this), this.href, function(doc) {
                let img = doc.querySelector('img');
                if (img) return img.src;
            }, false); // get source sync
        });

        callback($(res), this.name);
    }
});
