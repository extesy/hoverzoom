var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'wixstatic_a',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // thumbnail: https://static.wixstatic.com/media/8d1934_58b641a6575843a7bdacc28b3d64e27d~mv2.jpg/v1/fill/w_103,h_69,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/8d1934_58b641a6575843a7bdacc28b3d64e27d~mv2.jpg
        //  fullsize: https://static.wixstatic.com/media/8d1934_58b641a6575843a7bdacc28b3d64e27d~mv2.jpg
        hoverZoom.urlReplace(res,
            'img[src*="static.wixstatic.com"]',
            /(^.*?~mv2\..*?)\/.*/,
            '$1'
        );

        callback($(res), this.name);
    }
});
