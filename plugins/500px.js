var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'500px',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="/1.jpg"], img[src*="/2.jpg"], img[src*="/3.jpg"]',
            /(.*pcdn.*)\/[123]\.jpg/,
            '$1/4.jpg'
        );
        hoverZoom.urlReplace(res,
            'a img.changed[src*="/4.jpg"]',
            '/4.jpg',
            '/4.jpg#'
        );
        callback($(res));
    }
});