var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'eBay_a',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        
        // sample: https://i.ebayimg.com/00/s/NjgzWDEwMjQ=/z/oIAAAOSw2xRYhceC/$_2.JPG
        //      -> https://i.ebayimg.com/00/s/NjgzWDEwMjQ=/z/oIAAAOSw2xRYhceC/$_32.JPG
        hoverZoom.urlReplace(res,
            'img[src*="ebayimg"],[style*="ebayimg"]',
            /\$_\d+/,
            '$_32'
        );
        
        if (res.length) {
            callback($(res), this.name);
        }
    }
});
