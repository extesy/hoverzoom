var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'cineserie',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://imgr.cineserie.com/2016/05/143726.jpg?imgeng=/f_jpg/cmpr_0/w_225/h_337/m_cropbox&ver=1
        //      -> https://imgr.cineserie.com/2016/05/143726.jpg

        function findFullsizeUrl(link, src) {
            let fullsizeUrl = src.replace(/(png|jpe?g)\?.*/, '$1');
            if (fullsizeUrl == src) return;

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.unshift(fullsizeUrl);
                res.push(link);
            }
        }

        $('img[src*="png?"], img[src*="jpg?"], img[src*="jpeg?"]').each(function() {
            findFullsizeUrl($(this), this.src);
        });

        $('[style*="png?"], [style*="jpg?"], [style*="jpeg?"]').each(function() {
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage && /png|jpe?g/.test(backgroundImage)) {
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
