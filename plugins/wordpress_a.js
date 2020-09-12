var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Wordpress',
    version:'2.0',
    prepareImgLinks:function (callback) {

        var res = [];

        $('img[src*="wp-content"]').each(function () {
            var img = $(this),
                //re = /-\d+x\d+\./,
                //a global search is needed
                //ex:"https://globalvoices.org/wp-content/uploads/2018/11/Migrants_in_Hungary_2015_Aug_018-800x450-400x300.jpg"
                re = /-\d+x\d+/ig,
                src = this.src;
            if (src.match(re)) {
                src = src.replace(re, '');
                img.data().hoverZoomSrc = [src, src.replace(/jpg$/, 'jpeg')];
                res.push(img);
            }
        });

        // background images
        $('[style]').each(function() {

            // extract url from style
            // ex: style="background-image: url(https://globalvoices.org/wp-content/uploads/2019/01/20160507_KAR5877-400x300.jpg)"
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf('wp-content') != -1) {
                var reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                var backgroundImageUrl = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,"");
                var reThumb = /-\d+x\d+/ig
                var fullsizeUrl = backgroundImageUrl.replace(reThumb, '');
                if (fullsizeUrl != backgroundImageUrl) {
                    var link = $(this);
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
