// Copyright (c) 2014 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Bing',
    prepareImgLinks:function (callback) {
    
        var currSrc;
    
        $('a.dv_i[m]').one('mousemove', function() {
            var link = $(this),
                url = this.getAttribute('m');
            url = url.substr(url.indexOf('imgurl:"') + 8);
            url = url.substr(0, url.indexOf('"'));
            link.data().hoverZoomSrc = [url];
            link.data().hoverZoomCaption = this.getAttribute('t1');
            link.addClass('hoverZoomLink');
            link.mousemove(function() {
                currSrc = $(this).data().hoverZoomSrc;
            });
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