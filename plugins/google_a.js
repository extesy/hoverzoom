var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'GoogleUserContent',
    version:'1.2',
    prepareImgLinks:function (callback) {

        var res = [];

        //sample url: https://lh3.googleusercontent.com/oAO8qHLtaT5JHCvojKRL0IvjoXPM1aR22eDXh17eCsCgjeCL1_A6mIIUQD19kF3kVg=w192-c-h192-fcrop64=1,00000b5cffffdde9-rw-v1
        //         -> https://lh3.googleusercontent.com/oAO8qHLtaT5JHCvojKRL0IvjoXPM1aR22eDXh17eCsCgjeCL1_A6mIIUQD19kF3kVg=s0
        var regex1 = /(.*?=)(.*)/;
        var patch1 = '$1s0';

        //sample url: https://lh3.googleusercontent.com/-pjJcqQ567-8/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuckcnEaqf2P_2Kp0ITTsXt4bzL54Ww.CMID/s32-c/
        //         -> https://lh3.googleusercontent.com/-pjJcqQ567-8/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuckcnEaqf2P_2Kp0ITTsXt4bzL54Ww.CMID/s0/
        //sample url: https://lh3.googleusercontent.com/-pjJcqQ567-8/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuckcnEaqf2P_2Kp0ITTsXt4bzL54Ww.CMID/s32-c/photo.jpg
        //         -> https://lh3.googleusercontent.com/-pjJcqQ567-8/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuckcnEaqf2P_2Kp0ITTsXt4bzL54Ww.CMID/s0/photo.jpg
        var regex2 = /(.*)\/.*\//;
        var patch2 = '$1/s0/';

        //sample url: http://geo3.ggpht.com/cbk?panoid=50XRgCiXEq6wuqYWcGQ3BQ&output=thumbnail&cb_client=search.gws-prod.gps&thumb=0&w=100&h=100&yaw=277.2657&pitch=0&thumbfov=100
        //         -> http://geo3.ggpht.com/cbk?panoid=50XRgCiXEq6wuqYWcGQ3BQ&output=thumbnail&cb_client=search.gws-prod.gps&thumb=0&w=9999&h=9999&yaw=277.2657&pitch=0&thumbfov=100
        var regex3 = /(&[hw]{1})=\d+/g;
        var patch3 = '$1=9999';

        hoverZoom.urlReplace(res,
            'img[src*=".googleusercontent.com/"], img[src*=".ggpht.com/"]',
            regex1,
            patch1
        );

        hoverZoom.urlReplace(res,
            'img[src*=".googleusercontent.com/"], img[src*=".ggpht.com/"]',
            regex2,
            patch2
        );

        hoverZoom.urlReplace(res,
            'img[src*=".googleusercontent.com/"], img[src*=".ggpht.com/"]',
            regex3,
            patch3
        );

        $('[style*=url]').each(function() {
            var link = $(this);
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf(".googleusercontent.com") == -1 && backgroundImage.indexOf(".ggpht.com") == -1) return;
            var reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            var backgroundImageUrl = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");

            $([{r:regex1, p:patch1},{r:regex2, p:patch2},{r:regex3, p:patch3}]).each(function() {

                var fullsizeUrl = backgroundImageUrl.replace(this.r, this.p);
                if (fullsizeUrl != backgroundImageUrl) {

                    if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                    if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                        link.data().hoverZoomSrc.unshift(fullsizeUrl);
                        res.push(link);
                    }
                }
            });
        });

        callback($(res), this.name);
    }
});
