var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'tiktok',
    version: '1.1',
    prepareImgLinks: function(callback) {
        var name = this.name;

        const token1 = 'SIGI_STATE';
        const token2 = 'SIGI_RETRY';

        // Hook TikTok 'Send' XMLHttpRequests to catch data & metadata associated with videos
        // Catched data is stored in sessionStorage for later use by plug-in
        // Warning: origXHRSend must be added to window.XMLHttpRequest.prototype, direct calls to origXHRSend prevent comments & likes
        if ($('script.HZTikTokSend').length == 0) { // Inject hook script in document if not already there
            var sendScript = document.createElement('script');
            sendScript.type = 'text/javascript';
            sendScript.text = `if (typeof window.XMLHttpRequest.prototype.origXHRSend !== 'function') { // Hook only once!
                window.XMLHttpRequest.prototype.origXHRSend = window.XMLHttpRequest.prototype.send;
                window.XMLHttpRequest.prototype.send = function(data) {
                    // store relevant data as plain text in sessionStorage for later usage by plug-in
                    if (data && data.indexOf('author_id') != -1 && data.indexOf('group_id') != -1) {
                        let storedData = sessionStorage.getItem('HZTikTokSendData');
                        if (storedData == undefined) sessionStorage.setItem('HZTikTokSendData', data);
                        else {
                            // check that the 5Mo limit for session storage is respected
                            if (storedData.length + data.length < 5000000)
                                sessionStorage.setItem('HZTikTokSendData', storedData + data); // concatenate with previous data
                            else
                                sessionStorage.setItem('HZTikTokSendData', storedData.substr(1000000) + data); // make some room by removing oldest data then concatenate
                        }
                    }
                    // proceed with original send function
                    this.origXHRSend(data);
                }
            }`;
            sendScript.classList.add('HZTikTokSend');
            (document.head || document.documentElement).appendChild(sendScript);
        }

        // Profile img
        $('div[class*="DivContainer"').on('mouseover', function() {
            const userId = $(this).siblings('[class*="DivShareTitleContainer"]').find('[class*="ShareTitle"]').text().trim();
            if (!userId) return;

            const userUrl = "https://www.tiktok.com/@" + userId;

            // resuse previous result
            const link = $(this);
            if (link.data().hoverZoomTikTokUserId == userId) {
                if (link.data().hoverZoomTikTokAvatarUrl) link.data().hoverZoomSrc = [link.data().hoverZoomTikTokAvatarUrl];
                return;
            }

            link.data().hoverZoomTikTokUserId = userId;
            link.data().hoverZoomTikTokAvatarUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];
            getUserPictureFromPage(userUrl, userId, link);
        })

        // load user page then extract user picture url
        // proceed with API call from background page
        function getUserPictureFromPage(userUrl, userId, link) {
            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:userUrl,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},
                                        function (response) {
                                            if (response == null) { return; }

                                            // extract JSON data
                                            const index1 = response.indexOf(token1);
                                            if (index1 == -1) { return; }
                                            const index2 = response.indexOf(token2, index1);
                                            if (index2 == -1) { return; }
                                            const index3 = response.indexOf('{', index1);
                                            const index4 = response.lastIndexOf('}', index2);
                                            const jsonData = response.substring(index3, index4 + 1);
                                            try {
                                                const j = JSON.parse(jsonData);
                                                const avatarUrl = j["UserModule"]["users"][userId]["avatarLarger"];

                                                if (avatarUrl) {
                                                    link.data().hoverZoomTikTokAvatarUrl = avatarUrl;
                                                    link.data().hoverZoomSrc = [avatarUrl];
                                                    callback(link, name);
                                                    hoverZoom.displayPicFromElement(link);
                                                }
                                            } catch {}
                                        });
        }

        // "Related videos"
        $('div[class*="DivItemContainer"').on('mouseover', function() {
            const img = $(this).find('img')[0];
            if (!img) return;
            const imgSrc = img.src;
            const author = $(this).find('div[class*="DivAuthor"]')[0];
            if (!author) return;
            let userId = $(author).text();
            userId = userId.split(' ')[0].trim();
            const rank = Array.from(this.parentElement.children).indexOf(this) + 1;

            // reuse previous result
            const link = $(this);
            if (link.data().hoverZoomTikTokUserId == userId) {
                if (link.data().hoverZoomTikTokVideoUrl) link.data().hoverZoomSrc = [link.data().hoverZoomTikTokVideoUrl];
                return;
            }

            link.data().hoverZoomTikTokUserId = userId;
            link.data().hoverZoomTikTokVideoUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];

            // lookup user in stored data in sessionStorage
            findUser(userId, rank, imgSrc, link);
        })

        function findUser(userId, rank, imgSrc, link) {
            const storedData = sessionStorage.getItem('HZTikTokSendData');
            let index = storedData?.indexOf(userId);
            if (!index || index == -1) {
                // load user page
                const userUrl = 'https://www.tiktok.com/@' + userId;
                getVideoFromPage(userUrl, imgSrc, link);
            } else {
                let group_id = undefined;
                index = 0;
                while (index != -1 && !group_id) {
                    index = storedData.indexOf(userId, index);
                    if (index != -1) {
                        const index1 = storedData.lastIndexOf('{', index);
                        const index2 = storedData.indexOf('}', index);
                        let data = storedData.substring(index1, index2 + 1);
                        try {
                            // sample: "author_id":"aymen3162","group_id":"7101012987296746757","rank":7,
                            data = data.replaceAll('\\"', '"');
                            let j = JSON.parse(data);
                            if (j.rank == rank) group_id = j.group_id;
                        } catch {}
                        index = index + 1;
                    }
                }

                if (group_id) {
                    chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:'https://www.tiktok.com/api/item/detail/?itemId=' + group_id,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},
                                        function (response) {
                                            getVideo(group_id, undefined, response, link);
                                        })
                }
            }
        }

        // load video page then extract video url
        // proceed with API call from background page
        function getVideoFromPage(userUrl, imgSrc, link) {
            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:userUrl,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},
                                        function (response) {
                                            if (response == null) { return; }

                                            // extract JSON data
                                            const index1 = response.indexOf(token1);
                                            if (index1 == -1) { return; }
                                            const index2 = response.indexOf(token2, index1);
                                            if (index2 == -1) { return; }
                                            const index3 = response.indexOf('{', index1);
                                            const index4 = response.lastIndexOf('}', index2);
                                            const jsonData = response.substring(index3, index4 + 1);
                                            getVideo(undefined, imgSrc, jsonData, link);
                                        });
        }

        function getVideo(videoId, imgSrc, jsonData, link) {
            try {
                const jsonObj = JSON.parse(jsonData);
                if (videoId == undefined) {
                    // search img src to find associated video id
                    const values = hoverZoom.getValuesInJsonObject(jsonObj["ItemModule"], imgSrc, false, false, true); // look for a full match & stop after 1st match
                    if (values.length == 0) {
                        return;
                    }
                    // extract videoId from path
                    videoId = values[0].path.replace(/.*"(\d+)".*/, '$1');
                }

                let audioUrl = jsonObj["itemInfo"] ? jsonObj["itemInfo"]["itemStruct"]["music"]["playUrl"] : jsonObj["ItemModule"][videoId]["music"]["playUrl"];
                if (audioUrl) audioUrl += '.audiomuted'; // there is already a soundtrack in video, this one is only for download
                const videoUrlPlay = jsonObj["itemInfo"] ? jsonObj["itemInfo"]["itemStruct"]["video"]["playAddr"] : jsonObj["ItemModule"][videoId]["video"]["playAddr"];
                const videoUrlDownload = jsonObj["itemInfo"] ? jsonObj["itemInfo"]["itemStruct"]["video"]["downloadAddr"] : jsonObj["ItemModule"][videoId]["video"]["downloadAddr"];
                let videoUrl = (videoUrlDownload ? videoUrlDownload : videoUrlPlay);
                if (videoUrl) videoUrl += '.video';
                if (videoUrl) {
                    const urlVideoAudio = (audioUrl ? videoUrl + "_" + audioUrl : videoUrl);
                    link.data().hoverZoomTikTokVideoUrl = urlVideoAudio;
                    link.data().hoverZoomSrc = [urlVideoAudio];
                    callback(link, name);
                    hoverZoom.displayPicFromElement(link);
                }
            } catch {}
        }
    }
});
