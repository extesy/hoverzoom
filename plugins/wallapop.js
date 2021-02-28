var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'wallapop',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];

        var reThumb = /=W\d+/;
        var reReplace = '=W1024';

        // sample: https://cdn.wallapop.com/images/10420/91/j5/__/c10420p546768325/i1628105036.jpg?pictureSize=W320
        //      -> https://cdn.wallapop.com/images/10420/91/j5/__/c10420p546768325/i1628105036.jpg?pictureSize=W1024
        hoverZoom.urlReplace(res,
            'img[src]',
            reThumb,
            reReplace
        );

        // there are usually 2 background-images:
        // - default img: '../../../images/icons/man.png'
        // - real img: 'https://cdn.wallapop.com/images/13/0z/pj/__/c13p59977882/i306002269.jpg?pictureSize=W320'
        $('[style]').each(function() {

            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf("url") == -1) return;

            var reUrl = /.*?url\s*\(\s*(.*?)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            var backgroundImageUrl = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");

            var fullsizeUrl = backgroundImageUrl.replace(reThumb, reReplace);
            if (fullsizeUrl != backgroundImageUrl) {
                var link = $(this);
                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    res.push(link);
                }
            }

        });

        callback($(res), this.name);
    }
});