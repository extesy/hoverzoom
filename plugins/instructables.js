var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Instructables',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];

        //url sample:
        //https://content.instructables.com/FIU/8ERO/K8CH5ZJM/FIU8EROK8CH5ZJM.LARGE.jpg?auto=webp&frame=1&width=384&height=1024&fit=bounds -> https://content.instructables.com/FIU/8ERO/K8CH5ZJM/FIU8EROK8CH5ZJM.jpg
        //https://cdn.instructables.com/ORIG/FLZ/S0HR/JZJ0TDDE/FLZS0HRJZJ0TDDE.jpg?crop=1%3A1&width=48 -> https://cdn.instructables.com/ORIG/FLZ/S0HR/JZJ0TDDE/FLZS0HRJZJ0TDDE.jpg

        // deal with lazy-loading using data-src
        $('img[src], img[data-src]').each(function() {

            var link = $(this);
            link = $(link);

            var re = /(((?:.*?)(?:\/[A-Z\d]+){1,}\.).*?(bmp|gifv?|jpe?g|png|svg|webp)).*/
            var m;

            if (this.dataset.src) {
                m = this.dataset.src.match(re);
            }

            if (m == undefined && this.src) {
                m = this.src.match(re);
            }

            if (m) {
                var backupUrl = m[1]; // original url without resize, to be tried iff fullsizeUrl does not exist
                var fullsizeUrl = m[2] + m[3];
                if (fullsizeUrl != undefined) {

                    cLog('fullsizeUrl:' + fullsizeUrl);

                    if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                    if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                        link.data().hoverZoomSrc.push(fullsizeUrl);
                        link.data().hoverZoomSrc.reverse(); // 1st place
                    }

                    if (link.data().hoverZoomSrc.indexOf(backupUrl) == -1) {
                        link.data().hoverZoomSrc.push(backupUrl); // 2nd place
                    }

                    link.addClass('hoverZoomLink');
                    res.push(link);
                }
            }
        });

        callback($(res));
    }
});
