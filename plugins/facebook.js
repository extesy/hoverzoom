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

        $('img[src*="fbcdn"]:not(.spotlight), img[src*="fbexternal"], [style*="fbcdn"]:not([data-reactid]), [style*="fbexternal"]').each(function () {
            var img = $(this),
                link = img.parents('a'),
                data = link.data();
            if (!data || data.hoverZoomSrc || link.hasClass('UFICommentLink') || link.hasClass('messagesContent') || link.attr('href').indexOf('notif') != -1) return;

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
                //src = src.replace(/[a-z]\d+\.(facebook\.com|sphotos\.ak\.fbcdn\.net)\//, 'fbcdn-sphotos-a.akamaihd.net/').replace(/\/[a-z]\d+(\.\d+)+\//, '/').replace(/\/[a-z]\d+x\d+\//, '/').replace(/_[sqta]\./, '_n.').replace(/\/[sqta](\d)/, '/n$1');
                var reg = src.match(/\d+_(\d+)_\d+/);
                if (reg) {
                    src = 'https://www.facebook.com/photo/download/?fbid=' + reg[1];
                }
            }

            data.hoverZoomSrc = [src];
            //if (origSrc != src || (this.style.top && parseInt(this.style.top) < 0)) {
            //     img.addClass('hoverZoomLink');
            //
            //     var caption = getTooltip(img.parents('a:eq(0)'));
            //     if (caption) {
            //         data.hoverZoomCaption = caption;
            //     }
            //}
            link.addClass('hoverZoomLink');
        });

        //^(facebook\.com)(/)(?:photo(?:/download/|\.php)\?fbid=|[^/]+/photos/(?:[a-z]+\.[^/]+/)?)(\d+).*
        //^((?:fbcdn|s?(?:content|(?:igcdn-)?photos|origincache))[^/]+\.(?:net|com)/h?(?:p(rofile|hotos))-[-\da-z]+/)(?:[^\d]+[^/]+/)*((?:\d+_+)+)[asqtno]([.\d](?!mp[34])[^?#]+).*
        //if($[1].indexOf('instagram.')>-1||$[1].indexOf('igcdn-photos')>-1) return $[1]+$[3]+'n'+$[4];
        //return window.location.hostname.slice(-13)=='.facebook.com' && (document.evaluate('./ancestor::div[contains(@class, "stageWrapper")]', this.node, null, 9, null).singleNodeValue || this.node.matches('.UFICommentContent>div[data-testid]')) ? '' : 'https://www.facebook.com/photo/download/?fbid=' + ($[3].indexOf('_')>0?$[3].match(/_(\d+)/)[1]:$[3])

        //^(?:(?:(?:fbexternal-[a-z]\.akamaihd|(?:s-|fb)?external[-a-z\d]*\.[a-z]{2}\.fbcdn|platform\.ak\.fbcdn)\.net|(l)\.facebook\.com)/(?:safe_image|www/app_full_proxy|l)\.php|images\d-focus-opensocial\.googleusercontent\.com/gadgets/proxy|cdn\d+\.so\.cl/handlers/thumbnail)\?(?:[^&]+&)*?(?:u(?:rl)?|src)=(http[^&]+).*
        //var u=decodeURIComponent($[2].replace(/\+/g,' ')), n=this.find({href: u})
        //this.node.IMGS_fbp=u
        //return n&&typeof n!='number'||n===null? (Array.isArray(n) ? n.join('\n') : n) : ($[1]?'':u)

        function fetchPhoto(link, attr) {
            var regex = /fbid=(\d+).*/, matches = regex.exec(link.attr(attr)), fbid = matches.length > 1 ? matches[1] : '';
            if (fbid) {
                hoverZoom.prepareFromDocument(link, 'https://mbasic.facebook.com/photo.php?fbid=' + fbid, function(doc) {
                    var links = document.querySelectorAll('a.hoverZoomLink[href*="'+fbid+'"]');
                    return links.length > 0 ? links[links.length-1].getAttribute('data-ploi') : false;
                });
            } else {
                var url = link.attr(attr).replace('photo.php', 'photo/download/');
                link.data().hoverZoomSrc = [url];
                link.addClass('hoverZoomLink');
            }
        }

        $('a[href*="/photo.php"]').one('mouseover', function () {
            var link = $(this);
            fetchPhoto(link, 'href');
        });

        $('a[ajaxify*="&fbid="]').one('mouseover', function () {
            var link = $(this);
            fetchPhoto(link, 'ajaxify');
        });

        $('a[ajaxify*="src="]:not(.coverWrap)').one('mouseover', function () {
            var link = $(this),
                data = link.data();
            if (data.hoverZoomSrc) return;

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
