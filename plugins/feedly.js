var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'feedly',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var name = this.name;

        // sample: https://lh3.googleusercontent.com/NPBVY8hsmWZV2-1MFwpigdQQARKGGI0d5db9Py6I1_QEWgMbd33tR-nhYxVvVyh8TPQqKips5Do5fvhJWxw83HL0GgjPQpaFBLHzzfng=s139
        //      -> https://lh3.googleusercontent.com/NPBVY8hsmWZV2-1MFwpigdQQARKGGI0d5db9Py6I1_QEWgMbd33tR-nhYxVvVyh8TPQqKips5Do5fvhJWxw83HL0GgjPQpaFBLHzzfng=s0

        const filter = /\.googleusercontent\.com\/|\.ggpht\.com\/|\.google\.com\//;
        const regex = /(.*?=)(.*)/;
        const patch = '$1s0';

        $('div.MagazineLayout__visual, div.CardLayout__visual').one('mouseover', function() {
            const divParent = $(this);

            if (divParent.data().hoverZoomMouseOver) return;
            divParent.data().hoverZoomMouseOver = true;

            var divChild = divParent.find('[style*=url]')[0];
            if (divChild == undefined) return;

            // extract url from style
            var backgroundImage = divChild.style.backgroundImage;
            const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            var backgroundImageUrl = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");
            if (! filter.test(backgroundImageUrl)) return;
            backgroundImageUrl = backgroundImageUrl.replace(regex, patch);

            let data = divParent.data();
            data.hoverZoomSrc = [backgroundImageUrl];
            callback(divParent, this.name);

            // Image or video is displayed iff the cursor is still over the link
            if (divParent.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(divParent, true);

        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

    }
});
