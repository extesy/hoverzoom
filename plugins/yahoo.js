var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Yahoo',
    version:'1.1',
    prepareImgLinks:function (callback) {

        var res = [];

        hoverZoom.urlReplace(res,
            'img[src*="/http"]',
            [/.*\/(http.*)(\.cf\..*)/, /.*\/(http.*)(?!(\.cf\..*))/],
            ['$1', '$1']
        );

        $('a[href*=imgurl]').each(function() {

            var fullsizeUrl = this.href.replace(/(.*)imgurl=(.*?)&(.*)/i, '$2');
            if (! fullsizeUrl.startsWith('http')) fullsizeUrl = "https://" + fullsizeUrl;

            try {
                fullsizeUrl = decodeURIComponent(fullsizeUrl);
                var link = $(this);
                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    res.push(link);
                }
                // patch Bing's results
                var imgChild = $(this).find('img')[0];
                if (imgChild != undefined) {
                    $(imgChild).data().hoverZoomSrc = [fullsizeUrl];
                }

            } catch(e) {}
        });

        $('[style*=url]').each(function() {
            let link = $(this);
            // extract url from style
            let backgroundImage = this.style.backgroundImage;
            let reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            let backgroundImageUrl = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");
            let fullsizeUrl = backgroundImageUrl.replace(/.*\/(http.*)/, '$1').replace(/\.cf\..*/, '');
            if (fullsizeUrl != backgroundImageUrl) {

                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    res.push(link);
                }
            }
        });

        // add metadata for CherryPics
        $('a[href*="rurl="]').each(function () {
            var link = $(this),
                href = this.getAttribute('href');

            imgUrlIndex = href.indexOf('rurl=');
            href = href.substring(imgUrlIndex + 5, href.indexOf('&', imgUrlIndex));
            link.data().href = unescape(href);
            res.push(link);
        });

        callback($(res), this.name);
    }
});
