var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Threads',
    version: '0.6',
    prepareImgLinks: function (callback) {
        const name = this.name;
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

        // Video posts autoplay an inline <video>; we zoom to its stream. currentSrc
        // is usually a directly-playable progressive url; MSE blob: sources can't be
        // reused so they're skipped. The ".video" suffix is the core's marker for a
        // video stream.
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
        $('video').each(function () {
            var video = this;
            var url = video.currentSrc || video.src;
            if (!url || !/^https?:/.test(url)) {
                return;
            }
            var link = $(video);
            var vb = video.getBoundingClientRect();
            if (vb.width && vb.height) {
                var coincides = function (b) {
                    return Math.abs(b.left - vb.left) < 4 && Math.abs(b.top - vb.top) < 4 &&
                        Math.abs(b.width - vb.width) < 4 && Math.abs(b.height - vb.height) < 4;
                };
                // The overlay lives in a sibling branch of the video's path, so climb
                // the ancestors and look only at the branches we step past — never the
                // path already walked and never re-querying a growing subtree, so each
                // node is examined at most once. A sibling whose box doesn't even cover
                // the video can't hold the (video-sized) overlay, so it's skipped
                // without descending — this prunes unrelated siblings such as other
                // feed posts. getBoundingClientRect then runs only on the few remaining
                // presentation candidates.
                var overlay = null;
                for (var anc = video.parentElement, child = video, hops = 0;
                     anc && hops < 10 && !overlay;
                     child = anc, anc = anc.parentElement, hops++) {
                    for (var i = 0; i < anc.children.length && !overlay; i++) {
                        var sib = anc.children[i];
                        if (sib === child) {
                            continue;
                        }
                        var sb = sib.getBoundingClientRect();
                        if (sb.left > vb.left + 2 || sb.top > vb.top + 2 ||
                            sb.right < vb.right - 2 || sb.bottom < vb.bottom - 2) {
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
            link.data().hoverZoomSrc = [url + '.video'];
            res.push(link[0]);
        });

        callback($(res), name);
    }
});
