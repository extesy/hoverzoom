var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'focus_a',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://huffpost-focus.sirius.press/2023/05/25/0/0/2574/1716/1280/853/60/0/e552015_1685020729194-157747.jpg
        //      -> https://huffpost-focus.sirius.press/2023/05/25/0/0/0/0/0/0/100/0/e552015_1685020729194-157747.jpg
        // sample: https://focus.telerama.fr/2023/05/27/0/3/1914/1080/968/546/60/0/7963e82_1685191975653-les-filles-d-olfa.jpg/webp
        //      -> https://focus.telerama.fr/2023/05/27/0/0/0/0/0/0/100/0/7963e82_1685191975653-les-filles-d-olfa.jpg
        // sample: https://focus.telerama.fr/2023/05/27/0/0/3786/2136/294/156/60/0/888f106_1685187045255-capture-da-ei-cran-2023-05-27-ai-13-30-19.png/webp
        //      -> https://focus.telerama.fr/2023/05/27/0/0/0/0/0/0/100/0/888f106_1685187045255-capture-da-ei-cran-2023-05-27-ai-13-30-19.png
        // sample: https://focus.nouvelobs.com/2024/03/28/52/0/4032/2688/510/340/75/0/55ea916_1711630889803-image00002.jpeg/webp
        //      -> https://focus.nouvelobs.com/2024/03/28/0/0/0/0/0/0/100/0/55ea916_1711630889803-image00002.jpeg
        // sample: https://img.lemde.fr/2024/03/20/0/1/5971/3981/800/533/75/0/1880a03_b696e23b9f5f409bb63e55e117041241-0-36a668ecbcb243d78e9dde41ac7f8ea4.jpg
        //      -> https://img.lemde.fr/2024/03/20/0/0/0/0/0/0/100/0/1880a03_b696e23b9f5f409bb63e55e117041241-0-36a668ecbcb243d78e9dde41ac7f8ea4.jpg
        const reThumb = /(^.*(focus|img)\..*?\/[0-9]{4}\/[0-9]{2}\/[0-9]{2})\/\d+\/\d+\/\d+\/\d+\/\d+\/\d+\/\d+\/\d+\/(.*)/;
        const reReplace = '$1/0/0/0/0/0/0/100/0/$3';

        function findFullsizeUrl(link, src) {
            let fullsizeUrl = src.replace(reThumb, reReplace);
            if (fullsizeUrl == src) return;
            fullsizeUrl = fullsizeUrl.replace(/(png|jpe?g)\/webp$/i, '$1');

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

        $('img[src*="focus."], img[src*="img."]').each(function() {
            findFullsizeUrl($(this), this.src);
        });

        //$('[style*=url]').filter(function() { return this.style.backgroundImage.indexOf('focus.') == -1 ? false : true }).each(function() {
        $('[style*="focus."], [style*="img."]').each(function() {
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage && (backgroundImage.indexOf('focus.') != -1 || backgroundImage.indexOf('img.') != -1)) {
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
