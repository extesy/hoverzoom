var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'500px',
    version:'0.6',
    prepareImgLinks:function (callback) {

        var name = this.name;
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src*="/1.jpg"], img[src*="/2.jpg"], img[src*="/3.jpg"]',
            /(.*pcdn.*)\/[123]\.jpg/,
            '$1/4.jpg'
        );

        hoverZoom.urlReplace(res,
            'a img.changed[src*="/4.jpg"]',
            '/4.jpg',
            '/4.jpg#'
        );

        $('img[src],[style*=url]').removeClass('hoverZoomMouseover1');
        $('img[src]:not(.hoverZoomMouseover1),[style*=url]:not(.hoverZoomMouseover1)').addClass('hoverZoomMouseover1').parent().one('mouseover', function() {

            // extract url from link, it might be an image or a background-image
            var link = $(this);
            var tmp = $(this).children('img[src]')[0];
            if (tmp != undefined) {
                tmp = $(tmp);
                url = tmp[0].src;
            } else {
                tmp = $(this).children('[style*=url]')[0];
                tmp = $(tmp);
                backgroundImage = tmp[0].style.backgroundImage;
                reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                url = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,""); // remove leading & trailing quotes
            }

            findFullsizePhoto(url, link);
            findFullsizeAvatar(url, link);
        });
        $('div').removeClass('hoverZoomMouseover1');
        $('div:not(.hoverZoomMouseover1)').filter(function() { return $(this).css('background-image') != 'none' ? true : false }).addClass('hoverZoomMouseover1').parent().one('mouseover', function() {

            var link = $(this);

            let backgroundImage = $(link.children('div')[0]).css('background-image');
            let reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            url = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,""); // remove leading & trailing quotes

            findFullsizePhoto(url, link);
            findFullsizeAvatar(url, link);
        });

        // use API call to retrieve fullsize img url
        // method based on Imagus extension, check this file : https://github.com/Zren/chrome-extension-imagus/blob/community/unminified/sieve.jsn
        //
        // sample url   : https://drscdn.500px.org/photo/1015291632/q%3D80_h%3D450/v2?sig=e2b67697f74e5f9c07588f65e00d4b4f022803292649631c4f9669cf2a71455b
        //   image id   : 1015291632
        //   API call   : https://api.500px.com/v1/photos?ids=1015291632&image_size[]=34&image_size[]=2048
        // fullsize url : photos.1015291632.image_url[1] = https://drscdn.500px.org/photo/1015291632/m%3D2048/v2?sig=57d8851e13ca77aa5ae595dd07c3a1c049038e571d4298c1ab1ddb5de6f95f9a
        function findFullsizePhoto(url, link) {
            var re = /.*\/photo\/(\d+)\/.*/
            var m = url.match(re);
            if (m) {
                var id = m[1];
                cLog('id:' + id);

                var fullsizeUrl;
                // check if API's response is already in sessionStorage to lessen API calls
                var dataFromSessionStorage = sessionStorage.getItem('p_' + id);
                if (dataFromSessionStorage == null) {

                    // no data found in sessionStorage so proceed with API call
                    // WARNING: CORB error (Cross-Origin Read Blocking) when calling the API from the content script.
                    // cf https://www.chromium.org/Home/chromium-security/extension-content-script-fetches
                    // Workaround: call the API from background page.
                    var requestUrl = 'https://api.500px.com/v1/photos?ids=' + id + '&image_size[]=34&image_size[]=2048&tags=1';

                    // x-csrf-token & x-500px-token are required when user is logged in 500px
                    chrome.runtime.sendMessage({action:'ajaxGet', url:requestUrl, headers:[{"header":"x-csrf-token","value":"fetch"}, {"header":"x-500px-token","value":"fetch"}]}, function (response) {

                        if (response == null) { return; }

                        try {
                            var data = JSON.parse(response);
                        } catch (e) { return; }

                        // store whole response in sessionStorage
                        sessionStorage.setItem('p_' + id, response);

                        fullsizeUrl = data.photos[id].image_url[1];
                        cLog('photo fullsizeUrl (from API call):' + fullsizeUrl);

                        if (fullsizeUrl != undefined) {
                            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                                link.data().hoverZoomSrc.unshift(fullsizeUrl);
                            }
                            callback(link, name);
                            hoverZoom.displayPicFromElement(link);
                        }
                    });
                } else {

                    // use data found in sessionStorage
                    try {
                        var data = JSON.parse(dataFromSessionStorage);
                    } catch (e) { return; }

                    fullsizeUrl = data.photos[id].image_url[1];
                    cLog('photo fullsizeUrl (from sessionStorage):' + fullsizeUrl);

                    if (fullsizeUrl != undefined) {
                        if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                        if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                            link.data().hoverZoomSrc.unshift(fullsizeUrl);
                        }
                        callback(link, name);
                        hoverZoom.displayPicFromElement(link);
                    }
                }
            }
        }

        // use API call to retrieve fullsize img url of user
        //
        // sample url   : https://drscdn.500px.org/user_avatar/1003527811/q%3D85_w%3D50_h%3D50/v2?webp=true&v=1&sig=746c80e349c9c8ca6c8d842f113a1eb3f8c1c4a69681db1ea82dc190a19df312
        //   user id    : 1003527811
        //   API call   : https://api.500px.com/v1/users/1003527811
        // fullsize url : user.avatars.default = https://drscdn.500px.org/user_avatar/1003527811/q%3D85_w%3D300_h%3D300/v2?webp=true&v=1&sig=8a008cb904008f58a3bb3e9b9362be910868448375108f3dc2300146c212af84
        function findFullsizeAvatar(url, link) {
            var re = /.*\/user_avatar\/(\d+)\/.*/
            var m = url.match(re);
            if (m) {
                var id = m[1];
                cLog('id:' + id);

                var fullsizeUrl;
                // check if API's response is already in sessionStorage to lessen API calls
                var dataFromSessionStorage = sessionStorage.getItem('u_' + id);
                if (dataFromSessionStorage == null) {

                    // no data found in sessionStorage so proceed with API call
                    // WARNING: CORB error (Cross-Origin Read Blocking) when calling the API from the content script.
                    // cf https://www.chromium.org/Home/chromium-security/extension-content-script-fetches
                    // Workaround: call the API from background page.
                    var requestUrl = 'https://api.500px.com/v1/users/' + id;

                    // x-csrf-token & x-500px-token are required when user is logged in 500px
                    chrome.runtime.sendMessage({action:'ajaxGet', url:requestUrl, headers:[{"header":"x-csrf-token","value":"fetch"}, {"header":"x-500px-token","value":"fetch"}]}, function (response) {

                        if (response == null) { return; }

                        try {
                            var data = JSON.parse(response);
                        } catch (e) { return; }

                        // store whole response in sessionStorage
                        sessionStorage.setItem('u_' + id, response);

                        fullsizeUrl = data.user.avatars.cover.https; //data.user.userpic_https_url;
                        cLog('user fullsizeUrl (from API call):' + fullsizeUrl);

                        if (fullsizeUrl != undefined) {
                            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                                link.data().hoverZoomSrc.unshift(fullsizeUrl);
                            }
                            callback(link, name);
                            hoverZoom.displayPicFromElement(link);
                        }
                    });
                } else {
                    // use data found in sessionStorage
                    try {
                        var data = JSON.parse(dataFromSessionStorage);
                    } catch (e) { return; }

                    fullsizeUrl = data.user.avatars.cover.https; //data.user.userpic_https_url;
                    cLog('user fullsizeUrl (from sessionStorage):' + fullsizeUrl);

                    if (fullsizeUrl != undefined) {
                        if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                        if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                            link.data().hoverZoomSrc.unshift(fullsizeUrl);
                        }
                        callback(link, name);
                        hoverZoom.displayPicFromElement(link);
                    }
                }
            }
        }

        callback($(res), name);
    }
});
