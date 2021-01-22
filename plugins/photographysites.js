var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'photographysites.com',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];       

        hoverZoom.urlReplace(res,
            'img[src]',
            ['tn_gallery', 'sml_gallery', 'med_gallery', '-thumb'],
            ['gallery', 'gallery', 'gallery', '']
        );

        callback($(res), this.name);
    }
});