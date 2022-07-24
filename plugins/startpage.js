var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'startpage',
    version:'0.2',
    prepareImgLinks:function (callback) {

        var name = this.name;
        var res = [];
        var jsonToken1 = 'UIStartpage.AppSerp,';
        var jsonToken2 = '}),';
        var spJson = undefined;
        var spData = extractJsonFromDoc();

        // links to fullsize imgs are stored in HTML document (JSON)
        function extractJsonFromDoc() {

            let innerHTML = document.documentElement.innerHTML;
            let index1 = innerHTML.indexOf(jsonToken1);
            if (index1 == -1) return undefined;
            let index2 = innerHTML.indexOf(jsonToken2, index1);
            spJson = innerHTML.substring(index1 + jsonToken1.length, index2 + 1);
            try {
               let sp = JSON.parse(spJson);
               return sp;
            } catch { return undefined }

            return undefined;
        }

        //$('link[href*="proxy-image"]:not(.hoverZoomFetched)').addClass('hoverZoomFetched').each(function () {
        $('img[src*="proxy-image"]:not(.hoverZoomFetched)').addClass('hoverZoomFetched').each(function () {
            let link = $(this);
            let src = link.attr('src');

            // search for thumbnail url among sp data
            if (spJson.indexOf(src) == -1) return;

            let values = hoverZoom.getValuesInJsonObject(spData, src, false, true, true); // look for a partial match & stop after 1st match
            if (values.length == 0) return;
            let o = hoverZoom.getJsonObjectFromPath(spData, values[0].path.substring(0, values[0].path.lastIndexOf('[')));
            // extract fullsize url from Object
            let fullsizeUrl = o.clickUrl || o.anonImageViewUrl;
            fullsizeUrl = fullsizeUrl.replace(/.*piurl=(.*)&sp=.*/, '$1');
            fullsizeUrl = decodeURIComponent(fullsizeUrl);
            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.unshift(fullsizeUrl);
                res.push(link);
            }
        });

        callback($(res), name);
    }
});
