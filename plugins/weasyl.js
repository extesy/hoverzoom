var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Weasyl',
    prepareImgLinks:function (callback) {
        var res = [],
            imgs = qsa('img[src*=".thumb."]');
        for (var i=0; i<imgs.length; i++) {
            var link = $(imgs[i].parentNode),
                url = imgs[i].src.replace(/\.thumb\..*/, '.cover.');
            link.data().hoverZoomSrc = [url + 'jpg', url + 'png'];
            link.data().hoverZoomCaption = link.find('.ol').text();
            res.push(link);
        }
        callback($(res));
    }
});
