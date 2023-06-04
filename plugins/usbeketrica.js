var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'usbeketrica',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://usbeketrica.com/uploads/media/64x64/06/111366-Screenshot%202023-05-08%20at%2019.13.01.jpg?v=1-0
        //      -> https://usbeketrica.com/media/111366/download/Screenshot%202023-05-08%20at%2019.13.01.jpg?inline=1

        const reFind = /(^.*)\/uploads\/media\/.*?\d+x\d+\/\d+\/(\d+)-(.*)\?(.*)/;
        const reReplace = '$1/media/$2/download/$3?inline=1';

        function findFullsizeUrl(link, src) {
            if (src.startsWith('/')) {
                src = 'https://usbeketrica.com' + src;
            }
            let fullsizeUrl = src.replace(reFind, reReplace);
            if (fullsizeUrl == src) {
                return;
            }

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

        $('img[data-srcset]').each(function() {
            findFullsizeUrl($(this), $(this).data().srcset);
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
