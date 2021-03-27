var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Cloudinary_a',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];

        // Cloudinary transformations reference: https://cloudinary.com/documentation/transformation_reference

        // sample: https://carsguide-res.cloudinary.com/image/upload/f_auto,fl_lossy,q_auto,t_index_thumb_320/v1/editorial/segment_review/hero_image/2021-mitsubishi-Triton-GLS-ute-white-mark-oastler-1001x565-%281%29.jpg
        //      -> https://carsguide-res.cloudinary.com/image/upload/v1/editorial/segment_review/hero_image/2021-mitsubishi-Triton-GLS-ute-white-mark-oastler-1001x565-%281%29.jpg
        //
        // sample: https://autotraderau-res.cloudinary.com/t_cg_car_size_200x150/inventory/2021-01-22/55860568821161/11673982/2008_ford_falcon_Used_1.jpg
        //      -> https://autotraderau-res.cloudinary.com/inventory/2021-01-22/55860568821161/11673982/2008_ford_falcon_Used_1.jpg
        //
        // sample: https://fiverr-res.cloudinary.com/w_iw_div_3.0,q_auto,f_auto/general_assets/categories/assets/f3/desktop_graphic_design_illustration2.jpg
        //      -> https://fiverr-res.cloudinary.com/general_assets/categories/assets/f3/desktop_graphic_design_illustration2.jpg
        //
        // sample: https://res.cloudinary.com/demo/video/upload/h_320,c_scale/c_pad,h_320,w_480,b_blurred:400:15/e_volume:mute/e_accelerate:100/cld_rubiks_guy.mp4
        //      -> https://res.cloudinary.com/demo/video/upload/cld_rubiks_guy.mp4
        //
        hoverZoom.urlReplace(res,
            'img[src*="cloudinary"],[style*="cloudinary"]',
            /(.*?)\/(?:(ar?|bo?|c|e|fl?|g|h|l|o|q|r|t|w|x|y|z)_.*?\/){1,}(.*)/,
            '$1/$3'
        );

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
