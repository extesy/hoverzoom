var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'wildcritters',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];
        var extensions = ['jpg', 'png', 'gif', 'mp4', 'webm', 'webp'];

        // thumbnail : https://wildcritters.ws/thumbnails/67151b9eb96aeee4a6f1bfc5efbbec07.jpg
        //     image : https://wildcritters.ws/images/67151b9eb96aeee4a6f1bfc5efbbec07.png
        $('img[src*="wildcritters"]').each(function() {
            var img = this, _img = $(img);
            var urls = [];

            $(extensions).each(function() {
                let url = undefined;
                url = img.src.replace(/\/thumbnails\/(.*)\.(.*)/, '/images/$1.' + this.toString());
                if (url != img.src) {
                    urls.push(url);
                }
            });

            if (urls.length) {
                _img.data().hoverZoomSrc = urls;
                res.push(_img);
            }
        });

        callback($(res), this.name);
    }
});