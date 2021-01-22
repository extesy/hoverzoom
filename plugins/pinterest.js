var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Pinterest',
    version: '0.3',
    prepareImgLinks: function (callback) {

        $('div[data-test-id="pinWrapper"]').one('mouseover', function() {
            var link = $(this),
                data = link.data();
            if (data.hoverZoomSrc) return;
            var img = link.find('img[srcset]');
            if (img.length === 1 || img.length === 2) {
                var srcset = img.attr('srcset').split(" ");
                link.data().hoverZoomSrc = [srcset[srcset.length - 2]];
                data.hoverZoomCaption = img.attr('alt');
                link.addClass('hoverZoomLink');
            }
        });

        var res = [];
        var patches = [ '/280x280/', '/736x/', '/originals/' ];

        // avatars
        // samples (order by size ascending)
        // https://i.pinimg.com/30x30_RS/2b/9b/ab/2b9bab890b9b5fbbb86658dd2f7dcca7.jpg
        // https://i.pinimg.com/75x75_RS/2b/9b/ab/2b9bab890b9b5fbbb86658dd2f7dcca7.jpg
        // https://i.pinimg.com/140x140_RS/2b/9b/ab/2b9bab890b9b5fbbb86658dd2f7dcca7.jpg
        // https://i.pinimg.com/280x280_RS/2b/9b/ab/2b9bab890b9b5fbbb86658dd2f7dcca7.jpg
        // https://i.pinimg.com/736x/2b/9b/ab/2b9bab890b9b5fbbb86658dd2f7dcca7.jpg
        // https://i.pinimg.com/originals/2b/9b/ab/2b9bab890b9b5fbbb86658dd2f7dcca7.jpg
        patches.forEach(patch => {
            hoverZoom.urlReplace(res,
            'img[src]',
            /\/\d+x\d+_RS\//,
            patch
            );
        });

        // imgs without srcset
        patches.forEach(patch => {
            hoverZoom.urlReplace(res,
            'img[src]:not([srcset])',
            /\/\d+x(\d+)?\//,
            patch
            );
        });

        // background imgs
        $('[style*=url]').each(function() {
            let link = $(this);
            // extract url from style
            let backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf("url") == -1) return;

            let reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            let backgroundImageUrl = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");

            patches.forEach(patch => {

                let fullsizeUrl = backgroundImageUrl.replace(/\/\d+x(\d+)?\//, patch);
                if (fullsizeUrl != backgroundImageUrl) {

                    if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                    if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                        link.data().hoverZoomSrc.unshift(fullsizeUrl);
                        res.push(link);
                    }
                }
            });
        });

        callback($(res), this.name);
    }
});
