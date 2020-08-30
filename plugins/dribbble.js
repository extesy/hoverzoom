var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Dribbble',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];

        $('img[src*="_teaser."]').each(function () {
            var img = $(this),
                aZoom = img.parents('a.zoom'),
                aOver = img.parents('.dribbble-img').find('a.dribbble-over'),
                link = aOver.length ? aOver : aZoom;
            if (link.length) {
                link.data().hoverZoomSrc = [img.attr('src').replace('_teaser', '')];
                res.push(link);
            }
        });

        //sample url: https://cdn.dribbble.com/users/112047/screenshots/11090258/pat_drib_4x.jpg?compress=1&resize=1200x900
        // _4x.jpg?compress=1&resize=1200x900 -> .jpg
        $('img[src], [style*=url]').each(function() {

            var url;
            if ($(this).is('img')) {
                url = this.src;
            } else {
                let backgroundImage = this.style.backgroundImage;
                let reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                url = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,"");
            }
            
            var fullsizeUrl = url.replace('/thumbnail/','/').replace(/(mini|small|normal)/,'original').replace(/(_teaser|_1x|_2x|_3x|_4x)/, '').replace(/\?.*/, '');
            if (fullsizeUrl != url) {
                var link = $(this);
                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    res.push(link);
                }
            }
        });

        callback($(res), this.name);
    }
});