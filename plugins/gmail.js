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
