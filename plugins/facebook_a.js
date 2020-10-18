var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'FacebookGraph',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];

        function loadImg(requestUrl, link, id) {
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

                // store uri
                sessionStorage.setItem(currentId, uri);
                callback(currentLink);
            });
        }

        function fetchPhoto(link, attr) {
            let url = link.prop(attr);

            let regexGraphId = /\/graph\.facebook\.com\/.*\/(\d+)\//; //sample: https://graph.facebook.com/v2.9/1125844704094568/picture?type=square&height=64&width=64
            let matchGraphId = url.match(regexGraphId);
            let graphId = null;
            if (matchGraphId) graphId = matchGraphId.length > 1 ? matchGraphId[1] : null;

            let storedUrl = null;
            // check sessionStorage in case uri was already found
            if (graphId) {
                storedUrl = sessionStorage.getItem(graphId);
            }

            if (storedUrl == null) {
                let requestUrl = 'https://graph.facebook.com/' + graphId + '/picture?type=large&width=9999';
                loadImg(requestUrl, link, graphId);
            } else {
                let data = link.data();
                if (data.hoverZoomSrc == undefined) {
                    data.hoverZoomSrc = [];
                }
                data.hoverZoomSrc.unshift(storedUrl);
                res.push(link);
                callback(link);
            }
        }

        // mouseover event might not be received by img so fetch photo anyway
        //$('img[src*="graph.facebook.com"]:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function () {
        $('img[src*="graph.facebook.com"]:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').each(function () {
            var link = $(this);
            fetchPhoto(link, 'src');
        });

        callback($(res), this.name);
    }
});
