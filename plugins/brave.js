var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'brave',
    version: '1.0',
    prepareImgLinks: function(callback) {
        const pluginName = this.name;

        // sample: https://imgs.search.brave.com/-X9Un7ROC7nDmrcHTiYUf-WyLXXs36rD7Cy-31tlE2k/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1waG90/by9hdXN0cmFsaWFu/LXNoZXBoZXJkLWRv/Z18xMDE1Mzg0LTE2/MDM2NC5qcGc_c2l6/ZT02MjYmZXh0PWpw/Zw
        $('img[src]').on('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;
            const src = this.src;

            var HZbrave = sessionStorage.getItem('HZbrave');
            const jsObj = hoverZoom.strToJavascriptObj(HZbrave);

            var o = undefined;
            try {
                o = jsObj?.find(d => d.thumbnail.src == src);
            } catch {}
            if (o) {
                const fullsize = o.thumbnail.original || o.thumbnail.src;
                const caption = o.title;
                link.data().hoverZoomSrc = [fullsize];
                link.data().hoverZoomCaption = caption;
                var res = [];
                res.push(link);
                callback($(res), pluginName);
                // Image is displayed if the cursor is still over the link
                if (link.data().hoverZoomMouseOver)
                    hoverZoom.displayPicFromElement(link);
            } else {
                chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:window.location.href},
                                        function (response) {
                                            if (response == null) { return; }

                                            const parser = new DOMParser();
                                            const doc = parser.parseFromString(response, "text/html");

                                            if (doc.scripts == undefined) return;
                                            let scripts = Array.from(doc.scripts);
                                            scripts = scripts.filter(script => /results:\[/.test(script.text));
                                            if (scripts.length != 1) return;
                                            const data =  scripts[0].text;
                                            const index1 = data.indexOf('results:[') + 8; // open [
                                            const index2 = hoverZoom.matchBracket(data, index1); // close ]
                                            const usefulData = data.substring(index1, index2 + 1);

                                            // store for reuse
                                            sessionStorage.setItem("HZbrave", usefulData);

                                            try {
                                                const jsObj = hoverZoom.strToJavascriptObj(usefulData);
                                                var o = undefined;
                                                try {
                                                    o = jsObj?.find(d => d.thumbnail.src == src);
                                                } catch {}
                                                if (o == undefined) { return; }
                                                const fullsize = o.thumbnail.original || o.thumbnail.src;
                                                const caption = o.title;
                                                link.data().hoverZoomSrc = [fullsize];
                                                link.data().hoverZoomCaption = caption;
                                                var res = [];
                                                res.push(link);
                                                callback($(res), pluginName);
                                                // Image is displayed if the cursor is still over the link
                                                if (link.data().hoverZoomMouseOver)
                                                    hoverZoom.displayPicFromElement(link);

                                            } catch {}
                                        });
            }
        }).on('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

    }
});
