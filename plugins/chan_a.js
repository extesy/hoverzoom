var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'chan_a',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];

        if (window.location.host.indexOf('chan') == -1) return;

        // use parent's href if image or video
        // otherwise try to guess url of original image or video using url of thumbnail
        var extensions = ['jpg', 'png', 'gif', 'mp4', 'webm', 'webp'];

        $('img[src]').filter(function() { return ! /\.jpe?g|\.png|\.gif|\.mp4|\.webm|\.webp/.test($(this).parent()[0].href) }).each(function() {

            var img = this, _img = $(img);
            var urls = [];

            $(extensions).each(function() {
                let url = undefined;
                url = img.src.replace(/\/(cat|thumb)\/(\d+)s?\.(jpg|png)/, '/src/$2.' + this.toString());
                if (url != img.src) {
                    urls.push(url);
                }
            });

            if (urls.length) {
                _img.data().hoverZoomSrc = urls;
                res.push(_img);
            }
        });

        $('img[src*="4cdn"]').filter(function() { return ! /\.jpe?g|\.png|\.gif|\.mp4|\.webm|\.webp/.test($(this).parent()[0].href) }).each(function() {

            var img = this, _img = $(img);
            var urls = [];

            $(extensions).each(function() {
                let url = undefined;
                url = img.src.replace(/\/(\d+)s?\.(jpg|png)/, '/$1.' + this.toString());
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