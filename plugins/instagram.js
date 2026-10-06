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

        // Resolve albums, videos, and stories through Instagram's API; rendered photos
        // already use their full-resolution signed CDN URLs.
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        const webAppId = '936619743392459';   // identifies Instagram's web client to its api
        const shortcodeRe = /\/(?:p|reel|reels)\/([A-Za-z0-9_-]+)\/?(?:[?#]|$)/;
        const postLinkSelector = 'a[href*="/p/"], a[href*="/reel/"], a[href*="/reels/"]';
        const cacheLimit = 200;               // entries kept, the oldest are dropped first
        let observedHref = location.href;

        function mediaId(shortcode) {
            let id = 0n;
            for (const char of shortcode) id = id * 64n + BigInt(alphabet.indexOf(char));
            return id;
        }

        // Same-origin requests preserve Instagram's session cookies.
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

        function postFromResponse(data) {
            if (!data || typeof data !== 'object') return null;
            if (Array.isArray(data.items) && data.items.length) return data.items[0];
            if (data.data) {
                const item = postFromResponse(data.data);
                if (item) return item;
            }
            if (data.graphql && data.graphql.shortcode_media) return data.graphql.shortcode_media;
            if (data.xdt_shortcode_media) return data.xdt_shortcode_media;
            if (data.shortcode_media) return data.shortcode_media;
            if (data.media && typeof data.media === 'object') return data.media;
            if (data.item && typeof data.item === 'object') return data.item;
            if (data.video_versions || data.video_url || data.image_versions2 || data.carousel_media) return data;
            return null;
        }

        function postMedia(shortcode) {
            const id = mediaId(shortcode);
            // Private-account links can use an obfuscated shortcode; resolve its canonical URL.
            if (String(id).length <= 20) {
                return apiJson(`/api/v1/media/${id}/info/`, postFromResponse).then(item =>
                    item || apiJson(`/reel/${encodeURIComponent(shortcode)}/?__a=1&__d=dis`, postFromResponse)
                );
            }
            const resolveCanonical = type => apiMedia(`/${type}/${shortcode}/`, html => {
                const code = (html.match(/<meta property="og:url" content="[^"]*\/(?:p|reel|reels)\/([^\/?"]+)/) || [])[1];
                return code && code !== shortcode ? postMedia(code) : null;
            });
            return resolveCanonical('reel').then(item => item || resolveCanonical('p'));
        }

        function matchesUser(user, userId, username) {
            if (!user) return true;
            const responseUserId = String(user.pk || user.id || '');
            const responseUsername = String(user.username || '').toLowerCase();
            if (!responseUserId && !responseUsername) return true;
            return responseUserId === String(userId) ||
                (!!username && responseUsername === username.toLowerCase());
        }

        // Resolve story/highlight items by reel ID.
        function reelMedia(id, expectedUsername) {
            return apiJson(`/api/v1/feed/reels_media/?reel_ids=${encodeURIComponent(id)}`, data => {
                if (!data) return null;
                const reels = Array.isArray(data.reels_media)
                    ? data.reels_media
                    : data.reels_media && typeof data.reels_media === 'object'
                        ? Object.values(data.reels_media)
                        : data.reels && typeof data.reels === 'object'
                            ? Object.values(data.reels)
                            : [];
                const highlightId = String(id).match(/^highlight:(\d+)$/);
                const reel = reels.find(entry => {
                    if (!entry || !Array.isArray(entry.items) || !entry.items.length) return false;
                    if (highlightId) return String(entry.id || '') === `highlight:${highlightId[1]}`;

                    // The requested ID is the identity when Instagram omits the user object.
                    return matchesUser(entry.user, id, expectedUsername);
                });
                return reel ? reel.items : null;
            });
        }

        function hasMedia(items) {
            return Array.isArray(items) && items.some(item => {
                const srcs = mediaSrc(item);
                return srcs && srcs.some(Boolean);
            });
        }

        function userStoryMedia(userId, username) {
            return reelMedia(userId, username).then(items => {
                if (hasMedia(items)) return items;
                return apiJson(`/api/v1/feed/user/${encodeURIComponent(userId)}/story/`, data => {
                    if (!data) return null;
                    const responseUser = data.user || (data.reel && data.reel.user);
                    if (!matchesUser(responseUser, userId, username)) return null;
                    if (hasMedia(data.items)) return data.items;
                    if (data.reel && hasMedia(data.reel.items)) return data.reel.items;
                    const reels = Array.isArray(data.reels_media)
                        ? data.reels_media
                        : data.reels_media && typeof data.reels_media === 'object'
                            ? Object.values(data.reels_media)
                            : [];
                    const reel = reels.find(entry => entry && hasMedia(entry.items) &&
                        matchesUser(entry.user, userId, username));
                    return reel ? reel.items : null;
                });
            });
        }

        // Resolve the viewed profile through profile info, its posts, then the tray.
        function profileStories(username) {
            const fromUser = user => {
                if (!user) return Promise.resolve(null);
                const userName = String(user.username || '').toLowerCase();
                if (username && userName && userName !== username.toLowerCase()) return Promise.resolve(null);
                const uid = user.pk || user.id;
                return uid ? userStoryMedia(uid, username || user.username) : Promise.resolve(null);
            };
            const fromProfilePost = () => {
                const links = Array.from(document.querySelectorAll('main a[href*="/p/"], main a[href*="/reel/"], main a[href*="/reels/"]'))
                    .filter(candidate => shortcodeRe.test(candidate.getAttribute('href') || ''));
                const ownLinkFirst = link => {
                    const href = link.getAttribute('href') || '';
                    return username && (
                        href.startsWith(`/${username}/p/`) ||
                        href.startsWith(`/${username}/reel/`) ||
                        href.startsWith(`/${username}/reels/`)
                    );
                };
                links.sort((a, b) => Number(ownLinkFirst(b)) - Number(ownLinkFirst(a)));

                const findProfileStories = index => {
                    if (index >= links.length) return Promise.resolve(null);
                    const match = (links[index].getAttribute('href') || '').match(shortcodeRe);
                    if (!match) return findProfileStories(index + 1);
                    return postMedia(match[1]).then(post => {
                        const owner = post && post.user;
                        if (!owner || (username && String(owner.username || '').toLowerCase() !== username.toLowerCase())) {
                            return findProfileStories(index + 1);
                        }
                        return fromUser(owner);
                    });
                };
                return findProfileStories(0);
            };
            const fromProfileInfo = () => username
                ? apiJson(`/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`, data => {
                    return data && data.data && data.data.user;
                }).then(fromUser)
                : Promise.resolve(null);
            return fromProfileInfo().then(items => hasMedia(items)
                ? items
                : fromProfilePost().then(postItems => hasMedia(postItems)
                    ? postItems
                    : username ? trayStories([username]) : null
                )
            );
        }

        function profileUsername() {
            const match = location.pathname.match(/^\/([^/?#]+)(?:\/(?:reels|tagged|saved))?\/?$/);
            if (!match || /^(?:p|reel|reels|stories|explore|direct|accounts)$/i.test(match[1])) return null;
            return match[1];
        }

        // Resolve an account's story from the tray.
        function trayStories(names) {
            return apiJson('/api/v1/feed/reels_tray/', data => (data && data.tray) || []).then(tray => {
                const reel = (tray || []).find(r => r.user && names.some(n => n && r.user.username && n.toLowerCase() === r.user.username.toLowerCase()));
                if (!reel) return null;
                if (hasMedia(reel.items)) return reel.items;
                const uid = reel.user && (reel.user.pk || reel.user.id);
                return uid ? userStoryMedia(uid, reel.user.username) : null;
            });
        }

        // Extract account names from an image's accessible label.
        function namesIn(alt) {
            return (alt || '').split(/[^A-Za-z0-9._]+/).filter(Boolean);
        }

        // Exclude profile pictures from post media.
        const photoSelector = 'img[src*="cdninstagram"]:not([src*="-19/"]), img[src*="fbcdn.net"]:not([src*="-19/"])';

        // Return preview URLs for a media item.
        function mediaSrc(media) {
            if (!media) return null;
            if (media.video_versions && media.video_versions.length > 0 && media.video_versions[0].url)
                return [media.video_versions[0].url + '.video'];
            if (media.video_url) return [media.video_url + '.video'];
            if (media.image_versions2 && media.image_versions2.candidates && media.image_versions2.candidates.length > 0)
                return media.image_versions2.candidates[0].url ? [media.image_versions2.candidates[0].url] : null;
            if (media.display_resources && media.display_resources.length > 0)
                return media.display_resources[media.display_resources.length - 1].src
                    ? [media.display_resources[media.display_resources.length - 1].src]
                    : null;
            if (media.display_url) return [media.display_url];
            return null;
        }

        function mediaVideoSrc(media) {
            if (!media) return null;
            if (media.video_versions && media.video_versions.length > 0) return media.video_versions[0].url + '.video';
            return media.video_url ? media.video_url + '.video' : null;
        }

        function backgroundImageUrl(element) {
            if (!element) return null;
            const background = getComputedStyle(element).backgroundImage;
            const match = background && background.match(/^url\(["']?(.*?)["']?\)$/);
            return match ? match[1] : null;
        }

        function isProfileReelsTab() {
            return /^\/[^/?#]+\/reels\/?$/.test(location.pathname);
        }

        function profileReelLink(hit, event) {
            if (!isProfileReelsTab()) return null;

            const directLink = hit.closest('a[href*="/reel/"], a[href*="/reels/"]');
            if (directLink && shortcodeRe.test(directLink.getAttribute('href') || '')) return directLink;

            for (let ancestor = hit.parentElement; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
                const candidates = Array.from(ancestor.querySelectorAll('a[href*="/reel/"], a[href*="/reels/"]'))
                    .filter(link => shortcodeRe.test(link.getAttribute('href') || ''));
                if (!candidates.length) continue;

                const x = event.clientX;
                const y = event.clientY;
                const underPointer = candidates.find(link => {
                    const rect = link.getBoundingClientRect();
                    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
                });
                if (underPointer) return underPointer;
                if (candidates.length === 1) return candidates[0];
                return null;
            }

            return null;
        }

        function profileAvatarAtPointer(event, hit, username) {
            if (!username) return null;
            const pointX = event.clientX;
            const pointY = event.clientY;
            const avatar = Array.from(document.querySelectorAll('main img[alt]')).find(img => {
                const alt = (img.alt || '').toLowerCase();
                if (!alt.includes(username.toLowerCase()) || !/-19\/|profile_pic|profile (?:picture|photo)/i.test(`${alt} ${img.currentSrc || img.src}`)) return false;
                const rect = img.getBoundingClientRect();
                return pointX >= rect.left && pointX <= rect.right &&
                    pointY >= rect.top && pointY <= rect.bottom;
            });
            if (!avatar) return null;

            return {
                avatar,
                target: avatar.closest('[role="button"]') ||
                    avatar.closest('[role="link"]') ||
                    hit.closest('a') ||
                    avatar
            };
        }

        function onHover(event) {
            const hit = event.target;
            if (!hit.closest || hit.closest('#hzViewer')) return;
            if (observedHref !== location.href) {
                observedHref = location.href;
                self.resolved = new WeakSet();
            }

            const highlight = hit.closest('a[href*="/stories/highlights/"]');
            if (highlight) {
                showHighlight(highlight);
                return;
            }

            // Profile reel tiles must be handled before looking for avatars in a
            // containing role=button; Instagram may nest the tile and header controls.
            const reelLink = profileReelLink(hit, event);
            if (reelLink) {
                showPostMedia(hit, reelLink);
                return;
            }

            const viewedProfile = profileUsername();
            const profileAvatar = profileAvatarAtPointer(event, hit, viewedProfile);
            if (profileAvatar) {
                showStories(profileAvatar.target, profileAvatar.avatar, viewedProfile);
                return;
            }

            // Story avatars in the tray, profile, and comment hovercards.
            const circle = hit.closest('[role="button"], [role="link"]');
            const face = circle && (
                circle.querySelector('img[src*="-19/"]') ||
                circle.querySelector('img[src*="profile_pic"]')
            );
            if (face) {
                showStories(circle, face);
                return;
            }

            // Some story avatars load before their image URL is ready.
            const canvasCircle = hit.closest('[role="button"]:has(canvas), [role="link"]:has(canvas)');
            if (canvasCircle && !canvasCircle.querySelector('img[src*="cdninstagram"]:not([src*="-19/"])')) {
                const canvasImg = canvasCircle.querySelector('img');
                if (canvasImg) {
                    showStories(canvasCircle, canvasImg);
                    return;
                }
            }

            // Story links that expose a username in their URL.
            const storyLink = hit.closest('a[href*="/stories/"]:not([href*="/stories/highlights/"])');
            if (storyLink) {
                const m = (storyLink.getAttribute('href') || '').match(/\/stories\/([^/?#]+)/);
                if (m && m[1]) {
                    showStoriesByUsername(storyLink, m[1]);
                    return;
                }
            }

            showPostMedia(hit);
        }

        function showHighlight(link) {
            if (self.resolved.has(link)) return;
            const match = (link.getAttribute('href') || '').match(/\/stories\/highlights\/(\d+)/);
            if (!match) return;

            self.resolved.add(link);
            const retry = () => self.resolved.delete(link);
            reelMedia(`highlight:${match[1]}`).then(items => {
                const srcs = (items || []).map(mediaSrc).filter(Boolean);
                if (srcs.length) {
                    hoverZoom.prepareLink($(link), srcs);
                } else {
                    retry();
                }
            }).catch(retry);
        }

        // Resolve stories for profile, tray, and comment avatars.
        function showStories(circle, face, usernameHint) {
            if (self.resolved.has(circle)) return;
            self.resolved.add(circle);

            const names = namesIn(face.alt);
            const viewed = usernameHint || profileUsername();

            const isProfilePage = viewed && (
                usernameHint ||
                names.some(n => n.toLowerCase() === viewed.toLowerCase()) ||
                !!circle.closest('header')
            );
            const username = isProfilePage ? viewed : (names[0] || null);

            const retry = () => self.resolved.delete(circle);

            let stories;
            if (isProfilePage) {
                stories = profileStories(viewed).then(items => {
                    if (hasMedia(items)) return items;
                    return trayStories(names);
                });
            } else {
                stories = trayStories(names).then(items => {
                    if (hasMedia(items)) return items;
                    if (username) return profileStories(username);
                    return null;
                });
            }

            stories.then(items => {
                const srcs = (items || []).map(mediaSrc).filter(Boolean);
                if (srcs.length > 0) hoverZoom.prepareLink($(circle), srcs);
                else retry();
            }).catch(retry);
        }

        // Resolve a story link that exposes the username in its URL.
        function showStoriesByUsername(link, username) {
            if (self.resolved.has(link)) return;
            self.resolved.add(link);
            const retry = () => self.resolved.delete(link);
            const names = [username];
            trayStories(names).then(items => {
                if (hasMedia(items)) return items;
                return profileStories(username);
            }).then(items => {
                const srcs = (items || []).map(mediaSrc).filter(Boolean);
                if (srcs.length > 0) hoverZoom.prepareLink($(link), srcs);
                else retry();
            }).catch(retry);
        }

        // Resolve the post under the pointer.
        function showPostMedia(hit, forcedPostLink) {
            const highlight = hit.closest('a[href*="/stories/highlights/"]');
            // Prefer the nearest post link; saved grids can wrap several links in one article.
            const postLink = forcedPostLink || hit.closest(postLinkSelector);
            const post = highlight || postLink || hit.closest('article');
            if (!post || self.resolved.has(post)) return;

            const media = post.querySelector(photoSelector + ', video') ||
                post.querySelector('video, img, [style*="background-image"]');

            // In the feed, attach to the smallest element containing both the pointer and media.
            let frame = post.matches('a[href]') ? post : null;
            for (let el = hit; !frame && el && el !== post; el = el.parentElement) {
                if (media && el.contains(media)) frame = el;
            }
            if (!media || !frame) return;   // the pointer is not on the media

            self.resolved.add(post);
            const videoEl = post.querySelector('video') || (post.matches('video') ? post : null);
            const directVideoUrl = (videoEl && videoEl.currentSrc && /^https?:/.test(videoEl.currentSrc) && !/^blob:/.test(videoEl.currentSrc))
                ? (videoEl.currentSrc + '.video') : null;
            const reelsTab = isProfileReelsTab();
            if (reelsTab && directVideoUrl) {
                hoverZoom.prepareLink($(frame), directVideoUrl);
                hoverZoom.displayPicFromElement($(frame), true);
                if (videoEl && frame.matches && frame.matches(':hover')) pauseBehindPreview(videoEl, post);
            }

            const zoom = srcs => {
                hoverZoom.prepareLink($(frame), srcs);
                if (reelsTab) hoverZoom.displayPicFromElement($(frame), true);
                if (videoEl && frame.matches && frame.matches(':hover')) pauseBehindPreview(videoEl, post);
            };
            const fallback = () => {
                if (reelsTab) {
                    if (directVideoUrl) zoom(directVideoUrl);
                    else self.resolved.delete(post);
                    return;
                }
                if (directVideoUrl) { zoom(directVideoUrl); return; }
                const cover = post.querySelector(photoSelector) || media;
                zoom(cover ? (cover.currentSrc || cover.src || backgroundImageUrl(cover)) : media.src);
            };
            const show = srcs => srcs ? zoom(srcs) : fallback();

            if (highlight) {
                const id = (highlight.getAttribute('href').match(/highlights\/(\d+)/) || [])[1];
                if (id) reelMedia(`highlight:${id}`).then(items => show(items && items.map(mediaSrc).filter(Boolean))).catch(fallback);
                else fallback();
            } else {
                const link = post.matches('a[href]') ? post : post.querySelector(postLinkSelector);
                const shortcode = link && (link.getAttribute('href').match(shortcodeRe) || [])[1];
                if (shortcode) {
                    postMedia(shortcode).then(item => {
                        if (reelsTab) {
                            const videoUrl = mediaVideoSrc(item);
                            if (videoUrl) zoom(videoUrl);
                            else fallback();
                            return;
                        }
                        if (!item) return fallback();
                        if (item.media_type === 8 && Array.isArray(item.carousel_media)) {
                            show(item.carousel_media.map(mediaSrc).filter(Boolean));
                        } else {
                            const s = mediaSrc(item);
                            show(s ? s[0] : null);
                        }
                    }).catch(fallback);
                } else fallback();   // no post to resolve (e.g. an ad creative)
            }
        }

        if (!self.hoverBound) {
            self.hoverBound = true;
            document.addEventListener('mouseover', onHover, true);
        }

        // Pause autoplay video behind the preview and resume it when the viewer closes.
        function pauseBehindPreview(video, container) {
            if (!video || video.paused || self.pausedVideos.some(entry => entry[0] === video)) return;
            self.pausedVideos.push([video, container]);
            video.pause();
            $(container).one('mouseleave', resumePausedVideos);
            watchViewerClose();
        }

        function resumePausedVideos() {
            for (let i = self.pausedVideos.length - 1; i >= 0; i--) {
                const [video, container] = self.pausedVideos[i];
                if (container && container.matches && container.matches(':hover')) continue;
                self.pausedVideos.splice(i, 1);
                video.play().catch(function () { });
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
