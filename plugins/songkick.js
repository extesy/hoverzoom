var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'songkick',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // image
        // sample: https://images.sk-static.com/images/media/img/col3/20230530-163133-294123.jpg
        //      -> https://images.sk-static.com/images/media/img/original/20230530-163133-294123.jpg

        // avatar
        // sample: https://images.sk-static.com/images/media/profile_images/artists/233074/large_avatar
        //      -> https://images.sk-static.com/images/media/profile_images/artists/233074/original

        function findFullsizeUrl(link, src) {
            let fullsizeUrl = src.replace(/\/thumb$/, '/original').replace(/\/col\d+$/, '/original').replace(/\/col\d+\//, '/original/').replace(/(.*)\/.*avatar/, '$1/original');
            if (fullsizeUrl === src) return;

            link.data().hoverZoomSrc = [fullsizeUrl];
            res.push(link);
        }

        $('img[src*="/col"], img[src*="/thumb"], img[src*="avatar"]').each(function() {
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
