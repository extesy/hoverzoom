var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'GoogleUserContent',
    version:'1.4',
    favicon:'google.svg',
    prepareImgLinks:function (callback) {

        var res = [];

        // sample url: https://lh3.googleusercontent.com/oAO8qHLtaT5JHCvojKRL0IvjoXPM1aR22eDXh17eCsCgjeCL1_A6mIIUQD19kF3kVg=w192-c-h192-fcrop64=1,00000b5cffffdde9-rw-v1
        //          -> https://lh3.googleusercontent.com/oAO8qHLtaT5JHCvojKRL0IvjoXPM1aR22eDXh17eCsCgjeCL1_A6mIIUQD19kF3kVg=s0
        // sample url: https://lh3.googleusercontent.com/pw/ADCreHcI1RBxCxwnQVdGcmKulmomjxdamT0gw5vB8c5K8fwrvWe_ISlUbK8BqwPsHopTeOylrgqM1QPZtxGcUOg8rRJPr7Mcm789QH-moZtK-6Vvw-JxxTL3Mt8P4bzwjaJ4eH528xsJRLMlfbgjztUNrXlH8lAgl2xtTKM3JsftLAk9G8r4ppKlcJlW_0MDaAsregg_JSlwkowkO7TjqYLf9e4vykKc5rhO1jgxXGQwFL629ex5Tg4K-KVIyayq27mZDT_dT8I6465_hOSfBEaKqqQKJIMwZUBluSV0QB6ivLbomakSCzd1u3nMfym_-xmqjCzZcsEQ3beUKE1NKEqzUJXpH6oHvPGa1DX5HcOwRfM9qNOVy3Zy5VvTBr2bc92m4Dmg0InMo2Ndmc0ul4OlAwjtZNPcgLc_sPhd__mkEmc1oXgTUvmUgZ1OWpUPIeDyfzXMMMvCEB8oJkBCYVvtEO_DnkjvGnoBlWl07JC0iJAPSACR3LWlbsmkEa37gqsFEyaMLkSvvKQyhsI-0ry6E1kDJYKT8DgZZPIWNchHJZtRlSzhGWIhryDXszfOhbkyACeV6xasMP283jIfs50ApKEa-9GyjBc25fmFvBlpJKZEFU5EvbSjxDE9XDFUAnln5iW_XtHPr-ga7LqPDY2JvgJlrWkHIiGiCFc6wkmD0E2p-YmUTHPGw_TTRyIit-jYpvE7QsSLFyzBbFwyY1cDrqNALGWKoC9jxOk5qPBP3uy_nuwdnYdnCr_7kUpF-nCH4giE-r-oCAMyor7GgHIuAHzEq4AMf0KXIcogHTzRKLgC7dUGVCLqixqj1DiMJaGApKIQeWsdGQUatFo-yq0u5wbqXy38ueovhdyzyCQSuc7Dfyc-CAIgdGRwBYXz8r0LPND7DAzhUIWuD3Y011MvVEYH_aqwdgV3BYJXqSfQ1ETqGHrs-yCpFKwRgJ_T=s24-p-k-rw-no
        //          -> https://lh3.googleusercontent.com/pw/ADCreHcI1RBxCxwnQVdGcmKulmomjxdamT0gw5vB8c5K8fwrvWe_ISlUbK8BqwPsHopTeOylrgqM1QPZtxGcUOg8rRJPr7Mcm789QH-moZtK-6Vvw-JxxTL3Mt8P4bzwjaJ4eH528xsJRLMlfbgjztUNrXlH8lAgl2xtTKM3JsftLAk9G8r4ppKlcJlW_0MDaAsregg_JSlwkowkO7TjqYLf9e4vykKc5rhO1jgxXGQwFL629ex5Tg4K-KVIyayq27mZDT_dT8I6465_hOSfBEaKqqQKJIMwZUBluSV0QB6ivLbomakSCzd1u3nMfym_-xmqjCzZcsEQ3beUKE1NKEqzUJXpH6oHvPGa1DX5HcOwRfM9qNOVy3Zy5VvTBr2bc92m4Dmg0InMo2Ndmc0ul4OlAwjtZNPcgLc_sPhd__mkEmc1oXgTUvmUgZ1OWpUPIeDyfzXMMMvCEB8oJkBCYVvtEO_DnkjvGnoBlWl07JC0iJAPSACR3LWlbsmkEa37gqsFEyaMLkSvvKQyhsI-0ry6E1kDJYKT8DgZZPIWNchHJZtRlSzhGWIhryDXszfOhbkyACeV6xasMP283jIfs50ApKEa-9GyjBc25fmFvBlpJKZEFU5EvbSjxDE9XDFUAnln5iW_XtHPr-ga7LqPDY2JvgJlrWkHIiGiCFc6wkmD0E2p-YmUTHPGw_TTRyIit-jYpvE7QsSLFyzBbFwyY1cDrqNALGWKoC9jxOk5qPBP3uy_nuwdnYdnCr_7kUpF-nCH4giE-r-oCAMyor7GgHIuAHzEq4AMf0KXIcogHTzRKLgC7dUGVCLqixqj1DiMJaGApKIQeWsdGQUatFo-yq0u5wbqXy38ueovhdyzyCQSuc7Dfyc-CAIgdGRwBYXz8r0LPND7DAzhUIWuD3Y011MvVEYH_aqwdgV3BYJXqSfQ1ETqGHrs-yCpFKwRgJ_T=s0
        // sample url: https://photos.fife.usercontent.google.com/pw/ADCreHcD7ObiJaK7g3BFJ7N2YjAiwe04G9997AjTzVz1LLWimTr_nGIDHcFOnA=w165-h220-no?authuser=0
        //          -> https://photos.fife.usercontent.google.com/pw/ADCreHcD7ObiJaK7g3BFJ7N2YjAiwe04G9997AjTzVz1LLWimTr_nGIDHcFOnA=s0
        // sample url: https://yt3.ggpht.com/ytc/AAUvwngFPLZ-IsxaXxKW1fFJ1aI34VnPWiCCH8kKRauw=s68-c-k-c0x00ffffff-no-rj
        //          -> https://yt3.ggpht.com/ytc/AAUvwngFPLZ-IsxaXxKW1fFJ1aI34VnPWiCCH8kKRauw=s0
        const filter1 = /\.googleusercontent\.com\/|\.ggpht\.com\/|\.google\.com\//;
        const regex1 = /(.*?=)(.*)/;
        const patch1 = '$1s0';

        // sample url: https://lh3.googleusercontent.com/-pjJcqQ567-8/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuckcnEaqf2P_2Kp0ITTsXt4bzL54Ww.CMID/s32-c/
        //          -> https://lh3.googleusercontent.com/-pjJcqQ567-8/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuckcnEaqf2P_2Kp0ITTsXt4bzL54Ww.CMID/s0/
        // sample url: https://lh3.googleusercontent.com/-pjJcqQ567-8/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuckcnEaqf2P_2Kp0ITTsXt4bzL54Ww.CMID/s32-c/photo.jpg
        //          -> https://lh3.googleusercontent.com/-pjJcqQ567-8/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuckcnEaqf2P_2Kp0ITTsXt4bzL54Ww.CMID/s0/photo.jpg
        const filter2 = /(?=.*\.googleusercontent\.com\/)(?!.*=)/;
        const regex2 = /(.*)\/.*\//;
        const patch2 = '$1/s0/';

        // sample url: https://lh5.googleusercontent.com/-qnv3HcOTfdU/AAAAAAAAAAI/AAAAAAAAECY/LDjaha4DLVQ/photo.jpg?sz=64
        //          -> https://lh5.googleusercontent.com/-qnv3HcOTfdU/AAAAAAAAAAI/AAAAAAAAECY/LDjaha4DLVQ/photo.jpg
        const filter3 = /\.googleusercontent\.com\//;
        const regex3 = /(.*photo.jpg)\?.*/;
        const patch3 = '$1';

        // sample url: http://geo3.ggpht.com/cbk?panoid=50XRgCiXEq6wuqYWcGQ3BQ&output=thumbnail&cb_client=search.gws-prod.gps&thumb=0&w=100&h=100&yaw=277.2657&pitch=0&thumbfov=100
        //          -> http://geo3.ggpht.com/cbk?panoid=50XRgCiXEq6wuqYWcGQ3BQ&output=thumbnail&cb_client=search.gws-prod.gps&thumb=0&w=9999&h=9999&yaw=277.2657&pitch=0&thumbfov=100
        const filter4 = /\.googleusercontent\.com\/|\.ggpht\.com\//;
        const regex4 = /(&[hw]{1})=\d+/g;
        const patch4 = '$1=9999';


        // images

        hoverZoom.urlReplace(res,
            'img[src*=".googleusercontent.com/"], img[src*=".ggpht.com/"], img[src*=".google.com/"]',
            regex1,
            patch1
        );

        hoverZoom.urlReplace(res,
            'img[src*=".googleusercontent.com/"]:not([src*="="])',
            regex2,
            patch2
        );

        hoverZoom.urlReplace(res,
            'img[src*=".googleusercontent.com/"]',
            regex3,
            patch3
        );

        hoverZoom.urlReplace(res,
            'img[src*=".googleusercontent.com/"], img[src*=".ggpht.com/"]',
            regex4,
            patch4
        );

        // background images (e.g: divs)

        $('[style*=url]').each(function() {
            var link = $(this);
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            var backgroundImageUrl = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");

            $([{f:filter1, r:regex1, p:patch1}, {f:filter2, r:regex2, p:patch2}, {f:filter3, r:regex3, p:patch3}, {f:filter4, r:regex4, p:patch4}]).each(function() {
                if (this.f.test(backgroundImageUrl)) {
                    var fullsizeUrl = backgroundImageUrl.replace(this.r, this.p);
                    if (fullsizeUrl != backgroundImageUrl) {

                        if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                        if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                            link.data().hoverZoomSrc.unshift(fullsizeUrl);
                            res.push(link);
                        }
                    }
                }
            });
        });

        callback($(res), this.name);
    }
});
