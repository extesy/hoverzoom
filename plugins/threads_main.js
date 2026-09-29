// Threads plays videos through MSE, so the page's <video> only exposes a blob: url.
// The streams are in its player's React props (the post data itself is masked by
// Relay, so video_versions is not reachable from the element). Those props live on
// the DOM node as a React fiber expando, which only the page's own world can read, so
// this script runs there (manifest "world": "MAIN"). The player lists several
// implementations; we take, in order:
//  1. the progressive one (hdSrc / sdSrc): a single H.264 + AAC mp4, which also makes
//     a download that plays anywhere;
//  2. else the inline DASH manifest: the largest video rendition plus the best audio
//     track. Each representation's BaseURL is a complete fragmented mp4 that a
//     <video> plays directly; video renditions carry no sound, hence the audio track.
// On { hoverZoomThreadsResolve: true } from plugins/threads.js it stamps each <video>
// with its streams in the core's format, then answers with
// { hoverZoomThreadsResolved: true }:
//   data-hz-threads-src="<stream>.video" or "<video>.video_<audio>.audio"
(function () {
    if (window.hoverZoomThreadsPlayer) return;
    window.hoverZoomThreadsPlayer = true;

    var attribute = 'data-hz-threads-src';
    var parsed = new Map();   // manifest -> streams, bounded
    var parsedLimit = 200;

    // the player's progressive source and its DASH manifest
    function sourceOf(video) {
        var key = Object.keys(video).find(function (k) { return k.indexOf('__reactFiber$') === 0; });
        var source = { progressive: null, manifest: null };
        for (var fiber = key && video[key], hops = 0; fiber && hops < 25; fiber = fiber.return, hops++) {
            var props = fiber.memoizedProps;
            if (!props) continue;
            if (!source.manifest && typeof props.manifest === 'string') source.manifest = props.manifest;
            if (Array.isArray(props.implementations)) {   // the player's whole choice
                props.implementations.forEach(function (implementation) {
                    var data = implementation && implementation.data;
                    var url = data && (data.hdSrc || data.sdSrc);
                    if (!source.progressive && typeof url === 'string' && /^https:/.test(url)) source.progressive = url;
                    if (!source.manifest && data && typeof data.manifest === 'string') source.manifest = data.manifest;
                });
                break;
            }
        }
        return source.progressive || source.manifest ? source : null;
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
            var source = sourceOf(video);
            if (!source) return;   // the player has no streams yet: asked again later
            var dash = null;
            if (source.manifest) {
                if (!parsed.has(source.manifest)) {
                    if (parsed.size >= parsedLimit) parsed.delete(parsed.keys().next().value);
                    parsed.set(source.manifest, streams(source.manifest));
                }
                dash = parsed.get(source.manifest);
            }
            // an empty value marks a player without video (an audio-only manifest: the
            // soundtrack of a photo post), which has nothing to zoom
            var src = source.manifest && !dash ? '' : source.progressive ? source.progressive + '.video' : dash;
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
