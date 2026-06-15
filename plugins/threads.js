var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Threads',
    version: '0.5',
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
        // video as a *sibling*, so that overlay — not the <video> — receives the
        // hover, and the mousemove handler only looks at event.target's ancestors.
        // The class therefore has to sit on the lowest common ancestor of the video
        // and the overlay: climb the video's ancestors until one also contains that
        // overlay. Falls back to the <video> itself.
        $('video').each(function () {
            var video = this;
            var url = video.currentSrc || video.src;
            if (!url || !/^https?:/.test(url)) {
                return;
            }
            var link = $(video);
            // The common ancestor is a handful of levels up (measured ~8 on a real
            // post, in a small ~19-node media wrapper); cap the climb so a video with
            // no nearby overlay doesn't walk up into the feed/body and scan it.
            for (var anc = video.parentElement, hops = 0; anc && hops < 10; anc = anc.parentElement, hops++) {
                var overlays = anc.querySelectorAll('div[role="presentation"]');
                var found = false;
                for (var i = 0; i < overlays.length; i++) {
                    if (!video.contains(overlays[i]) && !overlays[i].contains(video)) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    link = $(anc);
                    break;
                }
            }
            link.data().hoverZoomSrc = [url + '.video'];
            res.push(link[0]);
        });

        callback($(res), name);
    }
});
