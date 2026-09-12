var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Instagram',
    version: '1.0',
    favicon: 'instagram.svg',
    api: new Map(),          // url -> promise of the picked api payload (bounded, failures dropped)
    pausedVideos: [],        // [video, container] pairs paused behind a preview
    viewerObserver: null,
    resolved: new WeakSet(), // media already resolved (or being resolved): posts and story circles
    hoverBound: false,
    prepareImgLinks: function () {
        const self = this;

        // Instagram serves media through signed CDN urls (the stp/oh/oe parameters are
        // part of the signature), so they can't be rewritten to another size. Photos
        // don't need that anyway: the <img> the page renders already points at the full
        // resolution file — it is only scaled down with CSS — in the feed as well as in
        // profile, reel and collection grids. The rest of a post, i.e. the other album
        // items, the video stream and the stories, is delivered to Instagram's own player
        // alone, so it is resolved on hover through its media api. That api takes the
        // media id, which is the shortcode in the post url in base64.
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        const webAppId = '936619743392459';   // identifies Instagram's web client to its api
        const shortcodeRe = /\/(?:p|reel|reels)\/([A-Za-z0-9_-]+)\/?(?:[?#]|$)/;
        const cacheLimit = 200;               // entries kept, the oldest are dropped first

        function mediaId(shortcode) {
            let id = 0n;
            for (const char of shortcode) id = id * 64n + BigInt(alphabet.indexOf(char));
            return id;
        }

        // Instagram's media apis, memoized per url. The calls are plain same-origin
        // fetches from the page: requests relayed through the extension background come
        // from a foreign origin, and Instagram's session cookies ("Lax") aren't sent to
        // those, so the api answers with the login page instead of the media.
        function apiMedia(url, pick) {
            if (!self.api.has(url)) {
                if (self.api.size >= cacheLimit) self.api.delete(self.api.keys().next().value);
                self.api.set(url, fetch(url, {
                        headers: { 'x-ig-app-id': webAppId }, credentials: 'include'
                    })
                    .then(response => response.json())
                    .then(pick)
                    .catch(() => null)
                    .then(value => {
                        if (!value) self.api.delete(url);   // a failed call is not worth keeping
                        return value;
                    }));
            }
            return self.api.get(url);
        }

        function postMedia(shortcode) {
            return apiMedia(`/api/v1/media/${mediaId(shortcode)}/info/`,
                data => data.items ? data.items[0] : null);
        }

        // the stories of a reel: a highlight, or a user the tray/one of their posts names
        function reelMedia(id) {
            return apiMedia(`/api/v1/feed/reels_media/?reel_ids=${id}`,
                data => data.reels_media[0].items || null);
        }

        // the stories of the profile being viewed: any of its posts carries the user id
        function profileStories() {
            const link = document.querySelector('main a[href*="/p/"], main a[href*="/reel/"]');
            const shortcode = link && (link.getAttribute('href').match(shortcodeRe) || [])[1];
            return shortcode ? postMedia(shortcode).then(post => post && post.user ? reelMedia(post.user.pk) : null) : null;
        }

        // the stories of a name: the tray carries the user ids of the names it shows
        function trayStories(names) {
            return apiMedia('/api/v1/feed/reels_tray/', data => data.tray || []).then(tray => {
                const reel = (tray || []).find(reel => reel.user && names.includes(reel.user.username));
                return reel && reelMedia(reel.user.pk);
            });
        }

        // the words of a picture's description: a user name is one of them, whatever the
        // page language says around it
        function namesIn(alt) {
            return alt.split(/[^A-Za-z0-9._]+/);
        }

        // candidates of one media item: its video stream, or its full resolution photo
        function mediaSrc(media) {
            return media.video_versions ? [media.video_versions[0].url + '.video']
                                        : [media.image_versions2.candidates[0].url];
        }

        // Instagram re-renders a feed post's media while scrolling and lays the hover
        // overlay over it in a parallel branch of the tree, so nothing can be prepared in
        // advance — the post under the pointer is resolved on hover instead. Its media is
        // the photo or video it holds; profile pictures (Instagram's -19 CDN variant) are
        // not post media.
        function onHover(event) {
            const hit = event.target;
            if (!hit.closest || hit.closest('#hzViewer') || hit.closest('.hoverZoomLink')) return;   // our viewer, or already zoomable

            const circle = hit.closest('[role="button"], [role="link"]');
            const face = circle && circle.querySelector('img[src*="-19/"]');
            if (face) showStories(circle, face);
            else showPostMedia(hit);
        }

        // a story circle — the tray at the top of the feed, or the profile picture of the
        // profile being viewed — opens the stories of the user it belongs to
        function showStories(circle, face) {
            if (self.resolved.has(circle)) return;
            self.resolved.add(circle);
            const names = namesIn(face.alt);
            const viewed = location.pathname.match(/^\/([^/?#]+)\/$/)?.[1];
            const stories = (names.includes(viewed) && profileStories()) || trayStories(names);
            const retry = () => self.resolved.delete(circle);   // nothing to show: allow another hover
            stories.then(items => items ? hoverZoom.prepareLink($(circle), items.map(mediaSrc)) : retry()).catch(retry);
        }

        // Instagram re-renders a feed post's media while scrolling and lays the hover
        // overlay over it in a parallel branch of the tree, so nothing can be prepared in
        // advance — the post under the pointer is resolved on hover instead. Its media is
        // the photo or video it holds; profile pictures (Instagram's -19 CDN variant) are
        // not post media.
        function showPostMedia(hit) {
            const highlight = hit.closest('a[href*="/stories/highlights/"]');
            const post = highlight || hit.closest('article') || hit.closest('a[href*="/p/"], a[href*="/reel/"]');
            if (!post || self.resolved.has(post)) return;
            const media = post.querySelector('img[src*="cdninstagram"]:not([src*="-19/"]), video');

            // the zoom hangs on the post link, or — where the media sits in a plain
            // wrapper, as in the feed — on the element holding both the pointer and the media
            let frame = post.matches('a[href]') ? post : null;
            for (let el = hit; !frame && el && el !== post; el = el.parentElement) {
                if (media && el.contains(media)) frame = el;
            }
            if (!media || !frame) return;                 // the pointer is not on the media

            self.resolved.add(post);
            const zoom = srcs => {
                hoverZoom.prepareLink($(frame), srcs);
                // the feed's own video keeps playing behind the preview: pause it
                if (frame.matches(':hover')) pauseBehindPreview(post.querySelector('video'), post);
            };
            const fallback = () => {                      // the page's own full size photo
                const cover = post.querySelector('img[src*="cdninstagram"]:not([src*="-19/"])');
                zoom(cover ? cover.src : media.src);
            };
            const show = srcs => srcs ? zoom(srcs) : fallback();

            if (highlight) {
                const id = (highlight.getAttribute('href').match(/highlights\/(\d+)/) || [])[1];
                if (id) reelMedia(`highlight:${id}`).then(items => show(items && items.map(mediaSrc))).catch(fallback);
                else fallback();
            } else {
                const link = post.matches('a[href]') ? post : post.querySelector('a[href*="/p/"], a[href*="/reel/"]');
                const shortcode = link && (link.getAttribute('href').match(shortcodeRe) || [])[1];
                // media_type: 1 = photo, 2 = video, 8 = album
                if (shortcode) postMedia(shortcode).then(item => show(item &&
                    (item.media_type === 8 ? item.carousel_media.map(mediaSrc) : mediaSrc(item)[0]))).catch(fallback);
                else fallback();                          // no post to resolve (e.g. an ad creative)
            }
        }

        if (!self.hoverBound) {
            self.hoverBound = true;
            $(document).on('mouseover', onHover);
        }

        // Videos in the main feed autoplay, so pause one behind its previewed viewer and
        // resume it when the viewer closes. The core fires no viewer events, but it
        // creates #hzViewer on the first zoom and empties it when the preview closes, so
        // watching that node tells us when to resume.
        function pauseBehindPreview(video, container) {
            if (!video || video.paused || self.pausedVideos.some(entry => entry[0] === video)) return;
            self.pausedVideos.push([video, container]);
            video.pause();
            // the viewer can also close while the pointer stays put (close key, an error):
            // leaving the post then resumes the video
            $(container).one('mouseleave', resumePausedVideos);
            watchViewerClose();
        }

        function resumePausedVideos() {
            for (let i = self.pausedVideos.length - 1; i >= 0; i--) {
                const [video, container] = self.pausedVideos[i];
                if (container.matches(':hover')) continue;   // its own preview is opening now
                self.pausedVideos.splice(i, 1);
                video.play().catch(function () {});
            }
        }

        function watchViewerClose() {
            if (self.viewerObserver) return;
            const viewer = document.getElementById('hzViewer');
            if (viewer) {
                self.viewerObserver = new MutationObserver(function () {
                    if (!viewer.firstChild) resumePausedVideos();
                });
                self.viewerObserver.observe(viewer, { childList: true });
            } else {
                // #hzViewer is created by the core on the first zoom
                self.viewerObserver = new MutationObserver(function () {
                    if (!document.getElementById('hzViewer')) return;
                    self.viewerObserver.disconnect();
                    self.viewerObserver = null;
                    watchViewerClose();
                });
                self.viewerObserver.observe(document.body, { childList: true });
            }
        }
    }
});
