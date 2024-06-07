var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'spotify',
    version:'0.1',
    prepareImgLinks:function (callback) {

        const pluginName = this.name;
        var access_token = undefined;

        // cache for images urls
        // tracks urls have a short TTL and can not be cached
        var HZspotify = sessionStorage.getItem('HZspotify');
        if (HZspotify == null) {
            HZspotify = {};
            HZspotify.artists = {};
            HZspotify.albums = {};
            HZspotify.playlists = {};
            HZspotify.users = {};
            HZspotify.shows = {};
            HZspotify.episodes = {};
        } else {
            HZspotify = JSON.parse(HZspotify);
        }

        // if header(s) rewrite is allowed store headers settings that will be used for rewrite
        if (options.allowHeadersRewrite) {
              chrome.runtime.sendMessage({action:"storeHeaderSettings",
                                        plugin:pluginName,
                                        settings:
                                            [{"type":"request",
                                            "skipInitiator":"spotifydown",
                                            "urls":["spotifydown.com"],
                                            "headers":[{"name":"referer", "value":"https://spotifydown.com/", "typeOfUpdate":"add"}, {"name":"origin", "value":"https://spotifydown.com", "typeOfUpdate":"add"}]},
                                            {"type":"response",
                                            "skipInitiator":"spotify",
                                            "urls":["spotify.com"],
                                            "headers":[{"name":"Access-Control-Allow-Origin", "value":"*", "typeOfUpdate":"add"}]}]
                                        });
        }

        // call spotifydown API to get urls for audio tracks
        // track sample: https://open.spotify.com/intl-fr/track/7fj36UASAJfRL4pdD00OPV?si=077b59604f0c4ec0
        //  -> track id: 7fj36UASAJfRL4pdD00OPV
        // note: podcasts (= episodes) not supported
        $('a[href*="/track/"]').one('mouseover', function() {

            const link = $(this);
            const href = this.href;
            let data = link.data();

            if (data.hoverZoomMouseOver) return;
            data.hoverZoomMouseOver = true;

            const re = /\/(track)\/([^\/\?]{1,})/;
            const m = href.match(re);
            if (m == null) return;
            const trackId = m[2];

            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:'https://api.spotifydown.com/download/' + trackId
                                       }, function (response) {
                                            if (response == null) { return; }

                                            var j = undefined;
                                            try {
                                                j = JSON.parse(response);
                                            } catch (e) { return; }

                                            const audioUrl = j.link;
                                            const album = j.metadata?.album;
                                            const artists = j.metadata?.artists;
                                            const title = j.metadata?.title;
                                            const caption = `${title} - ${album} - ${artists}`;
                                            handleAudio(link, audioUrl, caption);
                                        }
            );
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // download audio file & create blob
        function handleAudio(link, audioUrl, caption) {

            fetch(audioUrl)
                .then(handleResponse)
                .catch(function(error) {
                    cLog(error);
                });

            function handleResponse(response) {
                if (response.ok) {
                    cLog(response);
                    response.blob()
                    .then(blob => blob.arrayBuffer())
                    .then(buffer => {
                        // convert audio file to Blob
                        const blobBin = new Blob([buffer], {type:'audio/mpeg'});
                        const blobUrl = URL.createObjectURL(blobBin);
                        link.data().hoverZoomSrc = [blobUrl + '.audio'];
                        link.data().hoverZoomCaption = caption;
                        callback(link, pluginName);
                        // Track is displayed iff the cursor is still over the track
                        if (link.data().hoverZoomMouseOver)
                            hoverZoom.displayPicFromElement(link);
                    })
                }
            }
        }

        // tracks images
        // https://i.scdn.co/image/ab67616d00004851cac54fe481facfdaf078c323
        $('img[src*="i.scdn.co/image/"]').one('mouseover', function() {

            const link = $(this);
            let data = link.data();

            if (data.hoverZoomMouseOver) return;
            data.hoverZoomMouseOver = true;

            if (access_token == undefined) {
                access_token = getAccessToken();
                if (access_token == undefined) return;
            }

            var trackId = undefined;

            var track = link.siblings().find('a[href*="/track/"]')[0];
            if (track) {
                const href = track.href;
                const re = /\/(track)\/([^\/\?]{1,})/;
                const m = href.match(re);
                if (m == null) return;
                trackId = m[2];
            }

            track = HZspotify.albums[trackId]; // reuse cached data
            if (track) {
                displayPic(link, track.url, track.caption);
                return;
            }

            const urlTrack = `https://api-partner.spotify.com/pathfinder/v1/query?operationName=getTrack&variables=%7B%22uri%22%3A%22spotify%3Atrack%3A${trackId}%22%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22ae85b52abb74d20a4c331d4143d4772c95f34757bfa8c625474b912b9055b5c0%22%7D%7D`;
            getImageTrack(link, urlTrack, trackId);

        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        function getImageTrack(link, url, trackId) {
            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:url,
                                        headers:[{"header":"authorization", "value":"Bearer " + access_token}]
                                       }, function (response) {
                                            if (response == null) { return; }

                                            try {
                                                const j = JSON.parse(response);
                                                var sources = j.data.trackUnion.albumOfTrack.coverArt.sources;
                                                sources = sources.sort(sortWidth);
                                                const imgUrl = sources[0].url;
                                                const artist = j.data.trackUnion.firstArtist.items[0]?.profile.name;
                                                const album = j.data.trackUnion.albumOfTrack?.name;
                                                const year = j.data.trackUnion.albumOfTrack?.date.year;
                                                const caption = `${album} - ${year} - ${artist}`;

                                                HZspotify.albums[trackId] = { 'url':imgUrl, 'caption':caption };
                                                sessionStorage.setItem('HZspotify', JSON.stringify(HZspotify));
                                                displayPic(link, imgUrl, caption);
                                            } catch { return undefined; }
                                       }
            );
        }

        function getImageAlbum(link, url, albumId) {
            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:url,
                                        headers:[{"header":"authorization", "value":"Bearer " + access_token}]
                                       }, function (response) {
                                            if (response == null) { return; }

                                            try {
                                                const j = JSON.parse(response);
                                                var sources = j.data.albumUnion.coverArt.sources;
                                                sources = sources.sort(sortWidth);
                                                const imgUrl = sources[0].url;
                                                const artist = j.data.albumUnion.artists.items[0]?.profile.name;
                                                const album = j.data.albumUnion?.name;
                                                const year = j.data.albumUnion?.date.isoString;
                                                const caption = `${album} - ${year} - ${artist}`;

                                                HZspotify.albums[albumId] = { 'url':imgUrl, 'caption':caption };
                                                sessionStorage.setItem('HZspotify', JSON.stringify(HZspotify));
                                                displayPic(link, imgUrl, caption);
                                            } catch { return undefined; }
                                       }
            );
        }

        function getImageArtist(link, url, artistId) {
            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:url,
                                        headers:[{"header":"authorization", "value":"Bearer " + access_token}]
                                       }, function (response) {
                                            if (response == null) { return; }

                                            try {
                                                const j = JSON.parse(response);
                                                var sources = j.data.artistUnion.visuals.avatarImage.sources;
                                                sources = sources.sort(sortWidth);
                                                const imgUrl = sources[0].url;
                                                const artist = j.data.artistUnion.profile.name;

                                                HZspotify.artists[artistId] = { 'url':imgUrl, 'caption':artist };
                                                sessionStorage.setItem('HZspotify', JSON.stringify(HZspotify));
                                                displayPic(link, imgUrl, artist);
                                            } catch { return undefined; }
                                       }
            );
        }

        function getImagePlaylist(link, url, playlistId) {
            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:url,
                                        headers:[{"header":"authorization", "value":"Bearer " + access_token}]
                                       }, function (response) {
                                            if (response == null) { return; }

                                            try {
                                                const j = JSON.parse(response);
                                                var sources = j.data.playlistV2.images.items[0].sources;
                                                sources = sources.sort(sortWidth);
                                                const imgUrl = sources[0].url;
                                                const name = j.data.playlistV2.name;

                                                HZspotify.playlists[playlistId] = { 'url':imgUrl, 'caption':name };
                                                sessionStorage.setItem('HZspotify', JSON.stringify(HZspotify));
                                                displayPic(link, imgUrl, name);
                                            } catch { return undefined; }
                                       }
            );
        }

        function getImageUser(link, url, userId) {
            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:url,
                                        headers:[{"header":"authorization", "value":"Bearer " + access_token}]
                                       }, function (response) {
                                            if (response == null) { return; }

                                            try {
                                                const j = JSON.parse(response);
                                                const imgUrl = j.image_url;
                                                const name = j.name;

                                                HZspotify.users[userId] = { 'url':imgUrl, 'caption':name };
                                                sessionStorage.setItem('HZspotify', JSON.stringify(HZspotify));
                                                displayPic(link, imgUrl, name);
                                            } catch { return undefined; }
                                       }
            );
        }

        function getImageEpisode(link, url, episodeId) {
            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:url,
                                        headers:[{"header":"authorization", "value":"Bearer " + access_token}]
                                       }, function (response) {
                                            if (response == null) { return; }

                                            try {
                                                const j = JSON.parse(response);
                                                var sources = j.data.episodeUnionV2.coverArt.sources;
                                                sources = sources.sort(sortWidth);
                                                const imgUrl = sources[0].url;
                                                const name = j.data.episodeUnionV2.name;

                                                HZspotify.episodes[episodeId] = { 'url':imgUrl, 'caption':name };
                                                sessionStorage.setItem('HZspotify', JSON.stringify(HZspotify));
                                                displayPic(link, imgUrl, name);
                                            } catch { return undefined; }
                                       }
            );
        }

        function getImageShow(link, url, showId) {
            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:url,
                                        headers:[{"header":"authorization", "value":"Bearer " + access_token}]
                                       }, function (response) {
                                            if (response == null) { return; }

                                            try {
                                                const j = JSON.parse(response);
                                                var sources = j.data.podcastUnionV2.coverArt.sources;
                                                sources = sources.sort(sortWidth);
                                                const imgUrl = sources[0].url;
                                                const name = j.data.podcastUnionV2.name;

                                                HZspotify.shows[showId] = { 'url':imgUrl, 'caption':name };
                                                sessionStorage.setItem('HZspotify', JSON.stringify(HZspotify));
                                                displayPic(link, imgUrl, name);
                                            } catch { return undefined; }
                                       }
            );
        }

        function sortWidth(a, b) {
            if (a.width < b.width) return 1;
            if (a.width > b.width) return -1;
            return 0;
        }

        function displayPic(link, imgUrl, caption) {
            link.data().hoverZoomSrc = [imgUrl];
            link.data().hoverZoomCaption = caption;
            callback(link, pluginName);
            // Cover is displayed iff the cursor is still over the image
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link);
        }

        // albums images
        // https://open.spotify.com/intl-fr/album/2YJGDCF7Qbn6lKPRjROnlo
        $('a[href*="/album/"]').one('mouseover', function() {

            const link = $(this);
            let data = link.data();

            if (data.hoverZoomMouseOver) return;
            data.hoverZoomMouseOver = true;

            if (access_token == undefined) {
                access_token = getAccessToken();
                if (access_token == undefined) return;
            }

            var albumId = undefined;
            const href = this.href;
            const re = /\/(album)\/([^\/\?]{1,})/;
            const m = href.match(re);
            if (m == null) return;
            albumId = m[2];

            const album = HZspotify.albums[albumId]; // reuse cached data
            if (album) {
                displayPic(link, album.url, album.caption);
                return;
            }

            const urlAlbum = `https://api-partner.spotify.com/pathfinder/v1/query?operationName=getAlbum&variables=%7B%22uri%22%3A%22spotify%3Aalbum%3A${albumId}%22%2C%22locale%22%3A%22intl-fr%22%2C%22offset%22%3A0%2C%22limit%22%3A50%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22469874edcad37b7a379d4f22f0083a49ea3d6ae097916120d9bbe3e36ca79e9d%22%7D%7D`;
            getImageAlbum(link, urlAlbum, albumId);

        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // artists images
        // https://open.spotify.com/intl-fr/artist/0VJIBKdqJygrupAxpSTk7q
        $('a[href*="/artist/"]').one('mouseover', function() {

            const link = $(this);
            let data = link.data();

            if (data.hoverZoomMouseOver) return;
            data.hoverZoomMouseOver = true;

            if (access_token == undefined) {
                access_token = getAccessToken();
                if (access_token == undefined) return;
            }

            var artistId = undefined;
            const href = this.href;
            const re = /\/(artist)\/([^\/\?]{1,})/;
            const m = href.match(re);
            if (m == null) return;
            artistId = m[2];

            const artist = HZspotify.artists[artistId]; // reuse cached data
            if (artist) {
                displayPic(link, artist.url, artist.caption);
                return;
            }

            const urlArtist = `https://api-partner.spotify.com/pathfinder/v1/query?operationName=queryArtistOverview&variables=%7B%22uri%22%3A%22spotify%3Aartist%3A${artistId}%22%2C%22locale%22%3A%22intl-fr%22%2C%22includePrerelease%22%3Atrue%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22da986392124383827dc03cbb3d66c1de81225244b6e20f8d78f9f802cc43df6e%22%7D%7D`;
            getImageArtist(link, urlArtist, artistId);

        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // playlists images
        // https://open.spotify.com/playlist/37i9dQZF1DZ06evO0jmCg8
        $('a[href*="/playlist/"]').one('mouseover', function() {

            const link = $(this);
            let data = link.data();

            if (data.hoverZoomMouseOver) return;
            data.hoverZoomMouseOver = true;

            if (access_token == undefined) {
                access_token = getAccessToken();
                if (access_token == undefined) return;
            }

            var playlistId = undefined;
            const href = this.href;
            const re = /\/(playlist)\/([^\/\?]{1,})/;
            const m = href.match(re);
            if (m == null) return;
            playlistId = m[2];

            const playlist = HZspotify.playlists[playlistId]; // reuse cached data
            if (playlist) {
                displayPic(link, playlist.url, playlist.caption);
                return;
            }

            const urlPlaylist = `https://api-partner.spotify.com/pathfinder/v1/query?operationName=fetchPlaylist&variables=%7B%22uri%22%3A%22spotify%3Aplaylist%3A${playlistId}%22%2C%22offset%22%3A0%2C%22limit%22%3A25%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%2291d4c2bc3e0cd1bc672281c4f1f59f43ff55ba726ca04a45810d99bd091f3f0e%22%7D%7D`;
            getImagePlaylist(link, urlPlaylist, playlistId);

        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // users images
        // https://open.spotify.com/user/12162875490
        $('a[href*="/user/"]').one('mouseover', function() {

            const link = $(this);
            let data = link.data();

            if (data.hoverZoomMouseOver) return;
            data.hoverZoomMouseOver = true;

            if (access_token == undefined) {
                access_token = getAccessToken();
                if (access_token == undefined) return;
            }

            var userId = undefined;
            const href = this.href;
            const re = /\/(user)\/([^\/\?]{1,})/;
            const m = href.match(re);
            if (m == null) return;
            userId = m[2];

            const user = HZspotify.users[userId]; // reuse cached data
            if (user) {
                displayPic(link, user.url, user.caption);
                return;
            }

            const urlUser = `https://spclient.wg.spotify.com/user-profile-view/v3/profile/${userId}`;
            getImageUser(link, urlUser, userId);

        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // shows images
        // https://open.spotify.com/show/73BbK5ixaPIFcHlwX4u2E3
        $('a[href*="/show/"]').one('mouseover', function() {

            const link = $(this);
            let data = link.data();

            if (data.hoverZoomMouseOver) return;
            data.hoverZoomMouseOver = true;

            if (access_token == undefined) {
                access_token = getAccessToken();
                if (access_token == undefined) return;
            }

            var showId = undefined;
            const href = this.href;
            const re = /\/(show)\/([^\/\?]{1,})/;
            const m = href.match(re);
            if (m == null) return;
            showId = m[2];

            const show = HZspotify.shows[showId]; // reuse cached data
            if (show) {
                displayPic(link, show.url, show.caption);
                return;
            }

            const urlShow = `https://api-partner.spotify.com/pathfinder/v1/query?operationName=queryShowMetadataV2&variables=%7B%22uri%22%3A%22spotify%3Ashow%3A${showId}%22%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%225fb034a236a3e8301e9eca0e23def3341ed66c891ea2d4fea374c091dc4b4a6a%22%7D%7D`;
            getImageShow(link, urlShow, showId);

        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // episodes images
        // https://open.spotify.com/episode/4UJWOHGH2RfOBjLc9THTOM
        $('a[href*="/episode/"]').one('mouseover', function() {

            const link = $(this);
            let data = link.data();

            if (data.hoverZoomMouseOver) return;
            data.hoverZoomMouseOver = true;

            if (access_token == undefined) {
                access_token = getAccessToken();
                if (access_token == undefined) return;
            }

            var episodeId = undefined;
            const href = this.href;
            const re = /\/(episode)\/([^\/\?]{1,})/;
            const m = href.match(re);
            if (m == null) return;
            episodeId = m[2];

            const episode = HZspotify.episodes[episodeId]; // reuse cached data
            if (episode) {
                displayPic(link, episode.url, episode.caption);
                return;
            }

            const urlEpisode = `https://api-partner.spotify.com/pathfinder/v1/query?operationName=getEpisodeOrChapter&variables=%7B%22uri%22%3A%22spotify%3Aepisode%3A${episodeId}%22%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%229697538fe993af785c10725a40bb9265a20b998ccd2383bd6f586e01303824e9%22%7D%7D`;
            getImageEpisode(link, urlEpisode, episodeId);

        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        function getAccessToken() {
            const scripts = Array.from(document.scripts);
            const script = scripts.filter(script => /"accessToken"/.test(script.text));
            if (script.length != 1) return undefined;
            try {
                const j = JSON.parse(script[0].text);
                return j.accessToken;
            } catch { return undefined; }
        }

    }
});
