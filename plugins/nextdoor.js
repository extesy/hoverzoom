var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'nextdoor',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://us1-photo.nextdoor.com/post_photos/04/c6/04c6a0d367c31756fc1cf8a935a95f35.jpeg?request_version=v2&output_type=jpeg&sizing=linear&x_size=3&resize_type=resize
        //      -> https://us1-photo.nextdoor.com/post_photos/04/c6/04c6a0d367c31756fc1cf8a935a95f35.jpeg

        const reFind = /(.*\.nextdoor\.com\/.*)\?.*/;
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
