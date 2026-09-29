var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Threads',
    version: '0.7',
    listening: false,
    resolving: false,
    prepareImgLinks: function (callback) {
        const name = this.name;
        const self = this;
        var res = [];

        // Threads (threads.com / threads.net) serves post images from Instagram's
        // CDN (cdninstagram.com / fbcdn.net, path /v/t51.*-15/<id>_n.jpg). The "stp"
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
            return /\/t51\.[\d.]+-15\//.test(this.src);
        }).each(function () {
            var img = $(this);
            var link = img.closest('a[href*="/media"], div[role="button"]');
            if (!link.length) {
                link = img;
            }
            link.data().hoverZoomSrc = [this.src + '#hz'];
            res.push(link[0]);
        });

        // Video posts autoplay an inline <video>; we zoom to its stream. A progressive
        // currentSrc is used as is. Threads mostly plays through MSE though, which
        // leaves a blob: url that can't be reused: then plugins/threads_main.js, running
        // in the page's world, reads the player's streams from its React props and
        // stamps them on the <video> (data-hz-threads-src, already in the core's url
        // format, empty when there is nothing to zoom). A video not stamped yet is asked
        // for, and prepared as soon as the answer comes.
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
        function videoLinks(video) {
            var src = video.currentSrc || video.src;
            if (src && /^https?:/.test(src)) {
                src += '.video';
            } else {
                src = video.getAttribute('data-hz-threads-src');
                if (!src || !/^https:/.test(src)) {
                    return [];
                }
            }
            var link = $(video);
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
                    link = $(overlay);
                }
            }
            var links = [link[0]];
            // The photo pass above hangs the poster image on the carousel slide wrapper
            // around the video. The core collects the target's .hoverZoomLink ancestors
            // in document order and reads the data of the first one, i.e. the outermost
            // link wins, so the wrapper must zoom to the video as well.
            var slide = $(video).closest('a[href*="/media"], div[role="button"]');
            if (slide.length && slide[0] !== link[0]) {
                links.push(slide[0]);
            }
            links.forEach(function (el) {
                $(el).data().hoverZoomSrc = [src];
            });
            return links;
        }
        self.videoLinks = videoLinks;

        if (!self.listening) {
            self.listening = true;
            window.addEventListener('message', function (event) {
                if (event.source !== window || !event.data || !event.data.hoverZoomThreadsResolved) return;
                self.resolving = false;
                // the core's next pass only comes with node insertions or long scrolls
                $('video').each(function () {
                    self.videoLinks(this).forEach(function (el) {
                        $(el).data().hoverZoomSrcIndex = 0;
                        $(el).addClass('hoverZoomLink');
                    });
                });
            });
        }

        var waiting = false;
        $('video').each(function () {
            var links = videoLinks(this);
            if (!links.length && !this.hasAttribute('data-hz-threads-src')) {
                waiting = true;
            }
            res.push.apply(res, links);
        });
        if (waiting && !self.resolving) {
            self.resolving = true;
            window.postMessage({ hoverZoomThreadsResolve: true }, location.origin);
        }

        callback($(res), name);
    }
});
