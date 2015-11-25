// Copyright (c) 2014 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Bing',
    prepareImgLinks:function (callback) {
        var currSrc;

        $('a.iusc[m]').one('mousemove', function() {
            var link = $(this),
                m = JSON.parse(this.getAttribute('m'));
            url = m.imgurl;
            link.data().hoverZoomSrc = [url];
            link.data().hoverZoomCaption = this.getAttribute('t1');
            link.addClass('hoverZoomLink');
            link.mousemove(function() {
                currSrc = $(this).data().hoverZoomSrc;
            });
            // Trying to suppress default zoom effect. Maybe later.
            //var parent = link.parents('div.iuscp');
            //parent.attr('data-hovstyle', parent.attr('style'));
            //link.attr('data-hovstyle', link.attr('style'));
            //link.attr('data-nmstyle', link.attr('style'));
        });

        $('body').on('mouseenter', 'div.irhc span.center img', function() {
            var img = $(this),
                irhc = img.parents('.irhc');
            if (currSrc) {
                img.data().hoverZoomSrc = currSrc;
                img.addClass('hoverZoomLink');
                img.data().hoverZoomCaption = irhc.find('span.irhcs1').text();
            }
        });
    }
});
