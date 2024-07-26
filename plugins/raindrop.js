var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'raindrop',
    version:'0.1',
    prepareImgLinks:function (callback) {
        const name = this.name;

        // test page: https://raindrop.io/exentrich/design-66
        // thumbnail: https://rdl.ink/render/https%3A%2F%2Fcommitmono.com%2Fsrc%2Fimg%2Fcommitmono.png?width=350&height=&ar=16:9&mode=crop&dpr=2
        //  fullsize: https://commitmono.com/src/img/commitmono.png?width=350&height=&ar=16:9&mode=crop&dpr=2

        const reFind = /https:\/\/rdl.ink\/render\/(.*)/;
        const reReplace = '$1';

        function displayImg(link, source) {
            const src = hoverZoom.getBiggestSrcFromSrcset(source.srcset);

            let fullsizeUrl = src.replace(reFind, reReplace);
            fullsizeUrl = unescape(fullsizeUrl);
            link.addClass('hoverZoomLink');
            link.data().hoverZoomSrc = [fullsizeUrl];
            // Image is displayed iff the cursor is still over the image
            if (link.data().hoverZoomMouseOver) {
                hoverZoom.displayPicFromElement(link);
            }
        }

        function isMousePointerOverItem(x, y, item) {
            if(x < $(item).offset().left) return false;
            if(x > $(item).offset().left + $(item).width()) return false;
            if(y < $(item).offset().top) return false;
            if(y > $(item).offset().top + $(item).height()) return false;
            return true;
        }

        $('article a').on('mousemove', function() {
            const link = $(this);

            const img = link.siblings().find('img');
            if (img.length === 0) return;
            // remove downscaled img
            img.data().hoverZoomSrc = [];

            // find source relative to img
            const source = link.siblings().find('picture source[srcset]')[0];
            if (source === undefined) return;

            // check if mouse pointer is over img
            let x = event.pageX;
            let y = event.pageY;
            if (isMousePointerOverItem(x, y, img)) {
                if (link.data().hoverZoomMouseOver) return;
                link.data().hoverZoomMouseOver = true;
                displayImg(link, source);
            } else {
                hoverZoom.emptyHoverZoomViewer(true);
            }
        }).on('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

    }
});
