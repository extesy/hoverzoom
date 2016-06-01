var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Gravatar',
    prepareImgLinks:function (callback) {
        var i, url, res = [],
            img, imgs = qsa('img[src*="gravatar.com/avatar/"]');
        for (i = 0; i < imgs.length; i++) {
            img = imgs[i];
            if (img.src.indexOf('?') == -1) {
                url = img.src + '?s=420';
            } else if (img.src.indexOf('s=') > -1) {
                url = img.src.replace(/s=\d+/, 's=420');
            } else {
                url = img.src + '&s=420';
            }
            img = $(img);
            img.data().hoverZoomSrc = [url];
            res.push(img);
        }
        if (res.length) {
            callback($(res));
        }
    }
});
