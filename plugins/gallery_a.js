var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Gallery',
    prepareImgLinks:function (callback) {
        if (!document.body || !document.body.classList.contains('gallery')) { return; }
        var res = [];
        hoverZoom.urlReplace(res,
            '.giItemCell a[href*="?g2_itemId="]',
            /(g2_itemId=\d+).*/,
            '$1&g2_view=core.DownloadItem'
        );
        callback($(res));
    }
});