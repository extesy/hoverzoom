var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'routard',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // image
        // sample: https://media.routard.com/image/59/3/photo.1594593.sq210.jpg
        //      -> https://media.routard.com/image/59/3/photo.1594593.jpg
        const reFind = /(.*\.\d+)\..*\.(jpe?g)/;
        const reReplace = '$1.$2';

        // avatar
        // sample: https://cdn-forums.routard.com/forums/user_avatar/www.routard.com/hannahteruel/48/4255_2.png
        //      -> https://cdn-forums.routard.com/forums/user_avatar/www.routard.com/hannahteruel/288/4255_2.png
        const reFind2 = /(.*avatar\/www.routard.com\/.*?)\/\d+\/(.*)/;
        const reReplace2 = '$1/288/$2';

        // all purpose
        const reFind3 = /\/(x?small|x?large|medium|thumbnail)_/;
        const reReplace3 = '/';

        function findFullsizeUrl(link, src) {
            let fullsizeUrl = src.replace(reFind, reReplace);
            if (fullsizeUrl === src) {
                fullsizeUrl = src.replace(reFind2, reReplace2);
            }
            fullsizeUrl = fullsizeUrl.replace(reFind3, reReplace3);
            if (fullsizeUrl === src) return;

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
