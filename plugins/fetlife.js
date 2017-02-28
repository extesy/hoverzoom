var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'fetlife',

    // fetlife updated their image serving to require CSRF-style tokens to view anything
    // so now we need to load the actual picture page to get the full image URL with token to view anything
    // here's the work on it (iambic9 on fetlife if you have any questions or suggestions!)
    prepareImgLinks:function (callback) {
        var res = [];
        $('a[href*="/users/"]').filter(function() {

            // this class is the full-size image preview (but still has a link to the next image)
            if($(this).hasClass('fl-transparent-facade'))
                return false;

            // already processed
            if($(this).hasClass('hoverZoomLink'))
                return false;

            // limit ourselves to actual image thumbnails, too many text links around
            if ($(this).find("img").length == 0)
                return false;

            return this.href.match(/fetlife.com\/users\/\d+\/pictures\/\d+$/);
        }).each(function(){
            var link= this.href;
            var img = ($(this).find('img').length > 0 ? $(this) : null);

            // push the caption from the image into the link data
            img.find('img:first').data().hoverZoomCaption = img.find('img:first').attr('alt');
            img.find('img:first').attr('title', '');

            // news feed can have sometimes have 30-100 thumbnails right next to each
            // previously, sweeping the mouse over them would trigger one request per image
            // had some UI flicker issues, but also a bit of hammering to fetlife
            var delay=80, timeout;
            img.find('img:first').hover(
                  function() {
                    timeout = setTimeout(() => {

                        // try to flag as processed ourselves to prevent multiple loads
                        // there were sometimes multiple loads after fetlife's feed would load more content
                        if ($(this).data().prepared) return false;
                        $(this).data('prepared', true);

                        hoverZoom.prepareFromDocument($(this), link, function(doc) {
                            var img = doc.getElementsByClassName('fl-picture__img')[0];
                            return img ? img.src : false;
                        });
                     }, delay);
                    
                  }, function() {
                    clearTimeout(timeout );
                  }
                );
        })
        callback($(res));
    }
});
