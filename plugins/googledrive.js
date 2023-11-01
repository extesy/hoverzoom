var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'googledrive',
    version:'1.0',
    prepareImgLinks:function (callback) {
        const name = this.name;
        var res = [];


        $('div[data-id]').one('mouseover', function() {

            link = $(this);

            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const imgId = $(this).data().id;

            const fullsize = `https://lh3.google.com/u/0/d/${imgId}=s0`;

            link.data().hoverZoomSrc = [fullsize];
            callback(link, name);
            hoverZoom.displayPicFromElement(link);

        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

    }
});