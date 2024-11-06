var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'fetlife',

    // fetlife updated their image serving to require CSRF-style tokens to view anything
    // so now we need to load the actual picture page to get the full image URL with token to view anything
    // here's the work on it (iambic9 on fetlife if you have any questions or suggestions!)
    prepareImgLinks:function (callback) {
        const res = [];
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
            let link= this.href;
            let img = ($(this).find('img').length > 0 ? $(this) : null);

            // push the caption from the image into the link data
            img.find('img:first').data().hoverZoomCaption = img.find('img:first').attr('alt');
            img.find('img:first').attr('title', '');

            // news feed can have sometimes have 30-100 thumbnails right next to each
            // previously, sweeping the mouse over them would trigger one request per image
            // had some UI flicker issues, but also a bit of hammering to fetlife
            let delay=80;
            let timeout;
            img.on('mouseenter', function() {
                timeout = setTimeout(() => {
                        // try to flag as processed ourselves to prevent multiple loads
                        // there were sometimes multiple loads after fetlife's feed would load more content
                        if ($(this).data().prepared) return false;
                        $(this).data('prepared', true);

                        hoverZoom.prepareFromDocument($(this), link, function(doc) {
                            //jquery can't read doc as a webpage, so we have to find the image url within body.innerHTML using .match
                            let html = doc.body.innerHTML;
                            let img = html.match(/"src1x":"(https:\/\/picv2-u1000\S+)","src2x"/) || html.match(/"src1x":"(https:\/\/picv2-u500\S+)","src2x"/);
                            return img ? img[1].replaceAll('\\u0026','&') : false;
                        });
                     }, delay);   
                  }); 
            img.on('mouseexit', function() {
                    clearTimeout(timeout);
                  });
        })
        callback($(res), this.name);
    }
});
