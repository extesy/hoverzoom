var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Bing',
    version:'0.2',
    prepareImgLinks:function (callback) {

        var res = [];

        $('a[m]').each(function () {
            var link = $(this),
                m = this.getAttribute('m') || '',
                m1 = m.replace(/([{|,])([a-zA-Z0-9]+)\:/g, '$1"$2":'),
                m2 = $.parseJSON(m1);
            var url = m2.murl;
            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (url && link.data().hoverZoomSrc.indexOf(url) == -1) {
                link.data().hoverZoomSrc.unshift(url);
                if (m2.t) { link.data().hoverZoomCaption = m2.t }
                link.data().href = m2.purl;
                res.push(link);
            }
        });

        $('a[href*="mediaurl"]:not([m])').each(function () {
            var link = $(this);
            var url = this.href.replace(/.*mediaurl=(.*?)&.*/, '$1');
            url = decodeURIComponent(url);
            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (url && link.data().hoverZoomSrc.indexOf(url) == -1) {
                link.data().hoverZoomSrc.unshift(url);
                res.push(link);
            }
        });

        callback($(res));
    }
});
