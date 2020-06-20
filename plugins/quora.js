var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Quora',
    prepareImgLinks:function (callback) {
        var res = [],
            imgs = qsa('img[master_src]');
        for (var i=0; i<imgs.length; i++) {
            var img = imgs[i],
                url = img.getAttribute('master_src'),
                masterW = parseInt(img.getAttribute('master_w')) || 1,
                masterH = parseInt(img.getAttribute('master_h')) || 1;
            if (masterW > img.width * 1.5 || masterH > img.height * 1.5) {
                img = $(img);
                img.data().hoverZoomSrc = [url + '#'];
                res.push(img);
            }
        }
        callback($(res));
    }
});
