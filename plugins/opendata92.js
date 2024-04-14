var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'opendata92',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://opendata.hauts-de-seine.fr/explore/dataset/fr-229200506-plans-de-carrieres/files/aea63b50e86f1ed8d3f5f26b3a39c0af/300/
        //      -> https://opendata.hauts-de-seine.fr/explore/dataset/fr-229200506-plans-de-carrieres/files/aea63b50e86f1ed8d3f5f26b3a39c0af/download/

        const reFind = '/300/';
        const reReplace = '/download/';

        function findFullsizeUrl(link, src) {
            let fullsizeUrl = src.replace(reFind, reReplace);
            if (fullsizeUrl == src) return;

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.unshift(fullsizeUrl);
                res.push(link);
            }
        }

        $('img[src*="/300/"]').each(function() {
            findFullsizeUrl($(this), this.src);
        });

        $('[style*=url]').filter(function() { return /\/300\//.test(this.style.backgroundImage) }).each(function() {
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            var backgroundImageUrl = backgroundImage.replace(/^['"]/, '').replace(/['"]+$/, '');
            findFullsizeUrl($(this), backgroundImageUrl);
        });

        $('a[href*="/download/"]').each(function() {
            let link = $(this);
            let fullsizeUrl = this.href;

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.unshift(fullsizeUrl);
                res.push(link);
            }
        });

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
