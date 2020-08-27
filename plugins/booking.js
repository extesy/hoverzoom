var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'booking',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        //sample url (with xdata): https://cf.bstatic.com/xdata/images/xphoto/square60_ao/76187373.jpg?k=ce5b3bc79cd386511b7f96a0d492a4592e81af99a41e6649357fbb640cb9c7c1&o=
        //                      -> https://cf.bstatic.com/xdata/images/xphoto/max3000/76187373.jpg?k=ce5b3bc79cd386511b7f96a0d492a4592e81af99a41e6649357fbb640cb9c7c1&o=
        var regex1 = /\/(square|max|\d+x).*?\//;
        var patch1 = '/max3000/';

        //sample url (w/o xdata): https://cf.bstatic.com/images/hotel/max400/113/113560494.jpg
        //                     -> https://cf.bstatic.com/images/hotel/max1024x768/113/113560494.jpg
        var regex2 = /\/(square|max|\d+x).*?\//;
        var patch2 = '/max1024x768/';

        hoverZoom.urlReplace(res,
            'img[src*="/xdata/"], a[href*="/xdata/"]',
            regex1,
            patch1
        );

        hoverZoom.urlReplace(res,
            'img[src]:not([src*="/xdata/"]), a[href]:not([href*="/xdata/"])',
            regex2,
            patch2
        );

        $('[style*=url]').each(function() {
            let link = $(this);
            // extract url from style
            let backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf("url") == -1) return;

            let reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            let backgroundImageUrl = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");
            let fullsizeUrl = backgroundImageUrl;
            if (backgroundImageUrl.indexOf("/xdata/") != -1) {
                fullsizeUrl = backgroundImageUrl.replace(regex1, patch1);
            } else {
                fullsizeUrl = backgroundImageUrl.replace(regex2, patch2);
            }

            if (fullsizeUrl != backgroundImageUrl) {

                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    res.push(link);
                }
            }
        });

        callback($(res));
    }
});