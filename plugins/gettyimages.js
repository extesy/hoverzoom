var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'gettyimages.com',
    version:'0.3',
    favicon:'gettyimages.ico',
    prepareImgLinks:function (callback) {
        var res = [];

        // images & videos
        // thumbnail: https://media.gettyimages.com/id/1174602967/fr/photo/balcony-railing-reflections.jpg?s=612x612&w=0&k=20&c=UMtX7loNVSkLBSy7m85c2_F4-hjV0ARgAxJz-YcFHS4=
        //  fullsize: https://media.gettyimages.com/id/1174602967/fr/photo/balcony-railing-reflections.jpg?s=2048x2048&w=gi&k=20&c=8lF6J1oFwKVAcltfq4kBcfwNlPPkrmlkX0wB6tI5hsI=
        $('a[href]').filter(function() { return /\/([^\/]{1,})$/.test($(this).prop('href')) }).one('mouseenter', function () {

            const href = this.href;
            const link = $(this);

            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            cLog(`href: ${href}`);

            var imageId = null;
            const regexImageId = /\/([^\/]{1,})$/; // e.g: https://www.gettyimages.fr/detail/photo/church-of-st-mary-cracow-poland-image-libre-de-droits/138984718 => 138984718
            let matches = href.match(regexImageId);
            if (matches) imageId = matches[1];
            cLog(`imageId: ${imageId}`);

            // lookup sessionStorage
            const imageUrl = sessionStorage.getItem(imageId);
            const imageCaption = sessionStorage.getItem(`${imageId}_caption`);
            if (imageUrl) {
                // display image
                cLog(`image url (from sessionStorage): ${imageUrl}`);
                cLog(`image caption (from sessionStorage): ${imageCaption}`);
                link.data().hoverZoomSrc = [imageUrl];
                link.data().hoverZoomCaption = imageCaption;
                var res = [];
                res.push(link);
                callback($(res), 'gettyimages');
                // Image is displayed if the cursor is still over the link
                if (link.data().hoverZoomMouseOver)
                    hoverZoom.displayPicFromElement(link);
                return;
            }

            // image url not found in storageSession => load page to extract image url
            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:href,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},

                                        function (response) {

                                            cLog(response);
                                            // extract fullsize url from scripts
                                            const parser = new DOMParser();
                                            const doc = parser.parseFromString(response, "text/html");
                                            if (doc.scripts == undefined) return;
                                            let scripts = Array.from(doc.scripts);
                                            scripts = scripts.filter(script => /"highResCompUrl"/.test(script.text)); // image
                                            if (scripts.length != 1) {
                                                scripts = scripts.filter(script => /"filmCompUrl"/.test(script.text)); // video
                                            }
                                            if (scripts.length != 1) return;
                                            let scriptText = scripts[0].text.replaceAll('\\', '');
                                            let tokenPos = scriptText.indexOf('"highResCompUrl"');
                                            if (tokenPos == -1) {
                                                tokenPos = scriptText.indexOf('"filmCompUrl"');
                                            }
                                            let matchingBrackets = hoverZoom.matchBrackets(scriptText, tokenPos - 1, "[{");
                                            cLog(matchingBrackets);
                                            if (matchingBrackets.openPos == -1 || matchingBrackets.closePos == -1) return;
                                            let mediaText = scriptText.substring(matchingBrackets.openPos, matchingBrackets.closePos + 1);
                                            mediaText = hoverZoom.decodeUnicode(mediaText);
                                            let fullsize = undefined;
                                            let caption = undefined;
                                            try {
                                                let j = JSON.parse(mediaText);
                                                fullsize = j.highResCompUrl || j.filmCompUrl;
                                                caption = j.caption;
                                            } catch {}

                                            // fallback
                                            if (fullsize == undefined) {
                                                tokenPos = scriptText.indexOf('"HighResComp"');
                                                matchingBrackets = hoverZoom.matchBrackets(mediaText, tokenPos - 1, "[{");
                                                if (matchingBrackets.openPos == -1 || matchingBrackets.closePos == -1) return;
                                                mediaText = mediaText.substring(matchingBrackets.openPos, matchingBrackets.closePos + 1);
                                                try {
                                                    let j = JSON.parse(mediaText);
                                                    fullsize = j.HighResComp || j.FilmComp.Url;
                                                } catch {}
                                            }

                                            if (fullsize == undefined) return;

                                            // store url & caption
                                            sessionStorage.setItem(imageId, fullsize);
                                            sessionStorage.setItem(`${imageId}_caption`, caption);

                                            link.data().hoverZoomSrc = [fullsize];
                                            link.data().hoverZoomCaption = caption;
                                            var res = [];
                                            res.push(link);
                                            callback($(res), 'gettyimages');
                                            // Image is displayed if the cursor is still over the link
                                            if (link.data().hoverZoomMouseOver)
                                                hoverZoom.displayPicFromElement(link);
                                        });

        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        callback($(res), this.name);
    }
});