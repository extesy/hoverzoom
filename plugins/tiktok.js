var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'tiktok',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var name = this.name;

        const token1 = 'SIGI_STATE';
        const token2 = 'SIGI_RETRY';

        // Hook Quora 'Send' XMLHttpRequests to catch data & metadata associated with videos
        // Catched data is stored in sessionStorage for later use by plug-in
        if ($('script.HZTikTokSend').length == 0) { // Inject hook script in document if not already there
            var sendScript = document.createElement('script');
            sendScript.type = 'text/javascript';
            sendScript.text = `if (typeof origXHRSend !== 'function') { // Hook only once!
                origXHRSend = window.XMLHttpRequest.prototype.send;
                window.XMLHttpRequest.prototype.send = function(data) {
                    // store relevant data as plain text in sessionStorage for later usage by plug-in
                    if (data.indexOf('author_id') != -1 && data.indexOf('group_id') != -1) {
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
                    return origXHRSend.apply(this, arguments);
                }
            }`;
            sendScript.classList.add('HZTikTokSend');
            (document.head || document.documentElement).appendChild(sendScript);
        }

        $('div[class*="DivItemContainer"').on('mouseover', function() {

            let img = $(this).find('img')[0];
            if (!img) return;
            var imgSrc = img.src;

            let author = $(this).find('div[class*="DivAuthor"]')[0];
            if (!author) return;
            let userName = $(author).text();
            userName = userName.split(' ')[0].trim();

            // resuse previous result
            var link= $(this);
            if (link.data().hoverZoomTikTokUserName == userName) {
                if (link.data().hoverZoomTikTokVideoUrl) link.data().hoverZoomSrc = [link.data().hoverZoomTikTokVideoUrl];
                return;
            }

            link.data().hoverZoomTikTokUserName = userName;
            link.data().hoverZoomTikTokVideoUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];

            // lookup user in stored data in sessionStorage
            findUser(userName, imgSrc, link);
        })

        function findUser(userName, imgSrc, link) {
            let storedData = sessionStorage.getItem('HZTikTokSendData');
            let index = storedData?.indexOf(userName);
            if (!index || index == -1) {
                // load user page
                let userUrl = 'https://www.tiktok.com/@' + userName;
                getVideoFromPage(userUrl, imgSrc, link);
            } else {
                let index1 = storedData.lastIndexOf('{', index);
                let index2 = storedData.indexOf('}', index);
                let data = storedData.substring(index1, index2 + 1);
                try {
                    // sample: \"author_id\":\"aymen3162\",\"group_id\":\"7101012987296746757\"
                    data = data.replaceAll('\\"', '"');
                    let j = JSON.parse(data);
                    let group_id = j.group_id; // group_id can be used as videoId for API call
                    chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:'https://www.tiktok.com/api/item/detail/?itemId=' + group_id,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},
                                        function (response) {
                                            getVideo(group_id, undefined, response, link);
                                        })
                } catch {
                    // load user page
                    let userUrl = 'https://www.tiktok.com/@' + userName;
                    getVideoFromPage(userUrl, imgSrc, link);
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
                                            let index1 = response.indexOf(token1);
                                            if (index1 == -1) { return; }
                                            let index2 = response.indexOf(token2, index1);
                                            if (index2 == -1) { return; }
                                            let index3 = response.indexOf('{', index1);
                                            let index4 = response.lastIndexOf('}', index2);
                                            let jsonData = response.substring(index3, index4 + 1);

                                            getVideo(undefined, imgSrc, jsonData, link);
                                        });
        }

        function getVideo(videoId, imgSrc, jsonData, link) {
            try {
                let jsonObj = JSON.parse(jsonData);
                if (videoId == undefined) {
                    // search img src to find associated video id
                    let values = hoverZoom.getValuesInJsonObject(jsonObj["ItemModule"], imgSrc, false, false, true); // look for a full match & stop after 1st match
                    if (values.length == 0) {
                        return;
                    }
                    // extract videoId from path
                    videoId = values[0].path.replace(/.*"(\d+)".*/, '$1');
                }

                let audioUrl = jsonObj["itemInfo"] ? jsonObj["itemInfo"]["itemStruct"]["music"]["playUrl"] : jsonObj["ItemModule"][videoId]["music"]["playUrl"];
                if (audioUrl) audioUrl += '.audiomuted'; // there is already a soundtrack in video, this one is only for download
                let videoUrlPlay = jsonObj["itemInfo"] ? jsonObj["itemInfo"]["itemStruct"]["video"]["playAddr"] : jsonObj["ItemModule"][videoId]["video"]["playAddr"];
                let videoUrlDownload = jsonObj["itemInfo"] ? jsonObj["itemInfo"]["itemStruct"]["video"]["downloadAddr"] : jsonObj["ItemModule"][videoId]["video"]["downloadAddr"];
                let videoUrl = (videoUrlDownload ? videoUrlDownload : videoUrlPlay);
                if (videoUrl) videoUrl += '.video';
                if (videoUrl) {
                    let urlVideoAudio;
                    urlVideoAudio = (audioUrl ? videoUrl + "_" + audioUrl : videoUrl);
                    link.data().hoverZoomTikTokVideoUrl = urlVideoAudio;
                    link.data().hoverZoomSrc = [urlVideoAudio];
                    callback(link, name);
                    hoverZoom.displayPicFromElement(link);
                }
            } catch {}
        }
    }
});
