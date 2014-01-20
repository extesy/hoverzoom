// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

// This was a tricky one.
// Since the URLs of full size photos couldn't be guessed from the page source,
// I had to go fetch them from the linked RSS file.

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Windows Live',
    version:'0.2',
    prepareImgLinks:function (callback) {

        // RSS file URL
        var rssUrl = $(document.head).find('link[type="application/rss+xml"]').attr('href');
        if (!rssUrl) {
            return;
        }

        // Load RSS through an ajax request
        $.ajax({
            url:rssUrl,
            dataType:'xml',
            success:function (data, status, xhr) {
                var res = [];
                // The RSS file is loaded as an XmlDocument
                var rss = $(xhr.responseXML.documentElement);
                rss.find('item').each(function () {
                    var _this = $(this);

                    // Link to the page that displays the photo
                    var rssLinkUrl = _this.children('link').text();
                    if (!rssLinkUrl) {
                        return;
                    }

                    // img tag that displays the photo in RSS readers
                    var rssImg = _this.children('description').text();
                    if (!rssImg) {
                        return;
                    }

                    // src attribute of the img tag
                    var src = rssImg.substr(rssImg.indexOf('http'));
                    if (!src) {
                        return;
                    }
                    src = src.substr(0, src.indexOf('"'));

                    // Unescape HTML entities
                    src = src.replace('&amp;', '&').replace(/&#(\d+);/g, function (s, p1) {
                        return '%' + parseInt(p1).toString(16);
                    });

                    // Unescape URL characters
                    src = unescape(src);

                    // Since the call is asynchronous, the list of links can't be returned by the prepareImgLinks function,
                    // so all the processing is done here
                    var link = $('a[href="' + rssLinkUrl + '"]');
                    link.data().hoverZoomSrc = [src, src];
                    link.addClass('hoverZoomLink');
                    res.push(link);
                });
                callback($(res));
            }
        });
    }
});