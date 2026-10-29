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
        // media id, which is the first 11 characters of the post code in base64.
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        const webAppId = '936619743392459';   // identifies Instagram's web client to its api
        const apiQuery = '__a=1&__d=dis';     // client display params: the api now answers bare /api/v1 urls with 500
        const shortcodeRe = /\/(?:p|reel|reels)\/([A-Za-z0-9_-]+)\/?(?:[?#]|$)/;
        const cacheLimit = 200;               // entries kept, the oldest are dropped first
        let observedHref = location.href;     // the page the resolved cache belongs to

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
                    .then(response => response.text())
                    .then(pick)
                    .catch(() => null)
                    .then(value => {
                        if (!value) self.api.delete(url);   // a failed call is not worth keeping
                        return value;
                    }));
            }
            return self.api.get(url);
        }

        function apiJson(url, pick) {
            return apiMedia(url, text => {
                let data;
                try { data = JSON.parse(text); } catch { return null; }
                return pick(data);
            });
        }

        // The media code is the first 11 characters of a post code whatever its length:
        // posts of private accounts are linked with long signed codes whose tail is only the
        // signature (and the post page's meta no longer names the post at all).
        function postMedia(shortcode) {
            return apiJson(`/api/v1/media/${mediaId(shortcode.slice(0, 11))}/info/?${apiQuery}`, data => data.items ? data.items[0] : null);
        }

        // the stories of a reel: a highlight, or a user the tray/one of their posts names.
        // reels_media comes back as an array, or keyed by reel id
        function reelMedia(id) {
            return apiJson(`/api/v1/feed/reels_media/?reel_ids=${encodeURIComponent(id)}&${apiQuery}`, data => {
                const reels = Array.isArray(data && data.reels_media) ? data.reels_media
                    : Object.values((data && (data.reels_media || data.reels)) || {});
                const reel = reels.find(entry => entry && entry.items && entry.items.length &&
                    (String(id).startsWith('highlight:') ? entry.id === id
                        : !entry.user || String(entry.user.pk || entry.user.id) === String(id)));
                return reel && reel.items;
            });
        }

        // the stories of the profile being viewed: one of its posts carries the user id.
        // The first posts of a profile can be other users' suggestions, so check a few
        const profileScanLimit = 3;
        async function profileStories(username) {
            const links = Array.from(document.querySelectorAll('main a[href*="/p/"], main a[href*="/reel/"]'));
            for (const link of links.slice(0, profileScanLimit)) {
                const shortcode = (link.getAttribute('href').match(shortcodeRe) || [])[1];
                const post = shortcode && await postMedia(shortcode);
                if (post && post.user && String(post.user.username).toLowerCase() === username.toLowerCase())
                    return reelMedia(post.user.pk || post.user.id);
            }
            return null;
        }

        // the stories of a name: the tray carries the user ids of the names it shows
        function trayStories(names) {
            return apiJson(`/api/v1/feed/reels_tray/?${apiQuery}`, data => data.tray || []).then(tray => {
                const reel = (tray || []).find(entry => entry.user && names.some(name =>
                    name && name.toLowerCase() === String(entry.user.username).toLowerCase()));
                return reel && (reel.items && reel.items.length ? reel.items : reelMedia(reel.user.pk || reel.user.id));
            });
        }

        // the user name of the profile being viewed, if any
        function profileUsername() {
            const match = location.pathname.match(/^\/([^/?#]+)(?:\/(?:reels|tagged|saved))?\/?$/);
            return match && !/^(p|reel|reels|stories|explore|direct|accounts)$/i.test(match[1]) ? match[1] : null;
        }

        // the words of a picture's description: a user name is one of them, whatever the
        // page language says around it
        function namesIn(alt) {
            return alt.split(/[^A-Za-z0-9._]+/);
        }

        // a post's own photo: Instagram serves it from scontent-*.cdninstagram.com or, in
        // some regions, from instagram.*.fna.fbcdn.net. Profile pictures (the -19 CDN
        // variant) are not post media.
        const photoSelector = 'img[src*="cdninstagram"]:not([src*="-19/"]), img[src*="fbcdn.net"]:not([src*="-19/"])';

        // candidates of one media item: its video stream, or its full resolution photo.
        // Items with neither (empty or pending carousel slots) yield nothing
        function mediaSrc(media) {
            const video = media.video_versions && media.video_versions[0];
            const photo = media.image_versions2 && media.image_versions2.candidates && media.image_versions2.candidates[0];
            return video ? [video.url + '.video'] : photo ? [photo.url] : [];
        }

        // an album's or story's items that carry media: one empty slot must not take down the gallery
        function mediaSrcs(items) {
            return items.map(mediaSrc).filter(srcs => srcs.length);
        }

        // the hover target is resolved on demand: feeds re-render their media while
        // scrolling, and overlays cover the tiles' links, so nothing is tagged up front
        function onHover(event) {
            const hit = event.target;
            if (!hit.closest || hit.closest('#hzViewer')) return;   // our viewer
            if (observedHref !== location.href) {    // client-side navigation: the cache belongs to the old page
                observedHref = location.href;
                self.resolved = new WeakSet();
            }

            // the feed's own video would keep playing behind the preview. The hover event
            // itself proves the pointer sits on this post, so pause right away: waiting for
            // the async resolution was too late and never ran again for a tagged post.
            const post = hit.closest('a[href*="/p/"], a[href*="/reel/"], article');
            if (post) pauseBehindPreview(post.querySelector('video'), post);

            if (hit.closest('.hoverZoomLink')) return;   // already zoomable

            const highlight = hit.closest('a[href*="/stories/highlights/"]');
            if (highlight) return showHighlight(highlight);
            const reel = profileReelLink(hit, event);
            if (reel) return showPostMedia(hit, reel);
            const avatar = profileAvatar(event);
            if (avatar) return showStories(avatar.closest('[role="button"]') || avatar.closest('[role="link"]') || avatar, avatar, profileUsername());
            const circle = hit.closest('[role="button"], [role="link"]');
            const face = circle && circle.querySelector('img[src*="-19/"], img[src*="profile_pic"]');
            if (face) showStories(circle, face);
            else showPostMedia(hit);
        }

        // whether the pointer sits inside an element's box
        function pointerIn(rect, event) {
            return event.clientX >= rect.left && event.clientX <= rect.right &&
                event.clientY >= rect.top && event.clientY <= rect.bottom;
        }

        // the profile picture of the profile being viewed: other pictures can name the
        // same user (sidebars, tagged posts), so the one under the pointer wins
        function profileAvatar(event) {
            const username = profileUsername();
            return username && Array.from(document.querySelectorAll('main img[alt]')).find(image =>
                image.alt.toLowerCase().includes(username.toLowerCase()) &&
                /-19\/|profile_pic/i.test(`${image.alt} ${image.currentSrc || image.src}`) &&
                pointerIn(image.getBoundingClientRect(), event));
        }

        // a tile of a profile's reels tab: the hover overlay sits over the link, so the
        // pointer is often not inside it — take the tile whose box holds the pointer
        function profileReelLink(hit, event) {
            if (!/^\/[^/?#]+\/reels\/?$/.test(location.pathname)) return null;
            const selector = 'a[href*="/reel/"], a[href*="/reels/"]';
            const direct = hit.closest(selector);
            if (direct && shortcodeRe.test(direct.getAttribute('href') || '')) return direct;
            return Array.from(document.querySelectorAll(`main ${selector}`)).find(link =>
                shortcodeRe.test(link.getAttribute('href') || '') &&
                pointerIn(link.getBoundingClientRect(), event)) || null;
        }

        // a highlight link opens the stories it holds
        function showHighlight(link) {
            if (self.resolved.has(link)) return;
            const id = (link.getAttribute('href').match(/highlights\/(\d+)/) || [])[1];
            if (!id) return;
            self.resolved.add(link);
            const retry = () => self.resolved.delete(link);   // nothing to show: allow another hover
            reelMedia(`highlight:${id}`).then(items => {
                const srcs = items && mediaSrcs(items);
                return srcs && srcs.length ? hoverZoom.prepareLink($(link), srcs) : retry();
            }).catch(retry);
        }

        // a story circle — the tray at the top of the feed, or the profile picture of the
        // profile being viewed — opens the stories of the user it belongs to
        function showStories(circle, face, usernameHint) {
            if (self.resolved.has(circle)) return;
            self.resolved.add(circle);
            const names = namesIn(face.alt);
            const viewed = usernameHint || profileUsername();
            const own = viewed && (usernameHint || names.some(name => name.toLowerCase() === viewed.toLowerCase()));
            const stories = own
                ? profileStories(viewed).then(items => items && items.length ? items : trayStories([viewed]))
                : trayStories(names);
            const retry = () => self.resolved.delete(circle);   // a failed call: allow another hover
            stories.then(items => {
                const srcs = items && mediaSrcs(items);
                // without stories there is still the picture itself to zoom (a single
                // source is passed bare: an array would mean a gallery of candidate-arrays)
                return hoverZoom.prepareLink($(circle), srcs && srcs.length ? srcs : face.currentSrc || face.src);
            }).catch(retry);
        }

        // Instagram re-renders a feed post's media while scrolling and lays the hover
        // overlay over it in a parallel branch of the tree, so nothing can be prepared in
        // advance — the post under the pointer is resolved on hover instead. Its media is
        // the photo or video it holds; profile pictures (Instagram's -19 CDN variant) are
        // not post media.
        function showPostMedia(hit, forcedPostLink) {
            // a post is the feed's <article>, or a grid tile's link. The nearest one wins:
            // the saved collection grid wraps all of its tiles in a single <article>, and
            // taking that would resolve every tile to the first post of the grid.
            const post = forcedPostLink || hit.closest('a[href*="/p/"], a[href*="/reel/"], article');
            if (!post || self.resolved.has(post)) return;
            // a grid tile can hold its media as a plain image or as a background
            const media = post.querySelector(photoSelector + ', video') ||
                (forcedPostLink && post.querySelector('img, [style*="background-image"]'));

            // the zoom hangs on the post link, or — where the media sits in a plain
            // wrapper, as in the feed — on the element holding both the pointer and the media
            let frame = post.matches('a[href]') ? post : null;
            for (let el = hit; !frame && el && el !== post; el = el.parentElement) {
                if (media && el.contains(media)) frame = el;
            }
            if (!media || !frame) return;                 // the pointer is not on the media

            self.resolved.add(post);
            const zoom = srcs => {
                // nothing usable on the page: leave the post unresolved so a later hover retries
                if (Array.isArray(srcs) ? !srcs.length : !srcs) {
                    self.resolved.delete(post);
                    return;
                }
                hoverZoom.prepareLink($(frame), srcs);
            };
            const fallback = () => {                      // the page's own full size photo
                const cover = post.querySelector(photoSelector);
                const background = getComputedStyle(media).backgroundImage.match(/^url\(["']?(.*?)["']?\)$/);
                zoom(cover ? cover.src : media.currentSrc || media.src || (background && background[1]));
            };
            const show = srcs => srcs ? zoom(srcs) : fallback();

            const link = forcedPostLink || (post.matches('a[href]') ? post : post.querySelector('a[href*="/p/"], a[href*="/reel/"]'));
            // on a post's own page there is often no link: the url carries the shortcode
            const shortcode = (link && (link.getAttribute('href').match(shortcodeRe) || [])[1]) ||
                (location.pathname.match(shortcodeRe) || [])[1];
            // media_type: 1 = photo, 2 = video, 8 = album
            if (shortcode) postMedia(shortcode).then(item => {
                const srcs = item && (item.media_type === 8 ? mediaSrcs(item.carousel_media) : mediaSrc(item)[0]);
                show(srcs && srcs.length ? srcs : null);
            }).catch(fallback);
            else fallback();                          // no post to resolve (e.g. an ad creative)
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
