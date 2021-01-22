var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Flipkart',
    version:'2.0',
    prepareImgLinks:function (callback) {
        var res = [];

        /*hoverZoom.urlReplace(res,
            'img[src*="rukminim1.flixcart.com"]',
            /image\/\d+\/\d+/,
            'image/500/500'
        );*/

        $('img[src],[style*=url]').each(function() {

            // extract url from link, it might be an image or a background-image
            var link = $(this);
            var url = link[0].src;
            if (url == undefined) {
                backgroundImage = link[0].style.backgroundImage;
                reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                url = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,""); // remove leading & trailing quotes
            }

            var re = /(.*flixcart\.com\/.*?\/)(\d+\/\d+)(\/.*)/
            var m = url.match(re);
            if (m) {
                var fullsizeUrl = m[1] + '2000/2000' + m[3];

                if (fullsizeUrl != undefined) {
                    if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                    if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                        link.data().hoverZoomSrc.unshift(fullsizeUrl);
                        res.push(link);
                    }
                }
            }
        });

        callback($(res), this.name);
    }
});