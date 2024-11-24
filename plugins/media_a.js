var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'media_a',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://media.vogue.fr/photos/65fd3bb6667c44a47eaeec25/master/w_120,c_limit/VOG1046_COVER_300.jpg
        //      -> https://media.vogue.fr/photos/65fd3bb6667c44a47eaeec25/

        const reFind = /(http?s:\/\/media\..*\/photos\/\w+\/).*/;
        const reReplace = '$1';

        function findFullsizeUrl(link, src) {
            let fullsizeUrl = src.replace(reFind, reReplace);
            if (fullsizeUrl == src) return;

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.unshift(fullsizeUrl);
                res.push(link);
            }
        }

        $('img[src*="/photos/"]').filter(function() { return /http?s:\/\/media\..*\/photos\//.test(this.src) }).each(function() {
            findFullsizeUrl($(this), this.src);
        });

        $('[style*=url]').filter(function() { return /http?s:\/\/media\..*\/photos\//.test(this.style.backgroundImage) }).each(function() {
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
