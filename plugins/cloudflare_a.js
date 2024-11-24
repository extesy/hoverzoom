var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'cloudflare_a',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://prod.cdn-medias.jeuneafrique.com/cdn-cgi/image/q=100,f=auto,metadata=none,width=640,height=320/https://prod.cdn-medias.jeuneafrique.com/medias/2023/05/23/jad20230523-ass-tchad-idriss-deby-le-sud-1256x628.jpg
        //      -> https://prod.cdn-medias.jeuneafrique.com/medias/2023/05/23/jad20230523-ass-tchad-idriss-deby-le-sud-1256x628.jpg
        // sample: https://cdn.wamiz.fr/cdn-cgi/image/format=auto,quality=80,width=200,height=200,fit=cover/adoption/pet/picture/6624916d91181835733923.jpg
        //      -> https://cdn.wamiz.fr/adoption/pet/picture/6624916d91181835733923.jpg

        const reFind1 = /^.*\/cdn-cgi\/image\/.*\/(http.*)/;
        const reFind2 = /(^.*)\/cdn-cgi\/image\/[^\/]{1,}\/(?!http)(.*)/;
        const reReplace1 = '$1';
        const reReplace2 = '$1/$2';

        function findFullsizeUrl(link, src) {
            let fullsizeUrl = src.replace(reFind1, reReplace1);
            if (fullsizeUrl == src) {
                fullsizeUrl = src.replace(reFind2, reReplace2);
                if (fullsizeUrl == src) return;
            }

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
