var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'8kun',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];

        // sample: https://media.8kun.top/file_store/thumb/b5edd64bec096b5e5bedce034c7c374a6ce6f5af87e760a5899a3c29a09b228b.png
        //      -> https://media.8kun.top/file_store/b5edd64bec096b5e5bedce034c7c374a6ce6f5af87e760a5899a3c29a09b228b.png

        $('img[src*="thumb"]').filter(function() { return ! /\.jpe?g|\.png|\.gif|\.mp4|\.webm|\.webp/.test($(this).parent()[0].href) }).each(function() {

            var img = this, _img = $(img);
            var urls = [];

            let url = undefined;
            url = img.src.replace('/thumb/', '/');
            if (url != img.src) {
                urls.push(url);
            }

            if (urls.length) {
                _img.data().hoverZoomSrc = urls;
                res.push(_img);
            }
        });

        callback($(res), this.name);
    }
});