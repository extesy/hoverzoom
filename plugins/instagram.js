var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Instagram',
    version: '1.0',
    favicon: 'instagram.svg',
    times: new Map(),        // media url (no query) -> upload time in seconds, for the age badge
    badgeBound: false,
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
        let observedHref = location.href;
        const exploreTimeRequests = new WeakSet();

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

        function postMedia(shortcode) {
            const id = mediaId(shortcode);
            // a real shortcode is 11 characters, so its media id stays under 20 digits. Posts
            // of private accounts are linked with long obfuscated codes instead, whose id the
            // api rejects — the post page's og:url carries the real shortcode.
            if (String(id).length <= 20) return apiJson(`/api/v1/media/${id}/info/`, data => data.items ? data.items[0] : null);
            return apiMedia(`/p/${shortcode}/`, html => {
                const code = (html.match(/<meta property="og:url" content="[^"]*\/p\/([^\/"]+)/) || [])[1];
                return code && code !== shortcode && postMedia(code);
            });
        }

        function reelMedia(id) {
            return apiJson(`/api/v1/feed/reels_media/?reel_ids=${encodeURIComponent(id)}`, data => {
                const reels = Array.isArray(data && data.reels_media) ? data.reels_media
                    : data && data.reels_media ? Object.values(data.reels_media)
                        : data && data.reels ? Object.values(data.reels) : [];
                const highlight = String(id).match(/^highlight:(\d+)$/);
                const reel = reels.find(entry => entry && entry.items && entry.items.length &&
                    (highlight ? entry.id === `highlight:${highlight[1]}`
                        : !entry.user || String(entry.user.pk || entry.user.id) === String(id)));
                return reel && reel.items;
            });
        }

        function userStories(id) {
            if (!id) return Promise.resolve(null);
            return reelMedia(id).then(items => items && items.length ? items :
                apiJson(`/api/v1/feed/user/${encodeURIComponent(id)}/story/`, data =>
                    data && (data.items || data.reel && data.reel.items ||
                        data.reels_media && Object.values(data.reels_media)[0] && Object.values(data.reels_media)[0].items) || null));
        }

        function profileStories(username) {
            const links = Array.from(document.querySelectorAll('main a[href*="/p/"], main a[href*="/reel/"]'))
                .filter(link => shortcodeRe.test(link.getAttribute('href') || ''));
            const find = index => {
                if (index === links.length) return Promise.resolve(null);
                const match = links[index].getAttribute('href').match(shortcodeRe);
                return postMedia(match[1]).then(post => {
                    if (!post || !post.user || String(post.user.username).toLowerCase() !== username.toLowerCase())
                        return find(index + 1);
                    return userStories(post.user.pk || post.user.id);
                });
            };
            return find(0);
        }

        // the stories of a name: the tray carries the user ids of the names it shows
        function trayStories(names) {
            return apiJson('/api/v1/feed/reels_tray/', data => data.tray || []).then(tray => {
                const reel = (tray || []).find(entry => entry.user && names.some(name =>
                    name && name.toLowerCase() === String(entry.user.username).toLowerCase()));
                return reel && (reel.items && reel.items.length ? reel.items : userStories(reel.user.pk || reel.user.id));
            });
        }

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

        // candidates of one media item: its video stream, or its full resolution photo
        // media url without its query or the .video marker: the key the age badge looks up
        function urlKey(url) {
            return String(url).replace(/\.video$/, '').split('?')[0];
        }

        // album items carry no time of their own, so they get the post's (takenAt)
        function mediaSrc(media, takenAt) {
            const url = media.video_versions ? media.video_versions[0].url : media.image_versions2.candidates[0].url;
            const time = media.taken_at || takenAt;
            if (time) {
                if (self.times.size >= cacheLimit * 5) self.times.delete(self.times.keys().next().value);
                self.times.set(urlKey(url), time);
            }
            return [media.video_versions ? url + '.video' : url];
        }

        // Instagram re-renders a feed post's media while scrolling and lays the hover
        // overlay over it in a parallel branch of the tree, so nothing can be prepared in
        // advance — the post under the pointer is resolved on hover instead. Its media is
        // the photo or video it holds; profile pictures (Instagram's -19 CDN variant) are
        // not post media.
        function onHover(event) {
            const hit = event.target;
            if (!hit.closest || hit.closest('#hzViewer')) return;
            const existingLink = hit.closest('.hoverZoomLink');
            if (existingLink) {
                if (/^\/explore(?:\/|$)/.test(location.pathname) && existingLink.matches('video')) {
                    fetchExploreReelTime(existingLink);
                }
                return;
            }
            if (observedHref !== location.href) {
                observedHref = location.href;
                self.resolved = new WeakSet();
            }

            const highlight = hit.closest('a[href*="/stories/highlights/"]');
            if (highlight) {
                showHighlight(highlight);
                return;
            }

            const reelLink = profileReelLink(hit, event);
            if (reelLink) {
                showPostMedia(hit, reelLink);
                return;
            }

            const username = profileUsername();
            const avatar = username && Array.from(document.querySelectorAll('main img[alt]')).find(image => {
                const rect = image.getBoundingClientRect();
                return image.alt.toLowerCase().includes(username.toLowerCase()) &&
                    /-19\/|profile_pic/i.test(`${image.alt} ${image.currentSrc || image.src}`) &&
                    event.clientX >= rect.left && event.clientX <= rect.right &&
                    event.clientY >= rect.top && event.clientY <= rect.bottom;
            });
            if (avatar) {
                showStories(avatar.closest('[role="button"]') || avatar.closest('[role="link"]') || avatar,
                    avatar, username);
                return;
            }

            const circle = hit.closest('[role="button"], [role="link"]');
            const face = circle && (circle.querySelector('img[src*="-19/"]') || circle.querySelector('img[src*="profile_pic"]'));
            if (face) showStories(circle, face);
            else showPostMedia(hit);
        }

        function fetchExploreReelTime(video) {
            if (video.dataset.instagramTakenAt || exploreTimeRequests.has(video)) return;
            const link = video.closest('a[href*="/p/"], a[href*="/reel/"]');
            const shortcode = link && (link.getAttribute('href').match(shortcodeRe) || [])[1];
            if (!shortcode) return;
            exploreTimeRequests.add(video);
            postMedia(shortcode).then(item => {
                if (item && item.taken_at) video.dataset.instagramTakenAt = item.taken_at;
            }).catch(() => {
                exploreTimeRequests.delete(video);
                console.warn('[Hover Zoom] Could not fetch the upload time for an Explore Reel.');
            });
        }

        function profileReelLink(hit, event) {
            if (!/^\/[^/?#]+\/reels\/?$/.test(location.pathname)) return null;
            const selector = 'a[href*="/reel/"], a[href*="/reels/"]';
            const direct = hit.closest(selector);
            if (direct && shortcodeRe.test(direct.getAttribute('href') || '')) return direct;
            return Array.from(document.querySelectorAll(`main ${selector}`)).find(link => {
                const rect = link.getBoundingClientRect();
                return shortcodeRe.test(link.getAttribute('href') || '') &&
                    event.clientX >= rect.left && event.clientX <= rect.right &&
                    event.clientY >= rect.top && event.clientY <= rect.bottom;
            }) || null;
        }

        function showHighlight(link) {
            if (self.resolved.has(link)) return;
            const id = (link.getAttribute('href').match(/highlights\/(\d+)/) || [])[1];
            if (!id) return;
            self.resolved.add(link);
            reelMedia(`highlight:${id}`).then(items => {
                const sources = items && items.map(item => mediaSrc(item)).filter(Boolean);
                if (sources && sources.length) hoverZoom.prepareLink($(link), sources);
                else self.resolved.delete(link);
            }).catch(() => self.resolved.delete(link));
        }

        // a story circle — the tray at the top of the feed, or the profile picture of the
        // profile being viewed — opens the stories of the user it belongs to
        function showStories(circle, face, usernameHint) {
            if (self.resolved.has(circle)) return;
            self.resolved.add(circle);
            const names = namesIn(face.alt);
            const viewed = usernameHint || profileUsername();
            const ownProfile = viewed && (usernameHint || names.some(name => name.toLowerCase() === viewed.toLowerCase()));
            const stories = ownProfile
                ? profileStories(viewed).then(items => items && items.length ? items : trayStories([viewed]))
                : trayStories(names);
            const retry = () => self.resolved.delete(circle);   // nothing to show: allow another hover
            stories.then(items => items && items.length ? hoverZoom.prepareLink($(circle), items.map(item => mediaSrc(item))) : retry()).catch(retry);
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
            const post = forcedPostLink || hit.closest('a[href*="/p/"], a[href*="/reel"], article');
            if (!post || self.resolved.has(post)) return;
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
                hoverZoom.prepareLink($(frame), srcs);
                // the feed's own video keeps playing behind the preview: pause it
                if (frame.matches(':hover')) pauseBehindPreview(post.querySelector('video'), post);
            };
            const fallback = () => {                      // the page's own full size photo
                const cover = post.querySelector(photoSelector);
                const background = getComputedStyle(media).backgroundImage.match(/^url\(["']?(.*?)["']?\)$/);
                zoom(cover ? cover.src : media.currentSrc || media.src || (background && background[1]));
            };
            const show = srcs => srcs ? zoom(srcs) : fallback();

            const link = forcedPostLink || (post.matches('a[href]') ? post : post.querySelector('a[href*="/p/"], a[href*="/reel"]'));
            let shortcode = link && (link.getAttribute('href').match(shortcodeRe) || [])[1];

            // when viewing a post/reel page itself there is often no link — take shortcode from the URL
            if (!shortcode) {
                shortcode = (location.pathname.match(shortcodeRe) || [])[1];
            }

            // media_type: 1 = photo, 2 = video, 8 = album
            if (shortcode) postMedia(shortcode).then(item => {
                if (item && item.media_type === 8) {
                    show(item.carousel_media.map(child => mediaSrc(child, item.taken_at)));
                } else if (item) {
                    const source = mediaSrc(item);
                    if (source && source.length) zoom(source[0]);   // keep string, same as before
                    else fallback();
                } else {
                    fallback();
                }
            }).catch(fallback);
            else fallback();                          // no post to resolve (e.g. an ad creative)
        }

        // "3h ago" badge on top of the preview. The viewer is the core's, so instead of
        // hooking into it we poll it: the badge shows while #hzViewer holds a visible
        // media whose url we resolved, and follows it when an album or the stories move
        // on to the next item.
        function timeAgo(seconds) {
            const diff = Math.max(0, Date.now() / 1000 - seconds);
            const m = Math.floor(diff / 60), h = Math.floor(diff / 3600), d = Math.floor(diff / 86400);
            if (m < 1) return 'just now';
            if (h < 1) return m + 'm ago';
            if (d < 1) return h + 'h ago';
            if (d < 30) return d + 'd ago';
            if (d < 365) return Math.floor(d / 30) + 'mo ago';
            return Math.floor(d / 365) + 'y ago';
        }

        function startAgeBadge() {
            const badge = document.createElement('div');
            badge.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;display:none;' +
                'padding:3px 10px;border-radius:12px;background:rgba(0,0,0,.75);color:#fff;' +
                'font:600 12px/1.4 -apple-system,Segoe UI,Roboto,sans-serif;transform:translateX(-50%);white-space:nowrap';
            document.documentElement.appendChild(badge);
            const timeForUrls = urls => urls.reduce((found, src) => found || (src && self.times.get(urlKey(src))), null);
            setInterval(function () {
                let shown = false;
                const viewer = document.getElementById('hzViewer');
                if (viewer) {
                    const link = hoverZoom.currentLink;
                    const data = link && link.length ? link.data() : null;
                    const linkedTime = link && link.toArray().reduce((time, element) =>
                        time || Number(element.dataset.instagramTakenAt) || null, null);
                    const activeSrc = data && (data.hoverZoomGallerySrc
                        ? data.hoverZoomGallerySrc[data.hoverZoomGalleryIndex || 0]
                        : data.hoverZoomSrc);
                    const activeTime = timeForUrls([].concat(activeSrc || []).flat(Infinity));
                    for (const el of viewer.querySelectorAll('img, video')) {
                        const sources = [el.currentSrc, el.src, ...Array.from(el.querySelectorAll('source'), source => source.src)];
                        const time = timeForUrls(sources) || (el.tagName === 'VIDEO' ? linkedTime || activeTime : null);
                        const rect = el.getBoundingClientRect();
                        if (!time || rect.width < 10 || rect.height < 10) continue;
                        badge.textContent = timeAgo(time);
                        badge.style.left = (rect.left + rect.width / 2) + 'px';
                        badge.style.top = Math.max(4, rect.top + 8) + 'px';
                        shown = true;
                        break;
                    }
                }
                badge.style.display = shown ? 'block' : 'none';
            }, 150);
        }

        if (!self.badgeBound) {
            self.badgeBound = true;
            startAgeBadge();
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