var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'eBay_a',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://i.ebayimg.com/00/s/NjgzWDEwMjQ=/z/oIAAAOSw2xRYhceC/$_2.JPG
        //      -> https://i.ebayimg.com/00/s/NjgzWDEwMjQ=/z/oIAAAOSw2xRYhceC/$_32.JPG
        hoverZoom.urlReplace(res,
            'img[src*="ebayimg"],[style*="ebayimg"]',
            /\$_\d+/,
            '$_32'
        );

        // sample: https://i.ebayimg.com/images/g/SDwAAOSw9vdgOLBv/s-l500.jpg
        //      -> https://i.ebayimg.com/images/g/SDwAAOSw9vdgOLBv/s-l1600.jpg
        hoverZoom.urlReplace(res,
            'img[src*="ebayimg"],[style*="ebayimg"]',
            /\/s-l\d+\./,
            '/s-l1600.'
        );

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
