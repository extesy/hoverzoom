var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'stackoverflow',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        //   page: https://stackoverflow.com/questions/73385763/passing-dynamic-filename-in-azure-data-factory
        // sample: https://i.sstatic.net/ffIFg.jpg?s=64
        //      -> https://i.sstatic.net/ffIFg.jpg
        // sample: https://i.sstatic.net/Y8Xnbl.jpg
        //      -> https://i.sstatic.net/Y8Xnb.jpg

        const reFind = /(.*\.sstatic\.net\/.*)\?.*/;
        const reReplace = '$1';

        function findFullsizeUrl(link, src) {
            let fullsizeUrl = src.replace(reFind, reReplace).replace('l.', '.');

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.push(fullsizeUrl);
                link.addClass('hoverZoomLink');
                res.push(link);
            }
        }

        $('a img[src]').each(function() {
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
