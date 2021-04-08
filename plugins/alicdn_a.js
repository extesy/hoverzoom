var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'alicdn_a',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://ae01.alicdn.com/kf/Ha2e69426229d45f7bdca711d6aacaaa3H/2X-PY21W-BAU15S-1156-P21W-LED-BA15S-1157-P21-5W-BAY15D-Bulb-3030-LED-R5W-R10W.jpg_220x220xz.jpg_.webp
        //      -> https://ae01.alicdn.com/kf/Ha2e69426229d45f7bdca711d6aacaaa3H/2X-PY21W-BAU15S-1156-P21W-LED-BA15S-1157-P21-5W-BAY15D-Bulb-3030-LED-R5W-R10W.jpg
        // sample: http://cbu01.alicdn.com/img/ibank/2018/847/066/9475660748_1284753614.400x400.jpg
        //      -> http://cbu01.alicdn.com/img/ibank/2018/847/066/9475660748_1284753614.jpg

        hoverZoom.urlReplace(res,
            'img[src*="alicdn"],[style*="alicdn"]',
            /\.jpg_.*/,
            '.jpg'
        );

        hoverZoom.urlReplace(res,
            'img[src*="alicdn"],[style*="alicdn"]',
            /\.\d+x\d+\./,
            '.'
        );

        hoverZoom.urlReplace(res,
            'img[src*="alicdn"],[style*="alicdn"]',
            /\.(search|summ)\./,
            '.'
        );

        callback($(res), this.name);
    }
});
