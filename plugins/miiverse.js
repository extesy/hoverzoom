var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Miiverse',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="/th/"]',
            '/th/',
            '/ss/',
            ':eq(0)'
        );
        callback($(res));
    }
});
