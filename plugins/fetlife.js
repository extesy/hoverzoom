var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'fetlife',

    // fetlife updated their image serving to require CSRF-style tokens to view anything
    // so now we need to load the actual picture page to get the full image URL with token to view anything
    // here's the work on it (iambic9 on fetlife if you have any questions or suggestions!)
    prepareImgLinks:function (callback) {
        $('a[href*="/users/"]').filter(function() {

            // this class is the full-size image preview (but still has a link to the next image)
            if($(this).hasClass('fl-transparent-facade'))
                return false;

            return this.href.match(/fetlife.com\/users\/\d+\/pictures\/\d+$/);
        }).each(function(){
            var link= this.href;
            var img = ($(this).find('img').length > 0 ? $(this) : $(this).parent());

            // push the caption from the image into the link data
            $(this).data().hoverZoomCaption = img.find('img:first').attr('title');

            // actually pull the picture page when we move the mouse over this object (so we don't spam requests)
            img.one('mousemove', function() {
                hoverZoom.prepareFromDocument($(this), link, function(doc) {

                    var img = doc.getElementsByClassName('fl-picture__img')[0];

                    if (img) {
                        img.title = img.alt;
                        return img.src;
                    } else {
                        return false;
                    }
                });
            });
        })

    }
});
