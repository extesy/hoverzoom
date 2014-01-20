// Copyright (c) 2013 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Gmail',
    prepareImgLinks:function (callback) {
        $('span[download_url]').each(function () {
            var url = this.getAttribute('download_url');
            if (!url || url.substr(0,6) != 'image/') { return; }
            url = url.substr(url.indexOf(':http') + 1);
            this.classList.add('hoverZoomLink');
            $(this).data().hoverZoomSrc = [url];
        });
    }
});
