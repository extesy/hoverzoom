var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'imagebam_a',
    version: '0.1',
    prepareImgLinks: function(callback) {
        var res = [];

        // sample
        // thumbnail:                       https://thumbs.imagebam.com/17/ca/06/206f23635328743.jpg
        // page with fullsize img embeded:  https://www.imagebam.com/image/206f23635328743.jpg
        // only fullsize img:               https://images.imagebam.com/aa/dd/98/206f23635328743.jpg

        // sample gallery: https://www.imagebam.com/gallery/ltximpfxaf8gzebp8uymdvhtglhdfxg0
        //                 https://www.imagebam.com/gallery/bf2ify3sx8bpqnvslhppghdt9h9z56zh

        $('img[src*="imagebam"]:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').filter(function() { return /thumb/.test(this.src) }).one('mouseover', function() {

            var href = this.src.replace(/.*\/(.*)/, 'https://www.imagebam.com/image/$1');

            hoverZoom.prepareFromDocument($(this), href, function(doc, callback) {

                // 1st try
                findUrl(doc, callback);

                // 2nd try (fullsize img is displayed after some wait time)
                setTimeout(function() {

                    findUrl(doc, callback);

                }, 5000);

            }, true); //async
        });

        function findUrl(doc, callback) {
            let innerHTML = doc.documentElement.innerHTML;
            let m = innerHTML.match(/src=\"(https?:\/\/images.*?)\"/);
            if (!m) return;
            let fullsizeUrl = m[1];
            callback(fullsizeUrl);
        }
    }
});
