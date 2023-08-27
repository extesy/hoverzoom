var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'anilist',
    version:'1.1',
    prepareImgLinks:function (callback) {
        const pluginName = this.name;
        var res = [];

        // sample: https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx159831-TxAC0ujoLTK6.png
        // sample: https://s4.anilist.co/file/anilistcdn/user/avatar/medium/b5181457-UpiPrLPeBlcG.jpg
        //      -> https://s4.anilist.co/file/anilistcdn/user/avatar/large/b5181457-UpiPrLPeBlcG.jpg
        const re = /\/(small|medium)\//

        // images
        $('img[src*="/anilistcdn/"]').each(function() {
            const img = $(this), srcL = img.attr('src').replace(re, '/large/'), srcM = img.attr('src').replace(re, '/medium/');
            img.data().hoverZoomSrc = [];
            img.data().hoverZoomSrc.push(srcL);
            img.data().hoverZoomSrc.push(srcM);
            img.addClass('hoverZoomLink');
            res.push(img);
        });

        // background images (divs)
        $('[style]').each(function () {
            // extract url from style
            // e.g: style="background-image: url(https://globalvoices.org/wp-content/uploads/2019/01/20160507_KAR5877-400x300.jpg)"
            var backgroundImage = this.style.backgroundImage;
            if (!backgroundImage || backgroundImage.indexOf('/anilistcdn/') === -1) return;

            const link = $(this);
            const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            var backgroundImageUrl = backgroundImage.replace(/^['"]/, '').replace(/['"]+$/, '');
            const srcL = backgroundImageUrl.replace(re, '/large/');
            const srcM = backgroundImageUrl.replace(re, '/medium/');
            link.data().hoverZoomSrc = [];
            link.data().hoverZoomSrc.push(srcL);
            link.data().hoverZoomSrc.push(srcM);
            link.addClass('hoverZoomLink');
            res.push(link);
        });

        callback($(res), pluginName);
    }
});
