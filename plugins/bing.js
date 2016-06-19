var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Bing',
    prepareImgLinks:function (callback) {
        var currSrc;

        $('a[m*="imgurl"]').one('mousemove', function() {
            var link = $(this),
                m = this.getAttribute('m'),
                m1 = m.replace(/([{|,])([a-zA-Z0-9]+)\:/g,'$1"$2":'),
                m2 = $.parseJSON(m1);
            url = m2.imgurl;
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

        $('body').on('mouseenter', 'div.irhc span.center a img', function() {
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
