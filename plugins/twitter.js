var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Twitter',
    version:'0.4',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src*="_mini"]:not([src*="default_profile_"]), img[src*="_normal"]:not([src*="default_profile_"]), img[src*="_bigger"]:not([src*="default_profile_"])',
            /_(mini|normal|bigger)/,
            ''
        );

        hoverZoom.urlReplace(res,
            'img[src*="/profile_images/"]',
            /_(mini|normal|bigger)/,
            '',
            'a'
        );

        hoverZoom.urlReplace(res,
            'img[src*=":thumb"]',
            ':thumb',
            ':orig'
        );

        hoverZoom.urlReplace(res,
            'img[src*=":small"]',
            ':small',
            ':orig'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /&name=.*/,
            '&name=orig'
        );

        $('[data-image-url], [data-expanded-url], [data-full-url], [data-url]').each(function () {
            var link = $(this),
                url = this.getAttribute('data-image-url') || this.getAttribute('data-expanded-url') || this.getAttribute('data-full-url') || this.getAttribute('data-url');
            if (url.match(/\/[^:]+\.(?:jpe?g|gifv?|png|svg|webp|bmp|ico|xbm)(?:[\?#:].*)?$/i) || url.match(/twimg\.com/)) {
                //replace .jpg by .jpg:orig
                url = url.replace(/(.jpe?g)$/, '$1:orig').replace(/(.jpe?g)([^:])/, '$1:orig$2');
                link.data().hoverZoomSrc = [url.replace(':thumb', ':orig').replace(':small', ':orig').replace(':medium', ':orig')];
                res.push(link);
                link.addClass('hoverZoomLink');
            }
        });

        $('a:contains("pic.twitter.com/")').one('mouseover', function() {
            hoverZoom.prepareFromDocument($(this), this.href, function(doc) {
                var i, src, srcs = [], multiPhoto = doc.querySelectorAll('.multi-photo img[src*="twimg.com/media/"]');
                if (multiPhoto.length > 0) {
                    for (i = 0; i < multiPhoto.length; i++) {
                        srcs.push([multiPhoto[i].src.indexOf(':orig') == -1 ? multiPhoto[i].src + ':orig' : multiPhoto[i].src]);
                    }
                } else {
                    var img = doc.querySelector('img[src*="twimg.com/media/"]');
                    if (img) {
                        srcs.push(img.src.indexOf(':orig') == -1 ? img.src + ':orig' : img.src);
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

        // x.com: tweet media are rendered inside an `inert` layer, so the element under the mouse is an empty
        // overlay <a href="/user/status/ID/photo/N" aria-label="View media">. Turn every such overlay into a
        // gallery of all the tweet's media, starting at the hovered one: photos straight from the DOM (instant),
        // then completed by the syndication API (videos/GIFs, photos not rendered yet).
        const mediaImgSelector = 'img[src*="pbs.twimg.com/media/"], img[src*="pbs.twimg.com/ext_tw_video_thumb/"], img[src*="pbs.twimg.com/tweet_video_thumb/"], img[src*="pbs.twimg.com/amplify_video_thumb/"]';

        // the media <img> drawn under an overlay link: nearest ancestor holding exactly one media image
        function overlayImg(a) {
            let el = a;
            for (let depth = 0; el && depth < 6; depth++, el = el.parentElement) {
                const imgs = el.querySelectorAll(mediaImgSelector);
                if (imgs.length === 1) return imgs[0];
                if (imgs.length > 1) return null;
            }
            return null;
        }

        function domPhotoSrcs(src) {
            // https://pbs.twimg.com/media/ABC?format=webp&name=small -> originals first, the displayed size last
            const m = src.match(/^(https:\/\/pbs\.twimg\.com\/media\/[\w-]+)(?:\.(\w+))?/);
            if (!m) return [src];
            const formats = m[2] ? [m[2]] : ['jpg', 'png'];
            return formats.map(f => m[1] + '?format=' + f + '&name=orig').concat([src.replace(/name=\w+/, 'name=large')]);
        }

        const overlays = {};
        $('a[href*="/status/"][href*="/photo/"], a[href*="/status/"][href*="/video/"]').each(function () {
            const m = this.getAttribute('href').match(/\/status\/(\d+)\/(photo|video)\/(\d+)/);
            if (!m) return;
            (overlays[m[1]] = overlays[m[1]] || []).push({a: this, kind: m[2], n: parseInt(m[3])});
        });

        Object.keys(overlays).forEach(function (id) {
            const entries = overlays[id];
            const items = [];
            let complete = true;
            entries.forEach(function (e) {
                const img = overlayImg(e.a);
                if (e.kind === 'photo' && img) items[e.n - 1] = domPhotoSrcs(img.src);
                else complete = false; // videos need the API for their mp4 url
            });
            const max = Math.max.apply(null, entries.map(e => e.n));
            for (let i = 0; i < max; i++) if (!items[i]) complete = false;

            entries.forEach(function (e) {
                const link = $(e.a);
                if (link.data().hoverZoomTweetId === id) return; // already prepared
                link.data().hoverZoomTweetId = id;
                if (complete) {
                    link.data().hoverZoomGallerySrc = items.length > 1 ? items : undefined;
                    link.data().hoverZoomGalleryIndex = e.n - 1;
                    link.data().hoverZoomSrc = items[e.n - 1];
                    link.addClass('hoverZoomLink');
                    res.push(link);
                } else {
                    link.one('mouseenter', function () {
                        hoverZoomTweetMedia(id, function (media) {
                            if (media) hoverZoomTweetMedia.setGallery(link, media.items, e.n - 1);
                        });
                    });
                }
            });
        });

        $('a.media-item').each(function() {
            var link = $(this),
                url = this.style.backgroundImage
                .replace(/url\(("?)(.*)\1\)/, '$2')
                .replace(/(\.\w+)(:\w+)?"?$/, '$1:orig')
                .replace(/\?format=\w+&name=\d+x\d+/, '');
            link.data().hoverZoomSrc = [url];
            res.push(link);
        });

        callback($(res), this.name);
    }
});
