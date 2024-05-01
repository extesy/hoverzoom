var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'usarmy',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://media.defense.gov/2023/Mar/21/2003447102/400/400/0/230302-F-LD209-1015.JPG
        //      -> https://media.defense.gov/2023/Mar/21/2003447102/0/400/0/230302-F-LD209-1015.JPG

        const reFind = /(.*\.defense\.gov\/.*?\/.*?\/.*?\/.*?)\/.*?\/(.*)/;
        const reReplace = '$1/0/$2';

        function findFullsizeUrl(link, src) {
            let fullsizeUrl = src.replace(reFind, reReplace);
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
