var hoverZoomPlugins = hoverZoomPlugins || [];

// Shared by twitter.js (x.com) and the tweet link handler below.
// Fetches all media of a tweet from the public embed (syndication) API, which needs no login.
// Calls back with an array of gallery items (each an array of candidate urls), in tweet order, or null.
var hoverZoomTweetMedia = hoverZoomTweetMedia || (function () {
    const cache = {};

    function token(id) {
        return ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '');
    }

    // https://pbs.twimg.com/media/ABC.jpg -> https://pbs.twimg.com/media/ABC?format=jpg&name=orig
    function photoSrcs(url) {
        const m = url.match(/^(https:\/\/pbs\.twimg\.com\/media\/[\w-]+)\.(\w+)/);
        if (!m) return [url];
        return [m[1] + '?format=' + m[2] + '&name=orig', m[1] + '?format=' + m[2] + '&name=large'];
    }

    function videoSrcs(media) {
        const variants = ((media.video_info && media.video_info.variants) || [])
            .filter(v => v.content_type === 'video/mp4' && v.url)
            .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
        return variants.map(v => v.url);
    }

    function parse(data) {
        if (data && data.__typename === 'TweetTombstone') return null;
        let tweet = data;
        // retweets/quote-less wrappers keep media on the tweet itself; fall back to the quoted tweet
        let media = (tweet && tweet.mediaDetails) || (tweet && tweet.quoted_tweet && tweet.quoted_tweet.mediaDetails) || [];
        const items = [];
        for (const m of media) {
            if (m.type === 'photo') items.push(photoSrcs(m.media_url_https));
            else if (m.type === 'video' || m.type === 'animated_gif') {
                const srcs = videoSrcs(m);
                items.push(srcs.length ? srcs : photoSrcs(m.media_url_https));
            }
        }
        return items.length ? {items: items, caption: tweet.text || ''} : null;
    }

    // Turns `link` into a gallery of `items` starting at `index` (prepareLink always starts at 0 and
    // displays synchronously, so the start index has to be set before displaying).
    function setGallery(link, items, index, caption) {
        const data = link.data();
        index = Math.max(0, Math.min(index || 0, items.length - 1));
        if (caption && !data.hoverZoomCaption) data.hoverZoomCaption = caption;
        if (items.length > 1) {
            data.hoverZoomGallerySrc = items;
            data.hoverZoomGalleryIndex = index;
        } else {
            delete data.hoverZoomGallerySrc;
        }
        data.hoverZoomSrc = items[index];
        data.hoverZoomSrcIndex = 0;
        link.addClass('hoverZoomLink hoverZoomLinkFromPlugIn');
        hoverZoom.displayPicFromElement(link);
    }

    function fetchMedia(id, callback) {
        if (cache[id] !== undefined) {
            if (cache[id] instanceof Array) cache[id].push(callback);
            else callback(cache[id]);
            return;
        }
        cache[id] = [callback];
        const url = 'https://cdn.syndication.twimg.com/tweet-result?id=' + id + '&token=' + token(id) + '&lang=en';
        chrome.runtime.sendMessage({action: 'ajaxRequest', url: url, method: 'GET'}, function (response) {
            let result = null;
            try {
                result = parse(typeof response === 'string' ? JSON.parse(response) : response);
            } catch (e) {
                result = null;
            }
            const callbacks = cache[id];
            cache[id] = result;
            callbacks.forEach(cb => cb(result));
        });
    }

    fetchMedia.setGallery = setGallery;
    return fetchMedia;
})();

hoverZoomPlugins.push({
    name:'pic.twitter.com',
    prepareImgLinks:function (callback) {
        if (location.host.indexOf('twitter.com') !== -1 || /(^|\.)x\.com$/.test(location.host))
            return;

        // Links to tweets from other sites (e.g. Reddit posts linking a tweet): show all of its media as a gallery.
        $('a[href*="x.com/"][href*="/status/"], a[href*="twitter.com/"][href*="/status/"]').filter(function () {
            return /^https?:\/\/(?:[\w-]+\.)?(?:x|twitter|fxtwitter|vxtwitter|fixupx)\.com\/[^\/]+\/status(?:es)?\/\d+/.test(this.href);
        }).one('mouseenter', function () {
            const link = $(this);
            if (link.hasClass('hoverZoomLink')) return;
            const m = this.href.match(/\/status(?:es)?\/(\d+)(?:\/(?:photo|video)\/(\d))?/);
            hoverZoomTweetMedia(m[1], function (media) {
                if (media) hoverZoomTweetMedia.setGallery(link, media.items, m[2] ? parseInt(m[2]) - 1 : 0, media.caption);
            });
        });

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
