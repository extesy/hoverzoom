var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Threads',
    version: '0.8',
    api: new Map(),     // shortcode -> promise of the post's media item (bounded, failures dropped)
    hoverBound: false,
    prepareImgLinks: function (callback) {
        const name = this.name;
        const self = this;
        var res = [];

        // Threads (threads.com / threads.net) serves post images from Instagram's
        // CDN (cdninstagram.com / fbcdn.net, path /v/t51.*-15/<id>_n.jpg, or
        // /v/t39.30808-6/<id>_n.jpg on some posts). The "stp"
        // transform parameter is cryptographically signed, so the url can't be
        // rewritten to a larger size the way most plugins do (any change to stp
        // returns HTTP 403). The displayed <img> already carries the full-resolution
        // url though (often ~2160px while shown much smaller), so we simply zoom to
        // that same image. Two quirks of the core have to be worked around:
        //
        //  1. imgLinksPrepared() skips any link whose hoverZoomSrc equals the src of
        //     an <img> it contains (nothing bigger to show). We append a "#hz"
        //     fragment so the strings differ; the fragment is dropped before the
        //     request so the CDN serves the same signed image.
        //
        //  2. The mousemove handler only matches event.target and its *ancestors*
        //     against .hoverZoomLink. Threads renders a clickable overlay on top of
        //     each photo (hence the hand cursor), so a class on the <img> is never
        //     found. We attach to the nearest clickable ancestor that also wraps the
        //     overlay: the <a href=".../media"> when a photo is opened, or the
        //     <div role="button"> carousel slide wrapper inline. Falls back to the
        //     <img> itself.
        $('img[src*=".cdninstagram.com/"], img[src*=".fbcdn.net/"]').filter(function () {
            return /\/(t51\.[\d.]+-15|t39\.30808-6)\//.test(this.src);
        }).each(function () {
            var img = $(this);
            var link = img.closest('a[href*="/media"], div[role="button"]');
            if (!link.length) {
                link = img;
            }
            if (link.find('video').length) {
                return;   // a video's poster: the video pass below zooms that wrapper
            }
            link.data().hoverZoomSrc = [this.src + '#hz'];
            res.push(link[0]);
        });

        // Video posts autoplay an inline <video>; we zoom to its stream. A progressive
        // currentSrc is used as is. Threads mostly plays through MSE though, which leaves
        // a blob: url that can't be reused. The stream is then resolved on hover through
        // the media api, as in the Instagram plugin (Threads runs on the same backend):
        // the api takes the media id, which is the shortcode of the post url in base64,
        // and answers with the video_versions of the post. The calls are plain
        // same-origin fetches from the page, so the session cookies are sent.
        //
        // Threads lays a click/gesture overlay (div[role="presentation"]) over the
        // video as a *sibling*, so the overlay — not the <video> — receives the hover
        // (the mousemove handler only looks at event.target's ancestors). That overlay
        // is sized exactly to the video, so attaching to it makes hovering the video
        // fire while leaving the surrounding blank space inert. We identify it as the
        // sibling-branch presentation div whose box coincides with the video's — a
        // bare common-ancestor climb is unreliable, it can land on a wrapper larger
        // than the video (which then zooms on blank space) or on an unrelated overlay.
        // Falls back to the <video> itself.
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        const webAppId = '238260118697367';   // identifies Threads' web client to its api
        const cacheLimit = 200;               // entries kept, the oldest are dropped first

        function postMedia(shortcode) {
            if (!self.api.has(shortcode)) {
                if (self.api.size >= cacheLimit) self.api.delete(self.api.keys().next().value);
                let id = 0n;
                for (const char of shortcode) id = id * 64n + BigInt(alphabet.indexOf(char));
                self.api.set(shortcode, fetch(`/api/v1/media/${id}/info/`, {
                        headers: { 'x-ig-app-id': webAppId }, credentials: 'include'
                    })
                    .then(response => response.json())
                    .then(data => data.items ? data.items[0] : null)
                    .catch(() => null)
                    .then(item => {
                        if (!item) self.api.delete(shortcode);   // a failed call is not worth keeping
                        return item;
                    }));
            }
            return self.api.get(shortcode);
        }

        // the elements that zoom a video: its overlay (or the video itself) and, in a
        // carousel, the slide wrapper around it
        function videoLinks(video) {
            var link = video;
            var vb = video.getBoundingClientRect();
            if (vb.width && vb.height) {
                var coincides = function (b) {
                    return Math.abs(b.left - vb.left) < 4 && Math.abs(b.top - vb.top) < 4 &&
                        Math.abs(b.width - vb.width) < 4 && Math.abs(b.height - vb.height) < 4;
                };
                // The overlay lives in a sibling branch of the video's path, so climb
                // the ancestors and look only at the branches we step past (children
                // other than the one we came up) — each node is examined at most once,
                // never re-querying a subtree that grows as we climb. The overlay is
                // absolutely positioned over the video, so its ancestors' boxes don't
                // reflect its position; we match on the candidate's own box instead.
                // getBoundingClientRect runs only on the presentation candidates.
                var overlay = null;
                for (var anc = video.parentElement, child = video, hops = 0;
                     anc && hops < 10 && !overlay;
                     child = anc, anc = anc.parentElement, hops++) {
                    for (var i = 0; i < anc.children.length && !overlay; i++) {
                        var sib = anc.children[i];
                        if (sib === child) {
                            continue;
                        }
                        var cands = sib.matches('div[role="presentation"]') ? [sib]
                            : sib.querySelectorAll('div[role="presentation"]');
                        for (var j = 0; j < cands.length; j++) {
                            if (coincides(cands[j].getBoundingClientRect())) {
                                overlay = cands[j];
                                break;
                            }
                        }
                    }
                }
                if (overlay) {
                    link = overlay;
                }
            }
            var links = [link];
            // The core collects the target's .hoverZoomLink ancestors in document order
            // and reads the data of the first one, i.e. the outermost link wins, so the
            // carousel slide wrapper around the video must zoom to the video as well.
            var slide = $(video).closest('a[href*="/media"], div[role="button"]')[0];
            if (slide && slide !== link) {
                links.push(slide);
            }
            return links;
        }

        // the stream of a video from its post's media item: the item itself, or in a
        // carousel the item at the video's rank among the post's videos. A text post
        // (media_type 19) with an attached video carries no media of its own: the
        // video is under text_post_app_info.linked_inline_media.
        function streamOf(video, item) {
            var media = item;
            var inline = item.text_post_app_info && item.text_post_app_info.linked_inline_media;
            if (!item.video_versions && !item.carousel_media && inline) {
                media = inline;
            }
            if (media.carousel_media) {
                var post = postOf(video);
                var rank = post ? $(post.container).find('video').index(video) : -1;
                media = media.carousel_media.filter(m => m.video_versions)[rank];
            }
            return media && media.video_versions ? media.video_versions[0].url + '.video' : null;
        }

        // the post holding a video: the nearest ancestor with the post's permalink
        // (carousel slides link to ".../post/<code>/media", so they don't count: their
        // ancestor holding a single slide would rank every video first)
        function postOf(video) {
            for (var el = video.parentElement; el; el = el.parentElement) {
                var a = el.querySelector('a[href*="/post/"]:not([href*="/media"])');
                var code = a && (a.getAttribute('href').match(/\/post\/([A-Za-z0-9_-]+)/) || [])[1];
                if (code) return { container: el, shortcode: code };
            }
            return null;
        }

        function onHover(event) {
            var hit = event.target;
            var link = hit.closest && hit.closest('.hzThreadsVideo');
            if (!link) return;
            var video = $(link).data('hzThreadsVideo');
            var post = video && postOf(video);
            var links = video ? videoLinks(video) : [link];
            var zoom = function (src) {
                links.forEach(function (el) {
                    hoverZoom.prepareLink($(el), src);
                });
            };
            // the page's own poster, when the stream can't be resolved
            var fallback = function () {
                var cover = $(links[links.length - 1]).find('img[src*=".cdninstagram.com/"], img[src*=".fbcdn.net/"]')[0];
                var poster = cover ? cover.src : video && video.poster;
                if (poster) zoom(poster + '#hz');
            };
            // resolved once: later passes and hovers leave these links alone
            links.forEach(function (el) {
                el.classList.remove('hzThreadsVideo');
                $(el).data('hzThreadsResolved', true);
            });
            if (!post) return fallback();
            postMedia(post.shortcode).then(function (item) {
                var src = item && streamOf(video, item);
                if (src) zoom(src);
                else fallback();
            });
        }

        if (!self.hoverBound) {
            self.hoverBound = true;
            $(document).on('mouseover', onHover);
        }

        $('video').each(function () {
            var video = this;
            var src = video.currentSrc || video.src;
            var links = videoLinks(video);
            if (src && /^https?:/.test(src)) {
                links.forEach(function (el) {
                    $(el).data().hoverZoomSrc = [src + '.video'];
                    res.push(el);
                });
            } else {
                links.forEach(function (el) {
                    if ($(el).data('hzThreadsResolved')) return;
                    $(el).data('hzThreadsVideo', video);
                    el.classList.add('hzThreadsVideo');
                });
            }
        });

        callback($(res), name);
    }
});
