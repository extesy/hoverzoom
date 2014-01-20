// Copyright (c) 2012 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

// Very similar to google plugin

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Bing',
    version:'0.1',
    prepareImgLinks:function (callback) {
        function prepareImgLink(img) {
            var img = $(this),
                url = this.src,
                imgUrlIndex = url.indexOf('url=');
            url = url.substr(imgUrlIndex + 4);
            while (decodeURIComponent(url) != url)
                url = decodeURIComponent(url);
            img.data().hoverZoomSrc = [url];
            img.addClass('hoverZoomLink');
        }

        $('img[src*="url="]').each(prepareImgLink);
        $('#sg_hid').find('img.sg_t').load(prepareImgLink);
    }
});