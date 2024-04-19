var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'galerie9art',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://dpqiheki3bmmj.cloudfront.net/artist/medium/wlstudio.jpg
        //      -> https://dpqiheki3bmmj.cloudfront.net/artist/original/wlstudio.jpg

        const reFind1 = /\/(small|medium|large)\//;
        const reReplace1 = '/original/';

        function findFullsizeUrl(link, src) {
            let fullsizeUrl = src.replace(reFind1, reReplace1);
            if (fullsizeUrl == src) return;

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.unshift(fullsizeUrl);
                res.push(link);
            }
        }

        $('img[src]').each(function() {
            findFullsizeUrl($(this), this.src);
        });

        $('[style*=url]').each(function() {
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
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
