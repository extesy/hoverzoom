// Threads plays videos through MSE, so the page's <video> only exposes a blob: url.
// Its player gets the streams as an inline DASH manifest in its React props (the
// post data itself is masked by Relay, so video_versions is not reachable from the
// element). Those props live on the DOM node as a React fiber expando, which only the
// page's own world can read, so this script runs there (manifest "world": "MAIN").
// On { hoverZoomThreadsResolve: true } from plugins/threads.js it stamps each <video>
// with the streams of its manifest in the core's format, then answers with
// { hoverZoomThreadsResolved: true }:
//   data-hz-threads-src="<best video rendition>.video_<best audio track>.audio"
// Each representation's BaseURL is a complete fragmented mp4 file that a <video>
// plays directly. Video renditions carry no sound, hence the separate audio track.
(function () {
    if (window.hoverZoomThreadsPlayer) return;
    window.hoverZoomThreadsPlayer = true;

    var attribute = 'data-hz-threads-src';
    var parsed = new Map();   // manifest -> streams, bounded
    var parsedLimit = 200;

    function manifestOf(video) {
        var key = Object.keys(video).find(function (k) { return k.indexOf('__reactFiber$') === 0; });
        for (var fiber = key && video[key], hops = 0; fiber && hops < 20; fiber = fiber.return, hops++) {
            var props = fiber.memoizedProps;
            if (props && typeof props.manifest === 'string') return props.manifest;
        }
        return null;
    }

    // the largest video rendition (ties: the highest bitrate) and the best audio track
    function streams(manifest) {
        var mpd = new DOMParser().parseFromString(manifest, 'text/xml');
        var video = null, audio = null;
        mpd.querySelectorAll('Representation').forEach(function (rep) {
            var type = rep.getAttribute('mimeType') || rep.parentNode.getAttribute('mimeType') || '';
            var base = rep.querySelector('BaseURL');
            var url = base && base.textContent.trim();
            if (!url || !/^https:/.test(url)) return;
            var bitrate = +rep.getAttribute('bandwidth') || 0;
            if (/^video\//.test(type)) {
                var area = (+rep.getAttribute('width') || 0) * (+rep.getAttribute('height') || 0);
                if (!video || area > video.area || (area === video.area && bitrate > video.bitrate)) {
                    video = { url: url, area: area, bitrate: bitrate };
                }
            } else if (/^audio\//.test(type) && (!audio || bitrate > audio.bitrate)) {
                audio = { url: url, bitrate: bitrate };
            }
        });
        // an audio-only manifest is the soundtrack of a photo post, not a video
        if (!video) return null;
        return video.url + '.video' + (audio ? '_' + audio.url + '.audio' : '');
    }

    function stamp() {
        document.querySelectorAll('video').forEach(function (video) {
            var manifest = manifestOf(video);
            if (!manifest) return;   // the player has no streams yet: asked again later
            if (!parsed.has(manifest)) {
                if (parsed.size >= parsedLimit) parsed.delete(parsed.keys().next().value);
                parsed.set(manifest, streams(manifest));
            }
            // an empty value marks an audio-only manifest, which has nothing to zoom
            var src = parsed.get(manifest) || '';
            if (video.getAttribute(attribute) !== src) video.setAttribute(attribute, src);
        });
    }

    window.addEventListener('message', function (event) {
        if (event.source === window && event.data && event.data.hoverZoomThreadsResolve) {
            stamp();
            window.postMessage({ hoverZoomThreadsResolved: true }, location.origin);
        }
    });
})();
