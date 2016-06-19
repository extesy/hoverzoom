var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Jootix',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'div.smallImages, div.relatedPics',
            /thumbs\/(.*)_(big|small)\./,
            'cache/$1-975x550.'
        );
        callback($(res));
    }
});
