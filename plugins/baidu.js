var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Baidu',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];

        // Image search
        $('a[href]').each(function () {
            var link = $(this);
            var src = link.attr('onclick');
            if (src && src.indexOf('http') != -1) {
                src = src.toString();
                src = src.substring(src.indexOf('http'), src.lastIndexOf("',"));
                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(src) == -1) {
                    link.data().hoverZoomSrc.unshift(src);
                    res.push(link);
                }
            }
        });

        // Encyclopedia, Space, etc
        hoverZoom.urlReplace(res,
            'a img[src*="/abpic/"], a img[src*="/mpic/"]',
            /abpic|mpic/,
            'pic'
        );

        // News
        $('a img[src*="/it/u=http"]').each(function () {
            var link = $(this);
            var src = link.attr('src');
            if (src) {
                src = src.replace(/.*\/it\/u=(http.*)&.*/, '$1');
                src = unescape(src);
                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(src) == -1) {
                    link.data().hoverZoomSrc.unshift(src);
                    res.push(link);
                }
            }
        });

        // Maps
        var reMap = /src=(.*)/

        $('img[src]').each(function () {

            let link = $(this);
            let src = link.prop('src');
            let m = src.match(reMap);
            if (m == null) return;
            let fullsizeUrl = decodeURIComponent(m[1]);
            if (fullsizeUrl != src) {
                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    res.push(link);
                }
            }
        });

        $('[style*=url]').each(function() {
            let link = $(this);
            // extract url from style
            let backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf("url") == -1) return;

            let reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            let backgroundImageUrl = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");

            let m = backgroundImageUrl.match(reMap);
            if (m == null) return;
            let fullsizeUrl = decodeURIComponent(m[1]);
            if (fullsizeUrl != backgroundImageUrl) {
                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    res.push(link);
                }
            }
        });

        $('a[href]').each(function () {
            let link = $(this);
            let href = link.prop('href');
            try {
                href = decodeURIComponent(href);
            } catch { return; }

            let src = href.replace(/.*src=(.*?)&.*/, '$1');
            if (src == href) return;
            try {
                src = decodeURIComponent(src);
            } catch { return; }

            src = src.replace('http:', 'https:')

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(src) == -1) {
                link.data().hoverZoomSrc.unshift(src);
                res.push(link);
            }

            // update underlying img too
            let img = link.find('img');
            if (img.length != 1) return;
            img = $(img[0]);
            if (img.data().hoverZoomSrc == undefined) { img.data().hoverZoomSrc = [] }
            if (img.data().hoverZoomSrc.indexOf(src) == -1) {
                img.data().hoverZoomSrc.unshift(src);
                res.push(img);
            }
        });

        callback($(res), this.name);
    }
});