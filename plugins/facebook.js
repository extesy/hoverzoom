// Copyright (c) 2014 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Facebook',
    prepareImgLinks:function (callback) {

        // Profile pictures
        //$('a img[src*="fbcdn-profile"]').each(function() {
        //    var img = $(this),
        //        link = img.parents('a'),
        //        data = link.data();
        //    if (data.hoverZoomSrc) {
        //        return;
        //    }
        //    var url = link.attr('href');
        //    url = url.replace(/.*\?u=([^&]*)&.*/, '$1').replace('%2F', '/').replace(/.*facebook\.com\//, '').replace(/.*messages\//, '').replace(/profile\.php\?id=(\d+).*/, '$1').replace(/\?.*/, '');
        //    url = 'https://graph.facebook.com/' + url + '/picture';
        //    if (url != 'photo.php') {
        //      if (options.showHighRes) {
        //          url += '?width=10000';
        //      } else {
        //          url += '?width=800';
        //      }
        //      data.hoverZoomSrc = [url];
        //      link.addClass('hoverZoomLink');
        //    }
        //});

        var res = [];
        $('img[src*="fbcdn"]:not(.spotlight), img[src*="fbexternal"], [style*="fbcdn"]:not([data-reactid]), [style*="fbexternal"]').each(function () {
            var img = $(this),
                link = img.parents('a'),
                data = link.data();
            if (!data || data.hoverZoomSrc) return;

            var src = hoverZoom.getThumbUrl(this),
                origSrc = src;
            if (src.indexOf('safe_image.php') > -1) {
                src = unescape(src.substr(src.lastIndexOf('&url=') + 5));
                if (src.indexOf('?') > -1) {
                    src = src.substr(0, src.indexOf('?'));
                }
                if (src.indexOf('&') > -1) {
                    src = src.substr(0, src.indexOf('&'));
                }
                // Picasa hosted images
                if (src.indexOf('ggpht.com') > -1 || src.indexOf('blogspot.com') > -1) {
                    src = src.replace(/\/s\d+(-c)?\//, options.showHighRes ? '/s0/' : '/s800/');
                }
                // Youtube images
                if (src.indexOf('ytimg.com') > -1) {
                    src = src.replace(/\/(\d|(hq)?default)\.jpg/, '/0.jpg');
                }
            } else {
                src = src.replace(/[a-z]\d+\.(facebook\.com|sphotos\.ak\.fbcdn\.net)\//, 'fbcdn-sphotos-a.akamaihd.net/').replace(/\/[a-z]\d+(\.\d+)+\//, '/').replace(/\/[a-z]\d+x\d+\//, '/').replace(/_[sqta]\./, '_n.').replace(/\/[sqta](\d)/, '/n$1');
            }

            data.hoverZoomSrc = [src];
            // if (origSrc != src || (this.style.top && parseInt(this.style.top) < 0)) {
            //     img.addClass('hoverZoomLink');
            //
            //     var caption = getTooltip(img.parents('a:eq(0)'));
            //     if (caption) {
            //         data.hoverZoomCaption = caption;
            //     }
            // }
            res.push(link);
        });
        callback($(res));

        $('a[ajaxify*="src="]:not(.coverWrap)').one('mouseover', function () {
            var link = $(this),
                data = link.data();
            if (data.hoverZoomSrc) {
                return;
            }
            var key, src = link.attr('ajaxify');
            if (!options.showHighRes && src.indexOf('smallsrc=') > -1)
                key = 'smallsrc=';
            else
                key = 'src=';
            src = src.substr(src.indexOf(key) + key.length);
            src = unescape(src.substr(0, src.indexOf('&')));
            data.hoverZoomSrc = [src];
            link.addClass('hoverZoomLink');
        });

        function getTooltip(link) {
            var tooltip = link.find('[title], [alt]').add(link.parent('[title], [alt]')).add(link);
            var tooltipText = tooltip.attr('title') || tooltip.attr('alt');
            if (tooltipText) {
                return tooltipText;
            }
            tooltip = link.find('.uiTooltipText:eq(0)');
            var filter = '.actorName:eq(0), .passiveName:eq(0), .ego_title:eq(0), .uiAttachmentTitle:eq(0), .UIIntentionalStory_Names:eq(0), .fsl:eq(0)';
            if (!tooltip.text()) {
                tooltip = link.parent().find(filter).eq(0);
            }
            if (!tooltip.text()) {
                tooltip = link.parent().parent().find(filter).eq(0);
            }
            while (tooltip.children().length) {
                tooltip = tooltip.children().eq(0);
            }
            if (!tooltip.text()) {
                tooltip = link.parents('.album:eq(0)').find('.desc a');
            }
            if (!tooltip.text()) {
                tooltip = link.parents('.UIObjectListing:eq(0)').find('.UIObjectListing_Title');
            }
            if (!tooltip.text()) {
                tooltip = link.parents('.UIStoryAttachment:eq(0)').find('.UIStoryAttachment_Title');
            }
            if (!tooltip.text()) {
                tooltip = link.parents('.buddyRow:eq(0)').find('.UIImageBlock_Content');
            }
            return tooltip.text();
        }
    }
});
