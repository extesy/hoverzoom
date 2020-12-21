var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Facebook',
    version:'2.1',
    prepareImgLinks:function (callback) {

        var name = this.name;
        var res = [];

        var doc_id_CometPhotoRootQuery = 3271714669586749; // persisted query ID for CometPhotoRootQuery
        var doc_id_MarketplacePDPContainerQuery = 3423773414366589; // persisted query ID for MarketplacePDPContainerQuery
        var doc_id_ProfileCometHeaderQuery = 5087453091272318; // persisted query ID for ProfileCometHeaderQuery

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
                            if (this.responseText.length > 5000000) return; // response too large for session storage
                            let urlToken = '"image":{"';
                            if (this.responseText.indexOf(urlToken) == -1) return; // no relevant data in response
                            //console.log('hooked response: ' + this.responseText);
                            // store response as plain text in a sessionStorage for later usage by plug-in
                            let storedHookedData = sessionStorage.getItem('hookedData');
                            if (storedHookedData == undefined) sessionStorage.setItem('hookedData', this.responseText);
                            else {
                                // check that the 5Mo limit for session storage is respected
                                if (storedHookedData.length + this.responseText.length < 5000000)
                                    sessionStorage.setItem('hookedData', storedHookedData + this.responseText);
                                else
                                    sessionStorage.setItem('hookedData', this.responseText);
                            }
                            // Add & remove empty <a> element to/from DOM to trigger HoverZoom,
                            // so data & metadata just added to DOM in <script> element can be used
                            let fakeA = document.createElement('a');
                            (document.head || document.documentElement).appendChild(fakeA);
                            (document.head || document.documentElement).removeChild(fakeA);
                        } catch {}
                    });
                    // Proceed with original function
                    return oldXHROpen.apply(this, arguments);
                }
            }`;
            hookScript.classList.add('hoverZoomHook');
            (document.head || document.documentElement).appendChild(hookScript);
        }

        // search img's url in document & extract associated id
        function searchUrlId_InnerHTML(url) {
            cLog('searchInnerHTML url: ' + url);
            return searchUrlId(url, innerHTML);
        }

        // search img's url in hooked data (= intercepted responses to XMLHttpRequests 'Open' issued by client side) & extract associated id
        function searchUrlId_HookedData(url) {
            cLog('searchHookedData url: ' + url);
            return searchUrlId(url, hookedData);
        }

        // extract url id from data
        // sample: {"__typename":"Photo","image":{"uri":"https:\/\/scontent-cdt1-1.xx.fbcdn.net\/v\/t1.0-0\/cp0\/s118x90\/117971385_2642769225942936_8303353288818370739_n.jpg?_nc_cat=105&_nc_sid=8bfeb9&_nc_ohc=MHm8NkeU-r4AX_XD3ba&_nc_ht=scontent-cdt1-1.xx&_nc_tp=28&oh=9485c822b02ae29ec0374f0c89fda5ae&oe=5F9CB191"},"__isNode":"Photo","id":"2642769222609603"}
        //      => id = 2642769222609603
        function searchUrlId(url, data) {

            let urlId = undefined;
            if (data == undefined) return urlId;

            let urlToken = '"__typename":"Photo","image":{"uri":"';
            let urlIndex = data.indexOf(urlToken + url);
            if (urlIndex == -1) urlIndex = data.indexOf(urlToken + url.replace(/\//g, '\\/'));
            if (urlIndex == -1) return searchUrlTargetId(url, data);
            let idToken = '"id":"';
            let idIndex1 = data.indexOf(idToken, urlIndex);
            if (idIndex1 == -1) return searchUrlTargetId(url, data);
            let idIndex2 = data.indexOf('"', idIndex1 + idToken.length);
            if (idIndex2 == -1) return searchUrlTargetId(url, data);
            urlId = data.substring(idIndex1 + idToken.length, idIndex2);
            cLog('urlId: ' + urlId);
            if (parseInt(urlId) != urlId) return searchUrlTargetId(url, data);
            return urlId;
        }

        // extract url target id from data
        // sample: "{\\\"target_id\\\":3683791601654401,\\\"target_type\\\":0,\\\"primary_position\\\":17,\\\"ranking_signature\\\":5867348698442235904,\\\"commerce_channel\\\":504,\\\"value\\\":2.6756533516685e-6,\\\"upsell_type\\\":null}\"}","listing":{"__typename":"Vehicle","id":"3683791601654401","primary_listing_photo":{"__typename":"ProductImage","image":{"uri":"https:\/\/scontent-cdg2-1.xx.fbcdn.net\/v\/t45.5328-4\/c43.0.260.260a\/p261x260\/121092218_3901902919823176_3508024599515575974_n.jpg?_nc_cat=102&_nc_sid=c48759&_nc_ohc=midPWkcn5WEAX-lU7ie&_nc_ht=scontent-cdg2-1.xx&_nc_tp=27&oh=9fbfd786f597c8e36042cb936ec3ecf1&oe=5FACB323"},"id":"3901902913156510"}
        //      => id = 3683791601654401
        function searchUrlTargetId(url, data) {

            let urlTargetId = undefined;
            if (data == undefined) return urlTargetId;

            let urlToken = '"__typename":"ProductImage","image":{"uri":"';
            let urlIndex = data.indexOf(urlToken + url);
            if (urlIndex == -1) urlIndex = data.indexOf(urlToken + url.replace(/\//g, '\\/'));
            if (urlIndex == -1) return undefined;
            let targetIdToken = 'target_id';
            let targetIdIndex0 = data.lastIndexOf(targetIdToken, urlIndex);
            if (targetIdIndex0 == -1) return undefined;
            let targetIdIndex1 = data.indexOf(':', targetIdIndex0);
            if (targetIdIndex1 == -1) return undefined;
            let targetIdIndex2 = data.indexOf(',', targetIdIndex0);
            if (targetIdIndex2 == -1) return searchUrlTargetId(url, data);;
            urlTargetId = data.substring(targetIdIndex1 + 1, targetIdIndex2);
            cLog('urlTargetId: ' + urlTargetId);
            if (parseInt(urlTargetId) != urlTargetId) return undefined;
            return urlTargetId;
        }

        // get fb_dtsg from document
        // sample : {"name":"fb_dtsg","value":"AQGTALQ9UBXa:AQG-mujgyqQp"}
        function findFbDtsg() {

            let index1 = innerHTML.indexOf('{"name":"fb_dtsg"');
            if (index1 == -1) return undefined;
            let index2 = innerHTML.indexOf('}', index1);
            let fbDtsgJson = innerHTML.substring(index1, index2 + 1);
            let fbdtsg = JSON.parse(fbDtsgJson).value;
            cLog('fb_dtsg: ', fbdtsg);
            return fbdtsg;
        };

        // async load img
        function loadImg(requestUrl, link, id) {
            cLog('loadImg');
            var currentLink = link;
            var currentId = id;
            chrome.runtime.sendMessage({action:'ajaxGet', url:requestUrl, response:'URL'}, function (response) {

                if (response == null) { return; }

                let uri = response.replace(/\\/g, '');
                let data = currentLink.data();

                if (data.hoverZoomSrc == undefined) {
                    data.hoverZoomSrc = [];
                }
                data.hoverZoomSrc.unshift(uri);
                cLog('Facebook photo fullsizeUrl (from img load): ' + uri);
                // store uri
                sessionStorage.setItem(currentId, uri);
                callback(currentLink, name);
            });
        }

        // this method does not work with FB new design
        /*function loadPage(link, id) {
            hoverZoom.prepareFromDocument(link, link[0].href, function(doc) {
            });
        }*/

        // generate a graphQL request to load detail page containing image whose id is in argument
        // 2 requests can be generated:
        // - CometPhotoRootQuery (most common)
        // - MarketplacePDPContainerQuery (for some MarketPlace images)
        function loadPage(link, id) {
            cLog('loadPage');

            if (fb_dtsg == undefined) {
                fb_dtsg = findFbDtsg();
            }

            if (fb_dtsg == undefined) return;

            performCometPhotoRootQuery(link, id);
        }

        // perform a CometPhotoRoot graphQL query
        function performCometPhotoRootQuery(link, id) {
            cLog('performCometPhotoRootQuery');
            let nodeID = id;

            $.ajax({
                type: 'POST',
                dataType: 'text',
                url: 'https://www.facebook.com/api/graphql',
                data: 'fb_dtsg=' + fb_dtsg + '&variables={"nodeID":' + nodeID + '}&doc_id=' + doc_id_CometPhotoRootQuery,
                success: function(response) { if (extractFullsizeUrl(link, id, response) == false) performMarketplacePDPContainerQuery(link, id) },
                error: function(response) { cLog('error: ' + response) }
            });
        }

        // perform a MarketplacePDPContainer graphQL query
        function performMarketplacePDPContainerQuery(link, id) {
            cLog('performMarketplacePDPContainerQuery');
            let targetId = id;

            $.ajax({
                type: 'POST',
                dataType: 'text',
                url: 'https://www.facebook.com/api/graphql',
                data: 'fb_dtsg=' + fb_dtsg + '&variables={"targetId":' + targetId + '}&doc_id=' + doc_id_MarketplacePDPContainerQuery,
                success: function(response) { extractFullsizeUrl(link, id, response) },
                error: function(response) { cLog('error: ' + response) }
            });
        }

        // generate a graphQL request to load detail page containing profile whose id is in argument
        function loadPageProfile(link, id) {
            cLog('loadPageProfile');

            if (fb_dtsg == undefined) {
                fb_dtsg = findFbDtsg();
            }

            if (fb_dtsg == undefined) return;

            performProfileCometHeaderQuery(link, id);
        }

        // perform a ProfileCometHeader graphQL query
        function performProfileCometHeaderQuery(link, id) {
            cLog('performProfileCometHeaderQuery');
            let userID = id;

            $.ajax({
                type: 'POST',
                dataType: 'text',
                url: 'https://www.facebook.com/api/graphql',
                data: 'fb_dtsg=' + fb_dtsg + '&variables={"userID":' + userID + '}&doc_id=' + doc_id_ProfileCometHeaderQuery,
                success: function (response) { extractProfilePhoto(link, id, response) },
                error: function (response) { cLog('error: ' + response) }
            });
        }

        // parse response looking for uri = fullsize url
        // sample : "profilePhoto":{"url":"https:\/\/www.facebook.com\/photo.php?fbid=954656828396610&set=a.121176195078015&type=3"
        function extractProfilePhoto(link, id, data) {

            let url = null;
            if (data == undefined) return;

            let urlToken = '"profilePhoto":{"url":"';
            let urlIndex = data.indexOf(urlToken);
            if (urlIndex == -1) return;
            urlIndex += urlToken.length;
            let index2 = data.indexOf('"', urlIndex + 1);
            url = data.substring(urlIndex, index2 + 1);

            let regexFbid = /fbid=(\d+).*/;
            let matchesFbid = url.match(regexFbid);
            let fbid = null;
            if (matchesFbid) fbid = matchesFbid.length > 1 ? matchesFbid[1] : null;

            let storedUrl = null;
            // check sessionStorage in case fullsize url was already found
            if (fbid) {
                storedUrl = sessionStorage.getItem(fbid);
                if (storedUrl == null) {
                    loadPage(link, fbid);
                } else {
                    let data = link.data();
                    if (data.hoverZoomSrc == undefined) {
                        data.hoverZoomSrc = [];
                    }
                    data.hoverZoomSrc.unshift(storedUrl);
                    res.push(link);
                    cLog('Facebook photo fullsizeUrl (from sessionStorage): ' + storedUrl);
                    callback(link, name);
                }
            }
        }

        // parse response looking for uri = fullsize url
        // sample : "image":{"uri":"https:\/\/scontent-cdg2-1.xx.fbcdn.net\/v\/t1.0-9\/100913620_10158623488883120_6570526649723387904_o.jpg?_nc_cat=104&_nc_sid=9267fe&_nc_ohc=byYNTvoVKTQAX_gawtT&_nc_ht=scontent-cdg2-1.xx&oh=779b6790fb6d23a4e31ff65db789d460&oe=5F0142AC","height":958,"width":1440}
        // sample : "image":{"height":600,"width":800,"uri":"https://scontent-cdg2-1.xx.fbcdn.net/v/t45.5328-4/120040548_2936650183102715_8176740426141688330_n.jpg?_nc_cat=111&_nc_sid=c48759&_nc_ohc=mdbpc0Ces0cAX88LXhn&_nc_ht=scontent-cdg2-1.xx&oh=9be3e1e4dcc724e8b73b702727df32bd&oe=5FA654D1"}
        function extractFullsizeUrl(link, id, response) {

            cLog('extractFullsizeUrl id: ' + id + ' link: ' + (link[0].src  ? link[0].src : link[0].href));

            let regexUri = /"image":\{[^{]{0,}"uri":"(.*?)"/;
            let matchesUri = response.match(regexUri);
            let uri = null;
            if (matchesUri) uri = matchesUri.length > 1 ? matchesUri[1] : null;
            if (uri == null) {
                cLog('uri not found in response: ' + response);
                return false;
            }

            uri = uri.replace(/\\/g, '');
            let data = link.data();
            if (data.hoverZoomSrc == undefined) {
                data.hoverZoomSrc = [];
            }
            data.hoverZoomSrc.unshift(uri);
            cLog('Facebook photo fullsizeUrl (from page load): ' + uri);
            // store uri
            sessionStorage.setItem(id, uri);
            callback(link, name);
            return true;
        }

        // load user or group profile page
        function loadProfile(requestUrl, link) {
            cLog('loadProfile');
            var currentLink = link;
            var currentUrl = requestUrl;
            chrome.runtime.sendMessage({action:'ajaxGet', url:requestUrl}, function (response) {

                if (response == null) { return; }

                // parse response looking for uri = fullsize url
                let tokenUserID = '"userID":"';
                let tokenPageID = '"pageID":"';
                let indexUserID = response.indexOf(tokenUserID);
                let indexPageID = response.indexOf(tokenPageID);
                if (indexUserID == -1 && indexPageID == -1) { return; }
                if (indexUserID != -1 && indexPageID != -1) { return; }
                let index1 = (indexUserID != -1 ? indexUserID : indexPageID);
                let tokenLength = (indexUserID != -1 ? tokenUserID.length : tokenPageID.length);
                let index2 = response.indexOf('"', index1 + tokenLength);
                let id =  response.substring(index1 + tokenLength, index2);
                if (id == null) { return; }

                cLog('Facebook user or group id (from profile load): ' + id);
                let storedUrl = sessionStorage.getItem(id);
                if (storedUrl == null) {
                    loadPageProfile(currentLink, id);
                } else {
                    let data = currentLink.data();
                    if (data.hoverZoomSrc == undefined) {
                        data.hoverZoomSrc = [];
                    }
                    data.hoverZoomSrc.unshift(storedUrl);
                    cLog('Facebook photo fullsizeUrl (from sessionStorage): ' + storedUrl);
                    callback(currentLink, name);
                }
            });
        };

        // parse url to extract id for photo, video, profile's page
        function fetchPhoto(link, attr) {
            cLog('fetchPhoto');
            let url = link.prop(attr);

            // sample: https://www.facebook.com/photo/?fbid=594406298125799&set=bc.AbpjGtL4pnNezzYX8yoYVm15iSuoInRVyTQFkMQFlqTSx6fVYThBl8Trak-cuTK93mP5_Pr1n-QgRCpna_RJkUkwqTsUZ9WGBZVVTTgwCgSWTR_ZE-3X7Pd-OrmG_kKj0Hem-qFfv-MhunvHLp83RgSa&opaqueCursor=AboIiz6OSrza4kuQna_9Io8lftOyencTNmnjgptvby5LwrjC-le3iujcmC_loPGUdQ3T91zpU2HkEnPTqLHvnGrp7QaflyiFZG-X5WOvs37cijO1PpARIpTFlR7uRWAVRXkwki5BqEuflE83FXGlch3vvXoky2pplY5Q7QhezlJY4sSCoqTJ3_pBLB2XwB2MlpitfhcQsnYt1vPzNua4pJslFfYSQh4hU3GjTESsqZrHPJsyS5aYY937zVsKvN4_TTE6Hy4rsVZgZEKb-AR3Hryv_idLexY5M8gyKPHGdqzqbKTKEywQLpkM69gr9IjpznWBUcaZc5aYEFA5xYFazr_hBf5FPmnvxJXYA2KsVkDp68lZzhVhuMui7oO0fGeG6sFB4ng6uYgmogln7i6tihEduhoEaTZrSgtPFX7uDhnR64PFc0B6p1DFUrTf3izJn4jKJEdbft9KQj_ICVdEArQXBtEj58i29SrlxiFPDnGBklD9G4TeF-v2mfgSUXJ2s4Xdefr6rPoqmiieMzqERIxB7eeSnr1isbjzjPngz3rLeQ7SL0aOVvXiXChhxJNmAP8NOSaYhiB6pPL7kos4K6nn
            // => fbid = 594406298125799
            let regexFbid = /fbid=(\d+).*/;
            let matchesFbid = url.match(regexFbid);
            let fbid = null;
            if (matchesFbid) fbid = matchesFbid.length > 1 ? matchesFbid[1] : null;

            // sample: https://www.facebook.com/official.peta/photos/a.55746449585/10158850049124586/
            // => imgid = 10158850049124586
            let regexImgid = /\/photos\/.*\/(\d+)\//;
            let matchesImgid = url.match(regexImgid);
            let imgid = null;
            if (matchesImgid) imgid = matchesImgid.length > 1 ? matchesImgid[1] : null;

            // sample: https://www.facebook.com/8428968757/videos/10155919902028758/
            // => videoid = 10155919902028758
            let regexVideoid = /\/videos\/(\d+)\//;
            let matchesVideoid = url.match(regexVideoid);
            let videoid = null;
            if (matchesVideoid) videoid = matchesVideoid.length > 1 ? matchesVideoid[1] : null;

            // sample: https://www.facebook.com/profile.php?id=100014884125598
            // => profileid = 100014884125598
            let regexProfileid = /\/profile.php\?id=(\d+)/;
            let matchesProfileid = url.match(regexProfileid);
            let profileid = null;
            if (matchesProfileid) profileid = matchesProfileid.length > 1 ? matchesProfileid[1] : null;

            let storedUrl = null;
            // check sessionStorage in case fullsize url was already found
            if (fbid) {
                storedUrl = sessionStorage.getItem(fbid);
            } else if (imgid) {
                storedUrl = sessionStorage.getItem(imgid);
            } else if (videoid) {
                storedUrl = sessionStorage.getItem(videoid);
            } else if (profileid) {
                storedUrl = sessionStorage.getItem(profileid);
            }

            if (storedUrl == null) {
                if (fbid) {
                    loadPage(link, fbid);
                } else if (imgid) {
                    loadPage(link, imgid);
                } else if (videoid) {
                    loadPage(link, videoid);
                } /*else if (profileid) {
                    let requestUrl = 'https://graph.facebook.com/' + profileid + '/picture?type=large&width=9999';
                    loadImg(requestUrl, link, profileid);
                }*/ else {
                    loadProfile(url, link);
                }
            } else {
                let data = link.data();
                if (data.hoverZoomSrc == undefined) {
                    data.hoverZoomSrc = [];
                }
                data.hoverZoomSrc.unshift(storedUrl);
                res.push(link);
                cLog('Facebook photo fullsizeUrl (from sessionStorage): ' + storedUrl);
                callback(link, name);
            }
        }

        $('a[href]:not(.hoverZoomFetched)').addClass('hoverZoomFetched').one('mouseover', function () {
            var link = $(this);
            fetchPhoto(link, 'href');
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

        $('img[src]:not(img[src*="safe_image.php"]):not(.hoverZoom3)').addClass('hoverZoom3').each(function () {

            let link = $(this).parents('a')[0];
            if (link == undefined) return;
            link = $(link);
            let url = this.src;
            // filter urls with valid srcId
            // sample: https://scontent-cdg2-1.xx.fbcdn.net/v/t45.5328-4/120042242_3034295103343234_1203962750450144345_n.jpg?_nc_cat=104&_nc_sid=c48759&_nc_ohc=cVjtHyK2ufsAX8hyhib&_nc_ht=scontent-cdg2-1.xx&oh=d3c5f012f6eaf2a597f14450dc7d4eb6&oe=5FA6DCF8
            // => srcId = 120042242_3034295103343234_1203962750450144345
            let regexSrcid = /\/(\d+_\d+_\d+)/;
            let matchesSrcid = url.match(regexSrcid);
            let srcId = null;
            if (matchesSrcid) srcId = matchesSrcid.length > 1 ? matchesSrcid[1] : null;
            if (srcId == null) return;

            let urlId = searchUrlId_InnerHTML(url);
            if (urlId == undefined) urlId = searchUrlId_HookedData(url);
            if (urlId == undefined) return;

            // add urlId to dataset in case user hovers over the image later
            let data = link.data();
            data.hoverZoomUrlId = urlId;
        });

        $('img[src]:not(img[src*="safe_image.php"]):not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function () {

            let link = $(this).parents('a')[0];
            if (link == undefined) return;
            link = $(link);
            let data = link.data();
            let urlId = data.hoverZoomUrlId;
            if (urlId == undefined) return;

            let storedUrl = null;
            // check sessionStorage in case url was already found
            storedUrl = sessionStorage.getItem(urlId);
            if (storedUrl == null) {
                loadPage(link, urlId);
            }
            else {
                let data = link.data();
                if (data.hoverZoomSrc == undefined) {
                    data.hoverZoomSrc = [];
                }
                data.hoverZoomSrc.unshift(storedUrl);
                res.push(link);
                cLog('Facebook photo fullsizeUrl (from sessionStorage): ' + storedUrl);
                callback(link, name);
            }
        });

        callback($(res), name);
    }
});
