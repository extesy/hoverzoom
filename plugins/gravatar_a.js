var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Gravatar',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var i, url, res = [],
            img, imgs = qsa('img[src*="gravatar.com/avatar/"]');
        for (i = 0; i < imgs.length; i++) {
            img = imgs[i];
            if (img.src.indexOf('?') == -1) {
                url = img.src + '?s=512';
            } else if (img.src.indexOf('s=') > -1) {
                url = img.src.replace(/s=\d+/, 's=512');
            } else {
                url = img.src + '&s=512';
            }
            img = $(img);
            img.data().hoverZoomSrc = [url];
            res.push(img);
        }
        if (res.length) {
            callback($(res), this.name);
        }
    }
});
