var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'IMDb',
    version:'0.7',
    favicon:'imdb.svg',
    prepareImgLinks:function (callback) {
        var name = this.name;
        var res = [];

        // images
        // do not zoom an image when a video is available
        $('img[src*="._V1"], img.loadlate, div.rec_poster_img').filter(function() { return $($(this).parent('div')[0]).siblings('a[href*="/video/"], a[href*="/videoplayer/"]').length == 0 }).each(function () {
            var elem = $(this),
                url = elem.attr('loadlate') || hoverZoom.getThumbUrl(this);
            url = url.replace(/\._V1.*\./, options.showHighRes ? '.' : '._V1._SX600_SY600_.');
            var target = elem.parents('div[role="group"]');
            if (target.length > 0) elem = $(target[0]);
            elem.data().hoverZoomSrc = [url];
            res.push(elem);
        });

        // videos
        // https://www.imdb.com/video/vi2694185497/?ref_=vp_rv_8
        // https://www.imdb.com/videoplayer/vi2248787225?ref_=ttvi_vi_imdb_1
        $('a[href*="/video/"], a[href*="/videoplayer/"]').one('mouseenter', function () {

            const href = this.href;
            const link = $(this);

            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            cLog(`href: ${href}`);

            var videoId = null;
            const regexVideoId = /\/(video|videoplayer)\/([^/?]{1,})/;
            let matches = href.match(regexVideoId);
            if (matches) videoId = matches[2];
            if (videoId == null) return;
            cLog(`videoId: ${videoId}`);

            // lookup sessionStorage
            const videoUrl = sessionStorage.getItem(videoId);
            if (videoUrl) {
                // display video
                cLog('video url (from sessionStorage):' + videoUrl);
                link.data().hoverZoomSrc = [videoUrl];
                var res = [];
                res.push(link);
                callback($(res), 'IMDb');
                // Image is displayed if the cursor is still over the link
                if (link.data().hoverZoomMouseOver)
                    hoverZoom.displayPicFromElement(link);
                return;
            }

            // video url not found in storageSession => load page to extract video url
            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:href,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},

                                        function (response) {

                                            // extract playbackURLs from scripts
                                            const parser = new DOMParser();
                                            const doc = parser.parseFromString(response, "text/html");
                                            if (doc.scripts == undefined) return;
                                            let scripts = Array.from(doc.scripts);
                                            scripts = scripts.filter(script => /"playbackURLs"/.test(script.text));
                                            if (scripts.length != 1) return;
                                            let scriptText = scripts[0].text.replaceAll('\\', '');
                                            let tokenPos = scriptText.indexOf('"playbackURLs"');
                                            let openBracketPos = scriptText.indexOf('[', tokenPos);
                                            let matchingBracketPos = hoverZoom.matchBracket(scriptText, openBracketPos);
                                            if (matchingBracketPos < 0) return;
                                            let mediaText = scriptText.substring(openBracketPos, matchingBracketPos + 1);
                                            mediaText = hoverZoom.decodeUnicode(mediaText);
                                            try {
                                                let j = JSON.parse(mediaText);
                                                if (j.length == 0) return;

                                                // select MP4 with best definition
                                                // if not available then select M3U8
                                                let mp4_1080p = j.filter(u => u.videoMimeType == 'MP4' && u.videoDefinition == 'DEF_1080p')[0];
                                                let mp4_720p = j.filter(u => u.videoMimeType == 'MP4' && u.videoDefinition == 'DEF_720p')[0];
                                                let m3u8 = j.filter(u => u.videoMimeType == 'M3U8')[0];
                                                let fallback = j[0];
                                                let bestVideo = undefined;
                                                if (mp4_1080p) bestVideo = mp4_1080p.url;
                                                else if (mp4_720p) bestVideo = mp4_720p.url;
                                                else if (m3u8) bestVideo = m3u8.url;
                                                else bestVideo = fallback.url;

                                                // store url
                                                sessionStorage.setItem(videoId, bestVideo);

                                                link.data().hoverZoomSrc = [bestVideo];
                                                var res = [];
                                                res.push(link);
                                                callback($(res), 'IMDb');
                                                // Image is displayed if the cursor is still over the link
                                                if (link.data().hoverZoomMouseOver)
                                                    hoverZoom.displayPicFromElement(link);

                                            } catch {}
                                        });

        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        callback($(res), this.name);
    }
});
