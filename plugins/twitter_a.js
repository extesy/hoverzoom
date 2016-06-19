var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'pic.twitter.com',
    prepareImgLinks:function (callback) {
        if (location.host.indexOf('twitter.com') !== -1)
            return;

        $('a[href*="//pic.twitter.com/"]').one('mouseenter', function() {
            var link = this.href.replace('http:', location.protocol);
            hoverZoom.prepareFromDocument($(this), link, function(doc) {
                var i, src, srcs = [], multiPhoto = doc.querySelectorAll('.multi-photo img[src*="twimg.com/media/"]');
                if (multiPhoto.length > 0) {
                    for (i = 0; i < multiPhoto.length; i++) {
                        src = multiPhoto[i].src.replace(':small', ':large').replace(':thumb', ':large');
                        srcs.push([src.indexOf(':large') == -1 ? src + ':large' : src]);
                    }
                } else {
                    var img = doc.querySelector('img[src*="twimg.com/media/"]');
                    if (img) {
                        src = img.src.replace(':small', ':large').replace(':thumb', ':large');
                        srcs.push(src.indexOf(':large') == -1 ? src + ':large' : src);
                    } else {
                        img = doc.querySelector('video[src*="twimg.com/tweet_video/"]');
                        if (img) {
                            srcs.push(img.src);
                        }
                    }
                }
                switch(srcs.length) {
                    case 0:   return false;
                    case 1:   return srcs[0];
                    default:  return srcs;
                }
            });
        }); 
    }
});
