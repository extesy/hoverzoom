var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Blogo.it',
    version:'0.2',
    prepareImgLinks:function (callback) {

        var res = [];

        hoverZoom.urlReplace(res, 'img[src*="/thn_"]', 'thn_', 'big_');

        hoverZoom.urlReplace(res, 'img[src]', /(http.*)(http.*)/ , '$2');

        $('img[srcset]:not([src])').each(function () {

            let link = $(this);
            let srcset = link.prop('srcset');
            let fullsizeUrl = srcset.replace(/(http.*)(http.*)( .*)/, '$2');
            if (fullsizeUrl != srcset) {
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
