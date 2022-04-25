var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'shein',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var res = [];

        // sample:   https://img.ltwebstatic.com/images3_pi/2022/01/06/164143298217b45c1da8a1c07351af19a5ff72327e_thumbnail_220x293.webp
        // fullsize: https://img.ltwebstatic.com/images3_pi/2022/01/06/164143298217b45c1da8a1c07351af19a5ff72327e.webp
        hoverZoom.urlReplace(res,
            'img[src],div',
            /_thumbnail.*\./,
            '.',
            'a'
        );
        
        // sample:   https://img.ltwebstatic.com/images3_pi/2022/01/06/164143298217b45c1da8a1c07351af19a5ff72327e_thumbnail_220x293.webp
        // fullsize: https://img.ltwebstatic.com/images3_pi/2022/01/06/164143298217b45c1da8a1c07351af19a5ff72327e.webp
        hoverZoom.urlReplace(res,
            'img[src],div',
            /_thumbnail.*\./,
            '.'
        );

        callback($(res), this.name);
    }
});
