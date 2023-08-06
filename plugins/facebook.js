var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Facebook',
    version:'3.1',
    favicon:'facebook.svg',
    prepareImgLinks:function (callback) {

        var pluginName = this.name;
        var res = [];

        const doc_id_CometPhotoRootQuery = 3271714669586749; // persisted query ID for CometPhotoRootQuery
        const doc_id_CometPhotoRootContentQuery = 7004935099536142; // persisted query ID for CometPhotoRootContentQuery
        const doc_id_MarketplacePDPContainerQuery = 3423773414366589; // persisted query ID for MarketplacePDPContainerQuery
        const doc_id_ProfileCometHeaderQuery = 5087453091272318; // persisted query ID for ProfileCometHeaderQuery
        const doc_id_CometVideoHomePlaylistRootQuery = 6812050608806936; // persisted query ID for CometVideoHomePlaylistRootQuery
        const doc_id_CometTahoeRootQuery = 6362686907141837; // persisted query ID for CometTahoeRootQuery
        const doc_id_FBReelsRootWithEntrypointQuery = 5939630689471693; // persisted query ID for FBReelsRootWithEntrypointQuery

        var fb_dtsg = undefined;
        var innerHTML = document.documentElement.innerHTML;
        var hookedData = sessionStorage.getItem('hookedData');

        // Hook Facebook 'Open' XMLHttpRequests to catch data & metadata associated with pictures displayed
        // These requests are issued by client side to Facebook servers in order to obtain new data when user scrolls down
        // Hooked data is stored in sessionStorage
        if ($('script.hoverZoomHook').length == 0) { // Inject hook script in document if not already there
            var hookScript = document.createElement('script');
            hookScript.type = 'text/javascript';
            hookScript.text = `if (typeof oldXHROpen !== 'function') { // Hook only once!
                oldXHROpen = window.XMLHttpRequest.prototype.open;
                window.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
                    // catch responses
                    this.addEventListener('load', function() {
                        try {
                            const data = this.responseText || "";
                            // store relevant data as plain text in sessionStorage for later usage by plug-in
                            if (data.indexOf('jpg') != -1) {
                                var HZFacebookOpenData = sessionStorage.getItem('HZFacebookOpenData') || '[]';
                                HZFacebookOpenData = JSON.parse(HZFacebookOpenData);
                                const j = JSON.parse(data);
                                HZFacebookOpenData.push(j);
                                // update sessionStorage, if no more room then reset
                                try {
                                    sessionStorage.setItem('HZFacebookOpenData', JSON.stringify(HZFacebookOpenData));
                                } catch {
                                    // reset sessionStorage
                                    HZFacebookOpenData = [];
                                    HZFacebookOpenData.push(j);
                                    sessionStorage.setItem('HZFacebookOpenData', JSON.stringify(HZFacebookOpenData));
                                }
                            }
                        } catch {}
                    });
                    // Proceed with original function
                    return oldXHROpen.apply(this, arguments);
                }
            }`;
            hookScript.classList.add('hoverZoomHook');
            (document.head || document.documentElement).appendChild(hookScript);
        }

        // search img's src id in document's scripts & hooked data
        // return img fullsize url
        function searchSrcId_scripts(srcId) {
            var fullsizeUrl = undefined;
            var cnt = 0;

            // search document's scripts
            $('script:not(.hoverZoomHook)').filter(function() { return $(this).text().indexOf(srcId) != -1 }).each(function() {
                try {
                    const j = JSON.parse($(this).text());
                    const values = hoverZoom.getValuesInJsonObject(j, srcId, false, true, false); // look for a partial match
                    if (values.length == 0) return true; // try next script
                    $(values).each(function() {
                        var gp = hoverZoom.getJsonObjectFromPath(j, this.path, 2); // get grand-parent object
                        if (gp.viewer_image) {
                            if (gp.viewer_image.uri) {
                                fullsizeUrl = gp.viewer_image.uri;
                                return false; // stop search
                            }
                        }
                    })
                    if (fullsizeUrl) return false; // stop search
                } catch {}
            });

            if (fullsizeUrl) return fullsizeUrl;

            // search hooked data
            var HZFacebookOpenData = sessionStorage.getItem('HZFacebookOpenData') || '[]';
            HZFacebookOpenData = JSON.parse(HZFacebookOpenData);
            $(HZFacebookOpenData).filter(function() { return JSON.stringify(this).indexOf(srcId) != -1 }).each(function() {
                const j = this;
                const values = hoverZoom.getValuesInJsonObject(j, srcId, false, true, false); // look for a partial match
                if (values.length == 0) return true; // try next hooked data
                $(values).each(function() {
                    var gp = hoverZoom.getJsonObjectFromPath(j, this.path, 2); // get grand-parent object
                    if (gp.viewer_image) {
                        if (gp.viewer_image.uri) {
                            fullsizeUrl = gp.viewer_image.uri;
                            return false; // stop search
                        }
                    }
                })
                if (fullsizeUrl) return false; // stop search
            });
            return fullsizeUrl;
        }

        // search username in document's scripts & hooked data
        // return user id
        function searchUsername_scripts(username) {
            var id = undefined;
            var cnt = 0;

            // search document's scripts
            $('script:not(.hoverZoomHook)').filter(function() { return $(this).text().indexOf(username) != -1 }).each(function() {
                try {
                    const j = JSON.parse($(this).text());
                    const values = hoverZoom.getValuesInJsonObject(j, username, false, true, false); // look for a partial match
                    if (values.length == 0) return true; // try next script
                    $(values).each(function() {
                        var p = hoverZoom.getJsonObjectFromPath(j, this.path, 1); // get parent object
                        if (p) {
                            if (p.node) p = p.node;
                            if (p.url && p.id) {
                                id = p.id;
                                return false; // stop search
                            }
                        }
                    })
                    if (id) return false; // stop search
                } catch {}
            });

            if (id) return id;

            // search hooked data
            var HZFacebookOpenData = sessionStorage.getItem('HZFacebookOpenData') || '[]';
            HZFacebookOpenData = JSON.parse(HZFacebookOpenData);
            $(HZFacebookOpenData).filter(function() { return JSON.stringify(this).indexOf(username) != -1 }).each(function() {
                const j = this;
                const values = hoverZoom.getValuesInJsonObject(j, username, false, true, false); // look for a partial match
                if (values.length == 0) return true; // try next hooked data
                $(values).each(function() {
                    var p = hoverZoom.getJsonObjectFromPath(j, this.path, 1); // get parent object
                    if (p) {
                        if (p.node) p = p.node;
                        if (p.url && p.id) {
                            id = p.id;
                            return false; // stop search
                        }
                    }
                })
                if (id) return false; // stop search
            });
            return id;
        }

        // March, 2021 : Facebook modified the way fb_dtsg value is encoded in document, making this method obsolete
        // get fb_dtsg from document
        // sample : {"name":"fb_dtsg","value":"AQGTALQ9UBXa:AQG-mujgyqQp"}
        function findFbDtsg_obsolete() {
            let index1 = innerHTML.indexOf('{"name":"fb_dtsg"');
            if (index1 == -1) return undefined;
            let index2 = innerHTML.indexOf('}', index1);
            let fbDtsgJson = innerHTML.substring(index1, index2 + 1);
            let fbdtsg = JSON.parse(fbDtsgJson).value;
            cLog('fb_dtsg: ', fbdtsg);
            return fbdtsg;
        };

        // get fb_dtsg from document
        // samples :
        // ["DTSGInitialData",[],{"token":"AQGNKxGZChye:AQE6nMJf1oiR"},258]
        // ["DTSGInitData",[],{"token":"AQGNKxGZChye:AQE6nMJf1oiR","async_get_token":"AQxMihxz0r8DhmCe4Ga4XeM2jBWley10P7nMQKYX8Hn1YA:AQwKhv4RPLljN0sU78j60-zxEHL02GUd8HzBYH5RMqXflg"},3515]
        function findFbDtsg() {
            let index0 = innerHTML.indexOf('["DTSGInitialData",[],{"token":');
            if (index0 == -1) index0 = innerHTML.indexOf('["DTSGInitData",[],{"token":');
            let index1 = -1;
            if (index0 != -1) index1 = innerHTML.indexOf('{"token":', index0);
            else index1 = innerHTML.indexOf('{"token":');
            if (index1 == -1) return undefined; // token not found
            let index2 = innerHTML.indexOf('}', index1);
            let fbDtsgJson = innerHTML.substring(index1, index2 + 1);
            let fbdtsg = JSON.parse(fbDtsgJson).token;
            cLog('fb_dtsg: ', fbdtsg);
            return fbdtsg;
        };

        // photo
        //  sample: https://www.facebook.com/photo/?fbid=10232656805626323&set=gm.2536792859813975&idorvanity=129417863884832&__cft__[0]=AZW59NpcQceHNN28fAlCvgiEdZohRid1FIfYGs4n3cn5fm9rqVwxGKv9rKhHjQBM093-Zi4ltmYCEv1N_WL9gKpxSqAWKkgrhw99WVjWBUZaSrgfAxq4JUNR7WFvlWp7Gry3CsZxMfQJwbZ3iQEdPq9mbNW-rXcped_WpNnzRyGL_NIfg0lD1LXtOVq3TQ-FhHM&__tn__=EH-R
        // => fbid: 10232656805626323
        //  sample: https://www.facebook.com/photo.php?fbid=288195657198081&set=p.288195657198081&type=3&__cft__[0]=AZUJZvwHuooX1XXkKTpmw1i5a425EeQcXJtCtcx1Ra3-i_A1po-ZxHKoNRgTXg__lHSMqSjASFpMXhSHCeW1oPViD1hKkTdtqsjhpvF1qEda73kd_E5nqNb2CXCthMbvbD31i6neavZUKMANvPmodIQzbyAHjK2nbVcE80axlqkrYxpURu010rT8Ek_ejqEfU3Y&__tn__=R]-R
        // => fbid: 288195657198081
        $('a[href*="/photo/?fbid="]:not(.hoverZoomMouseOverFbid), a[href*="/photo.php?fbid="]:not(.hoverZoomMouseOverFbid)').addClass('hoverZoomMouseOverFbid').one('mouseover', function () {

            var link = $(this);
            const href = link.prop('href');

            let fbid = null;
            let regexFbid = /fbid=(\d+).*/;
            let matchesFbid = href.match(regexFbid);
            if (matchesFbid) fbid = matchesFbid.length > 1 ? matchesFbid[1] : null;

            if (fbid == null) return;

            if (fb_dtsg == undefined) {
                fb_dtsg = findFbDtsg();
            }
            if (fb_dtsg == undefined) return;

            $.ajax({
                type: 'POST',
                dataType: 'text',
                url: 'https://www.facebook.com/api/graphql',
                data:'__a=1&__req=10&__comet_req=15&fb_dtsg=' + fb_dtsg + '&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometPhotoRootContentQuery&variables=%7B%22UFI2CommentsProvider_commentsKey%22%3A%22CometPhotoRootQuery%22%2C%22displayCommentsContextEnableComment%22%3Anull%2C%22displayCommentsContextIsAdPreview%22%3Anull%2C%22displayCommentsContextIsAggregatedShare%22%3Anull%2C%22displayCommentsContextIsStorySet%22%3Anull%2C%22displayCommentsFeedbackContext%22%3Anull%2C%22feedbackSource%22%3A65%2C%22feedLocation%22%3A%22COMET_MEDIA_VIEWER%22%2C%22focusCommentID%22%3Anull%2C%22isMediaset%22%3Atrue%2C%22nodeID%22%3A%22' + fbid + '%22%2C%22privacySelectorRenderLocation%22%3A%22COMET_MEDIA_VIEWER%22%2C%22renderLocation%22%3A%22permalink%22%2C%22scale%22%3A8%2C%22useDefaultActor%22%3Afalse%2C%22useHScroll%22%3Afalse%7D&server_timestamps=true&doc_id=' + doc_id_CometPhotoRootContentQuery,
                success: function(response) {
                    try {
                        const r = response.split('\r\n').filter(s => s.indexOf('currMedia') != -1)[0];
                        if (r == undefined) return;
                        const j = JSON.parse(r);
                        const uri = j["data"]["currMedia"]["image"]["uri"];
                        if (uri) {
                            link.data().hoverZoomSrc = [uri];
                            callback(link, pluginName);
                            hoverZoom.displayPicFromElement(link);
                        }
                    } catch {}
                },
                error: function(response) { cLog('error: ' + response) }
            });
        });

        // marketplace item
        // sample: https://www.facebook.com/marketplace/item/188620124163085/
        // => marketId = 188620124163085
        $('a[href*="/marketplace/item/"]:not(.hoverZoomMouseOverMarket)').addClass('hoverZoomMouseOverMarket').one('mouseover', function () {
            var link = $(this);
            const href = link.prop('href');
            let regexMarketId = /\/marketplace\/item\/(\d+).*/;
            let matchesMarketId = href.match(regexMarketId);
            let marketId = null;
            if (matchesMarketId) marketId = matchesMarketId.length > 1 ? matchesMarketId[1] : null;
            if (marketId == null) return;

            if (fb_dtsg == undefined) {
                fb_dtsg = findFbDtsg();
            }
            if (fb_dtsg == undefined) return;

            $.ajax({
                type: 'POST',
                dataType: 'text',
                url: 'https://www.facebook.com/api/graphql',
                data: 'fb_dtsg=' + fb_dtsg + '&variables={"scale":8,"targetId":' + marketId + '}&doc_id=' + doc_id_MarketplacePDPContainerQuery,
                success: function(response) {
                    try {
                        const j = JSON.parse(response);
                        const keys = hoverZoom.getKeysInJsonObject(j, 'listing_photos', false);
                        if (keys.length != 1) return;
                        const gallery = keys[0].value.map(k => [k.image.uri]);
                        link.data().hoverZoomSrc = undefined;
                        link.data().hoverZoomGallerySrc = gallery;
                        link.data().hoverZoomGalleryIndex = 0;
                        callback(link, pluginName);
                        hoverZoom.displayPicFromElement(link);
                    } catch {}
                },
                error: function(response) { cLog('error: ' + response) }
            });
        });

        // marketplace profile
        // sample: https://www.facebook.com/marketplace/profile/743742771/
        // => profileId = 743742771
        $('a[href*="/marketplace/profile/"]:not(.hoverZoomMouseOverMarket)').addClass('hoverZoomMouseOverMarket').one('mouseover', function () {
            var link = $(this);
            const href = link.prop('href');
            let regexProfileId = /\/marketplace\/profile\/(\d+).*/;
            let matchesProfileId = href.match(regexProfileId);
            let profileId = null;
            if (matchesProfileId) profileId = matchesProfileId.length > 1 ? matchesProfileId[1] : null;
            if (profileId == null) return;

            if (fb_dtsg == undefined) {
                fb_dtsg = findFbDtsg();
            }
            if (fb_dtsg == undefined) return;

            $.ajax({
                type: 'POST',
                dataType: 'text',
                url: 'https://www.facebook.com/api/graphql',
                data: '__a=1&__req=z&dpr=1&__comet_req=15&fb_dtsg=' + fb_dtsg + '&variables={"scale":8,"userID":' + profileId + '}&doc_id=' + doc_id_ProfileCometHeaderQuery,
                success: function(response) {
                    try {
                        const j = JSON.parse(response);
                        var keys = hoverZoom.getKeysInJsonObject(j, 'profilePicNormal', false);
                        if (keys.length != 1) {
                            keys = hoverZoom.getKeysInJsonObject(j, 'profilePicLarge', false);
                            if (keys.length != 1) return;
                        }
                        const gallery = keys[0].value.map(k => [k.image.uri]);
                        link.data().hoverZoomSrc = undefined;
                        link.data().hoverZoomGallerySrc = gallery;
                        link.data().hoverZoomGalleryIndex = 0;
                        callback(link, pluginName);
                        hoverZoom.displayPicFromElement(link);
                    } catch {}
                },
                error: function(response) { cLog('error: ' + response) }
            });
        });

        // marketplace thumbnail
        $('div[aria-label*=Thumbnail]').one('mouseover', function () {
            var link = $(this), data = link.data();
            if (data.hoverZoomSrc) return;
            var img = $(this).find('img[src]')[0];
            if (!img) return;
            data.hoverZoomSrc = [img.src];
            link.addClass('hoverZoomLink');
            hoverZoom.displayPicFromElement(link);
        });

        $('a[ajaxify*="src="]:not(.coverWrap):not(.hoverZoom1)').addClass('hoverZoom1').each(function () {
            var link = $(this),
                data = link.data();
            if (data.hoverZoomSrc) return;

            var key, src = link.attr('ajaxify');
            if (!options.showHighRes && src.indexOf('smallsrc=') > -1)
                key = 'smallsrc=';
            else
                key = 'src=';
            src = src.substr(src.indexOf(key) + key.length);
            src = unescape(src.substr(0, src.indexOf('&')));
            data.hoverZoomSrc = [src];
            res.push(link);
        });

        $('img[src*="safe_image.php"]:not(.hoverZoom2)').addClass('hoverZoom2').each(function () {
            let img = $(this);
            let link = img.parents('a');
            if (link[0] == undefined) link = img;

            let src = this.src;
            src = unescape(src.substr(src.lastIndexOf('&url=') + 5));
            if (src.indexOf('?') > -1) {
                src = src.substr(0, src.indexOf('?'));
            }
            if (src.indexOf('&') > -1) {
                src = src.substr(0, src.indexOf('&'));
            }
            // Picasa hosted images
            if (src.indexOf('ggpht.com') > -1 || src.indexOf('blogspot.com') > -1) {
                src = src.replace(/\/s\d+(-c)?\//, options.showHighRes ? '/s0/' : '/s800/');
            }
            // Youtube images
            if (src.indexOf('ytimg.com') > -1) {
                src = src.replace(/\/(\d|(hq)?default)\.jpg/, '/0.jpg');
            }

            if (src != this.src) {
                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(src) == -1) {
                    link.data().hoverZoomSrc.unshift(src);
                    res.push(link);
                }
            }
        });

        // external picture
        // sample: https://external-cdg4-1.xx.fbcdn.net/emg1/v/t13/17155566839907853609?url=https%3A%2F%2Fmedialb.ultimedia.com%2Fmulti%2F3vmlk%2Fqkv5vvz-H.jpg&fb_obo=1&utld=ultimedia.com&stp=c0.5000x0.5000f_dst-emg0_p428x223_q75&ccb=13-1&oh=06_AbHiyEgwgfPxOHT97ht7mHOOSqzWxEaUqnj-CVhgimFCzg&oe=64BEAC98&_nc_sid=e4a1ba
        //      => https://medialb.ultimedia.com/multi/3vmlk/qkv5vvz-H.jpg
        $('img[src*="?url=http"]:not(.hoverZoom2)').addClass('hoverZoom2').each(function () {
            let img = $(this);
            let link = img.parents('a');
            if (link[0] == undefined) link = img;

            let src = this.src;
            src = unescape(src.substr(src.lastIndexOf('?url=http') + 5));
            if (src.indexOf('?') > -1) {
                src = src.substr(0, src.indexOf('?'));
            }
            if (src.indexOf('&') > -1) {
                src = src.substr(0, src.indexOf('&'));
            }
            // Picasa hosted images
            if (src.indexOf('ggpht.com') > -1 || src.indexOf('blogspot.com') > -1) {
                src = src.replace(/\/s\d+(-c)?\//, options.showHighRes ? '/s0/' : '/s800/');
            }
            // Youtube images
            if (src.indexOf('ytimg.com') > -1) {
                src = src.replace(/\/(\d|(hq)?default)\.jpg/, '/0.jpg');
            }

            if (src != this.src) {
                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(src) == -1) {
                    link.data().hoverZoomSrc.unshift(src);
                    res.push(link);
                }
            }
        });

        // thumbnail => fullsize (<img>)
        $('a[href]:not(.hoverZoomMouseOverImg)').filter(function() { return $(this).find('img[src*=".jpg"]').length == 1 }).addClass('hoverZoomMouseOverImg').one('mouseover', function () {

            let link = $(this);
            let img = $(this).find('img[src*=".jpg"]');
            const src = img[0].src;
            // filter urls with valid srcId
            // sample: https://scontent-cdg2-1.xx.fbcdn.net/v/t45.5328-4/120042242_3034295103343234_1203962750450144345_n.jpg?_nc_cat=104&_nc_sid=c48759&_nc_ohc=cVjtHyK2ufsAX8hyhib&_nc_ht=scontent-cdg2-1.xx&oh=d3c5f012f6eaf2a597f14450dc7d4eb6&oe=5FA6DCF8
            // => srcId = 120042242_3034295103343234_1203962750450144345
            let regexSrcId = /\/(\d+_\d+_\d+)/;
            let matchesSrcId = src.match(regexSrcId);
            let srcId = null;
            if (matchesSrcId) srcId = matchesSrcId.length > 1 ? matchesSrcId[1] : null;
            if (srcId == null) return;

            const fullsizeUrl = searchSrcId_scripts(srcId);
            if (fullsizeUrl) {
                link.data().hoverZoomSrc = [fullsizeUrl];
                res.push(link);
                callback(link, pluginName);
                hoverZoom.displayPicFromElement(link);
            }
        });

        // thumbnail => fullsize (<image>)
        $('a[href]:not(.hoverZoomMouseOverImg)').filter(function() { return $(this).find('image').length == 1 }).addClass('hoverZoomMouseOverImg').one('mouseover', function () {

            let link = $(this);
            let img = $(this).find('image');
            if (!img[0].href || !img[0].href.baseVal) return;
            const src = img[0].href.baseVal;
            // filter urls with valid srcId
            // sample: https://scontent-cdg2-1.xx.fbcdn.net/v/t45.5328-4/120042242_3034295103343234_1203962750450144345_n.jpg?_nc_cat=104&_nc_sid=c48759&_nc_ohc=cVjtHyK2ufsAX8hyhib&_nc_ht=scontent-cdg2-1.xx&oh=d3c5f012f6eaf2a597f14450dc7d4eb6&oe=5FA6DCF8
            // => srcId = 120042242_3034295103343234_1203962750450144345
            let regexSrcId = /\/(\d+_\d+_\d+)/;
            let matchesSrcId = src.match(regexSrcId);
            let srcId = null;
            if (matchesSrcId) srcId = matchesSrcId.length > 1 ? matchesSrcId[1] : null;
            if (srcId == null) return;

            const fullsizeUrl = searchSrcId_scripts(srcId);
            if (fullsizeUrl) {
                link.data().hoverZoomSrc = [fullsizeUrl];
                res.push(link);
                callback(link, pluginName);
                hoverZoom.displayPicFromElement(link);
            }
        });

        // profile
        // sample: https://www.facebook.com/profile.php?id=100014884125598
        // => profileid = 100014884125598
        $('a[href*="/profile.php"]').one('mouseover', function () {

            var link = $(this);
            const href = link.prop('href');
            let regexProfileid = /\/profile.php\?id=(\d+)/;
            let matchesProfileid = href.match(regexProfileid);
            let profileid = null;
            if (matchesProfileid) profileid = matchesProfileid.length > 1 ? matchesProfileid[1] : null;

            if (profileid == null) return;

            // reuse previous result
            if (link.data().hoverZoomFacebookProfileid == profileid) {
                if (link.data().hoverZoomFacebookProfileUrl) link.data().hoverZoomSrc = [link.data().hoverZoomFacebookProfileUrl];
                return;
            }

            link.data().hoverZoomFacebookProfileId = profileid;
            link.data().hoverZoomFacebookProfileUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];

            if (fb_dtsg == undefined) {
                fb_dtsg = findFbDtsg();
            }
            if (fb_dtsg == undefined) return;

            $.ajax({
                type: 'POST',
                dataType: 'text',
                url: 'https://www.facebook.com/api/graphql',
                data: '__a=1&__req=z&dpr=1&__comet_req=15&fb_dtsg=' + fb_dtsg + '&variables={"scale":8,"userID":' + profileid + '}&doc_id=' + doc_id_ProfileCometHeaderQuery,
                success: function(response) {
                    try {
                        const r = response.split('\r\n').filter(s => s.indexOf('profilePicLarge') != -1 || s.indexOf('profilePicNormal') != -1)[0];
                        if (r == undefined) return;
                        const j = JSON.parse(r);
                        var keys = hoverZoom.getKeysInJsonObject(j, 'profilePicLarge', false);
                        if (keys.length != 1) {
                            keys = hoverZoom.getKeysInJsonObject(j, 'profilePicNormal', false);
                        }
                        if (keys.length == 1) {
                            link.data().hoverZoomSrc = [keys[0].value.uri];
                            link.data().hoverZoomFacebookProfileId = profileid;
                            link.data().hoverZoomFacebookProfileUrl = keys[0].value.uri;
                            callback(link, pluginName);
                            hoverZoom.displayPicFromElement(link);
                        }
                    } catch {}
                },
                error: function(response) { cLog('error: ' + response) }
            });
        });

        // profile
        // sample: https://www.facebook.com/sofia.urrea03
        // => username = sofia.urrea03
        // => profileid = 100005256759899
        $('a[href]').filter(function() { return ! /(\.php\?|\/watch\/|profile_id|\/photos\/|\/videos\/)/.test($(this).prop('href')) }).one('mouseover', function () {
            var link = $(this);
            const href = link.prop('href');
            let regexUsername = /facebook\.com\/([^/\?]{1,})/;
            let matchesUsername = href.match(regexUsername);
            let username = null;
            if (matchesUsername) username = matchesUsername.length > 1 ? matchesUsername[1] : null;

            if (username == null) return;

            const profileid = searchUsername_scripts(username);
            if (profileid == null) return;

            // reuse previous result
            if (link.data().hoverZoomFacebookProfileid == profileid) {
                if (link.data().hoverZoomFacebookProfileUrl) link.data().hoverZoomSrc = [link.data().hoverZoomFacebookProfileUrl];
                return;
            }

            link.data().hoverZoomFacebookProfileId = profileid;
            link.data().hoverZoomFacebookProfileUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];

            if (fb_dtsg == undefined) {
                fb_dtsg = findFbDtsg();
            }
            if (fb_dtsg == undefined) return;

            $.ajax({
                type: 'POST',
                dataType: 'text',
                url: 'https://www.facebook.com/api/graphql',
                data: '__a=1&__req=z&dpr=1&__comet_req=15&fb_dtsg=' + fb_dtsg + '&variables={"scale":8,"userID":' + profileid + '}&doc_id=' + doc_id_ProfileCometHeaderQuery,
                success: function(response) {
                    try {
                        const r = response.split('\r\n').filter(s => s.indexOf('profilePicLarge') != -1 || s.indexOf('profilePicNormal') != -1)[0];
                        if (r == undefined) return;
                        const j = JSON.parse(r);
                        var keys = hoverZoom.getKeysInJsonObject(j, 'profilePicLarge', false);
                        if (keys.length != 1) {
                            keys = hoverZoom.getKeysInJsonObject(j, 'profilePicNormal', false);
                        }
                        if (keys.length == 1) {
                            link.data().hoverZoomSrc = [keys[0].value.uri];
                            link.data().hoverZoomFacebookProfileId = profileid;
                            link.data().hoverZoomFacebookProfileUrl = keys[0].value.uri;
                            callback(link, pluginName);
                            hoverZoom.displayPicFromElement(link);
                        }
                    } catch {}
                },
                error: function(response) { cLog('error: ' + response) }
            });
        });

        // profile
        // sample: https://www.facebook.com/watch/100077099961507
        // => profileid = 100077099961507
        // sample: https://www.facebook.com/friends/suggestions/?profile_id=100009267692104
        // => profileid = 100009267692104
        $('a[href*="/watch/"], a[href*="profile_id"]').filter(function() { return $(this).prop('href').indexOf('.php?') == -1 }).one('mouseover', function () {
            var link = $(this);
            const href = link.prop('href');
            let regexProfileid = /facebook\.com\/watch\/(\d+)/;
            let matchesProfileid = href.match(regexProfileid);
            let profileid = null;
            if (matchesProfileid) profileid = matchesProfileid.length > 1 ? matchesProfileid[1] : null;
            if (profileid == null) {
                regexProfileid = /profile_id=(\d+)/;
                matchesProfileid = href.match(regexProfileid);
                if (matchesProfileid) profileid = matchesProfileid.length > 1 ? matchesProfileid[1] : null;
            }

            if (profileid == null) return;

            // reuse previous result
            if (link.data().hoverZoomFacebookProfileid == profileid) {
                if (link.data().hoverZoomFacebookProfileUrl) link.data().hoverZoomSrc = [link.data().hoverZoomFacebookProfileUrl];
                return;
            }

            link.data().hoverZoomFacebookProfileId = profileid;
            link.data().hoverZoomFacebookProfileUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];

            if (fb_dtsg == undefined) {
                fb_dtsg = findFbDtsg();
            }
            if (fb_dtsg == undefined) return;

            $.ajax({
                type: 'POST',
                dataType: 'text',
                url: 'https://www.facebook.com/api/graphql',
                data: '__a=1&__req=z&dpr=1&__comet_req=15&fb_dtsg=' + fb_dtsg + '&variables={"scale":8,"userID":' + profileid + '}&doc_id=' + doc_id_ProfileCometHeaderQuery,
                success: function(response) {
                    try {
                        const r = response.split('\r\n').filter(s => s.indexOf('profilePicLarge') != -1 || s.indexOf('profilePicNormal') != -1)[0];
                        if (r == undefined) return;
                        const j = JSON.parse(r);
                        var keys = hoverZoom.getKeysInJsonObject(j, 'profilePicLarge', false);
                        if (keys.length != 1) {
                            keys = hoverZoom.getKeysInJsonObject(j, 'profilePicNormal', false);
                        }
                        if (keys.length == 1) {
                            link.data().hoverZoomSrc = [keys[0].value.uri];
                            link.data().hoverZoomFacebookProfileId = profileid;
                            link.data().hoverZoomFacebookProfileUrl = keys[0].value.uri;
                            callback(link, pluginName);
                            hoverZoom.displayPicFromElement(link);
                        }
                    } catch {}
                },
                error: function(response) { cLog('error: ' + response) }
            });
        });

        // profile
        // sample: https://www.facebook.com/watch/expertarchaeologist/
        $('a[href*="/watch/"]:not(.hoverZoomMouseOverProfile4)').filter(function() { return $(this).prop('href').indexOf('.php?') == -1 }).addClass('hoverZoomMouseOverProfile4').one('mouseover', function () {

            var link = $(this);
            const href = link.prop('href');
            let regexUsername = /facebook\.com\/watch\/([^/\?]{1,})/;
            let matchesUsername = href.match(regexUsername);
            let username = null;
            if (matchesUsername) username = matchesUsername.length > 1 ? matchesUsername[1] : null;

            if (username == null) return;

            const profileid = searchUsername_scripts(username);
            if (profileid == null) return;

            if (fb_dtsg == undefined) {
                fb_dtsg = findFbDtsg();
            }
            if (fb_dtsg == undefined) return;

            $.ajax({
                type: 'POST',
                dataType: 'text',
                url: 'https://www.facebook.com/api/graphql',
                data: '__a=1&__req=1c&dpr=1&__comet_req=15&fb_dtsg=' + fb_dtsg + '&variables={"scale":8,"trigger_data"={"id":"' + profileid + '"}}&doc_id=' + doc_id_CometVideoHomePlaylistRootQuery,
                success: function(response) {
                    try {
                        const r = response.split('\r\n').filter(s => s.indexOf('profilePicLarge') != -1 || s.indexOf('profilePicNormal') != -1)[0];
                        if (r == undefined) return;
                        const j = JSON.parse(r);
                        var keys = hoverZoom.getKeysInJsonObject(j, 'profilePicLarge', false);
                        if (keys.length != 1) {
                            keys = hoverZoom.getKeysInJsonObject(j, 'profilePicNormal', false);
                        }
                        if (keys.length == 1) {
                            link.data().hoverZoomSrc = [keys[0].value.uri];
                            callback(link, pluginName);
                            hoverZoom.displayPicFromElement(link);
                        }
                    } catch {}
                },
                error: function(response) { cLog('error: ' + response) }
            });
        });

        // video
        // sample: https://www.facebook.com/upsocllekiwi/videos/196595949967848/
        // => videoId = 196595949967848
        // sample: https://www.facebook.com/watch/?v=168809246022573
        // => videoId = 168809246022573
        // sample: https://www.facebook.com/watch/?ref=search&v=964373281036797
        // => videoId = 964373281036797
        $('a[href*="/videos/"], a[href*="/watch/?"]').filter(function() { return $(this).prop('href').indexOf('.php?') == -1 }).one('mouseover', function () {

            var link = $(this);
            let videoId = null;
            const href = link.prop('href');
            let regexVideoId = /facebook\.com\/.*\/videos\/(\d+)/;
            let matchesVideoId = href.match(regexVideoId);
            if (matchesVideoId) videoId = matchesVideoId.length > 1 ? matchesVideoId[1] : null;
            if (videoId == null) {
                regexVideoId = /facebook\.com\/watch\/\?.*v=(\d+)/;
                matchesVideoId = href.match(regexVideoId);
                if (matchesVideoId) videoId = matchesVideoId.length > 1 ? matchesVideoId[1] : null;
            }

            if (videoId == null) return;

            // reuse previous result
            if (link.data().hoverZoomFacebookVideoId == videoId) {
                if (link.data().hoverZoomFacebookVideoUrl) link.data().hoverZoomSrc = [link.data().hoverZoomFacebookVideoUrl];
                return;
            }

            link.data().hoverZoomFacebookVideoId = videoId;
            link.data().hoverZoomFacebookVideoUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];

            if (fb_dtsg == undefined) {
                fb_dtsg = findFbDtsg();
            }
            if (fb_dtsg == undefined) return;

            $.ajax({
                type: 'POST',
                dataType: 'text',
                url: 'https://www.facebook.com/api/graphql',
                data: '__a=1&__req=t&__comet_req=15&fb_dtsg=' + fb_dtsg + '&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometTahoeRootQuery&variables=%7B%22UFI2CommentsProvider_commentsKey%22%3A%22CometTahoeSidePaneQuery%22%2C%22caller%22%3A%22channel_view_from_page_timeline%22%2C%22chainingCursor%22%3Anull%2C%22chainingSeedVideoId%22%3Anull%2C%22channelEntryPoint%22%3A%22VIDEOS_TAB%22%2C%22displayCommentsContextEnableComment%22%3Anull%2C%22displayCommentsContextIsAdPreview%22%3Anull%2C%22displayCommentsContextIsAggregatedShare%22%3Anull%2C%22displayCommentsContextIsStorySet%22%3Anull%2C%22displayCommentsFeedbackContext%22%3Anull%2C%22feedbackSource%22%3A41%2C%22feedLocation%22%3A%22TAHOE%22%2C%22focusCommentID%22%3Anull%2C%22isCrawler%22%3Afalse%2C%22privacySelectorRenderLocation%22%3A%22COMET_STREAM%22%2C%22renderLocation%22%3A%22video_channel%22%2C%22scale%22%3A8%2C%22streamChainingSection%22%3Afalse%2C%22useDefaultActor%22%3Afalse%2C%22videoChainingContext%22%3Anull%2C%22videoID%22%3A%22' + videoId + '%22%7D&server_timestamps=true&doc_id=' + doc_id_CometTahoeRootQuery,
                success: function(response) {
                    try {
                        const r = response.split('\r\n').filter(s => s.indexOf('playable_url_quality_hd') != -1 || s.indexOf('playable_url') != -1)[0];
                        if (r == undefined) return;
                        const j = JSON.parse(r);
                        var keys = hoverZoom.getKeysInJsonObject(j, 'playable_url_quality_hd', false);
                        if (keys.length != 1 || keys[0].value == null) {
                            keys = hoverZoom.getKeysInJsonObject(j, 'playable_url', false);
                        }
                        if (keys.length == 1) {
                            link.data().hoverZoomSrc = [keys[0].value];
                            link.data().hoverZoomFacebookVideoId = videoId;
                            link.data().hoverZoomFacebookVideoUrl = keys[0].value;
                            callback(link, pluginName);
                            hoverZoom.displayPicFromElement(link);
                        }
                    } catch {}
                },
                error: function(response) { cLog('error: ' + response) }
            });
        });

        // reels
        // samples source: https://www.facebook.com/groups/646032424205352/media/videos
        // sample: https://www.facebook.com/reel/948338253095761/
        $('a[href*="/reel/"]').filter(function() { return $(this).prop('href').indexOf('.php?') == -1 }).one('mouseover', function () {

            var link = $(this);
            let reelId = null;
            const href = link.prop('href');
            let regexReelId = /facebook\.com\/reel\/(\d+)/;
            let matchesReelId = href.match(regexReelId);
            if (matchesReelId) reelId = matchesReelId.length > 1 ? matchesReelId[1] : null;

            if (reelId == null) return;

            // reuse previous result
            if (link.data().hoverZoomFacebookReelId == reelId) {
                if (link.data().hoverZoomFacebookReelUrl) link.data().hoverZoomSrc = [link.data().hoverZoomFacebookReelUrl];
                return;
            }

            link.data().hoverZoomFacebookReelId = reelId;
            link.data().hoverZoomFacebookReelUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];

            if (fb_dtsg == undefined) {
                fb_dtsg = findFbDtsg();
            }
            if (fb_dtsg == undefined) return;

            $.ajax({
                type: 'POST',
                dataType: 'text',
                url: 'https://www.facebook.com/api/graphql',
                data: '__a=1&__req=2c&__comet_req=15&fb_dtsg=' + fb_dtsg + '&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FBReelsRootWithEntrypointQuery&variables=%7B%22UFI2CommentsProvider_commentsKey%22%3A%22FBReelsRootWithEntrypointQuery%22%2C%22count%22%3A1%2C%22displayCommentsContextEnableComment%22%3Afalse%2C%22displayCommentsContextIsAdPreview%22%3Afalse%2C%22displayCommentsContextIsAggregatedShare%22%3Afalse%2C%22displayCommentsContextIsStorySet%22%3Afalse%2C%22displayCommentsFeedbackContext%22%3Anull%2C%22feedbackSource%22%3A65%2C%22feedLocation%22%3A%22COMET_MEDIA_VIEWER%22%2C%22focusCommentID%22%3Anull%2C%22group_id_list%22%3A%5B%5D%2C%22initial_node_id%22%3A%22' + reelId + '%22%2C%22isAggregationProfileViewerOrShouldShowReelsForPage%22%3Afalse%2C%22page_id%22%3A%22%22%2C%22recent_vpvs_v2%22%3A%5B%5D%2C%22renderLocation%22%3A%22fb_shorts_video_deep_dive%22%2C%22root_video_tracking_key%22%3A%22%22%2C%22scale%22%3A8%2C%22shouldIncludeInitialNodeFetch%22%3Atrue%2C%22shouldShowReelsForPage%22%3Afalse%2C%22surface_type%22%3A%22FEED_VIDEO_DEEP_DIVE%22%7D&server_timestamps=true&doc_id=' + doc_id_FBReelsRootWithEntrypointQuery,
                success: function(response) {
                    try {
                        const r = response.split('\r\n').filter(s => s.indexOf('browser_native_hd_url') != -1 || s.indexOf('browser_native_sd_url') != -1)[0];
                        if (r == undefined) return;
                        const j = JSON.parse(r);
                        var keys = hoverZoom.getKeysInJsonObject(j, 'browser_native_hd_url', false);
                        if (keys.length == 0 || keys[0].value == null) {
                            keys = hoverZoom.getKeysInJsonObject(j, 'browser_native_sd_url', false);
                        }
                        if (keys.length) {
                            link.data().hoverZoomSrc = [keys[0].value];
                            link.data().hoverZoomFacebookReelId = reelId;
                            link.data().hoverZoomFacebookReelUrl = keys[0].value;
                            callback(link, pluginName);
                            hoverZoom.displayPicFromElement(link);
                        }
                    } catch {}
                },
                error: function(response) { cLog('error: ' + response) }
            });
        });

        // TO BE DONE
        // stories
        // live (require MPD handling)

        callback($(res), pluginName);
    }
});
