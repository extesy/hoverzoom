var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Pict.Mobi',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a[href*=pict.mobi]',
            /pict\.mobi\/([^\/]*)$/,
            'pict.mobi/show/med/med_$1'
        );
        callback($(res));
    }
});
