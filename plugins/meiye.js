var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'meiye',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://image.meiye.art/pic_S000e66nmR-8Eil06dcnz?imageMogr2/thumbnail/560x/interlace/1
        //      -> https://image.meiye.art/pic_S000e66nmR-8Eil06dcnz

        const reFind = /(.*\.meiye\.art\/.*)\?.*/;
        const reReplace = '$1';

        function findFullsizeUrl(link, src) {
            let fullsizeUrl = src.replace(reFind, reReplace);

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.push(fullsizeUrl);
                res.push(link);
            }
        }

        $('img[src*="meiye.art"]').each(function() {
            findFullsizeUrl($(this), this.src);
        });

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
