var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'duckduckgo',
    version:'1.3',
    favicon:'duckduckgo.ico',
    prepareImgLinks:function (callback) {
        const pluginName = this.name;
        const res = [];

        // thumbnail: https://external-content.duckduckgo.com/iu/?u=https://tse1.mm.bing.net/th/id/OIP.iP8z8ieV_-ZpxUfqxRLmIQHaHa?pid=Api&f=1&ipt=b4be1de5a5fc824b05c2d37026055985c3930fa225a99e9a010d0f957175bab9&ipo=images
        //     => id: OIP.iP8z8ieV_-ZpxUfqxRLmIQHaHa
        // thumbnail: https://external-content.duckduckgo.com/iu/?u=https://tse2.mm.bing.net/th?id=OIP.wPTeMr0k1hMU--K5rM_0FAHaE7&pid=Api&f=1&ipt=e747e5a6ff913cff4bd304069ba7934f27642348803332da84b178647a425f48&ipo=images
        //     => id: OIP.wPTeMr0k1hMU--K5rM_0FAHaE7

        $('img[src], [style*=url]').one('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            // extract src from link, it might be an image or a background-image
            let src = '';

            if (this.src != undefined) {
                src = this.src;
            } else {
                let backgroundImage = this.style.backgroundImage;
                reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                src = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,""); // remove leading & trailing quotes
            }

            src = decodeURIComponent(src);
            let m = src.match(/.*\?u=(.*\/th[\?\/][^&\?]{1,})/);
            if (m == null) return;
            const thumbnail = m[1];
            m = thumbnail.match(/.*[\/\?]id[\/=](.*)/);
            if (m == null) return;
            const id = m[1];

            // search fetched data for id
            try {
                let HZduckduckgoFetch = sessionStorage.getItem('HZduckduckgoFetch');
                if (HZduckduckgoFetch.indexOf(id) == -1) return;
                const j = JSON.parse(HZduckduckgoFetch);
                const values = hoverZoom.getValuesInJsonObject(j, id, false, true, true); // look for a partial match & stop after 1st match
                if (values.length == 0) return;
                const o = hoverZoom.getJsonObjectFromPath(j, values[0].path.substring(0, values[0].path.lastIndexOf('[')));
                if (o.image) {
                    link.data().hoverZoomSrc = [o.image];
                    if (o.title) link.data().hoverZoomCaption = o.title;
                    if (o.url) link.data().url = o.url;
                    callback(link, pluginName);
                    // Image is displayed iff cursor is still over the image
                    if (link.data().hoverZoomMouseOver)
                        hoverZoom.displayPicFromElement(link);
                }
            } catch {}
        }).one('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        callback($(res), pluginName);
    }
});
