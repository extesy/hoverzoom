var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Weasyl',
    version: '0.2',
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

        $('img[src]').each(function() {
            let link = $(this).parents('[href]').first();
            if (link[0]) {
                let fullsizeUrl = link[0].href + '.png';
                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    link.data().hoverZoomCaption = link.find('.ol').text();
                    res.push(link);
                }
            }
        });

        callback($(res));
    }
});
