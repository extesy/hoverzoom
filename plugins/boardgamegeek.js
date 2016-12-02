var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'BoardGameGeek',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res, 'img[src*="_mt."]', /_mt/, '');
        hoverZoom.urlReplace(res, 'img[src*="_t."]', /_t/, '');
        hoverZoom.urlReplace(res, 'img[src*="_sq."]', /_sq/, '');
        hoverZoom.urlReplace(res, 'img[src*="_md."]', /_md/, '');
        hoverZoom.urlReplace(res, 'img[src*="_lg."]', /_lg/, '');
        hoverZoom.urlReplace(res, 'img[src]', /geekdo-images.com\/[^images].*\/pic/, 'geekdo-images.com\/images\/pic');
        callback($(res));
    }
});