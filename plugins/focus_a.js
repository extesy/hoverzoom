var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'focus_a',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://huffpost-focus.sirius.press/2023/05/25/0/0/2574/1716/1280/853/60/0/e552015_1685020729194-157747.jpg
        //      -> https://huffpost-focus.sirius.press/2023/05/25/0/0/0/0/0/0/100/0/e552015_1685020729194-157747.jpg
        // sample: https://focus.telerama.fr/2023/05/27/0/3/1914/1080/968/546/60/0/7963e82_1685191975653-les-filles-d-olfa.jpg/webp
        //      -> https://focus.telerama.fr/2023/05/27/0/0/0/0/0/0/100/0/7963e82_1685191975653-les-filles-d-olfa.jpg
        // sample: https://focus.telerama.fr/2023/05/27/0/0/3786/2136/294/156/60/0/888f106_1685187045255-capture-da-ei-cran-2023-05-27-ai-13-30-19.png/webp
        //      -> https://focus.telerama.fr/2023/05/27/0/0/0/0/0/0/100/0/888f106_1685187045255-capture-da-ei-cran-2023-05-27-ai-13-30-19.png
        const reThumb = /(^.*focus\..*?\/[0-9]{4}\/[0-9]{2}\/[0-9]{2})\/\d+\/\d+\/\d+\/\d+\/\d+\/\d+\/\d+\/\d+\/(.*)/;
        const reReplace = '$1/0/0/0/0/0/0/100/0/$2';

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

        $('img[src*="focus."]').each(function() {
            findFullsizeUrl($(this), this.src);
        });

        $('[style*="focus."]').each(function() {
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage && backgroundImage.indexOf('focus.') != -1) {
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
