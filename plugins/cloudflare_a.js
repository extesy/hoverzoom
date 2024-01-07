var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'cloudflare_a',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://prod.cdn-medias.jeuneafrique.com/cdn-cgi/image/q=100,f=auto,metadata=none,width=640,height=320/https://prod.cdn-medias.jeuneafrique.com/medias/2023/05/23/jad20230523-ass-tchad-idriss-deby-le-sud-1256x628.jpg
        //      -> https://prod.cdn-medias.jeuneafrique.com/medias/2023/05/23/jad20230523-ass-tchad-idriss-deby-le-sud-1256x628.jpg
        const reThumb = /^.*\/cdn-cgi\/image\/.*\/(http.*)/;
        const reReplace = '$1';

        function findFullsizeUrl(link, src) {
            let fullsizeUrl = src.replace(reThumb, reReplace);
            if (fullsizeUrl == src) return;

            // decode ASCII characters, for instance: '%2C' -> ','
            // NB: this operation must be try/catched because url might not be well-formed
            try {
                fullsizeUrl = decodeURIComponent(fullsizeUrl);
            } catch {}

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.unshift(fullsizeUrl);
                res.push(link);
            }
        }

        $('img[src*="/cdn-cgi/image/"]').each(function() {
            findFullsizeUrl($(this), this.src);
        });

        $('[style*="/cdn-cgi/image/"]').each(function() {
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage && backgroundImage.indexOf('/cdn-cgi/image/') != -1) {
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
