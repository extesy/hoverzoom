// Copyright (c) 2013 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Twitter',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        
        hoverZoom.urlReplace(res,
            'img[src*="_mini"]:not([src*="default_profile_"]), img[src*="_normal"]:not([src*="default_profile_"]), img[src*="_bigger"]:not([src*="default_profile_"])',
            /_(mini|normal|bigger)/,
            ''
        );
        
        hoverZoom.urlReplace(res,
            'img[src*=":thumb"]',
            ':thumb',
            ':large'
        );
        
        $('div video source[video-src*="twimg.com/tweet_video/"]').each(function() {
            var div = $(this).parents('div:eq(0)'),
                img = div.find('img[src*="tweet_video_thumb"]');
            img.data().hoverZoomSrc = [this.getAttribute('video-src')];
            res.push(img);
            console.log(this.src);
        });
        
        $('[data-expanded-url], [data-full-url], [data-url]').each(function () {
            var link = $(this),
                url = this.getAttribute('data-expanded-url') || this.getAttribute('data-full-url') || this.getAttribute('data-url');
            if (url.match(/\/[^:]+\.(?:jpe?g|gif|png|svg|webp|bmp|ico|xbm)(?:[\?#:].*)?$/i) || url.match(/twimg\.com/)) {
                link.data().hoverZoomSrc = [url.replace(':thumb', ':large')];
                res.push(link);
                link.addClass('hoverZoomLink');
            }
        });

        $('a:contains("pic.twitter.com/")').one('mouseover', function() {
            hoverZoom.prepareFromDocument($(this), this.href, function(doc) {                
                var i, src, srcs = [], multiPhoto = doc.querySelectorAll('.multi-photo img[src*="twimg.com/media/"]');
                if (multiPhoto.length > 0) {
                    for (i = 0; i < multiPhoto.length; i++) {
                        srcs.push([multiPhoto[i].src.indexOf(':large') == -1 ? multiPhoto[i].src + ':large' : multiPhoto[i].src]);
                    }
                } else {
                    var img = doc.querySelector('img[src*="twimg.com/media/"]');
                    if (img) {
                        srcs.push(img.src.indexOf(':large') == -1 ? img.src + ':large' : img.src);
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

        callback($(res));
    }
});
