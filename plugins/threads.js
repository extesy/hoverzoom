var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Threads',
    version: '0.3',
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

        callback($(res), name);
    }
});
