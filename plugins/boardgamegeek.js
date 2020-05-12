var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'BoardGameGeek',
    version:'0.3',
    prepareImgLinks:function (callback) {

        var res = [];

        //hoverZoom.urlReplace(res, 'img[src*="_mt."]', /_mt/, '');
        //hoverZoom.urlReplace(res, 'img[src*="_t."]', /_t/, '');
        //hoverZoom.urlReplace(res, 'img[src*="_sq."]', /_sq/, '');
        //hoverZoom.urlReplace(res, 'img[src*="_md."]', /_md/, '');
        //hoverZoom.urlReplace(res, 'img[src*="_lg."]', /_lg/, '');
        //hoverZoom.urlReplace(res, 'img[src]', /geekdo-images.com\/[^images].*\/pic/, 'geekdo-images.com\/images\/pic');
        
        //    https://cf.geekdo-images.com/T936PUt9WZBkv6vjXLYvcwrDXU8=/35x35/https://cf.geekdo-static.com/avatars/avatar_id46554.jpg
        // -> https://cf.geekdo-static.com/avatars/avatar_id46554.jpg
        hoverZoom.urlReplace(res, 'img[src]', /.*\/(http.*)/, '$1');

        // use API call to retrieve fullsize img url
        // method based on Imagus extension 
        // method based on Imagus extension, check this file : https://github.com/Zren/chrome-extension-imagus/blob/community/unminified/sieve.jsn
        //
        //      sample url : https://cf.geekdo-images.com/tinysquare/img/_tWFnVEWmngUa5tzPMV9baJFa1A=/fit-in/30x30/pic2119260.jpg
        // ->     image id : 2119260
        // ->     API call : https://api.geekdo.com/api/images/2119260
        // -> fullsize url : data.images.original.url = https://cf.geekdo-images.com/original/img/lWyxk2AH3g29lS-kmDQjkWlOOhc=/0x0/pic2119260.jpg
        $('img[src]:not(.hoverZoomLink),[style*=url]:not(.hoverZoomLink)').parent().one('mouseover', function() {

            // extract url from link, it might be an image or a background-image
            var link = $(this).children('img[src]')[0];
            if (link != undefined) {
                link = $(link);
                url = link[0].src;
            } else {
                link = $(this).children('[style*=url]')[0];
                link = $(link);
                backgroundImage = link[0].style.backgroundImage;
                reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                url = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,""); // remove leading & trailing quotes
            }

            var re = /.*\/pic(\d+).*/
            var m = url.match(re);
            if (m) {
                var id = m[1];
                console.log('id:' + id);

                var fullsizeUrl;
                // check if API's response is already in sessionStorage to lessen API calls
                var dataFromSessionStorage = sessionStorage.getItem(id);
                if (dataFromSessionStorage == null) {

                    // no data found in sessionStorage so proceed with API call
                    // WARNING: CORB error (Cross-Origin Read Blocking) when calling the API from the content script.
                    // cf https://www.chromium.org/Home/chromium-security/extension-content-script-fetches
                    // Workaround: call the API from background page.
                    var requestUrl = 'https://api.geekdo.com/api/images/' + id;

                    chrome.runtime.sendMessage({action:'ajaxGet', url:requestUrl}, function (response) {

                        if (response == null) { return; }

                        try {
                            var data = JSON.parse(response);
                        } catch (e) { return; }

                        // store response in sessionStorage 
                        fullsizeUrl = data.images.original.url;
                        sessionStorage.setItem(id, fullsizeUrl);
                        console.log('photo fullsizeUrl (from API call):' + fullsizeUrl);

                        if (fullsizeUrl != undefined) {
                            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) { 
                                link.data().hoverZoomSrc.push(fullsizeUrl);
                                link.data().hoverZoomSrc.reverse(); 
                            }
                            link.addClass('hoverZoomLink');
                            callback(link);
                        }
                    });
                } else {

                    // use data found in sessionStorage
                    var fullsizeUrl = dataFromSessionStorage;
                    console.log('photo fullsizeUrl (from sessionStorage):' + fullsizeUrl);

                    if (fullsizeUrl != undefined) {
                        if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                        if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                            link.data().hoverZoomSrc.push(fullsizeUrl);
                            link.data().hoverZoomSrc.reverse(); 
                        }
                        link.addClass('hoverZoomLink');
                        callback(link);
                    }
                }
            }
        });
    }
});