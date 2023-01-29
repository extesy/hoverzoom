var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Instagram',
    version:'0.4',
    favicon:'instagram.svg',
    prepareImgLinks:function (callback) {

        const pluginName = this.name;
        var res = [];

        function sortResults(obj, prop, asc) {
            obj.sort(function(a, b) {
                if (asc) {
                    return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
                } else {
                    return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
                }
            });
        }

        // find user name, user id, user fullname, reels highlights
        //    sample: https://www.instagram.com/wants_a_meme/reels/
        //  user name: wants_a_meme
        // => user id: 54909864326

        var userName, userId, userFullname;
        const m = document.location.href.match(/instagram\.com\/([^/]{1,})/);
        if (m) {
            userName = m[1];
            if (!['instagram|explore|reels|stories|p'].includes(userName)) {

                var instagramUsersData = sessionStorage.getItem('instagramUsersData') || '{}';
                try {
                    instagramUsersData = JSON.parse(instagramUsersData);
                    if (instagramUsersData[userName]) {
                        userId = instagramUsersData[userName].data.user.id;
                        userFullname = instagramUsersData[userName].data.user.full_name;
                    }
                } catch {}

                if (!userId && !userFullname) {
                    chrome.runtime.sendMessage({action:'ajaxGet',
                                                url:'https://www.instagram.com/api/v1/users/web_profile_info/?username=' + userName,
                                                headers:[{"header":"X-IG-App-ID","value":"936619743392459"}],
                                                }, function (response) {

                                                    try {
                                                        const o = JSON.parse(response);
                                                        userId = o.data.user.id;
                                                        userFullname = o.data.user.full_name;
                                                        // store user data
                                                        instagramUsersData[userName] = o;
                                                        try {
                                                            sessionStorage.setItem('instagramUsersData', JSON.stringify(instagramUsersData));
                                                        } catch {
                                                            // reset sessionStorage
                                                            let instagramUserData = instagramUsersData[userName];
                                                            instagramUsersData = {};
                                                            instagramUsersData[userName] = instagramUserData;
                                                            sessionStorage.setItem('instagramUsersData', JSON.stringify(instagramUsersData));
                                                        }
                                                        getUserReelsHighlights();
                                                    } catch { }
                                                }
                    )
                } else {
                    var instagramUsersReelsHighlights = sessionStorage.getItem('instagramUsersReelsHighlights') || '{}';
                    try {
                        instagramUsersReelsHighlights = JSON.parse(instagramUsersReelsHighlights);
                        if (!instagramUsersReelsHighlights[userId]) {
                            getUserReelsHighlights();
                        }
                    } catch {}
                }
            }
        }

        function getUserReelsHighlights() {
            if (! userId) return;
            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:'https://www.instagram.com/graphql/query/?query_hash=d4d88dc1500312af6f937f7b804c68c3&variables={"user_id":"' + userId + '","include_chaining":true,"include_reel":false,"include_suggested_users":false,"include_logged_out_extras":false,"include_highlight_reels":true,"include_live_status":false}',
                                        headers:[{"header":"X-IG-App-ID","value":"936619743392459"}],
                                        }, function (response) {

                                            var instagramUsersReelsHighlights = sessionStorage.getItem('instagramUsersReelsHighlights') || '{}';
                                            try {
                                                instagramUsersReelsHighlights = JSON.parse(instagramUsersReelsHighlights);
                                                // store reels data
                                                instagramUsersReelsHighlights[userId] = JSON.parse(response);
                                                try {
                                                    sessionStorage.setItem('instagramUsersReelsHighlights', JSON.stringify(instagramUsersReelsHighlights));
                                                } catch {
                                                    // reset sessionStorage
                                                    let instagramUserReelsHighlights = instagramUsersReelsHighlights[userId];
                                                    instagramUsersReelsHighlights = {};
                                                    instagramUsersReelsHighlights[userId] = instagramUserReelsHighlights;
                                                    sessionStorage.setItem('instagramUsersReelsHighlights', JSON.stringify(instagramUsersReelsHighlights));
                                                }
                                            } catch {}
                                        });
        }

        // audio
        // sample: https://www.instagram.com/reels/audio/492466295586301/
        // TBD

        // header reels
        $('header div[role="button"] img').on('mouseover', function() {
            if (document.location.href.match('(following|followers)')) return;
            // extract image src (e.g: 321365237_536711615164811_1593293938921078231_n.jpg)
            const imgSrc = this.src.replace(/.*?([^\/]{1,}\.jpg)(\?.*)?/, '$1');
            const link = $(this);

            // resuse previous result
            if (link.data().hoverZoomInstagramUserId == userId) {
                if (link.data().hoverZoomInstagramGallerySrc) {
                    link.data().hoverZoomGallerySrc = link.data().hoverZoomInstagramGallerySrc;
                    if (link.data().hoverZoomInstagramGalleryCaption) {
                        link.data().hoverZoomGalleryCaption = link.data().hoverZoomInstagramGalleryCaption;
                    }
                }
                return;
            }

            link.data().hoverZoomInstagramUserId = userId;
            link.data().hoverZoomGallerySrc = undefined;
            link.data().hoverZoomGalleryCaption = undefined;

            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:'https://www.instagram.com/api/v1/feed/reels_media/?reel_ids=' + userId,
                                        headers:[{"header":"X-IG-App-ID","value":"936619743392459"}],
                                        }, function (response) {

                                            try {
                                                const o = JSON.parse(response);
                                                var gallery = [];
                                                var captions = [];
                                                // reels might mix images & videos
                                                const reels = o.reels_media[0].items;
                                                reels.map(r => { gallery.push([r.video_versions ? r.video_versions[0].url : r.image_versions2.candidates[0].url]); captions.push(r.caption ?? userFullname); });
                                                link.data().hoverZoomGallerySrc = gallery;
                                                link.data().hoverZoomInstagramGallerySrc = gallery;
                                                link.data().hoverZoomGalleryCaption = captions;
                                                link.data().hoverZoomInstagramGalleryCaption = captions;
                                                callback(link, pluginName);
                                                hoverZoom.displayPicFromElement(link);
                                            } catch {}

                                        }
                                    );
        });

        // highlighted reels
        $('div[role="presentation"] img').on('mouseover', function() {
            if (document.location.href.match('(following|followers)')) return;
            // extract image src (e.g: 321365237_536711615164811_1593293938921078231_n.jpg)
            // image src will be used as a key to find reels id
            const imgSrc = this.src.replace(/.*?([^\/]{1,}\.jpg)(\?.*)?/, '$1');
            const link = $(this);

            // resuse previous result
            if (link.data().hoverZoomInstagramUserId == userId) {
                if (link.data().hoverZoomInstagramGallerySrc) {
                    link.data().hoverZoomGallerySrc = link.data().hoverZoomInstagramGallerySrc;
                    if (link.data().hoverZoomInstagramGalleryCaption) {
                        link.data().hoverZoomGalleryCaption = link.data().hoverZoomInstagramGalleryCaption;
                    }
                }
                return;
            }

            // clean previous result
            link.data().hoverZoomInstagramUserId = userId;
            link.data().hoverZoomGallerySrc = undefined;
            link.data().hoverZoomGalleryCaption = undefined;

            // lookup sessionStorage
            var instagramUsersReelsHighlights = sessionStorage.getItem('instagramUsersReelsHighlights') || '{}';
            var reels;
            try {
                instagramUsersReelsHighlights = JSON.parse(instagramUsersReelsHighlights);
                reels = instagramUsersReelsHighlights[userId];
            } catch { return; }

            // find reel_ids associated to img
            var reel_ids = undefined;
            try {
                const values = hoverZoom.getValuesInJsonObject(reels, imgSrc, false, true, true); // look for a partial match & stop after 1st match
                if (values.length == 0) {
                    return;
                }
                // extract object containing id
                const o = hoverZoom.getJsonObjectFromPath(reels, values[0].path.substring(0, values[0].path.substring(0, values[0].path.lastIndexOf('[')).lastIndexOf('[')));
                reel_ids = o.id;
            } catch {}

            if (!reel_ids) return;

            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:'https://www.instagram.com/api/v1/feed/reels_media/?reel_ids=highlight:' + reel_ids,
                                        headers:[{"header":"X-IG-App-ID","value":"936619743392459"}],
                                        }, function (response) {

                                            try {
                                                const o = JSON.parse(response);
                                                var gallery = [];
                                                var captions = [];
                                                // reels might mix images & videos
                                                const reels = o.reels_media[0].items;
                                                reels.map(r => { gallery.push([r.video_versions ? r.video_versions[0].url : r.image_versions2.candidates[0].url]); captions.push(r.caption ?? userFullname); });
                                                link.data().hoverZoomGallerySrc = gallery;
                                                link.data().hoverZoomInstagramGallerySrc = gallery;
                                                link.data().hoverZoomGalleryCaption = captions;
                                                link.data().hoverZoomInstagramGalleryCaption = captions;
                                                callback(link, pluginName);
                                                hoverZoom.displayPicFromElement(link);
                                            } catch {}
                                        });
        });

        // profiles
        // sample 1: https://www.instagram.com/therock/
        // sample 2: https://www.instagram.com/ronaldo_sites/reels/
        $('a[href]:not(.hoverZoomMouseover)').filter(function() { return (!/(\/reel\/|\/p\/)/.test($(this).prop('href'))) }).addClass('hoverZoomMouseover').one('mouseover', function() {

            var href = this.href;
            var link = $(this);

            const re = /instagram\.com\/([^/]{1,})\//
            const m = href.replace('reels/', '').match(re);
            if (m == null) return;
            const username = m[1];

            // clean previous result
            link.data().hoverZoomSrc = [];

            // lookup sessionStorage
            var instagramUsersData = sessionStorage.getItem('instagramUsersData') || '{}';
            try {
                instagramUsersData = JSON.parse(instagramUsersData);
                if (instagramUsersData[username]) {
                    link.data().hoverZoomSrc = [instagramUsersData[username].data.user.profile_pic_url_hd];
                    link.data().hoverZoomCaption = instagramUsersData[username].data.user.full_name;
                    hoverZoom.displayPicFromElement(link);
                    return;
                }
            } catch {}

            // username not found in sessionStorage => proceed with api call
            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:'https://www.instagram.com/api/v1/users/web_profile_info/?username=' + username,
                                        headers:[{"header":"X-IG-App-ID","value":"936619743392459"}],
                                        }, function (response) {

                                            try {
                                                const o = JSON.parse(response);
                                                const profileUrl = o.data.user.profile_pic_url_hd;
                                                link.data().hoverZoomSrc = [profileUrl];
                                                link.data().hoverZoomCaption = o.data.user.full_name;
                                                // store user data
                                                instagramUsersData[username] = o;
                                                try {
                                                    sessionStorage.setItem('instagramUsersData', JSON.stringify(instagramUsersData));
                                                } catch {
                                                    // reset sessionStorage
                                                    let instagramUserData = instagramUsersData[username];
                                                    instagramUsersData = {};
                                                    instagramUsersData[username] = instagramUserData;
                                                    sessionStorage.setItem('instagramUsersData', JSON.stringify(instagramUsersData));
                                                }
                                                callback(link, pluginName);
                                                hoverZoom.displayPicFromElement(link);
                                            } catch { }
                                        }
            );
        });

        // pictures & videos
        // sample: https://www.instagram.com/p/ClpZbUIpNvx/
        $('a[href*="/p/"]:not(.hoverZoomMouseover), a[href*="/reel/"]:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function() {

            const href = this.href;
            const link = $(this);

            const re = /\/(p|reel)\/([^/]{1,})/
            const m = href.match(re);
            if (m == null) return;
            const shortcode = m[2];

            var mediaId = undefined;

            // lookup sessionStorage
            var instagramMediaData = sessionStorage.getItem('instagramMediaData') || '{}';
            try {
                instagramMediaData = JSON.parse(instagramMediaData);
                if (instagramMediaData[shortcode]) {
                    const items0 = instagramMediaData[shortcode];
                    displayMedia(link, items0);
                    callback(link, pluginName);
                    return;
                } else {
                    // find media id associated to shortcode in user data
                    var instagramUsersData = sessionStorage.getItem('instagramUsersData') || '{}';
                    instagramUsersData = JSON.parse(instagramUsersData);
                    if (instagramUsersData[userName]) {

                        const values = hoverZoom.getValuesInJsonObject(instagramUsersData[userName], shortcode, true, true, true); // look for a full match & stop after 1st match
                        if (values.length) {
                            // extract object containing media id
                            const o = hoverZoom.getJsonObjectFromPath(instagramUsersData[userName], values[0].path.substring(0, values[0].path.lastIndexOf('[')));
                            mediaId = o.id;
                        }
                    }
                }
            } catch {}

            if (mediaId == undefined) {
                // compute media id from shortcode
                mediaId = mediaIdfromShortcode(shortcode);
            }

            // clean previous result
            link.data().hoverZoomSrc = [];

            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:'https://www.instagram.com/api/v1/media/' + mediaId + '/info/',
                                        headers:[{"header":"X-IG-App-ID","value":"936619743392459"}],
                                        }, function (response) {

                                            try {
                                                const o = JSON.parse(response);
                                                const items0 = o.items[0];
                                                // store media data
                                                var instagramMediaData = sessionStorage.getItem('instagramMediaData') || '{}';
                                                instagramMediaData = JSON.parse(instagramMediaData);
                                                instagramMediaData[shortcode] = items0;
                                                try {
                                                    sessionStorage.setItem('instagramMediaData', JSON.stringify(instagramMediaData));
                                                } catch {
                                                    // reset sessionStorage
                                                    instagramMediaData = {};
                                                    instagramMediaData[shortcode] = items0;
                                                    sessionStorage.setItem('instagramMediaData', JSON.stringify(instagramMediaData));
                                                }
                                                displayMedia(link, items0);
                                                callback(link, pluginName);
                                                hoverZoom.displayPicFromElement(link);
                                            } catch { }
                                        }
            );
        });

        // display all kind of media (images, videos, carousel)
        function displayMedia(link, items0, callback) {

            const videos = items0.video_versions;
            const images = items0.image_versions2;
            const carousel = items0.carousel_media;
            if (videos) {
                // extract best quality video url
                //sortResults(videos, 'width', false);
                const videoUrl = videos[0].url + '.video';

                // try to extract audio url (might not be present)
                let audioUrl;
                try {
                    if (items0.clips_metadata.original_sound_info) {
                        audioUrl = items0.clips_metadata.original_sound_info.progressive_download_url + '.audiomuted'; // there is already a soundtrack in video, this one is only for download
                    } else if (items0.clips_metadata.music_info) {
                        audioUrl = items0.clips_metadata.music_info.music_asset_info.progressive_download_url + '.audiomuted'; // there is already a soundtrack in video, this one is only for download
                    }
                } catch {}

                // try to extract subtitles url (might not be present)
                let subtitlesUrl;
                try {
                    if (items0.video_subtitles_uri) subtitlesUrl = items0.video_subtitles_uri + '.subtitles';
                } catch {}

                let videoAudioSubtitlesUrl = videoUrl;
                if (audioUrl) videoAudioSubtitlesUrl += '_' + audioUrl;
                if (subtitlesUrl) videoAudioSubtitlesUrl += '_' + subtitlesUrl;
                link.data().hoverZoomCaption = (items0.caption ? items0.caption.text : (items0.accessibility_caption ? items0.accessibility_caption : items0.user.full_name));
                if (callback) callback(videoAudioSubtitlesUrl);
                else link.data().hoverZoomSrc = [videoAudioSubtitlesUrl];
            } else if (images) {
                const imagesUrl = images.candidates[0].url;
                link.data().hoverZoomCaption = (items0.caption ? items0.caption.text : (items0.accessibility_caption ? items0.accessibility_caption : items0.user.full_name));
                if (callback) callback(imagesUrl);
                else link.data().hoverZoomSrc = [imagesUrl];
            } else if (carousel) {
                var gallery = [];
                var captions = [];
                const caption = (items0.caption ? items0.caption.text : (items0.accessibility_caption ? items0.accessibility_caption : items0.user.full_name));
                // carousel might mix images & videos
                carousel.map(c => { gallery.push([c.video_versions ? c.video_versions[0].url : c.image_versions2.candidates[0].url]); captions.push(caption ?? ''); });
                link.data().hoverZoomGalleryCaption = captions;
                if (callback) callback(gallery);
                else link.data().hoverZoomGallerySrc = gallery;
            }
        }

        // from https://gist.github.com/sclark39/9daf13eea9c0b381667b61e3d2e7bc11
        // require https://github.com/peterolson/BigInteger.js

        var lower = 'abcdefghijklmnopqrstuvwxyz';
        var upper = lower.toUpperCase();
        var numbers = '0123456789';
        var ig_alphabet =  upper + lower + numbers + '-_';
        var bigint_alphabet = numbers + lower;

        // compute media id from shortcode
        // e.g: CG53Utagki0 => 2430216789653866676
        function mediaIdfromShortcode( shortcode )
        {
            var o = shortcode.replace( /\S/g, m =>
            {
                var c = ig_alphabet.indexOf( m );
                var b = bigint_alphabet.charAt( c );
                return ( b != "" ) ? b : `<${c}>`;
            } );
            return bigInt( o, 64 ).toString( 10 );
        }

    }
});