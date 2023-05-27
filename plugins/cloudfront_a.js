var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'cloudfront_a',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://d38hokjm2drjyk.cloudfront.net/?url=nypost.com%2Fwp-content%2Fuploads%2Fsites%2F2%2F2021%2F03%2Fjen-psaki.jpg%3Fquality%3D90%26strip%3Dall%26w%3D1200&w=300&h=190&secure=yes&token=cdb675f5d8e584c6d6233188352417df6750c099
        //      -> nypost.com/wp-content/uploads/sites/2/2021/03/jen-psaki.jpg
        var reThumb1 = /.*cloudfront.net.*?\?url=(.*)\.(jpe?g|gif|png|webp)(.*)/;
        var reReplace1 = '$1.$2';

        // sample: https://www.leparisien.fr/resizer/xRuYCaOxI88qdE8cFXvzjqhmje4=/932x582/cloudfront-eu-central-1.images.arcpublishing.com/leparisien/5WVYUA3CRHLVQ2B5HZZCL43LTM.jpg
        //      -> cloudfront-eu-central-1.images.arcpublishing.com/leparisien/5WVYUA3CRHLVQ2B5HZZCL43LTM.jpg
        // sample: https://www.lexpress.fr/resizer/UAT5-7OWS5H9L0NqUL95-v_ImyY=/300x167/filters:focal(2804x1160:2814x1170)/cloudfront-eu-central-1.images.arcpublishing.com/lexpress/B3FAAH7ISVHJLEMK3XT6LZPVPA.jpg
        //      -> cloudfront-eu-central-1.images.arcpublishing.com/lexpress/B3FAAH7ISVHJLEMK3XT6LZPVPA.jpg
        var reThumb2 = /.*\/(cloudfront.*)/;
        var reReplace2 = '$1';

        function findFullsizeUrl(link, src) {

            let fullsizeUrl = src.replace(reThumb1, reReplace1);
            if (fullsizeUrl == src) {
                fullsizeUrl = src.replace(reThumb2, reReplace2);
            }

            if (fullsizeUrl == src) return;

            // decode ASCII characters, for instance: '%2C' -> ','
            // NB: this operation must be try/catched because url might not be well-formed
            try {
                fullsizeUrl = decodeURIComponent(fullsizeUrl);
            } catch {}

            if (! fullsizeUrl.startsWith('http')) fullsizeUrl = 'https://' + fullsizeUrl;

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.unshift(fullsizeUrl);
                res.push(link);
            }
        }

        $('img[src*="cloudfront"]').each(function() {
            findFullsizeUrl($(this), this.src);
        });

        $('[style*=url]').filter(function() { return this.style.backgroundImage.indexOf('cloudfront') == -1 ? false : true }).each(function() {
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            var reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            var backgroundImageUrl = backgroundImage.replace(/^['"]/, '').replace(/['"]+$/, '');

            findFullsizeUrl($(this), backgroundImageUrl);
        });

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
