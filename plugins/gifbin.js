var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'gifbin',
    prepareImgLinks:function (callback) {
        let res = [];

        // TODO: Fix status code 206 and repeated warning: "Invalid URI. Load of media resource failed."
        $('a[title][href*="/"]:not([class][poster])').filter(function() {
             return this.href.match(/gifbin\.com\/\d+$/);
        }).one('mouseover', function () { 
            hoverZoom.prepareFromDocument($(this), this.href, function(doc) {
                let img = doc.getElementById('gif');
                img = img.innerHTML.match(/source src="(.+\.mp4)"/);
                return img ? img[1] : false;
            });
        });

        callback($(res), this.name);
    }
});
