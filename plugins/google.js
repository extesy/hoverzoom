var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Google',
    version:'2.0',
    prepareImgLinks:function (callback) {

        // Google+ full page viewer
        if (location.search.indexOf('pid=') > -1) {
            return;
        }

        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*=".googleusercontent.com/"], img[src*=".ggpht.com/"]',
            /(\/|=)(w\d{2,}-h\d{2,}|[hws]\d{2,})(-[npckorw]+)*(\/|$)/,
            options.showHighRes ? '$1s0$4' : '$1s800$4'
        );
        /*hoverZoom.urlReplace(res,
            'img[src*=".googleusercontent.com/"], img[src*=".ggpht.com/"]',
            /(\/|=)(w\d{2,}-h\d{2,}|[hws]\d{2,})(-[npcko]+)*(\/|$)/,
            options.showHighRes ? '$1s0$4' : '$1s800$4'
        );*/
        hoverZoom.urlReplace(res,
            'a[href*="imgurl="]',
            /.*imgurl=([^&]+).*/,
            '$1'
        );

        // Extract direct links to images using document.scripts data (no api call(s) needed)
        // Mostly inspired from chocolatebot's userscript : Google DWIMages 
        // You can find it here: https://greasyfork.org/fr/scripts/29420-google-dwimages
        // Data structure:
        // "data-tbnid",["thumbnail url",h,w],["image url we are looking for",h,w]
        // for instance:
        // "zEevaU3QYshNNM",["https://encrypted-tbn0.gstatic.com/images?q\u003dtbn%3AANd9GcS2TiJ5s8_9L8dtcfU8uhN7eBaJXUPU8Macpmkjs-HZDAOdiJtz\u0026usqp\u003dCAU",225,225],["https://www.savethedeco.com/12079-large_default/ballon-tete-de-singe-87-cm.jpg",800,800]
        function parseScripts() {
            scripts = Array.from(document.scripts);
            callbacks = scripts.filter(script => /^AF_initDataCallback\b/.test(script.text));
            dataFromScripts = callbacks.pop().text;
        };

        parseScripts();

        // Loop through thumbnails and when possible add hrefs = images urls found in scripts
        $('div[data-tbnid]').each(function() {

           // tbnid = thumbnail id referenced in scripts'data
           tbnid = '"' + this.dataset.tbnid + '",';

           // lookup data extracted from scripts
           if (dataFromScripts.indexOf(tbnid) == -1) { return; }

           firstquoteIndex = dataFromScripts.indexOf('[', dataFromScripts.indexOf('[', dataFromScripts.indexOf(tbnid)) + 1) + 1;
           lastquoteIndex = dataFromScripts.indexOf('"', firstquoteIndex + 1);
           url = dataFromScripts.substring(firstquoteIndex + 1, lastquoteIndex);

           if (url == undefined || url == "") { return; }

           links = $(this).find('a');
           if (links.length > 0) {
               // update image link (1st link) with url
               imageLink = links.eq(0);
               imageLink.attr('href', url);
           }
        });

        callback($(res));

        // remove this when old google image is retired
        function prepareImgLink(img) {
            var img = $(this);
            if (this.id != 'rg_hi' && img.data().hoverZoomSrc) { return; }
            var link = this.parentNode,
                href = link.href,
                imgUrlIndex = href.indexOf('imgurl=');
            href = href.substring(imgUrlIndex + 7, href.indexOf('&', imgUrlIndex));
            try {
                while (decodeURIComponent(href) != href)
                    href = decodeURIComponent(href);
            } catch (e) {
            }
            link.classList.remove('hoverZoomLink');
            img.data().hoverZoomSrc = [href];
            img.addClass('hoverZoomLink');
        }
        $('a[href*="imgurl="] > img').each(prepareImgLink);
        $('.rg_ic').on('load',prepareImgLink);

    }
});
