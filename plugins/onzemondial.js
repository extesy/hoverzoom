var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'onzemondial',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://static.onzemondial.com/8/2024/01/photos/340481/zoom-%F0%9F%93%9D-c%C3%B4te-d-ivoire---nigeria--les-tops-et-les-flops-.jpg
        //      -> https://static.onzemondial.com/8/2024/01/photos/340481/%F0%9F%93%9D-c%C3%B4te-d-ivoire---nigeria--les-tops-et-les-flops-.jpg

        function findFullsizeUrl(link, src) {
            let fullsizeUrl = src.replace('/zoom-', '/').replace('/moyen-', '/');
            if (fullsizeUrl == src) return;

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.unshift(fullsizeUrl);
                res.push(link);
            }
        }

        $('img[src*="/zoom-"], img[src*="/moyen-"]').each(function() {
            findFullsizeUrl($(this), this.src);
        });

        $('[style*="/zoom-"], [style*="/moyen-"]').each(function() {
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage && (backgroundImage.indexOf('/zoom-') != -1 || backgroundImage.indexOf('/moyen-') != -1)) {
                const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                var backgroundImageUrl = backgroundImage.replace(/^['"]/, '').replace(/['"]+$/, '');
                findFullsizeUrl($(this), backgroundImageUrl);
            }
        });

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
