var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'hejto',
    version:'0.1',
    prepareImgLinks:function (callback) {

        //   sample: https://hejto-media.s3.eu-central-1.amazonaws.com/uploads/posts/images/250x250/0121101aeff54233a72bf0abfda6a3f4.png
        // fullsize: https://hejto-media.s3.eu-central-1.amazonaws.com/uploads/posts/images/1200x900/0121101aeff54233a72bf0abfda6a3f4.png
        $('img[src*=hejto]').one('mouseover', function() {
            var link = $(this);

            var src = this.src;
            if (src.indexOf("url=") != -1) {
                try {
                    src = src.replace(/http.*url=(.*?)(&|\?).*/, '$1');
                    // decode ASCII characters, for instance: '%2C' -> ','
                    // NB: this operation must be try/catched because url might not be well-formed
                    src = decodeURIComponent(src);
                } catch {}
            }

            const fullsize = src.replace(/\/images\/\d+x\d+\//, '/images/1200x900/');

            link.data().hoverZoomSrc = [fullsize];
            link.addClass('hoverZoomLink');
            hoverZoom.displayPicFromElement(link);
        });

    }
});
