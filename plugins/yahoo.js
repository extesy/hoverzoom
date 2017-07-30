var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Yahoo',
    version:'0.4',
    prepareImgLinks:function (callback) {
        function prepareImgLink(img) {
            var img = $(this),
                link = this.parentNode,
                href = link.href,
                imgUrlIndex = href.indexOf('imgurl=');
            href = href.substring(imgUrlIndex + 7, href.indexOf('&', imgUrlIndex));
            while (decodeURIComponent(href) != href)
                href = decodeURIComponent(href);
            img.data().hoverZoomSrc = [href];
            img.addClass('hoverZoomLink');
        }

        $('a[href*="imgurl="] > img').each(prepareImgLink);
        $('#ihover-img').on('load',prepareImgLink);

        var res = [];
        hoverZoom.urlReplace(res, 'img[src*="/http"]', /.*\/(http.*)/, '$1');
        callback($(res));
    }
});
