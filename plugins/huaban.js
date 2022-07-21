var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'huaban',
    version: '1.1',
    prepareImgLinks: function(callback) {
        var res = [];

        // sample:   https://hbimg.huaban.com/ee3e69d3e537cbe479c7df83611ab1c056639ac61df2d-KuC9Ni_fw86/format/webp
        // fullsize: https://hbimg.huaban.com/ee3e69d3e537cbe479c7df83611ab1c056639ac61df2d-KuC9Ni
        hoverZoom.urlReplace(res,
            'img[src*="huaban.com"],div',
            /https:\/\/.*hbimg.huaban.com\/(.*)_(.*)/,
            'https://hbimg.huaban.com/$1',
            'a'
        );

        // sample:   https://hbimg.huaban.com/ee3e69d3e537cbe479c7df83611ab1c056639ac61df2d-KuC9Ni_fw86/format/webp
        // fullsize: https://hbimg.huaban.com/ee3e69d3e537cbe479c7df83611ab1c056639ac61df2d-KuC9Ni
        hoverZoom.urlReplace(res,
            'img[src*="huaban.com"],div',
            /https:\/\/.*hbimg.huaban.com\/(.*)_(.*)/,
            'https://hbimg.huaban.com/$1'
        );

        callback($(res), this.name);
    }
});