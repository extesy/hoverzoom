var hoverZoomPlugins = hoverZoomPlugins || [],
    debug = false;

function cLog(msg) {
    if (debug) {
        console.log(msg);
    }
}

var hoverZoom = {

    options:{},
    currentLink:null,
    hzImg:null,
    hzImgCss:{
        'border':'1px solid #e3e3e3',
        'line-height':0,
        'overflow':'hidden',
        'padding':'2px',
        'margin':0,
        'position':'absolute',
        'z-index':2147483647,
        'border-radius':'3px',
        'background':'-webkit-gradient(linear, left top, right bottom, from(#ffffff), to(#ededed), color-stop(0.5, #ffffff))',
        '-webkit-box-shadow':'3px 3px 6px rgba(0,0,0,0.46)'
    },
    imgLoading:null,
    pageGenerator:'',

    loadHoverZoom:function () {
        var hz = hoverZoom,
            wnd = $(window),
            body = $(document.body),
            hzCaption = null,
            hzGallery = null,
            imgFullSize = null,
            imgThumb = null,
            mousePos = {},
            loading = false,
            loadFullSizeImageTimeout,
            preloadTimeout,
            actionKeyDown = false,
            fullZoomKeyDown = false,
            hideKeyDown = false,
            pageActionShown = false,
            skipFadeIn = false,
            titledElements = null,
            body100pct = true,
            linkRect = null;
        /*panning = true,
         panningThumb = null;*/

        var imgDetails = {
                url:'',
                host:'',
                naturalHeight:0,
                naturalWidth:0,
                video:false
            },
            thumbDetails = {
                url:'',
                naturalHeight:0,
                naturalWidth:0
            };
            
        var progressCss = {
                'opacity':'0.5',
                'position':'absolute',
                'max-height':'22px',
                'max-width':'22px',
                'left':'3px',
                'top':'3px',
                'margin':'0',
                'padding':'0',
                'border-radius':'2px'
            },
            imgFullSizeCss = {
                'opacity':'1',
                'position':'static',
                'height':'auto',
                'width':'auto',
                'left':'auto',
                'top':'auto',
                'max-height':'none',
                'max-width':'none',
                'margin':'0',
                'padding':'0',
                'border-radius':'0',
                'background-size':'100% 100%',
                'background-position':'center',
                'background-repeat':'no-repeat'
            },
            hzCaptionCss = {
                'font':'menu',
                'font-size':'11px',
                'font-weight':'bold',
                'color':'#333',
                'text-align':'center',
                'max-height':'27px',
                'overflow':'hidden',
                'vertical-align':'top'
            },
            hzGalleryInfoCss = {
                'position':'absolute',
                'top':'5px',
                'right':'5px',
                'font':'menu',
                'font-size':'14px',
                'font-weight':'bold',
                'color':'white',
                'text-shadow':'-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
                'text-align':'center',
                'overflow':'hidden',
                'vertical-align':'top',
                'horizontal-align':'right'
            };
        var flashFixDomains = [
            /*'www.youtube.com',*/
            'www.redditmedia.com'
        ];

        // Calculate optimal image position and size
        function posImg(position) {
            if (!imgFullSize) {
                return;
            }

            if (position === undefined || position.top === undefined || position.left === undefined) {
                position = {top:mousePos.top, left:mousePos.left};
            }

            var offset = 20,
                padding = 10,
                statusBarHeight = 15,
                wndWidth = window.innerWidth,
                wndHeight = window.innerHeight,
                wndScrollLeft = (document.documentElement && document.documentElement.scrollLeft) || document.body.scrollLeft,
                wndScrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop,
                bodyWidth = document.body.clientWidth,
                displayOnRight = (position.left - wndScrollLeft < wndWidth / 2);
                
            function posCaption() {
                if (hzCaption) {
                    hzCaption.css('max-width', imgFullSize.width());
                    if (hzCaption.height() > 20) {
                        hzCaption.css('font-weight', 'normal');
                    }
                    // This is looped 10x max just in case something
                    // goes wrong, to avoid freezing the process.
                    var i = 0;
                    while (hz.hzImg.height() > wndHeight - statusBarHeight && i++ < 10) {
                        imgFullSize.height(wndHeight - padding - statusBarHeight - hzCaption.height()).width('auto');
                        hzCaption.css('max-width', imgFullSize.width());
                    }
                }
            }

            if (displayOnRight) {
                position.left += offset;
            } else {
                position.left -= offset;
            }

            if (hz.imgLoading) {
                position.top -= 10;
                if (!displayOnRight) {
                    position.left -= 25;
                }

            } else {

                var fullZoom = options.mouseUnderlap || fullZoomKeyDown;

                imgFullSize.width('auto').height('auto');

                // Image natural dimensions
                imgDetails.naturalWidth = imgFullSize.width();
                imgDetails.naturalHeight = imgFullSize.height();
                if (!imgDetails.naturalWidth || !imgDetails.naturalHeight) {
                    return;
                }

                // Width adjustment
                if (fullZoom) {
                    imgFullSize.width(Math.min(imgDetails.naturalWidth, wndWidth - padding + wndScrollLeft));
                } else {
                    if (displayOnRight) {
                        if (imgDetails.naturalWidth + padding > wndWidth - position.left) {
                            imgFullSize.width(wndWidth - position.left - padding + wndScrollLeft);
                        }
                    } else {
                        if (imgDetails.naturalWidth + padding > position.left) {
                            imgFullSize.width(position.left - padding - wndScrollLeft);
                        }
                    }
                }

                // Height adjustment
                if (hz.hzImg.height() > wndHeight - padding - statusBarHeight) {
                    imgFullSize.height(wndHeight - padding - statusBarHeight).width('auto');
                }

                posCaption();

                position.top -= hz.hzImg.height() / 2;

                // Display image on the left side if the mouse is on the right
                if (!displayOnRight) {
                    position.left -= hz.hzImg.width() + padding;
                }

                // Horizontal position adjustment if full zoom
                if (fullZoom) {
                    if (displayOnRight) {
                        position.left = Math.min(position.left, wndScrollLeft + wndWidth - hz.hzImg.width() - padding);
                    } else {
                        position.left = Math.max(position.left, wndScrollLeft);
                    }
                }

                // Vertical position adjustments
                var maxTop = wndScrollTop + wndHeight - hz.hzImg.height() - padding - statusBarHeight;
                if (position.top > maxTop) {
                    position.top = maxTop;
                }
                if (position.top < wndScrollTop) {
                    position.top = wndScrollTop;
                }
            }


            // This fixes positioning when the body's width is not 100%
            if (body100pct) {
                position.left -= (wndWidth - bodyWidth) / 2;
            }

            hz.hzImg.css({top:Math.round(position.top), left:Math.round(position.left)});
        }
        
        function isPointInRect(point, rect) {
            return point.top > rect.top && point.top < rect.bottom && point.left > rect.left && point.left < rect.right;
        }

        function posWhileLoading() {
            if (loading) {
                posImg();
                if (hz.imgLoading && imgFullSize && imgFullSize.height() > 0) {
                    displayFullSizeImage();
                } else {
                    setTimeout(posWhileLoading, 100);
                }
            }
        }

        // Remove the 'title' attribute from all elements to prevent a tooltip from appearing above the zoomed image.
        // Titles are saved so they can be restored later.
        function removeTitles() {
            if (titledElements) {
                return;
            }
            titledElements = $('[title]').not('iframe, .lightbox, [rel^="lightbox"]');
            titledElements.each(function () {
                $(this).data().hoverZoomTitle = this.getAttribute('title');
                this.removeAttribute('title');
            });
        }

        // Restore the 'title' attributes
        function restoreTitles() {
            if (!titledElements) {
                return;
            }
            titledElements.each(function () {
                if ($(this).data()) {
                    this.setAttribute('title', $(this).data().hoverZoomTitle);
                }
            });
            titledElements = null;
        }

        function hideHoverZoomImg(now) {
            cLog('hideHoverZoomImg(' + now + ')');
            if (!now && !imgFullSize || !hz.hzImg || fullZoomKeyDown) {
                return;
            }
            imgFullSize = null;
            if (loading) {
                now = true;
            }
            hz.hzImg.stop(true, true).fadeOut(now ? 0 : options.fadeDuration, function () {
                hzCaption = null;
                hz.imgLoading = null;
                hz.hzImg.empty();
                restoreTitles();
            });
            //chrome.runtime.sendMessage({action: 'viewWindow', visible: false});
        }

        function documentMouseMove(event) {
            if (!options.extensionEnabled || fullZoomKeyDown || isExcludedSite() || wnd.height() < 30 || wnd.width() < 30) {
                return;
            }

            var links,
                target = $(event.target),
            // Test if the action key was pressed without moving the mouse
                explicitCall = event.pageY == undefined;


            // If so, the MouseMove event was triggered programmaticaly and we don't have details
            // about the mouse position and the event target, so we use the last saved ones.
            if (explicitCall) {
                links = hz.currentLink;
            } else {
                mousePos = {top:event.pageY, left:event.pageX};
                links = target.parents('.hoverZoomLink');
                if (target.hasClass('hoverZoomLink')) {
                    links = links.add(target);
                }
            }

            if (options.mouseUnderlap && target.length && mousePos && linkRect &&
                (imgFullSize && imgFullSize.length && target[0] == imgFullSize[0] ||
                    hz.hzImg && hz.hzImg.length && target[0] == hz.hzImg[0])) {
                /*cLog('Over image. linkRect:');
                cLog(linkRect);
                cLog('Over image. mousePos:');
                cLog(mousePos);*/
                if (mousePos.top > linkRect.top && mousePos.top < linkRect.bottom && mousePos.left > linkRect.left && mousePos.left < linkRect.right) {
                    //cLog('Mouse over link');
                    return;
                }
            }

            if (links && links.length > 0) {
                var hoverZoomSrcIndex = links.data().hoverZoomSrcIndex || 0;
                if (links.data().hoverZoomSrc && typeof(links.data().hoverZoomSrc) != 'undefined' &&
                    links.data().hoverZoomSrc[hoverZoomSrcIndex] &&
                    typeof(links.data().hoverZoomSrc[hoverZoomSrcIndex]) != 'undefined') {
                    // Happens when the mouse goes from an image to another without hovering the page background
                    if (links.data().hoverZoomSrc[hoverZoomSrcIndex] != imgDetails.url) {
                        hideHoverZoomImg();
                    }

                    removeTitles();

                    // Is the image source has not been set yet
                    if (!imgFullSize) {
                        hz.currentLink = links;
                        //initLinkRect(hz.currentLink);
                        if (!options.actionKey || actionKeyDown) {
                            imgDetails.url = links.data().hoverZoomSrc[hoverZoomSrcIndex];
                            clearTimeout(loadFullSizeImageTimeout);

                            // If the action key has been pressed over an image, no delay is applied
                            var delay = explicitCall ? 0 : options.displayDelay;
                            loadFullSizeImageTimeout = setTimeout(loadFullSizeImage, delay);

                            loading = true;
                        }
                    } else {
                        posImg();
                    }
                }
            } else if (hz.currentLink) {
                cancelImageLoading();
            }
        }

        function documentMouseDown(event) {
            if (imgFullSize && event.target != hz.hzImg[0] && event.target != imgFullSize[0]) {
                cancelImageLoading();
                restoreTitles();
            }
        }

        function loadFullSizeImage() {
            cLog('loadFullSizeImage');
            // If no image is currently displayed...
            if (!imgFullSize) {
                hz.createHzImg(!hideKeyDown);
                hz.createImgLoading();

                imgDetails.video = (imgDetails.url.substr(imgDetails.url.length - 4) == 'webm' || imgDetails.url.substr(imgDetails.url.length - 3) == 'mp4');
                if (imgDetails.video) {
                    if (!options.zoomVideos) { return; }
                    var video = document.createElement('video');
                    video.style.width = 0;
                    video.style.height = 0;
                    video.loop = true;
                    video.muted = options.muteVideos;
                    video.poster = chrome.extension.getURL('images/white.png');
                    video.src = imgDetails.url;
                    imgFullSize = $(video).appendTo(hz.hzImg);
                    video.addEventListener('loadedmetadata', function() {
                        posImg();
                    });
                    video.addEventListener('loadeddata', function() {
                        imgFullSizeOnLoad();
                        video.play();
                        video.removeAttribute('poster');
                    });
                    video.load();
                } else {
                    imgFullSize = $('<img style="border: none" />').appendTo(hz.hzImg).load(imgFullSizeOnLoad).error(imgFullSizeOnError).attr('src', imgDetails.url);
                }

                imgDetails.host = getHostFromUrl(imgDetails.url);

                skipFadeIn = false;
                imgFullSize.css(progressCss);
                if (options.showWhileLoading && !imgDetails.video) {
                    posWhileLoading();
                }
                posImg();
            }
            posImg();
        }

        function imgFullSizeOnLoad() {
            cLog('imgFullSizeOnLoad');
            // Only the last hovered link gets displayed
            if (imgDetails.url == $(imgFullSize).attr('src')) {
                loading = false;
                //imgFullSize.css({'background-image': 'none'});
                if (hz.imgLoading) {
                    displayFullSizeImage();
                }
            }
        }

        function initLinkRect(elem) {
            linkRect = elem.offset();
            linkRect.bottom = linkRect.top + elem.height();
            linkRect.right = linkRect.left + elem.width();
        }

        function displayFullSizeImage() {

            cLog('displayFullSizeImage');

            hz.imgLoading.remove();
            hz.imgLoading = null;
            hz.hzImg.stop(true, true);
            hz.hzImg.offset({top:-9000, left:-9000});    // hides the image while making it available for size calculations
            hz.hzImg.empty();

            clearTimeout(cursorHideTimeout);
            hz.hzImg.css('cursor', 'none');

            imgFullSize.css(imgFullSizeCss).appendTo(hz.hzImg).mousemove(imgFullSizeOnMouseMove);

            if (hz.currentLink) {

                // Sets up the thumbnail as a full-size background
                imgThumb = hz.currentLink;
                var lowResSrc = imgThumb.attr('src');
                if (!lowResSrc) {
                    imgThumb = hz.currentLink.find('[src]').first();
                    lowResSrc = imgThumb.attr('src');
                }
                if (!lowResSrc) {
                    imgThumb = hz.currentLink.find('[style]').first();
                    lowResSrc = hz.getThumbUrl(imgThumb);
                }
                lowResSrc = lowResSrc || 'noimage';
                if (loading && lowResSrc.indexOf('noimage') == -1) {
                    var ext = imgDetails.url.substr(imgDetails.url.length - 3).toLowerCase();
                    if (ext != 'gif' && ext != 'svg' && ext != 'png') {
                        var imgRatio = imgFullSize.width() / imgFullSize.height(),
                            thumbRatio = imgThumb.width() / imgThumb.height();
                        // The thumbnail is used as a background only if its width/height ratio is similar to the image
                        if (Math.abs(imgRatio - thumbRatio) < 0.1)
                            imgFullSize.css({'background-image':'url(' + lowResSrc + ')'});
                    }
                } else {
                    imgThumb = null;
                }

                /*if (thumb.length == 1) {
                 panningThumb = thumb.first();
                 }*/

                hz.hzImg.css('cursor', 'pointer');

                initLinkRect(imgThumb || hz.currentLink);

            }

            if (hz.currentLink) {
                var linkData = hz.currentLink.data();
                if (options.showCaptions && linkData.hoverZoomCaption) {
                    hzCaption = $('<div/>', {id:'hzCaption', text:linkData.hoverZoomCaption}).css(hzCaptionCss).appendTo(hz.hzImg);
                }
                if (linkData.hoverZoomGallerySrc) {
                    var info = '';
                    if (linkData.hoverZoomGallerySrc.length > 0) {
                        info = (linkData.hoverZoomGalleryIndex + 1) + '/' + linkData.hoverZoomGallerySrc.length;
                    }
                    hzGallery = $('<div/>', {id:'hzGallery', text:info}).css(hzGalleryInfoCss).appendTo(hz.hzImg);
                    if (linkData.hoverZoomGalleryIndex == 0 && linkData.hoverZoomGallerySrc.length > 1) {
                        preloadGalleryImage(1);
                    }
                }
            }
            if (!skipFadeIn && !hideKeyDown) {
                hz.hzImg.hide().fadeTo(options.fadeDuration, options.picturesOpacity);
            }

            // The image size is not yet available in the onload so I have to delay the positioning
            setTimeout(posImg, options.showWhileLoading ? 0 : 10);
            
            if (options.addToHistory && !chrome.extension.inIncognitoContext) {
                var url = hz.currentLink.context.href || imgDetails.url;
                chrome.runtime.sendMessage({action:'addUrlToHistory', url:url});
            }
            chrome.runtime.sendMessage({action:'trackEvent', event:{category:'Actions', action:'ImageDisplayedOnSite', label:document.location.host}});
            chrome.runtime.sendMessage({action:'trackEvent', event:{category:'Actions', action:'ImageDisplayedFromSite', label:imgDetails.host}});
        }

        function imgFullSizeOnError() {
            if (imgDetails.url == $(this).attr('src')) {
                var hoverZoomSrcIndex = hz.currentLink ? hz.currentLink.data().hoverZoomSrcIndex : 0;
                if (hz.currentLink && hoverZoomSrcIndex < hz.currentLink.data().hoverZoomSrc.length - 1) {
                    // If the link has several possible sources, we try to load the next one
                    imgFullSize.remove();
                    imgFullSize = null;
                    hoverZoomSrcIndex++;
                    hz.currentLink.data().hoverZoomSrcIndex = hoverZoomSrcIndex;
                    console.info('[HoverZoom] Failed to load image: ' + imgDetails.url + '\nTrying next one...');
                    imgDetails.url = hz.currentLink.data().hoverZoomSrc[hoverZoomSrcIndex];
                    setTimeout(loadFullSizeImage, 100);
                } else {
                    hideHoverZoomImg();
                    //hz.currentLink.removeClass('hoverZoomLink').removeData();
                    console.warn('[HoverZoom] Failed to load image: ' + imgDetails.url);
                    chrome.runtime.sendMessage({action:'trackEvent', event:{category:'Errors', action:'LoadingErrorFromSite', label:imgDetails.host}});
                }
            }
        }

        var firstMouseMoveAfterCursorHide = false,
            cursorHideTimeout = 0;

        function hideCursor() {
            firstMouseMoveAfterCursorHide = true;
            hz.hzImg.css('cursor', 'none');
        }

        function imgFullSizeOnMouseMove() {
            cLog('imgFullSizeOnMouseMove');
            if (!imgFullSize && !options.mouseUnderlap) {
                hideHoverZoomImg(true);
            }
            clearTimeout(cursorHideTimeout);
            if (!firstMouseMoveAfterCursorHide) {
                hz.hzImg.css('cursor', 'pointer');
                cursorHideTimeout = setTimeout(hideCursor, 500);
            }
            firstMouseMoveAfterCursorHide = false;
        }

        function cancelImageLoading() {
            cLog('cancelImageLoading');
            hz.currentLink = null;
            clearTimeout(loadFullSizeImageTimeout);
            hideHoverZoomImg();
        }

        function prepareImgCaption(link) {
            var titledElement = null;
            if (link.attr('title')) {
                titledElement = link;
            } else {
                titledElement = link.find('[title]');
                if (!titledElement.length) {
                    titledElement = link.parents('[title]');
                }
            }
            if (titledElement && titledElement.length) {
                link.data().hoverZoomCaption = titledElement.attr('title');
            } else {
                var alt = link.attr('alt') || link.find('[alt]').attr('alt');
                if (alt && alt.length > 6 && !/^\d+$/.test(alt)) {
                    link.data().hoverZoomCaption = alt;
                } else {
                    var ref = link.attr('ref') || link.find('[ref]').attr('ref');
                    if (ref && ref.length > 6 && !/^\d+$/.test(ref)) {
                        link.data().hoverZoomCaption = ref;
                    }
                }
            }
        }

        // Callback function called by plugins after they finished preparing the links
        function imgLinksPrepared(links) {
            var showPageAction = false;
            links.each(function () {
                var link = $(this),
                    linkData = link.data();
                if (!linkData.hoverZoomSrc && !linkData.hoverZoomGallerySrc) {

                    prepareImgLinksAsync(true);

                } else {

                    // Skip if the image has the same URL as the thumbnail.
                    //try {
                    if (linkData.hoverZoomSrc) {
                        var url = linkData.hoverZoomSrc[0],
                            skip = (url == link.attr('src'));
                        if (!skip) {
                            link.find('img[src]').each(function () {
                                if (this.src == url) {
                                    skip = true;
                                }
                            });
                        }
                        if (skip) {
                            return;
                        }
                    }
                    /*} catch(e) {
                     throw e;
                     }*/
                     
                    // Avoid nested links
                    /*if (link.parents('.hoverZoomLink').length > 0) {
                        return;
                    }
                    link.find('.hoverZoomLink').removeClass('hoverZoomLink');*/

                    showPageAction = true;

                    // If the extension is disabled or the site is excluded, we only need to know
                    // whether the page action needs to be shown or not.
                    if (!options.extensionEnabled || isExcludedSite()) {
                        return;
                    }

                    link.addClass('hoverZoomLink');

                    // Convert URL special characters                 
                    /*var srcs = linkData.hoverZoomSrc;
                     for (var i=0; i<srcs.length; i++) {
                     srcs[i] = deepUnescape(srcs[i]);
                     }
                     linkData.hoverZoomSrc = srcs;*/
                    if (linkData.hoverZoomGallerySrc) {
                        linkData.hoverZoomGalleryIndex = 0;
                        linkData.hoverZoomGallerySrc = linkData.hoverZoomGallerySrc.map(function (srcs) {
                            return srcs.map(deepUnescape);
                        });
                        updateImageFromGallery(link);
                    } else {
                        linkData.hoverZoomSrc = linkData.hoverZoomSrc.map(deepUnescape);
                    }

                    linkData.hoverZoomSrcIndex = 0;

                    // Caption
                    if (options.showCaptions && !linkData.hoverZoomCaption) {
                        prepareImgCaption(link);
                    }
                }
            });

            if (options.pageActionEnabled && !pageActionShown && showPageAction) {
                chrome.runtime.sendMessage({action:'showPageAction'});
                pageActionShown = true;
            }
        }

        function prepareImgLinks() {
            if (debug) {
                console.time('prepareImgLinks');
            }
            pageActionShown = false;

            // Commented this out in version 2.9 for better performances. Keep an eye on it for potential side effects.
            //$('.hoverZoomLink').removeClass('hoverZoomLink').removeData('hoverZoomSrc');

            for (var i = 0; i < hoverZoomPlugins.length; i++) {
                hoverZoomPlugins[i].prepareImgLinks(imgLinksPrepared);
            }
            prepareImgLinksTimeout = null;

            if (options.alwaysPreload) {
                clearTimeout(preloadTimeout);
                preloadTimeout = setTimeout(hz.preloadImages, 800);
            } else {
                chrome.runtime.sendMessage({action:'preloadAvailable'});
            }

            prepareDownscaledImagesAsync();
            if (debug) {
                console.timeEnd('prepareImgLinks');
            }

        }

        var prepareDownscaledImagesDelay = 500, prepareDownscaledImagesTimeout;

        function prepareDownscaledImagesAsync(dontResetDelay) {
            if (!dontResetDelay) {
                prepareDownscaledImagesDelay = 500;
            }
            clearTimeout(prepareDownscaledImagesTimeout);
            prepareDownscaledImagesTimeout = setTimeout(prepareDownscaledImages, prepareDownscaledImagesDelay);
            prepareDownscaledImagesDelay *= 2;
        }

        function prepareDownscaledImages() {

            // Excluded sites
            if (['www.facebook.com'].indexOf(location.host) > -1) {
                return;
            }

            $('img').filter(function () {
                var _this = $(this);

                // Only zoom jpg images, to prevent zooming on images that are part of the site design
                if (this.src.toLowerCase().lastIndexOf('.jpg') != this.src.length - 4) {
                    return false;
                }

                // Using _this.data('hoverZoomSrc') breaks some multi-frames sites (don't know why...)
                if (_this.data().hoverZoomSrc) {
                    return false;
                }

                // Don't process when the image is the only element on the page (well, first element).
                if (this == document.body.firstChild) {
                    return false;
                }

                // Only images with a specified width, height, max-width or max-weight are processed.
                var scaled = this.getAttribute('width') || this.getAttribute('height') ||
                    this.style && (this.style.width || this.style.height || this.style.maxWidth || this.style.maxHeight);
                if (!scaled) {
                    scaled = scaled || _this.css('width') != '0px' || _this.css('height') != '0px' || _this.css('max-width') != 'none' || _this.css('max-height') != 'none';
                }
                return scaled;
            }).one('mouseover.hoverZoom', function () {
                    var img = $(this),
                        widthAttr = parseInt(this.getAttribute('width') || this.style.width || this.style.maxWidth || img.css('width') || img.css('max-width')),
                        heightAttr = parseInt(this.getAttribute('height') || this.style.height || this.style.maxHeight || img.css('height') || img.css('max-height')),
                        hzDownscaled = $('<img id="hzDownscaled" style="position: absolute; top: -10000px;">').appendTo(document.body);
                    //console.log(widthAttr + 'x' + heightAttr + ' - ' + img.attr('src'));
                    if (widthAttr > 300 || heightAttr > 300) {
                        return;
                    }
                    hzDownscaled.load(function () {
                        setTimeout(function () {
                            if (hzDownscaled.height() > heightAttr * 1.8 || hzDownscaled.width() > widthAttr * 1.8) {
                                var srcs = img.data().hoverZoomSrc || [];
                                srcs.unshift(img.attr('src'));
                                img.data().hoverZoomSrc = srcs;
                                img.addClass('hoverZoomLink');
                            }
                            hzDownscaled.remove();
                        }, 10);
                    }).attr('src', this.src);
                });
        }

        var prepareImgLinksDelay = 500, prepareImgLinksTimeout;

        function prepareImgLinksAsync(dontResetDelay) {
            if (!options.extensionEnabled || isExcludedSite()) {
                return;
            }
            if (!dontResetDelay) {
                prepareImgLinksDelay = 500;
            }
            clearTimeout(prepareImgLinksTimeout);
            prepareImgLinksTimeout = setTimeout(prepareImgLinks, prepareImgLinksDelay);
            prepareImgLinksDelay *= 2;
        }

        function deepUnescape(url) {
            var ueUrl = unescape(encodeURIComponent(url));
            while (url != ueUrl) {
                url = ueUrl;
                ueUrl = unescape(url);
            }
            return decodeURIComponent(escape(url));
        }

        function applyOptions() {
            init();
            if (!options.extensionEnabled || isExcludedSite()) {
                hideHoverZoomImg();
                $(document).unbind('mousemove', documentMouseMove);
            }
        }

        var webSiteExcluded = null;

        function isExcludedSite() {

            // If site exclusion has already been tested
            if (webSiteExcluded != null) {
                return webSiteExcluded;
            }

            var excluded = !options.whiteListMode;
            var siteAddress = location.href.substr(location.protocol.length + 2);
            if (siteAddress.substr(0, 4) == 'www.') {
                siteAddress = siteAddress.substr(4);
            }
            for (var i = 0; i < options.excludedSites.length; i++) {
                var es = options.excludedSites[i];
                if (es.substr(0, 4) == 'www.') {
                    es = es.substr(4);
                }
                if (es && es.length <= siteAddress.length) {
                    if (siteAddress.substr(0, es.length) == es) {
                        webSiteExcluded = excluded;
                        return excluded;
                    }
                }
            }
            webSiteExcluded = !excluded;
            return !excluded;
        }

        function loadOptions() {
            chrome.runtime.sendMessage({action:'getOptions'}, function (result) {
                options = result;
                if (options) {
                applyOptions();
                }
            });
        }

        function onMessage(message, sender, sendResponse) {
            if (message.action == 'optionsChanged') {
                options = message.options;
                applyOptions();
            }
        }

        function windowOnDOMNodeInserted(event) {
            var insertedNode = event.target;
            if (insertedNode && insertedNode.nodeType === Node.ELEMENT_NODE) {
                if (insertedNode.nodeName === 'A' || 
                    insertedNode.nodeName === 'IMG' || 
                    insertedNode.getElementsByTagName('A').length > 0 || 
                    insertedNode.getElementsByTagName('IMG').length > 0) {
                    if (insertedNode.id !== 'hzImg' &&
                        insertedNode.parentNode.id !== 'hzImg' &&
                        insertedNode.id !== 'hzDownscaled') {
                        prepareImgLinksAsync();
                    }
                } else if (insertedNode.nodeName === 'EMBED' || insertedNode.nodeName === 'OBJECT') {
                    fixFlash();
                }
            }
        }

        function windowOnLoad(event) {
            prepareImgLinksAsync();
        }

        function bindEvents() {
            wnd.bind('DOMNodeInserted', windowOnDOMNodeInserted).load(windowOnLoad).scroll(cancelImageLoading);
            $(document).mousemove(documentMouseMove).mouseleave(cancelImageLoading).mousedown(documentMouseDown).keydown(documentOnKeyDown).keyup(documentOnKeyUp);
            if (options.galleriesMouseWheel) {
                $(document).on('mousewheel', documentOnMouseWheel);
            }
        }
        
        function documentOnMouseWheel(event) {
          if (imgFullSize) {
            var link = hz.currentLink, data = link.data();
            if (data.hoverZoomGallerySrc) {
              event.preventDefault();
              if (event.originalEvent.wheelDeltaY > 0) {
                rotateGalleryImg(-1);
              } else {
                rotateGalleryImg(1);
              }
            }
          }
        }

        function documentOnKeyDown(event) {
            // Skips if an input controlled is focused
            if (event.target && ['INPUT','TEXTAREA','SELECT'].indexOf(event.target.tagName) > -1) {
                return;
            }
            // Action key (zoom image) is pressed down
            if (event.which == options.actionKey && !actionKeyDown) {
                actionKeyDown = true;
                $(this).mousemove();
                if (loading || imgFullSize) {
                    return false;
                }
            }
            // Full zoom key is pressed down
            if (event.which == options.fullZoomKey && !fullZoomKeyDown) {
                fullZoomKeyDown = true;
                posImg();
                if (imgFullSize) {
                    return false;
                }
            }
            // Hide key (hide zoomed image) is pressed down
            if (event.which == options.hideKey && !hideKeyDown) {
                hideKeyDown = true;
                if (hz.hzImg) {
                    hz.hzImg.hide();
                }
                if (imgFullSize) {
                    return false;
                }
            }
            // The following keys are processed only if an image is displayed
            if (imgFullSize) {
                // "Open image in a new window" key
                if (event.which == options.openImageInWindowKey) {
                    openImageInWindow();
                    return false;
                }
                // "Open image in a new tab" key
                if (event.which == options.openImageInTabKey) {
                    openImageInTab(event.shiftKey);
                    return false;
                }
                // "Save image" key
                if (event.which == options.saveImageKey) {
                    saveImage();
                    return false;
                }
                // Cancels event if an action key is held down (auto repeat may trigger additional events)
                if (event.which == options.actionKey ||
                    event.which == options.fullZoomKey ||
                    event.which == options.hideKey) {
                    return false;
                }
                // "Previous image" key
                if (event.which == options.prevImgKey) {
                    rotateGalleryImg(-1);
                    return false;
                }
                // "Next image" key
                if (event.which == options.nextImgKey) {
                    rotateGalleryImg(1);
                    return false;
                }
            }
        }

        function documentOnKeyUp(event) {
            // Action key (zoom image) is released
            if (event.which == options.actionKey) {
                actionKeyDown = false;
                hideHoverZoomImg();
            }
            // Full zoom key is released
            if (event.which == options.fullZoomKey) {
                fullZoomKeyDown = false;
                $(this).mousemove();
            }
            // Hide key is released
            if (event.which == options.hideKey) {
                hideKeyDown = false;
                if (imgFullSize) {
                    hz.hzImg.show();
                }
                $(this).mousemove();
            }
        }

        function fixFlash() {
            if (flashFixDomains.indexOf(location.host) == -1) {
                return;
            }
            if (isExcludedSite() || window == window.top && $('.hoverZoomLink').length == 0) {
                return;
            }
            $('embed:not([wmode]), embed[wmode="window"]').each(function () {
                if (!this.type || this.type.toLowerCase() != 'application/x-shockwave-flash') {
                    return;
                }
                var embed = this.cloneNode(true);
                embed.setAttribute('wmode', 'opaque');
                wnd.unbind('DOMNodeInserted', windowOnDOMNodeInserted);
                $(this).replaceWith(embed);
                wnd.bind('DOMNodeInserted', windowOnDOMNodeInserted);
            });
            var wmodeFilter = function () {
                return this.name.toLowerCase() == 'wmode';
            };
            $('object[type="application/x-shockwave-flash"]').filter(function () {
                var param = $(this).children('param').filter(wmodeFilter);
                return param.length == 0 || param.attr('value').toLowerCase() == 'window';
            }).each(function () {
                    var object = this.cloneNode(true);
                    $(object).children('param').filter(wmodeFilter).remove();
                    $('<param name="wmode" value="opaque">').appendTo(object);
                    wnd.unbind('DOMNodeInserted', windowOnDOMNodeInserted);
                    $(this).replaceWith(object);
                    wnd.bind('DOMNodeInserted', windowOnDOMNodeInserted);
                });
        }

        function getHostFromUrl(url) {
            var host = '';
            if (url.indexOf('://') > -1) {
                host = url.replace(/.+:\/\/([^\/]*).*/, '$1');
            } else {
                host = window.location.host;
            }
            var aHost = host.split('.'),
                maxItems = 2;
            if (aHost.length > 2) {
                var preTld = aHost[aHost.length - 2];
                if (preTld == 'co' || preTld == 'com' || preTld == 'net' || preTld == 'org') {
                    maxItems = 3;
                }
            }
            while (aHost.length > maxItems) {
                aHost.shift();
            }
            return aHost.join('.');
        }

        function openImageInWindow() {
            chrome.runtime.sendMessage({action:'getItem', id:'popupBorder'}, function (data) {
                var createData,
                    popupBorder = {width:16, height:38};

                if (data) {
                    try {
                        popupBorder = JSON.parse(data);
                    }
                    catch (e) {
                    }
                }

                createData = {
                    url:imgDetails.url,
                    width:imgDetails.naturalWidth + popupBorder.width,
                    height:imgDetails.naturalHeight + popupBorder.height,
                    type:'popup',
                    incognito:chrome.extension.inIncognitoContext
                };

                // If image bigger than screen, adjust window dimensions to match image's aspect ratio
                if (createData.height > screen.availHeight) {
                    createData.height = screen.availHeight;
                    createData.width = Math.round(popupBorder.width + (screen.availHeight - popupBorder.height) * imgDetails.naturalWidth / imgDetails.naturalHeight);
                }
                if (createData.width > screen.availWidth) {
                    createData.width = screen.availWidth;
                    createData.height = Math.round(popupBorder.height + (screen.availWidth - popupBorder.width) * imgDetails.naturalHeight / imgDetails.naturalWidth);
                }

                // Center window
                createData.top = Math.round(screen.availHeight / 2 - createData.height / 2);
                createData.left = Math.round(screen.availWidth / 2 - createData.width / 2);

                chrome.runtime.sendMessage({
                    action:'openViewWindow',
                    createData:createData
                });
            });
        }

        function openImageInTab(background) {
            chrome.runtime.sendMessage({
                action:'openViewTab',
                createData:{
                    url:imgDetails.url,
                    active:!background
                }
            });
        }

        function saveImage() {
            var a = document.createElement('a');
            a.href = imgDetails.url;
            a.download = imgDetails.url.split('/').pop().split('?')[0];
            if (!a.download) {
                a.download = 'image.jpg';
            }
            var clickEvent = document.createEvent('MouseEvent');
            clickEvent.initEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(clickEvent);
        }

        function rotateGalleryImg(rot) {
            cLog('rotateGalleryImg(' + rot + ')');
            var link = hz.currentLink, data = link.data();
            if (!data.hoverZoomGallerySrc) {
                return;
            }

            var l = data.hoverZoomGallerySrc.length;
            data.hoverZoomGalleryIndex = (data.hoverZoomGalleryIndex + rot + l) % l;
            updateImageFromGallery(link);

            data.hoverZoomSrcIndex = 0;
            loading = true;
            hzGallery.text('.../' + data.hoverZoomGallerySrc.length);

            loadNextGalleryImage();
            preloadGalleryImage((data.hoverZoomGalleryIndex + rot + l) % l);
        }

        function loadNextGalleryImage() {
            clearTimeout(loadFullSizeImageTimeout);
            imgDetails.url = hz.currentLink.data().hoverZoomSrc[hz.currentLink.data().hoverZoomSrcIndex];
            imgFullSize.load(nextGalleryImageOnLoad).error(function () {
                imgOnError(this, false, loadNextGalleryImage);
            }).attr('src', imgDetails.url);
        }

        function nextGalleryImageOnLoad() {
            cLog('nextGalleryImageOnLoad');
            if (loading) {
                loading = false;
                posImg();

                data = hz.currentLink.data();
                if (data.hoverZoomGallerySrc.length > 0) {
                    hzGallery.text((data.hoverZoomGalleryIndex + 1) + '/' + data.hoverZoomGallerySrc.length);
                }
                if (options.showCaptions) {
                    $(hzCaption).text(data.hoverZoomCaption);
                }
            }
        }

        function updateImageFromGallery(link) {
            if (options.enableGalleries) {
                var data = link.data();
                data.hoverZoomSrc = data.hoverZoomGallerySrc[data.hoverZoomGalleryIndex];

                if (data.hoverZoomGalleryCaption) {
                    data.hoverZoomCaption = data.hoverZoomGalleryCaption[data.hoverZoomGalleryIndex];
                } else {
                    prepareImgCaption(link);
                }
            }
        }

        function preloadGalleryImage(index) {
            var preloadImg = new Image();
            preloadImg.src = hz.currentLink.data().hoverZoomGallerySrc[index][0];
        }

        function init() {
            if (!window.innerHeight || !window.innerWidth) {
                return;
            }

            webSiteExcluded = null;
            body100pct = (body.css('position') != 'static') ||
                (body.css('padding-left') == '0px' && body.css('padding-right') == '0px' && body.css('margin-left') == '0px' && body.css('margin-right') == '0px');
            hz.pageGenerator = $('meta[name="generator"]').attr('content');
            prepareImgLinks();
            bindEvents();
            fixFlash();
        }

        chrome.runtime.onMessage.addListener(onMessage);
        loadOptions();
    },

    // __________________________________________________________________
    // Public functions

    // Search for links or images using the 'filter' parameter,
    // process their src or href attribute using the 'search' and 'replace' values,
    // store the result in the link and add the link to the 'res' array.
    urlReplace:function (res, filter, search, replace, parentFilter) {
        $(filter).each(function () {
            var _this = $(this), link, url, thumbUrl;
            if (parentFilter) {
                link = _this.parents(parentFilter);
            } else {
                link = _this;
            }
            url = hoverZoom.getThumbUrl(this);
            if (!url) {
                return;
            }
            thumbUrl = url;
            if (Array.isArray(search)) {
                for (var i = 0; i < search.length; i++) {
                    url = url.replace(search[i], replace[i]);
                }
            } else {
                url = url.replace(search, replace);
            }
            url = unescape(url);
            if (thumbUrl == url) {
                return;
            }
            var data = link.data().hoverZoomSrc;
            if (Object.prototype.toString.call(data) === '[object Array]') {
                data.unshift(url);
            } else {
                data = [url];
            }
            link.data().hoverZoomSrc = data;
            res.push(link);
        });
    },

    // Extract a thumbnail url from an element, whether it be a link,
    // an image or a element with a background image.
    getThumbUrl:function (el) {
        var compStyle = getComputedStyle(el),
            backgroundImage = compStyle ? compStyle.backgroundImage : 'none';
        if (backgroundImage != 'none') {
            return backgroundImage.replace(/.*url\s*\(\s*(.*)\s*\).*/i, '$1');
        } else {
            return el.src || el.href;
        }
    },

    // Simulates a mousemove event to force a zoom call
    displayPicFromElement:function (el) {
        hoverZoom.currentLink = el;
        $(document).mousemove();
    },

    // Create and displays the zoomed image container
    createHzImg:function (displayNow) {
        if (!hoverZoom.hzImg) {
            hoverZoom.hzImg = $('<div id="hzImg"></div>').appendTo(document.body);

            // If the user clicks the image, this simulates a click underneath
            hoverZoom.hzImg.click(function (event) {
                if (hoverZoom.currentLink && hoverZoom.currentLink.length) {
                    var simEvent = document.createEvent('MouseEvents');
                    simEvent.initMouseEvent('click', event.bubbles, event.cancelable, event.view, event.detail,
                        event.screenX, event.screenY, event.clientX, event.clientY,
                        event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, event.button, null);
                    hoverZoom.currentLink[0].dispatchEvent(simEvent);
                }
            });

        }
        hoverZoom.hzImg.css(hoverZoom.hzImgCss);
        hoverZoom.hzImg.empty();
        if (displayNow) {
            hoverZoom.hzImg.stop(true, true).fadeTo(options.fadeDuration, options.picturesOpacity);
        }
    },

    // Create and displays the loading image container
    createImgLoading:function () {
        hoverZoom.imgLoading = hoverZoom.imgLoading || $('<img src="' + chrome.extension.getURL('images/loading.gif') + '" style="opacity: 0.8; padding: 0; margin: 0" />');
        hoverZoom.imgLoading.appendTo(hoverZoom.hzImg);
    },

    // Preloads zoomed images
    preloadImages:function () {

        var links = $('.hoverZoomLink'),
            preloadIndex = 0,
            preloadDelay = 200;

        function preloadNextImage() {
            if (preloadIndex >= links.length) {
                return;
            }
            var link = links.eq(preloadIndex++);
            if (link.data().hoverZoomPreloaded) {
                preloadNextImage();
                chrome.runtime.sendMessage({action:'preloadProgress', value:preloadIndex, max:links.length});
            } else {
                var hoverZoomSrcIndex = link.data().hoverZoomSrcIndex || 0;
                $('<img src="' + link.data().hoverZoomSrc[hoverZoomSrcIndex] + '">').load(function () {
                    link.data().hoverZoomPreloaded = true;
                    setTimeout(preloadNextImage, preloadDelay);
                    chrome.runtime.sendMessage({action:'preloadProgress', value:preloadIndex, max:links.length});
                }).error(function () {
                        if (hoverZoomSrcIndex < link.data().hoverZoomSrc.length - 1) {
                            link.data().hoverZoomSrcIndex++;
                            preloadIndex--;
                        }
                        setTimeout(preloadNextImage, preloadDelay);
                    });
            }
        }

        setTimeout(preloadNextImage, preloadDelay);
    },

    prepareOEmbedLink:function (link, apiEndpoint, linkUrl) {
        if (!linkUrl) {
            linkUrl = getThumbUrl(link);
        }
        link = $(link);
        $.getJSON(apiEndpoint + linkUrl, function (data) {
            if (data && data.type == 'photo' && data.url) {
                link.data().hoverZoomSrc = [data.url];
                link.addClass('hoverZoomLink');
                hoverZoom.displayPicFromElement(link);
            }
        });
    },
    
    prepareFromDocument:function (link, url, getSrc) {
        $.get(url, function(data) {
            var doc = document.implementation.createHTMLDocument();
            doc.open();
            doc.write(data);
            doc.close();
            var httpRefresh = doc.querySelector('meta[http-equiv="refresh"][content]');
            if (httpRefresh) {
                var redirUrl = httpRefresh.content.substr(httpRefresh.content.toLowerCase().indexOf('url=')+4);
                if (redirUrl) {
                    hoverZoom.prepareFromDocument(link, redirUrl, getSrc);
                }
            }
            var src = getSrc(doc);
            if (src) {
                if (Array.isArray(src)) {
                    console.log(src);
                    link.data().hoverZoomGallerySrc = src;
                    link.data().hoverZoomGalleryIndex = 0;
                    link.data().hoverZoomSrc = src[0];
                } else {
                    link.data().hoverZoomSrc = [src];
                }
                link.addClass('hoverZoomLink');
                hoverZoom.displayPicFromElement(link);
            }
        });
    }
};

hoverZoom.loadHoverZoom();