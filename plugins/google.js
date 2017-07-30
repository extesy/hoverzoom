var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Google',
    prepareImgLinks:function (callback) {

        // Google+ full page viewer
        if (location.search.indexOf('pid=') > -1) {
            return;
        }

        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*=".googleusercontent.com/"], img[src*=".ggpht.com/"]',
            /(\/|=)(w\d{2,}-h\d{2,}|[hws]\d{2,})(-[npckorw]+)*(\/|$)/,
            options.showHighRes ? '$1s0$4' : '$1s800$4'
        );
        /*hoverZoom.urlReplace(res,
            'img[src*=".googleusercontent.com/"], img[src*=".ggpht.com/"]',
            /(\/|=)(w\d{2,}-h\d{2,}|[hws]\d{2,})(-[npcko]+)*(\/|$)/,
            options.showHighRes ? '$1s0$4' : '$1s800$4'
        );*/
        hoverZoom.urlReplace(res,
            'a[href*="imgurl="]',
            /.*imgurl=([^&]+).*/,
            '$1'
        );
        callback($(res));

        // remove this when old google image is retired
        function prepareImgLink(img) {
            var img = $(this);
            if (this.id != 'rg_hi' && img.data().hoverZoomSrc) { return; }
            var link = this.parentNode,
                href = link.href,
                imgUrlIndex = href.indexOf('imgurl=');
            href = href.substring(imgUrlIndex + 7, href.indexOf('&', imgUrlIndex));
            try {
                while (decodeURIComponent(href) != href)
                    href = decodeURIComponent(href);
            } catch (e) {
            }
            link.classList.remove('hoverZoomLink');
            img.data().hoverZoomSrc = [href];
            img.addClass('hoverZoomLink');
        }
        $('a[href*="imgurl="] > img').each(prepareImgLink);
        $('.rg_ic').on('load',prepareImgLink);

    }
});
