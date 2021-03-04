var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'picclick',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var name = this.name;

        // sample: https://www.picclickimg.com/d/l400/pict/353392392848_/Emma-Watson-Harry-Potter-74877-Authentic-Autographed.jpg
        //      -> https://www.picclickimg.com/d/w1600/pict/353392392848_/Emma-Watson-Harry-Potter-74877-Authentic-Autographed.jpg
        var reThumbPicclick = /\/l\d+\//;
        var reReplacePicclick = '/w1600/';

        // sample: https://i.ebayimg.com/00/s/NjgzWDEwMjQ=/z/oIAAAOSw2xRYhceC/$_2.JPG
        //      -> https://i.ebayimg.com/00/s/NjgzWDEwMjQ=/z/oIAAAOSw2xRYhceC/$_32.JPG
        var reThumbEbay1 = /\$_\d+/;
        var reReplaceEbay1 = '$_32';

        // sample: https://i.ebayimg.com/images/g/SDwAAOSw9vdgOLBv/s-l500.jpg
        //      -> https://i.ebayimg.com/images/g/SDwAAOSw9vdgOLBv/s-l1600.jpg
        var reThumbEbay2 = /\/s-l\d+\./;
        var reReplaceEbay2 = '/s-l1600.';

        // sample: https://images-na.ssl-images-amazon.com/images/I/71oG4Tw0LUL._SY88.jpg
        //      -> https://images-na.ssl-images-amazon.com/images/I/71oG4Tw0LUL.jpg
        var reThumbAmazon = /(.*)\/(.*?)\.([^\/]*?)\.(gif|jpe?g|png)$/;
        var reReplaceAmazon = '$1/$2.$4';

        function findFullsizeUrl(thumbUrl) {

            let fullsizeUrl = undefined;

            if (thumbUrl.includes('picclickimg')) {
                fullsizeUrl = thumbUrl.replace(reThumbPicclick, reReplacePicclick);
            }

            if (thumbUrl.includes('ebayimg')) {
                fullsizeUrl = thumbUrl.replace(reThumbEbay1, reReplaceEbay1);
                if (fullsizeUrl == thumbUrl) fullsizeUrl = thumbUrl.replace(reThumbEbay2, reReplaceEbay2);
            }

            if (thumbUrl.includes('amazon')) {
                fullsizeUrl = thumbUrl.replace(reThumbAmazon, reReplaceAmazon);
            }

            return fullsizeUrl;
        }

        // use "on" and not "one" because of images gallery
        $('img[src]').on('mouseover', function () {

            let link = $(this);
            let src = this.src;
            let fullsizeUrl = findFullsizeUrl(src);
            if (fullsizeUrl == undefined || fullsizeUrl == src) return;

            let data = link.data();

            data.hoverZoomSrc = [fullsizeUrl];

            callback(link, name);
            hoverZoom.displayPicFromElement(link);
        });

        // handle gallery
        $('a[href]').one('mouseover', function() {

            var link = $(this);
            fetchPhoto(link);
        });

        function fetchPhoto(link) {

            var imgs = link.find('img');
            if (imgs.length == 0) return;

            // extract id from href
            var id = undefined;

            // sample: https://picclick.com/Clive-Owen-Signed-8x10-auto-photo-in-224366062253.html
            //  -> id: 224366062253
            var reId = /-(\d+)\.html/
            var matchesId = link.prop('href').match(reId);
            if (matchesId) id = matchesId.length > 1 ? matchesId[1] : undefined;
            if (id == undefined) return;

            // check sessionStorage in case gallery for current id was already found
            var urls = [];
            var storedUrls = sessionStorage.getItem(id);
            if (storedUrls) storedUrls.split(',').forEach(function(i) { urls.push([i]) })
            if (urls.length) {
                link.data().hoverZoomGallerySrc = urls;
                callback(link, this.name);
            } else {
                $.ajax({type: 'GET',
                    dataType: 'text',
                    url: 'https://picclick.com/tools/getsingleitem2.php?id=' + id + '&callbackname=data',
                    success: function(response) { fillGallery(link, id, response); },
                    error: function(response) { cLog('error: ' + response); }
                });
            }
        }

        function fillGallery(link, id, response) {

            var data = response.replace('data(', '').replace(');', '').replace("'", " ");
            var urls = [];
            var PictureURL = undefined;

            try {
                var j=JSON.parse(data);
                PictureURL = j.Item.PictureURL;
            } catch (e) { cLog(e) };

            if (PictureURL == undefined) return;

            PictureURL.forEach(function(url) { urls.push([findFullsizeUrl(url)]) });

            if (urls.length == 0) return;

            // store gallery to lessen API calls
            sessionStorage.setItem(id, urls);

            link.data().hoverZoomGallerySrc = urls;
            callback(link, this.name);
        }
    }
});