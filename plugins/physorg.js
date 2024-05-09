var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'physorg',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // image
        // sample: https://scx1.b-cdn.net/csz/news/tmb/2024/the-spread-of-misinfor.jpg
        //      -> https://scx1.b-cdn.net/gfx/news/hires/2024/the-spread-of-misinfor.jpg (fullsize)
        //      -> https://scx1.b-cdn.net/gfx/news/2024/the-spread-of-misinfor.jpg (fallback)

        const reFind = /(.*)\/csz\/(.*?)\/.*?\/(.*)/;
        const reReplace = '$1/gfx/$2/hires/$3';

        function findFullsizeUrl(link, src) {
            let fullsizeUrl = src.replace(reFind, reReplace);
            if (fullsizeUrl === src) return;
            let fallbackUrl = fullsizeUrl.replace('/hires', '');

            link.data().hoverZoomSrc = [fullsizeUrl, fallbackUrl];
            res.push(link);
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
