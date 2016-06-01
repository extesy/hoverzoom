var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'MyYearBook',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="thumb_userimages"]',
            [/thumb_userimages\/(?:[^\d]+\/)?(\d+)\//, /(_\d+){4}/],
            ['thumb_userimages/large/$1/', '']
        );
        callback($(res));
    }
});
