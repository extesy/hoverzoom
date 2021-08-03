var hoverZoomPlugins = hoverZoomPlugins || [],
    regexImgUrl = /\.(jpe?g|gifv?|png|webm|mp4|3gpp|svg|webp|bmp|ico|xbm)([\?#].*)?$/i,
    debug = false,
    logger = Logger();

function cLog(msg) {
    if (debug) {
        console.log(msg);
    }
}

function cTime(msg) {
    if (debug) {
        console.time(msg);
    }
}

function cTimeLog(msg) {
    if (debug) {
        console.timeLog(msg);
    }
}

function cTimeEnd(msg) {
    if (debug) {
        console.timeEnd(msg);
    }
}

function getFuncName() {
   return getFuncName.caller.name;
}

function Logger() {
    this.logger = {};
    if (debug) {

        for (var m in console)
            if (typeof console[m] == 'function')
                this.logger[m] = console[m].bind(window.console);

        this.logger.enterFunc = function() { console.info('enter: ' + this.enterFunc.caller.name); }
        this.logger.leaveFunc = function() { console.info('leave: ' + this.leaveFunc.caller.name); }

    } else {

        for (var m in console)
            if (typeof console[m] == 'function')
                this.logger[m] = function() {}

        this.logger.enterFunc = function() {}
        this.logger.leaveFunc = function() {}
    }
    return this.logger;
}

var hoverZoom = {

    options:{},
    currentLink:null,
    hzImg:null,
    hzImgLoader:null,
    hzImgCss:{
        'background':'none',
        'line-height':'0px',
        'overflow':'hidden',
        'padding':'10px',
        'position':'absolute',
        'z-index':2147483647,
        'transform':''
    },
    hzImgLoaderCss:{
        'background':'none',
        'border-style':'solid',
        'border-width':'4px',
        'line-height':'0px',
        'overflow':'hidden',
        'padding':'0px',
        'margin':'4px',
        'position':'absolute',
        'z-index':'2147483647',
        'border-radius':'4px',
        'box-shadow':'0px 1px 3px rgba(0, 0, 0, 0.4)'
    },
    hzImgLoadingCss:{ // green
        'border-color':'#e1ffbf',
        'background-color':'#e1ffbf'
    },
    hzImgSkippedCss:{ // orange
        'border-color':'#ffdfbf',
        'background-color':'#ffdfbf'
    },
    hzImgErrorCss:{ // red
        'border-color':'#ffbfbf',
        'background-color':'#ffbfbf'
    },
    pageGenerator:'',

    loadHoverZoom:function () {
        var hz = hoverZoom,
            wnd = $(window),
            body = $(document.body),
            hzAbove = null,
            hzBelow = null,
            hzCaptionMiscellaneous = null,
            hzDetails = null,
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
            imageLocked = false,
            lockImageClickTime = 0,
            zoomFactor = 1,
            pageActionShown = false,
            skipFadeIn = false,
            titledElements = null,
            body100pct = true,
            linkRect = null;
        /*panning = true,
         panningThumb = null;*/

        var imgDetails = {
                url:'',
                audioUrl:'',
                host:'',
                naturalHeight:0,
                naturalWidth:0,
                displayedHeight:0,
                displayedWidth:0,
                video:false
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
                'border-style':'solid',
                'background-size':'100% 100%',
                'background-position':'center',
                'background-repeat':'no-repeat',
                'box-shadow':'1px 1px 5px rgba(0, 0, 0, 0.5), -1px 1px 5px rgba(0, 0, 0, 0.5), 1px -1px 5px rgba(0, 0, 0, 0.5), -1px -1px 5px rgba(0, 0, 0, 0.5)' // cast shadow in every direction
            },
            hzCaptionCss = {
                'opacity':'1',
                'font':'menu',
                'font-weight':'bold',
                'text-align':'center',
                'overflow':'hidden',
                'overflow-wrap':'break-word',
                'display':'-webkit-box',
                '-webkit-line-clamp':'2',
                '-webkit-box-orient':'vertical',
                'min-width':'25%',
                'z-index':2147483647,
                'box-shadow':'1px 1px 5px rgba(0, 0, 0, 0.5), -1px 1px 5px rgba(0, 0, 0, 0.5), 1px -1px 5px rgba(0, 0, 0, 0.5), -1px -1px 5px rgba(0, 0, 0, 0.5)' // cast shadow in every direction
            },
            hzMiscellaneousCss = {
                'opacity':'1',
                'font':'menu',
                'font-weight':'bold',
                'text-align':'center',
                'overflow':'hidden',
                'overflow-wrap':'break-word',
                'display':'-webkit-box',
                '-webkit-line-clamp':'2',
                '-webkit-box-orient':'vertical',
                'min-width':'25%',
                'z-index':2147483647,
                'box-shadow':'1px 1px 5px rgba(0, 0, 0, 0.5), -1px 1px 5px rgba(0, 0, 0, 0.5), 1px -1px 5px rgba(0, 0, 0, 0.5), -1px -1px 5px rgba(0, 0, 0, 0.5)' // cast shadow in every direction
            },
            hzDetailCss = {
                'opacity':'1',
                'font':'menu',
                'font-weight':'bold',
                'white-space':'nowrap',
                'z-index':2147483647,
                'box-shadow':'1px 1px 5px rgba(0, 0, 0, 0.5), -1px 1px 5px rgba(0, 0, 0, 0.5), 1px -1px 5px rgba(0, 0, 0, 0.5), -1px -1px 5px rgba(0, 0, 0, 0.5)' // cast shadow in every direction
            },
            hzAboveCss = {
                'background':'none',
                'display':'flex',
                'flex-direction':'row',
                'flex-wrap':'nowrap',
                'align-items':'flex-end'
            },
            hzBelowCss = {
                'background':'none',
                'display':'flex',
                'flex-direction':'row',
                'flex-wrap':'nowrap',
                'align-items':'flex-start'
            },
            hzCaptionMiscellaneousCss = {
                'background':'none',
                'display':'flex',
                'margin':'auto',
                'justify-content':'center',
                'min-width':'25%'
            },
            hzDetailsCss = {
                'background':'none',
                'display':'flex',
                'flex-direction':'row',
                'flex-wrap':'nowrap',
                'min-width':'25%'
            },
            hzGalleryInfoCss = {
                'position':'absolute',
                'z-index':'2147483647',
                'padding':'2px',
                'top':'14px',
                'left':'20px',
                'font':'menu',
                'font-size':'14px',
                'font-weight':'bold',
                'color':'white',
                'text-shadow':'1px 1px 0px black, -1px 1px 0px black, 1px -1px 0px black, -1px -1px 0px black',
                'text-align':'center',
                'overflow':'hidden',
                'vertical-align':'top',
                'horizontal-align':'right'
            };
        var flashFixDomains = [
            'www.redditmedia.com'
        ];

        // calculate optimal image position and size
        function posImg(position) {

            imgSkipped = false
            imgError = false;

            if (!imgFullSize) {
                return;
            }

            // because of iframes, we should use parent window (= main window) for positioning and sizing
            if (position === undefined || position.top === undefined || position.left === undefined) {
                position = {top:mousePos.top, left:mousePos.left};
            }

            var offset = 20,
                padding = 10,
                zoom = window.devicePixelRatio || 1.0,
                scrollBarHeight = (hasScrollbarH() ? 17 / zoom : 0),
                statusBarHeight = 30 / zoom,
                scrollBarWidth = 17 / zoom,
                wndWidth = innerWidth,
                wndHeight = innerHeight,
                bodyStyleLeft = Math.abs(parseInt(document.body.style.left) || 0),
                bodyStyleTop = Math.abs(parseInt(document.body.style.top) || 0),
                bodyScrollLeft = document.body.scrollLeft,
                bodyScrollTop = document.body.scrollTop,
                docStyleLeft = (document.documentElement ? (Math.abs(parseInt(document.documentElement.style.left) || 0)) : 0),
                docStyleTop = (document.documentElement ? (Math.abs(parseInt(document.documentElement.style.top) || 0)) : 0),
                docScrollLeft = (document.documentElement ? document.documentElement.scrollLeft : 0),
                docScrollTop = (document.documentElement ? document.documentElement.scrollTop : 0),
                wndScrollLeft = Math.max(bodyStyleLeft, bodyScrollLeft, docStyleLeft, docScrollLeft),
                wndScrollTop = Math.max(bodyStyleTop, bodyScrollTop, docStyleTop, docScrollTop),
                bodyWidth = document.body.clientWidth,
                displayOnRight = (position.left - wndScrollLeft < wndWidth / 2);

            function adjustCaptionMiscellaneousDetails() {

                // needed to avoid a bug with some websites (e.g. instagram)
                if (hzCaptionMiscellaneous)
                    hzCaptionMiscellaneous.css('max-width', 0);
                if (hzDetails)
                    hzDetails.css('max-width', 0);
                if (hzAbove)
                    hzAbove.css('max-width', 0);
                if (hzBelow)
                    hzBelow.css('max-width', 0);

                // this is looped 10x max just in case something goes wrong, to avoid freezing the process
                let i = 0;

                while (!imageLocked && hz.hzImg.height() > wndHeight - statusBarHeight - scrollBarHeight && i++ < 10) {
                    imgFullSize.height(wndHeight - padding - statusBarHeight - scrollBarHeight - (hzAbove ? hzAbove.height() : 0) - (hzBelow ? hzBelow.height() : 0)).width('auto');
                }

                if (hzCaptionMiscellaneous)
                    hzCaptionMiscellaneous.css('max-width', imgFullSize[0].clientWidth);
                if (hzDetails)
                    hzDetails.css('max-width', imgFullSize[0].clientWidth);
                if (hzAbove)
                    hzAbove.css('max-width', imgFullSize[0].clientWidth);
                if (hzBelow)
                    hzBelow.css('max-width', imgFullSize[0].clientWidth);

                // do not display caption nor details if img is too small
                if (imgFullSize[0].clientWidth < 50) {
                    if (hzAbove) hzAbove.hide();
                    if (hzBelow) hzBelow.hide();
                } else {
                    if (hzAbove) hzAbove.show();
                    if (hzBelow) hzBelow.show();

                    if (hzDetails) {

                        // add img dimensions if missing
                        displayImgDimensions();

                        let nb = hzDetails.find('.hzDetail').length;
                        let i = 0;
                        while (hzDetails[0].scrollWidth - 1 <= hzDetails[0].clientWidth && i < nb ) {
                            hzDetails.find('.hzDetail').eq(i++).show();
                        }
                        i = nb;
                        while (hzDetails[0].scrollWidth - 1 > hzDetails[0].clientWidth && i > 0) {
                            hzDetails.find('.hzDetail').eq(--i).hide();
                        }
                    }
                }
            }

            if (displayOnRight) {
                position.left += offset;
            } else {
                position.left -= offset;
            }

            if ($('#hzImgLoader.imgLoading')[0] != undefined) {

                hz.displayImgLoader('loading', position);
                return;

                /*position.top -= 10;
                if (!displayOnRight) {
                    position.left -= 25;
                }*/

            } else {

                // img fully loaded
                loading = false;

                imgFullSize.width('auto').height('auto');
                hz.hzImg.width('auto').height('auto');
                //hz.hzImg.css('visibility', 'visible');

                // image natural dimensions
                imgDetails.naturalWidth = (imgFullSize[0].naturalWidth ? imgFullSize[0].naturalWidth : imgFullSize.width()) * zoomFactor;
                imgDetails.naturalHeight = (imgFullSize[0].naturalHeight ? imgFullSize[0].naturalHeight : imgFullSize.height()) * zoomFactor;

                if (!imgDetails.naturalWidth || !imgDetails.naturalHeight) {
                    return;
                }

                // width adjustment
                var fullZoom = options.mouseUnderlap || fullZoomKeyDown || imageLocked;
                if (imageLocked) {
                    imgFullSize.width(imgDetails.naturalWidth);
                } else if (fullZoom) {
                    imgFullSize.width(Math.min(imgDetails.naturalWidth, wndWidth - padding - 2 * scrollBarWidth));
                } else if (displayOnRight) {
                    if (imgDetails.naturalWidth + padding > wndWidth - position.left) {
                        imgFullSize.width(wndWidth - position.left - padding + wndScrollLeft);
                    }
                } else {
                    if (imgDetails.naturalWidth + padding > position.left) {
                        imgFullSize.width(position.left - padding - wndScrollLeft);
                    }
                }

                // height adjustment
                if (!imageLocked && hz.hzImg.height() > wndHeight - padding - statusBarHeight - scrollBarHeight) {
                    imgFullSize.height(wndHeight - padding - statusBarHeight - scrollBarHeight).width('auto');
                }

                adjustCaptionMiscellaneousDetails();

                position.top -= hz.hzImg.height() / 2;

                // display image on the left side if the mouse is on the right
                if (!displayOnRight) {
                    position.left -= hz.hzImg.width() + padding;
                }

                // horizontal position adjustment if full zoom
                if (fullZoom) {
                    if (displayOnRight) {
                        position.left = Math.min(position.left, wndScrollLeft + wndWidth - hz.hzImg.width() - padding - 2 * scrollBarWidth);
                    } else {
                        position.left = Math.max(position.left, wndScrollLeft);
                    }
                }

                // vertical position adjustments
                var maxTop = wndScrollTop + wndHeight - hz.hzImg.height() - padding - statusBarHeight - scrollBarHeight;
                if (position.top > maxTop) {
                    position.top = maxTop;
                }
                if (position.top < wndScrollTop + 0.5 * padding) {
                    position.top = wndScrollTop + 0.5 * padding;
                }

                if (options.ambilightEnabled) {
                    updateAmbilight();
                }
            }

            if (options.centerImages || imageLocked) {
                hz.hzImg.css('top', (wndHeight / 2 - hz.hzImg.height() / 2 - padding / 2 - statusBarHeight / 2 - scrollBarHeight / 2) + 'px');
                hz.hzImg.css('left', (wndWidth / 2 - hz.hzImg.width() / 2 - padding / 2 - scrollBarWidth / 2) + 'px');
                hz.hzImg.css('position', 'fixed');
            } else {
                // this fixes positioning when the body's width is not 100%
                if (body100pct) {
                    position.left -= (wndWidth - bodyWidth) / 2;
                }

                // check that image is not too much on the left side
                if (position.left < wndScrollLeft + 0.5 * padding) {
                    position.left = wndScrollLeft + 0.5 * padding;
                }

                // check that image is not too much on the right side
                if (position.left + imgFullSize.width() + 2 * padding > wndScrollLeft + wndWidth) {
                    position.left = wndScrollLeft + 0.5 * padding;
                }

                hz.hzImg.css({top:Math.round(position.top), left:Math.round(position.left)});
            }
        }

        function panLockedImage() {
            var width = imgFullSize[0].width || imgFullSize[0].videoWidth * zoomFactor;
            var height = imgFullSize[0].height || imgFullSize[0].videoHeight * zoomFactor;
            var widthOffset = (width - window.innerWidth) / 2;
            var heightOffset = (height - window.innerHeight) / 2;
            var ratioX = 1 - (2 * event.clientX / window.innerWidth);
            var ratioY = 1 - (2 * event.clientY / window.innerHeight);
            var dx = widthOffset > 0 ? ratioX * (widthOffset + 50) : 0;
            var dy = heightOffset > 0 ? ratioY * (heightOffset + 50) : 0;
            hz.hzImg.css('transform', `translate(${dx}px, ${dy}px)`);
        }

        // adapted from: https://gist.github.com/numee/1e7a19cd26113323f1ae
        function hasScrollbarH() {
            var rootElem = document.documentElement || document.body,
                overflowStyle;

            if (typeof rootElem.currentStyle !== 'undefined')
            {
                overflowStyle = rootElem.currentStyle.overflow;
            }
            overflowStyle = overflowStyle || window.getComputedStyle(rootElem, '').overflow;

            var contentOverflows = rootElem.scrollWidth > rootElem.clientWidth;
            var overflowShown = /(visible|auto)/.test(overflowStyle);
            var alwaysShowScroll = overflowStyle === 'scroll';
            return (contentOverflows && overflowShown) || (alwaysShowScroll);
        }

        function isVideoLink(url, includeGifs) {

            if (url.indexOf('.video') != -1) return true;

            if (url.lastIndexOf('?') > 0)
                url = url.substr(0, url.lastIndexOf('?'));
            var ext = url.substr(url.length - 4).toLowerCase();
            includeGifs = includeGifs || false;
            return (includeGifs && (ext == '.gif' || ext == 'gifv')) || ext == 'webm' || ext == '.mp4' || ext == '3gpp' || url.indexOf('googlevideo.com/videoplayback') > 0 || url.indexOf('v.redd.it') > 0;
        }

        // some plug-ins append:
        // .video to video streams so url =  videourl.video
        // .audio to audio streams so url = audiourl.audio
        // if both urls are present then url = videourl.video_audiourl.audio
        function getVideoAudioFromUrl() {
            var videourl = imgDetails.url.split('.video')[0];
            var audiourl = imgDetails.url.split('.video')[1] || '';
            if (audiourl.endsWith('.audio')) { imgDetails.audioUrl = audiourl.replace(/^_/, '').replace('.audio', ''); }
            imgDetails.url = videourl;
        }

        function updateAmbilight() {
            if (!hz.hzImg) return;
            var canvas = hz.hzImg.find('canvas')[0];
            if (!canvas || !imgFullSize) return;

            var isVideo = isVideoLink(imgDetails.url, true);

            if (!(isVideo || (imgFullSize.get(0).complete && imgFullSize.get(0).naturalWidth))) {
                window.setTimeout(updateAmbilight, 20);
                return;
            }

            let width = imgFullSize.width();
            let height = imgFullSize.height();
            let blur = options.ambilightHaloSize * 100;
            let scale = 1 + options.ambilightHaloSize;
            let scaleW = scale;
            let scaleH = scale;
            if (height > width) { scaleH = scale; scaleW = (width + height * (scale - 1)) / width; }
            if (height < width) { scaleW = scale; scaleH = (height + width * (scale - 1)) / height;  }

            $(canvas).attr('width', width)
                     .attr('height', height)
                     .css('padding', 4 * scale * blur + 'px')
                     .css('margin-top', -4 * scale * blur + 'px')
                     .css('margin-left', -4 * scale * blur + 'px')
                     .css('-webkit-filter', 'blur(' + blur + 'px)')
                     .css('transform', 'scale(' + scaleW + ',' + scaleH + ')');
            var ctx = canvas.getContext('2d');
            ctx.drawImage(imgFullSize.get(0), 0, 0, width, height);

            if (isVideo)
                window.setTimeout(updateAmbilight, 30);
        }

        function isPointInRect(point, rect) {
            return point.top > rect.top && point.top < rect.bottom && point.left > rect.left && point.left < rect.right;
        }

        function posWhileLoading() {
            if (loading) {
                posImg();
                if ($('#hzImgLoader.imgLoading')[0] != undefined && imgFullSize && imgFullSize.height() > 0) {
                    displayFullSizeImage();
                } else {
                    setTimeout(posWhileLoading, 100);
                }
            }
        }

        // Remove the 'title' attribute from all elements to prevent a tooltip from appearing above the zoomed image.
        // Titles are saved so they can be restored later.
        function removeTitles(img) {
            if (titledElements) {
                restoreTitles();
            }
            titledElements = img.parents('[title]').not('iframe, .lightbox, [rel^="lightbox"]');
            // Occasionally, the img element itself will have a title attribute
            // which we like to handle that as well
            titledElements = titledElements.add(img.filter('[title]'));
            titledElements.each(function () {
                $(this).data().hoverZoomTitle = this.getAttribute('title');
                this.title = '';
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

        // set frame background color and border to match chosen option
        function frameBackgroundColor(color) {
            imgFullSizeCss.borderColor = imgFullSizeCss.backgroundColor = hzCaptionCss.backgroundColor = hzDetailCss.backgroundColor = hzMiscellaneousCss.backgroundColor = color;

            if (options.fontOutline) {
                // outline text: white font + thin black border
                hzCaptionCss.color = hzMiscellaneousCss.color = hzDetailCss.color = 'white';
                hzCaptionCss.textShadow = hzMiscellaneousCss.textShadow = hzDetailCss.textShadow = '1px 1px 0px black, -1px 1px 0px black, 1px -1px 0px black, -1px -1px 0px black';
                return;
            }

            // update text color in function of frame background color
            let hsl = hz.hexToHSL(color);
            let textColor = (hsl.l > 50 ? 'black' : 'white');
            hzCaptionCss.color = hzMiscellaneousCss.color = hzDetailCss.color = textColor;
            hzCaptionCss.textShadow = hzMiscellaneousCss.textShadow = hzDetailCss.textShadow = '';
        }

        // set border thickness in pixel(s)
        function frameThickness(thickness) {
            imgFullSizeCss.borderWidth = imgFullSizeCss.borderRadius = thickness + 'px';
        }

        // set font size in pixel(s)
        function fontSize(size) {
            size = parseInt(size);
            hzCaptionCss.fontSize = hzMiscellaneousCss.fontSize = hzDetailCss.fontSize = size + 'px';
            hzDetailCss.paddingTop = 0.3 * size + 'px';
            hzDetailCss.paddingBottom = 0.3 * size + 'px';
            hzDetailCss.paddingLeft = hzDetailCss.paddingRight = 0.5 * size + 'px';
            hzDetailCss.lineHeight = size + 'px';
            hzCaptionCss.padding = hzMiscellaneousCss.padding = 0.2 * size + 'px';
            hzCaptionCss.paddingLeft = hzMiscellaneousCss.paddingLeft = hzCaptionCss.paddingRight = hzMiscellaneousCss.paddingRight = 0.5 * size + 'px';
            hzCaptionCss.marginLeft = hzMiscellaneousCss.marginLeft = hzDetailCss.marginLeft = size + 'px';
            hzCaptionCss.marginRight = hzMiscellaneousCss.marginRight = size + 'px';
            hzCaptionCss.borderRadius = hzMiscellaneousCss.borderRadius = hzDetailCss.borderRadius = 0.25 * size + 'px';
            hzAboveCss.marginBottom = hzBelowCss.marginTop = -0.25 * size + 'px';
        }

        function stopMedias() {
            stopMedia('video');
            stopMedia('audio');
        }

        function stopMedia(selector) {
            if (!hz.hzImg) return;
            var el = hz.hzImg.find(selector).get(0);
            if (el) {
                el.pause();
                el.src = '';
            }
        }

        function hideHoverZoomImg(now) {
            cLog('hideHoverZoomImg(' + now + ')');

            if (hz.hzImgLoader) { hz.hzImgLoader.remove(); hz.hzImgLoader = null; }
            if ((!now && !imgFullSize) || !hz.hzImg || fullZoomKeyDown || imageLocked) {
                return;
            }
            if (imgFullSize) {
                stopMedias();
                imgFullSize.remove();
                imgFullSize = null;
                imageLocked = false;
            }
            if (loading) {
                now = true;
            }
            hz.hzImg.stop(true, true).fadeOut(now ? 0 : options.fadeDuration, function () {
                stopMedias();
                hzCaptionMiscellaneous = null;
                hzDetails = null;
                hz.hzImg.empty();
                if (imgFullSize) {
                    imgFullSize.remove();
                    imgFullSize = null;
                    imageLocked = false;
                }
                restoreTitles();
            });
            //chrome.runtime.sendMessage({action: 'viewWindow', visible: false});
        }

        function normalizeSrc(hoverZoomSrcIndex, links, dataKey) {
            var data = links.data()[dataKey];
            if (!data) {
                return undefined;
            }

            var src = data[hoverZoomSrcIndex];
            if (src && src.indexOf('http') !== 0) {
                if (src.indexOf('//') !== 0) {
                    if (src.indexOf('/') !== 0) {
                        // Image has relative path (doesn't start with '/')
                        var path = window.location.pathname;
                        path = path.substr(0, path.lastIndexOf('/') + 1);
                        src = path + src;
                    }
                    src = '//' + window.location.host + src;
                }
                src = window.location.protocol + src;
                links.data()[dataKey][hoverZoomSrcIndex] = src;
            }
            return src;
        }

        function documentMouseMove(event) {
            if (!options.extensionEnabled || fullZoomKeyDown || isExcludedSite() || wnd.height() < 30 || wnd.width() < 30) {
                return;
            }

            // Pan image around if it's zoomed larger than the screen.
            if (imageLocked && imgFullSize) {
                panLockedImage();
                return;
            }

            var links,
                target = $(event.target),
            // Test if the action key was pressed without moving the mouse
                explicitCall = typeof(event.pageY) === 'undefined';

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
                (imgFullSize && imgFullSize.length && target[0] === imgFullSize[0] ||
                    hz.hzImg && hz.hzImg.length && target[0] === hz.hzImg[0])) {
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
                if (links.data().hoverZoomSrc && typeof(links.data().hoverZoomSrc) !== 'undefined' &&
                    links.data().hoverZoomSrc[hoverZoomSrcIndex] &&
                    typeof(links.data().hoverZoomSrc[hoverZoomSrcIndex]) !== 'undefined') {
                    // Happens when the mouse goes from an image to another without hovering the page background
                    if (imgDetails.url && links.data().hoverZoomSrc[hoverZoomSrcIndex] !== imgDetails.url) {
                        cLog("hiding because " + links.data().hoverZoomSrc[hoverZoomSrcIndex] + " !== " + imgDetails.url);
                        hideHoverZoomImg();
                    }

                    removeTitles(target);

                    // if the image source has not been set yet
                    if (!imgFullSize) {
                        hz.currentLink = links;

                        if (links.data().hoverZoomSrc && (!options.actionKey || actionKeyDown)) {

                            var src = hoverZoom.getFullUrl(links.data().hoverZoomSrc[hoverZoomSrcIndex]);
                            var audioSrc = (links.data().hoverZoomAudioSrc ? hoverZoom.getFullUrl(links.data().hoverZoomAudioSrc[hoverZoomSrcIndex]) : undefined);

                            // only works after img has been loaded
                            /*let height = undefined;
                            let width = undefined;
                            let imgDim = hz.getImageDimensions(src, width, height);*/


                            imgDetails.displayedWidth = links.width();
                            imgDetails.displayedHeight = links.height();

                            imgDetails.url = src;
                            imgDetails.audioUrl = audioSrc;
                            clearTimeout(loadFullSizeImageTimeout);

                            // if the action key has been pressed over an image, no delay is applied
                            var delay = actionKeyDown || explicitCall ? 0 : (isVideoLink(imgDetails.url) ? options.displayDelayVideo : options.displayDelay);
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

        function documentContextMenu(event) {
            // If it's been less than 300ms since right click, lock image and prevent context menu.
            var lockElapsed = event.timeStamp - lockImageClickTime;
            if (imgFullSize && !imageLocked && options.lockImageKey == -1 & lockElapsed < 300) {
                lockImage();
                event.preventDefault();
            }
        }

        function documentMouseDown(event) {
            // Right click pressed and lockImageKey is set to special value for right click (-1).
            if (imgFullSize && !imageLocked && options.lockImageKey == -1 && event.button == 2) {
                lockImageClickTime = event.timeStamp;
            } else if (imgFullSize && event.target != hz.hzImg[0] && event.target != imgFullSize[0]) {
                if (imageLocked && event.button == 0) {
                    imageLocked = false;
                }
                cancelImageLoading();
                restoreTitles();
            }
        }

        function loadFullSizeImage() {
            cLog('loadFullSizeImage');
            // If no image is currently displayed...
            if (!imgFullSize) {
                hz.displayImgLoader('loading');
                hz.createHzImg(!hideKeyDown);
                zoomFactor = parseInt(options.zoomFactor);

                imgDetails.video = isVideoLink(imgDetails.url);
                if (imgDetails.video) {
                    getVideoAudioFromUrl();

                    if (!options.zoomVideos) {
                        cancelImageLoading();
                        return;
                    }
                    var video = document.createElement('video');
                    video.style.width = 0;
                    video.style.height = 0;
                    video.loop = true;
                    video.muted = options.muteVideos;
                    video.volume = options.videoVolume;
                    video.src = imgDetails.url;
                    imgFullSize = $(video).appendTo(hz.hzImg);
                    video.addEventListener('error', imgFullSizeOnError);
                    video.addEventListener('loadedmetadata', function() {
                        posImg();
                        if (options.videoTimestamp) {
                            addTimestampTrack(video);
                        }
                    });
                    video.addEventListener('loadeddata', function() {
                        imgFullSizeOnLoad();
                        video.play();
                        video.removeAttribute('poster');
                    });

                    if (imgDetails.audioUrl) {
                        var audio = document.createElement('audio');
                        audio.autoplay = false;
                        audio.muted = options.muteVideos;
                        audio.volume = options.videoVolume;
                        audio.src = imgDetails.audioUrl;
                        $(audio).appendTo(imgFullSize);

                        video.addEventListener('play', function() {
                            audio.play();
                        });

                        video.addEventListener('seeked', function() {
                            audio.currentTime = video.currentTime;
                        });

                        video.addEventListener('volumechange', function() {
                            audio.volume = video.volume;
                        });

                        audio.load();
                    }

                    video.load();
                } else {

                    hoverZoom.hzImg.hzImgContainer = $('<div id="hzImgContainer" style="position:relative"></div>').appendTo(hoverZoom.hzImg);
                    imgFullSize = $('<img style="border: none" />').appendTo(hz.hzImg.hzImgContainer).on('load', imgFullSizeOnLoad).on('error', imgFullSizeOnError).attr('src', imgDetails.url);
                    // Note for Chrome: if image is loaded from cache then 'load' event is never fired
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

        function addTimestampTrack(video){

            var track;
            if (video.textTracks.length) {
                // reuse previous track: remove all cues
                track = video.textTracks[0];
                for (let c = track.cues.length - 1; c >= 0; c--) {
                    let cue = track.cues[c];
                    track.removeCue(cue);
                }
                track.mode = "hidden"; // needed to update video
            } else {
                track = video.addTextTrack("captions", "English", "en");
            }

            var duration = Math.ceil(video.duration);
            // create an array that hosts the times from decending order
            // TODO: see if there is a way to optimize this as it causes a small lag
            var timer = [];
            for (var time = duration; time >= 0; time--) {
                var hours = Math.floor(time / 3600);
                var minutes = Math.floor((time - hours*3600) / 60);
                var seconds = time % 60;
                var finalTime = "";
                if (hours > 0) {
                    finalTime += hours + ":";
                }
                if (hours > 0 || minutes > 0) {
                    finalTime += (hours > 0 && minutes < 10 ? "0" : "") + minutes + ":";
                }
                finalTime += ((hours > 0 || minutes > 0) && seconds < 10 ? "0" : "") + seconds;
                timer.push(finalTime);
            }
            for (var i = 0; i <= duration; i++) {
                track.addCue(new VTTCue(i, i == duration ? video.duration : i+1, timer[i]));
                track.cues[i].align = "end";
                track.cues[i].position = 100;
                track.cues[i].line = 0;
            }
            track.mode = "showing";
        }

        function imgFullSizeOnLoad() {
            logger.enterFunc();
            // only the last hovered link gets displayed
            if (imgDetails.url == $(imgFullSize).prop('src')) {
                loading = false;
                displayFullSizeImage();
            }
        }

        function initLinkRect(elem) {
            linkRect = elem.offset();
            linkRect.bottom = linkRect.top + elem.height();
            linkRect.right = linkRect.left + elem.width();
        }

        function displayFullSizeImage() {
            cLog('displayFullSizeImage');

            if (hz.hzImgLoader) { hz.hzImgLoader.remove(); hz.hzImgLoader = null; }

            hz.hzImg.stop(true, true);
            hz.hzImg.offset({top:-9000, left:-9000});    // hides the image while making it available for size calculations
            hz.hzImg.empty();

            hz.hzImg.css('visibility', 'visible');

            clearTimeout(cursorHideTimeout);
            hz.hzImg.css('cursor', 'none');
            hz.hzImg.css('pointer-events', 'none');

            if (options.ambilightEnabled) {

                imgFullSizeCss.boxShadow = 'none';
                imgFullSizeCss.borderColor = 'none';
                imgFullSizeCss.borderRadius = 'none';
                imgFullSizeCss.borderStyle = 'none';
                imgFullSizeCss.borderWidth = 'none';

                hz.hzImg.css('overflow', 'visible');
                hz.hzImg.css('border', '0px');
                hz.hzImg.css('padding', '10px');
                hz.hzImg.css('box-shadow', 'none');
                var background = $('<div/>');
                $(background).css('width', 2 * screen.availWidth)
                             .css('height', 2 * screen.availHeight)
                             .css('position', 'fixed')
                             .css('z-index', -2)
                             .css('top', -screen.availHeight)
                             .css('left', -screen.availWidth)
                             .css('pointer-events', 'none')
                             .css('background-color', 'black')
                             .css('opacity', options.ambilightBackgroundOpacity);
                background.appendTo(hz.hzImg);

                var canvas = $('<canvas/>');
                $(canvas).css('position', 'absolute')
                         .css('z-index', -1)
                         .css('pointer-events', 'none')
                         .css('opacity', 1);
                canvas.appendTo(hz.hzImg);
            }

            hz.hzImg.hzImgContainer = $('<div id="hzImgContainer" style="position:relative"></div>').appendTo(hz.hzImg);
            imgFullSize.css(imgFullSizeCss).appendTo(hz.hzImg.hzImgContainer).mousemove(imgFullSizeOnMouseMove);

            if (hz.currentLink) {
                // Sets up the thumbnail as a full-size background
                imgThumb = hz.currentLink;
                var lowResSrc = imgThumb.prop('src');
                if (!lowResSrc) {
                    imgThumb = hz.currentLink.find('[src]');
                    if (imgThumb.length > 0) {
                        imgThumb = $(imgThumb[0]);
                        lowResSrc = imgThumb.prop('src');
                    }
                }
                if (!lowResSrc) {
                    imgThumb = hz.currentLink.find('[style]');
                    if (imgThumb.length > 0) {
                        imgThumb = $(imgThumb[0]);
                        lowResSrc = hz.getThumbUrl(imgThumb);
                    }
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

                if (imageLocked) {
                    // Allow clicking on locked image.
                    hz.hzImg.css('pointer-events', 'auto');
                }

                initLinkRect(imgThumb || hz.currentLink);
            }

            if (hz.currentLink) {
                var linkData = hz.currentLink.data();

                if (!options.ambilightEnabled) displayCaptionMiscellaneousDetails();

                if (linkData.hoverZoomGallerySrc && linkData.hoverZoomGallerySrc.length > 1) {
                    var info = (linkData.hoverZoomGalleryIndex + 1) + '/' + linkData.hoverZoomGallerySrc.length;
                    hzGallery = $('<div/>', {id:'hzGallery', text:info}).css(hzGalleryInfoCss).prependTo(hz.hzImg.hzImgContainer);
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
                var url = hz.currentLink.attr('href') || imgDetails.url;
                if (url.startsWith('/') && url.indexOf('http') < 0)
                    url = window.location.protocol + '//' + window.location.hostname + url;
                chrome.runtime.sendMessage({action:'addUrlToHistory', url:url});
            }
        }

        function displayImgDimensions() {

            let details = getImgDetails(hz.currentLink);
            try { details = JSON.parse(details) } catch { details = null }
            if (options.detailsLocation != "none" && details) {

                if (hzDetails == null) {
                    if (options.detailsLocation === "above") hzDetails = $('<div/>', {id:'hzDetails'}).css(hzDetailsCss).appendTo(hzAbove);
                    if (options.detailsLocation === "below") hzDetails = $('<div/>', {id:'hzDetails'}).css(hzDetailsCss).appendTo(hzBelow);
                }

                // add duration (videos only)
                if (details.duration)
                    if (hzDetails.find('#hzDetailDuration').length == 0)
                        $('<div/>', {id:'hzDetailDuration', text:details.duration, class:'hzDetail'}).css(hzDetailCss).prependTo(hzDetails);

                // add dimensions (WxH) at first position (left-most)
                if (details.dimensions) {
                    if (hzDetails.find('#hzDetailDimensions').length == 0)
                        $('<div/>', {id:'hzDetailDimensions', text:details.dimensions, class:'hzDetail'}).css(hzDetailCss).prependTo(hzDetails);
                }
            }
        }

        function displayCaptionMiscellaneousDetails() {

            let linkData = hz.currentLink.data();
            let caption = linkData.hoverZoomCaption;
            let miscellaneous = getTextSelected();
            let details = getImgDetails(hz.currentLink);
            try { details = JSON.parse(details) } catch { details = null }

            $('#hzAbove').remove();
            $('#hzBelow').remove();
            hzAbove = $('<div/>', {id:'hzAbove'}).css(hzAboveCss).prependTo(hz.hzImg);
            hzBelow = $('<div/>', {id:'hzBelow'}).css(hzBelowCss).appendTo(hz.hzImg);

            if (options.detailsLocation != "none" && details) {
                if (options.detailsLocation === "above") hzDetails = $('<div/>', {id:'hzDetails'}).css(hzDetailsCss).appendTo(hzAbove);
                if (options.detailsLocation === "below") hzDetails = $('<div/>', {id:'hzDetails'}).css(hzDetailsCss).appendTo(hzBelow);

                // extension
                if (details.extension) $('<div/>', {id:'hzDetailExtension', text:details.extension.toUpperCase(), class:'hzDetail'}).css(hzDetailCss).appendTo(hzDetails);
                // host
                if (details.host) $('<div/>', {id:'hzDetailHost', text:details.host, class:'hzDetail'}).css(hzDetailCss).appendTo(hzDetails);
                // filename
                if (details.filename) $('<div/>', {id:'hzDetailFilename', text:details.filename, class:'hzDetail'}).css(hzDetailCss).appendTo(hzDetails);
            }

            if (options.captionLocation != "none" && (caption || miscellaneous)) {
                if (options.captionLocation === "above") hzCaptionMiscellaneous = $('<div/>', {id:'hzCaptionMiscellaneous'}).css(hzCaptionMiscellaneousCss).appendTo(hzAbove);
                if (options.captionLocation === "below") hzCaptionMiscellaneous = $('<div/>', {id:'hzCaptionMiscellaneous'}).css(hzCaptionMiscellaneousCss).appendTo(hzBelow);

                if (caption) $('<div/>', {id:'hzCaption', text:caption}).css(hzCaptionCss).appendTo(hzCaptionMiscellaneous);
                if (miscellaneous) $('<div/>', {id:'hzMiscellaneous', text:miscellaneous}).css(hzMiscellaneousCss).appendTo(hzCaptionMiscellaneous);
            }
        }

        function imgFullSizeOnError() {

            if (imgDetails.url === $(this).prop('src')) {
                let hoverZoomSrcIndex = hz.currentLink ? hz.currentLink.data().hoverZoomSrcIndex : 0;

                if (imgFullSize) {
                    imgFullSize.remove();
                    imgFullSize = null;
                    imageLocked = false;
                }

                if (hz.currentLink && hoverZoomSrcIndex < hz.currentLink.data().hoverZoomSrc.length - 1) {
                    // if the link has several possible sources, we try to load the next one
                    hoverZoomSrcIndex++;
                    hz.currentLink.data().hoverZoomSrcIndex = hoverZoomSrcIndex;
                    let nextSrc = hz.currentLink.data().hoverZoomSrc[hoverZoomSrcIndex];
                    console.info('[HoverZoom] Failed to load image: ' + imgDetails.url + '\nTrying next one: ' + nextSrc);
                    imgDetails.url = nextSrc;
                    clearTimeout(loadFullSizeImageTimeout);
                    loadFullSizeImageTimeout = setTimeout(loadFullSizeImage, 100);
                } else {
                    // no more sources to try
                    loading = false;
                    if (options.useSeparateTabOrWindowForUnloadableUrlsEnabled) {
                        // last attempt to display image in separate tab or window
                        console.info('[HoverZoom] Failed to load image: ' + imgDetails.url + ' in current window.\nTrying to load image in separate window or tab...');
                        if (options.useSeparateTabOrWindowForUnloadableUrls == 'window') {
                            openImageInWindow();
                        } else if (options.useSeparateTabOrWindowForUnloadableUrls == 'tab') {
                            openImageInTab(true); // do not focus tab
                        }
                    } else {
                        console.warn('[HoverZoom] Failed to load image: ' + imgDetails.url);
                    }
                }
            }
        }

        var firstMouseMoveAfterCursorHide = false,
            cursorHideTimeout = 0;

        function hideCursor() {
            firstMouseMoveAfterCursorHide = true;
            hz.hzImg.css('cursor', 'none');
        }

        var lastMousePosTop = -1;
        var lastMousePosLeft = -1;

        function imgFullSizeOnMouseMove() {
            if (lastMousePosTop == mousePos.top && lastMousePosLeft == mousePos.left) {
                return;
            }

            if (imageLocked) {
                // Don't hide cursor on locked image.
                return;
            }

            lastMousePosTop = mousePos.top;
            lastMousePosLeft = mousePos.left;

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
            loading = false;
            hz.currentLink = null;
            clearTimeout(loadFullSizeImageTimeout);
            hideHoverZoomImg();
        }

        function getTextSelected() {
            // remove carriage returns
            return window.getSelection().toString().replace(/\n/g, " "); // "&crarr;"
        }

        function getImgDetails(link) {
            let details = {};
            details.dimensions = imgDetails.naturalWidth / options.zoomFactor + 'x' + imgDetails.naturalHeight / options.zoomFactor;
            details.extension = getExtensionFromUrl(imgDetails.url);
            details.host = imgDetails.host;
            let filename = getDownloadFilename();
            if (filename) details.filename = filename;
            let duration = getDurationFromVideo();
            if (duration) details.duration = duration.replace(/ /g, ':');
            return JSON.stringify(details);
        }

        function prepareImgCaption(link) {

            logger.enterFunc();
            logger.info(link[0].outerHTML);

            var title = "";
            var alt = "";
            var figcaption = "";
            var textAround = "";
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
                if (alt && !/^\d+$/.test(alt)) {
                    link.data().hoverZoomCaption = alt;
                } else {
                    var ref = link.attr('ref') || link.find('[ref]').attr('ref');
                    if (ref && !/^\d+$/.test(ref)) {
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
                if (!linkData.hoverZoomSrc && !linkData.hoverZoomGallerySrc && !linkData.href && $.isEmptyObject(linkData.meta)) {
                    prepareImgLinksAsync(true);
                } else {
                    // Skip if the image has the same URL as the thumbnail.
                    if (linkData.hoverZoomSrc) {
                        var url = linkData.hoverZoomSrc[0],
                            skip = url === link.attr('src');
                        if (!skip) {
                            link.find('img[src]').each(function () {
                                if (this.src === url) {
                                    skip = true;
                                }
                            });
                        }
                        if (skip) {
                            return;
                        }
                    }

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
                        if (!linkData.hoverZoomGalleryIndex)
                            linkData.hoverZoomGalleryIndex = 0;
                        linkData.hoverZoomGallerySrc = linkData.hoverZoomGallerySrc.map(function (srcs) {
                            return srcs.map(deepUnescape);
                        });
                        updateImageFromGallery(link);
                    } else if (linkData.hoverZoomSrc) {
                        linkData.hoverZoomSrc = linkData.hoverZoomSrc.map(deepUnescape);
                    }

                    linkData.hoverZoomSrcIndex = 0;

                    // Caption
                    if (options.captionLocation !== "none" && !options.ambilightEnabled && !linkData.hoverZoomCaption) {
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
            cTime('prepareImgLinks');
            pageActionShown = false;

            // Commented this out in version 2.9 for better performances. Keep an eye on it for potential side effects.
            //$('.hoverZoomLink').removeClass('hoverZoomLink').removeData('hoverZoomSrc');

            for (var i = 0; i < hoverZoomPlugins.length; i++) {
                if (!options.disabledPlugins.includes(hoverZoomPlugins[i].name.replace(/[^\w]/g, '').toLowerCase()))
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
            cTimeEnd('prepareImgLinks');
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

        function getHostname() {
            return this.location.hostname;
        }

        function getHostname(href) {
            if (!href) { return undefined; }

            var url = new URL(href);
            return url.hostname;
        }

        function getHref(img) {
            if (img == undefined) { return undefined; }
            var href = img.prop('href');

            if (href == undefined) {
                href = img.parents('[href]').prop('href');
            }

            // remove invalid hrefs
            if (href && /mailto/.test(href.toLowerCase())) {
                href = undefined;
            }

            // replace useless href (= img url) by something more usefull
            if (href && href.match(regexImgUrl)) {
                href = window.location.href;
            }

            // use location's href in last resort (not very specific)
            if (!href) {
                href = window.location.href;
            }

            return href;
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
                        heightAttr = parseInt(this.getAttribute('height') || this.style.height || this.style.maxHeight || img.css('height') || img.css('max-height'));

                    // skip img if displayed size is above 300 x 300 px
                    if (widthAttr > 300 || heightAttr > 300) {
                        return;
                    }

                    if (document.body.querySelector('#hzDownscaled') !== null)
                        return;
                    var hzDownscaled = $('<img id="hzDownscaled" style="position: absolute; top: -10000px;">').appendTo(document.body);

                    hzDownscaled.on('load',function () {
                        setTimeout(function () {
                            // skip img if displayed size * 1.8 > natural size
                            if (hzDownscaled.height() > heightAttr * 1.8 || hzDownscaled.width() > widthAttr * 1.8) {
                                var srcs = img.data().hoverZoomSrc || [];
                                srcs.push(img.attr('src'));
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
            while (url !== ueUrl) {
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
            if (webSiteExcluded !== null) {
                return webSiteExcluded;
            }
            webSiteExcluded = isExcludedLink(location.href);
            return webSiteExcluded;
        }

        function isExcludedLink(link) {
            let url = new URL(link)['hostname'];
            let excluded = !options.whiteListMode;
            for (let i = 0; i < options.excludedSites.length; i++) {
                let es = new URL('http://' + options.excludedSites[i])['hostname'];
                if (es && es.length <= url.length) {
                    if (url.substr(url.length - es.length, es.length) === es) {
                        return excluded;
                    }
                }
            }
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
            if (message.action === 'optionsChanged') {
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
                        insertedNode.id !== 'hzDownscaled' &&
                        insertedNode.id !== 'hzImgLoader') {
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

        var lastScrollTop = 0;
        var deltaMin = 1000;
        function bindEvents() {
            wnd.bind('DOMNodeInserted', windowOnDOMNodeInserted).on('load',windowOnLoad).scroll(cancelImageLoading).blur(cancelImageLoading);

            // to deal with lazy loading : prepare imgs links when user scrolls down more than deltaMin pixels, even if no node inserted
            // for instance, on TripAdvisor:
            // img's src placeholder is replaced by real img url stored in data-lazyurl as user scrolls down
            $(document).on('scroll mousewheel', function() {
                let scrollTop = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
                if (scrollTop < lastScrollTop) {
                    lastScrollTop = scrollTop < 0 ? 0 : scrollTop; // For Mobile or negative scrolling
                } else if (scrollTop > lastScrollTop + deltaMin) {
                    lastScrollTop = scrollTop < 0 ? 0 : scrollTop; // For Mobile or negative scrolling
                    prepareImgLinksAsync();
                }
            });

            // needed when navigating galleries fullscreen
            $(document).on('click', function() { prepareImgLinksAsync(); });

            $(document).contextmenu(documentContextMenu);
            $(document).mousemove(documentMouseMove).mousedown(documentMouseDown).mouseleave(cancelImageLoading);
            $(document).keydown(documentOnKeyDown).keyup(documentOnKeyUp);
            if (options.galleriesMouseWheel) {
                window.addEventListener('wheel', documentOnMouseWheel, {passive: false});
            }
            if (options.zoomVideos) {
                $(document).on('visibilitychange', hideHoverZoomImg);
            }
        }

        function documentOnMouseWheel(event) {
            if (imageLocked) {
                // Scale up or down locked image then clamp between 0.1x and 10x.
                zoomFactor = zoomFactor * (event.deltaY < 0 ? 1.25 : 0.8);
                zoomFactor = Math.max(Math.min(zoomFactor, 10), 0.1);
                posImg();
                panLockedImage();
                event.preventDefault();
            } else if (imgFullSize) {
                var link = hz.currentLink, data = link.data();
                if (data.hoverZoomGallerySrc && data.hoverZoomGallerySrc.length !== 1) {
                    event.preventDefault();
                    if (event.deltaY < 0) {
                        rotateGalleryImg(-1);
                    } else {
                        rotateGalleryImg(1);
                    }
                } else {
                    var video = hz.hzImg.find('video').get(0);
                    if (video && !options.disableMouseWheelForVideo) {
                        event.preventDefault();
                        if (event.deltaY < 0) {
                            changeVideoPosition(-parseInt(options.videoPositionStep));
                        } else {
                            changeVideoPosition(parseInt(options.videoPositionStep));
                        }
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
            // escape key is pressed down
            if (event.which == options.escKey) {
                imageLocked = false;
                if (hz.hzImg) {
                    stopMedias();
                    hz.hzImg.hide();
                }
                if (imgFullSize) {
                    return false;
                }
            }
            // hide key (hide zoomed image) is pressed down
            if (event.which == options.hideKey && !hideKeyDown) {
                hideKeyDown = true;
                if (hz.hzImg) {
                    stopMedias();
                    hz.hzImg.hide();
                }
                if (imgFullSize) {
                    return false;
                }
            }
            // the following keys are processed only if an image is displayed
            if (imgFullSize) {
                // "Open image in a new window" key
                if (event.which == options.openImageInWindowKey) {
                    if (imgDetails.video) openVideoInWindow();
                    else openImageInWindow();
                    return false;
                }
                // "Open image in a new tab" key
                if (event.which == options.openImageInTabKey) {
                    if (imgDetails.video) openVideoInTab(event.shiftKey);
                    else openImageInTab(event.shiftKey);
                    return false;
                }
                // "Lock image" key
                if (event.which == options.lockImageKey) {
                    lockImage();
                    return false;
                }
                // "Save image" key
                if (event.which == options.saveImageKey) {
                    saveImage();
                    return false;
                }
                if (isChromiumBased) {
                    if (event.which == options.copyImageKey) {
                        copyImage();
                        return false;
                    }
                }
                if (event.which == options.copyImageUrlKey) {
                    copyLink();
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
                    var linkData = hz.currentLink.data();
                    if (linkData.hoverZoomGallerySrc && linkData.hoverZoomGallerySrc.length > 1) rotateGalleryImg(-1);
                    else changeVideoPosition(-parseInt(options.videoPositionStep));
                    return false;
                }
                // "Next image" key
                if (event.which == options.nextImgKey) {
                    var linkData = hz.currentLink.data();
                    if (linkData.hoverZoomGallerySrc && linkData.hoverZoomGallerySrc.length > 1) rotateGalleryImg(1);
                    else changeVideoPosition(parseInt(options.videoPositionStep));
                    return false;
                }
            }
        }

        function changeVideoPosition(amount) {
            var video = hz.hzImg.find('video').get(0);
            if (video && video.currentTime) {
                video.currentTime = Math.max(video.currentTime + amount, 0);
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

        function getExtensionFromUrl(url) {
            url = url.split(/[\?!#&]/)[0];
            var ext = url.substr(url.lastIndexOf('.') + 1);
            ext = ext.replace(/\//g, '');
            if (ext == '' || ext.length > 5) ext = 'jpg';
            return ext;
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
                    popupBorder = {width:16, height:39};

                if (data) {
                    try {
                        popupBorder = JSON.parse(data);
                    }
                    catch (e) {
                    }
                }

                // If image bigger than screen, adjust window dimensions to match image's aspect ratio
                var createDataWidth = imgDetails.naturalWidth + popupBorder.width;
                var createDataHeight = imgDetails.naturalHeight + popupBorder.height;
                if (createDataHeight > screen.availHeight) {
                    let imgHeight = screen.availHeight - popupBorder.height;
                    let imgWidth = Math.round(imgHeight * imgDetails.naturalWidth / imgDetails.naturalHeight);
                    createDataWidth = imgWidth + popupBorder.width;
                    createDataHeight = screen.availHeight;
                } else if (createDataWidth > screen.availWidth) {
                    let imgWidth = screen.availWidth - popupBorder.width;
                    let imgHeight = Math.round(imgWidth * imgDetails.naturalHeight / imgDetails.naturalWidth);
                    createDataWidth = screen.availWidth;
                    createDataHeight = imgHeight + popupBorder.height;
                }

                // Center window vertically & horizontally
                var createDataTop = Math.round(screen.availHeight / 2 - createDataHeight / 2);
                var createDataLeft = Math.round(screen.availWidth / 2 - createDataWidth / 2);

                createData = {
                    url:imgDetails.url,
                    width:createDataWidth,
                    height:createDataHeight,
                    top:createDataTop,
                    left:createDataLeft,
                    type:'popup',
                    incognito:chrome.extension.inIncognitoContext
                };

                chrome.runtime.sendMessage({
                    action:'openViewWindow',
                    createData:createData
                });
            });
        }

        function openVideoInWindow() {

            chrome.runtime.sendMessage({action:'getItem', id:'popupBorder'}, function (data) {
                var createData,
                    popupBorder = {width:16, height:39};

                if (data) {
                    try {
                        popupBorder = JSON.parse(data);
                    }
                    catch (e) {}
                }

                var body = '<body/>';
                body = $(body);
                body[0].style.margin = 0;
                var video = '<video/>';
                video = $(video);
                video[0].style.position = 'absolute';
                video[0].controls = true;
                video[0].src = imgDetails.url;
                video[0].setAttribute('onloadeddata', 'this.volume = ' + options.videoVolume + '; this.muted = ' + options.muteVideos + ';');
                body.append(video);
                var audio = null;
                if (imgDetails.audioUrl) {
                    // add audio source if not embedded in video
                    audio = '<audio/>';
                    audio = $(audio);
                    audio[0].controls = true;
                    audio[0].src =  imgDetails.audioUrl;
                    audio[0].setAttribute('onloadeddata', 'this.volume = ' + options.videoVolume + '; this.muted = ' + options.muteVideos + ';');
                    body.append(audio);
                    // plug audio controls (play, pause...) in video
                    video[0].setAttribute('onplay', 'document.querySelector(\'audio\').play()');
                    video[0].setAttribute('onpause', 'document.querySelector(\'audio\').pause()');
                    video[0].setAttribute('onseeked', 'document.querySelector(\'audio\').currentTime = this.currentTime');
                    // hide audio controls after 2.5s (same as video controls)
                    audio.controlsTimeout = undefined;
                    body[0].setAttribute('onmousemove', 'var audio = document.querySelector("audio"); clearTimeout(audio.controlsTimeout); audio.style = "opacity : 1"; audio.controlsTimeout = setTimeout(function() { audio.style = "transition : all ease 1s; opacity : 0" }, 2500)');
                }

                // If image bigger than screen, adjust window dimensions to match image's aspect ratio
                var createDataWidth = imgDetails.naturalWidth + popupBorder.width;
                var createDataHeight = imgDetails.naturalHeight + popupBorder.height;
                if (createDataHeight > screen.availHeight) {
                    let videoHeight = screen.availHeight - popupBorder.height;
                    let videoWidth = Math.round(videoHeight * imgDetails.naturalWidth / imgDetails.naturalHeight);
                    video[0].height = videoHeight;
                    video[0].width = videoWidth;
                    createDataWidth = videoWidth + popupBorder.width;
                    createDataHeight = screen.availHeight;
                } else if (createDataWidth > screen.availWidth) {
                    let videoWidth = screen.availWidth - popupBorder.width;
                    let videoHeight = Math.round(videoWidth * imgDetails.naturalHeight / imgDetails.naturalWidth);
                    video[0].height = videoHeight;
                    video[0].width = videoWidth;
                    createDataWidth = screen.availWidth;
                    createDataHeight = videoHeight + popupBorder.height;
                }

                // Center window vertically & horizontally
                var createDataTop = Math.round(screen.availHeight / 2 - createDataHeight / 2);
                var createDataLeft = Math.round(screen.availWidth / 2 - createDataWidth / 2);

                createData = {
                    url:'data:text/html,' + body[0].outerHTML,
                    width:createDataWidth,
                    height:createDataHeight,
                    top:createDataTop,
                    left:createDataLeft,
                    type:'popup',
                    incognito:chrome.extension.inIncognitoContext
                };

                chrome.runtime.sendMessage({
                    action:'openViewWindow',
                    createData:createData
                });
            });
        }

        function openImageInTab(background) {
            chrome.runtime.sendMessage({
                action: 'openViewTab',
                createData: {
                    url:imgDetails.url,
                    active:!background
                }
            });
        }

        function openVideoInTab(background) {

            var createData;

            var body = '<body/>';
            body = $(body);
            body[0].style.backgroundColor = 'rgb(0,0,0)';

            var video = '<video/>';
            video = $(video);
            video[0].style.position = 'absolute';
            video[0].style.margin = 'auto';
            video[0].style.top = '0px';
            video[0].style.right = '0px';
            video[0].style.bottom = '0px';
            video[0].style.left = '0px';
            video[0].style.maxHeight = '100%';
            video[0].style.maxWidth = '100%';
            video[0].controls = true;
            video[0].src = imgDetails.url;
            video[0].setAttribute('onloadeddata', 'this.volume = ' + options.videoVolume + '; this.muted = ' + options.muteVideos + ';');
            body.append(video);
            var audio = null;
            if (imgDetails.audioUrl) {
                // add audio source if not embedded in video
                audio = '<audio/>';
                audio = $(audio);
                audio[0].controls = true;
                audio[0].src =  imgDetails.audioUrl;
                audio[0].setAttribute('onloadeddata', 'this.volume = ' + options.videoVolume + '; this.muted = ' + options.muteVideos + ';');
                body.append(audio);
                // plug audio controls (play, pause...) in video
                video[0].setAttribute('onplay', 'document.querySelector(\'audio\').play()');
                video[0].setAttribute('onpause', 'document.querySelector(\'audio\').pause()');
                video[0].setAttribute('onseeked', 'document.querySelector(\'audio\').currentTime = this.currentTime');
                // hide audio controls after 2.5s (same as video controls)
                audio.controlsTimeout = undefined;
                body[0].setAttribute('onmousemove', 'var audio = document.querySelector("audio"); clearTimeout(audio.controlsTimeout); audio.style = "opacity : 1"; audio.controlsTimeout = setTimeout(function() { audio.style = "transition : all ease 1s; opacity : 0" }, 2500)');
            }

            // If image bigger than screen, adjust window dimensions to match image's aspect ratio
            var createDataWidth = imgDetails.naturalWidth;
            var createDataHeight = imgDetails.naturalHeight;
            if (createDataHeight > screen.availHeight) {
                let videoHeight = screen.availHeight;
                let videoWidth = Math.round(videoHeight * imgDetails.naturalWidth / imgDetails.naturalHeight);
                video[0].height = videoHeight;
                video[0].width = videoWidth;
            } else if (createDataWidth > screen.availWidth) {
                let videoWidth = screen.availWidth;
                let videoHeight = Math.round(videoWidth * imgDetails.naturalHeight / imgDetails.naturalWidth);
                video[0].height = videoHeight;
                video[0].width = videoWidth;
            }

            createData = {
                url:'data:text/html,' + body[0].outerHTML,
                active:!background
            };

            chrome.runtime.sendMessage({
                action:'openViewTab',
                createData:createData
            });
        }

        //stackoverflow.com/questions/49474775/chrome-65-blocks-cross-origin-a-download-client-side-workaround-to-force-down
        function forceDownload(blob, filename) {
          var a = document.createElement('a');
          a.download = filename;
          a.href = blob;
          a.click();
        }

        function downloadResource(url, filename, callback) {
            console.log('download: ' + url);
            if (!filename) filename = url.split('\\').pop().split('/').pop();

            // prefix with download folder if needed
            if (options.downloadFolder) {

                let downloadFolder = options.downloadFolder;
                filename = downloadFolder + filename;
            }

            chrome.runtime.sendMessage({
                action: 'downloadFile',
                url: url,
                filename: filename
            }, callback);
        }

        // 3 types of media can be saved to disk: image, video, audio
        const downloadMedias = {
            IMG : "IMG",
            VIDEO : "VIDEO",
            AUDIO : "AUDIO"
        }

        // return download filename without knowing type of download
        function getDownloadFilename() {

            let filename = getDownloadFilenameByMedia(downloadMedias.IMG);
            if (filename) return filename;
            filename = getDownloadFilenameByMedia(downloadMedias.VIDEO);
            if (filename) return filename;
            filename = getDownloadFilenameByMedia(downloadMedias.AUDIO);
            if (filename) return filename;
            return '';
        }

        // return download filename according to type of download in param
        function getDownloadFilenameByMedia(downloadMedia) {

            let src, filename;

            switch (downloadMedia) {
                case downloadMedias.IMG:
                    if (!hz.hzImg) return '';
                    let img = hz.hzImg.find('img').get(0);
                    if (!img) return '';
                    src = img.src;
                    // remove trailing /
                    src = src.replace(/\/$/, '');
                    filename = src.split('/').pop().split(/[\?!#&]/)[0];
                    if (filename == '') filename = 'image';
                    if (filename.indexOf('.') === -1) filename = filename + '.jpg';
                    return filename;

                case downloadMedias.VIDEO:
                    if (!hz.hzImg) return '';
                    let video = hz.hzImg.find('video').get(0);
                    if (!video) return '';
                    src = video.src;
                    filename = src.split('/').pop().split(/[\?!#&]/)[0];
                    if (filename == '') filename = 'video';
                    if (filename.indexOf('.') === -1) filename = filename + '.mp4';
                    return filename;

                case downloadMedias.AUDIO:
                    if (!hz.hzImg) return '';
                    let audio = hz.hzImg.find('audio').get(0);
                    if (!audio) return '';
                    src = audio.src;
                    filename = src.split('/').pop().split(/[\?!#&]/)[0];
                    if (filename == '') filename = 'audio';
                    if (filename.indexOf('.') === -1) filename = filename + '.mp4';
                    return filename;
            }

            return '';
        }

        function lockImage() {
            imageLocked = true;
            displayFullSizeImage();
        }

        function saveImage() {
            saveImg();
            saveVideo();
            saveAudio();
        }

        function copyLink() {
            const url = imgDetails.url;
            if (!url) return;

            navigator.clipboard.writeText(url);
        }

        function copyImage() {
            const url = imgDetails.url;
            if(!url) return;

            fetch(url)
                .then(resp => resp.blob())
                .then(blob => blob.arrayBuffer())
                .then(buffer => {
                    // Lie about the data type
                    // Note: This does not work on FireFox
                    const blob = new Blob([buffer], {'type': 'image/png'});
                    const item = new ClipboardItem({'image/png': blob});
                    navigator.clipboard.write([item]);
                });

        }

        function saveImg() {
            if (!hz.hzImg) return;
            let img = hz.hzImg.find('img').get(0);
            if (!img) return;
            let src = img.src;
            let filename = getDownloadFilenameByMedia(downloadMedias.IMG);
            if (!filename) return;

            if (options.addDownloadSize) {
                // prefix with size [WxH]
                let size = '[' + img.naturalWidth + 'x' + img.naturalHeight + ']';
                filename = size + filename;
            }
            if (options.addDownloadOrigin) {
                // prefix with origin
                let origin = '[' + getOrigin() + ']';
                filename = origin + filename;
            }
            downloadResource(src, filename);
        }

        function saveVideo() {
            if (!hz.hzImg) return;
            let video = hz.hzImg.find('video').get(0);
            if (!video) return;
            let src = video.src;
            let filename = getDownloadFilenameByMedia(downloadMedias.VIDEO);
            if (!filename) return;

            if (options.addDownloadSize) {
                // prefix with size [WxH]
                let size = '[' + video.videoWidth + 'x' + video.videoHeight + ']';
                filename = size + filename;
            }
            if (options.addDownloadDuration) {
                // prefix with duration [hh mm ss]
                let duration = hz.secondsToHms(video.duration);
                filename = (duration != '' ? '[' + duration + ']' : '') + filename;
            }
            if (options.addDownloadOrigin) {
                // prefix with origin
                let origin = '[' + getOrigin() + ']';
                filename = origin + filename;
            }
            downloadResource(src, filename);
        }

        function saveAudio() {
            if (!hz.hzImg) return;
            let audio = hz.hzImg.find('audio').get(0);
            if (!audio) return;
            let src = audio.src;
            let filename = getDownloadFilenameByMedia(downloadMedias.AUDIO);
            if (!filename) return;

            if (options.addDownloadDuration) {
                // prefix with duration [hh mm ss]
                let duration = hz.secondsToHms(audio.duration);
                filename = (duration != '' ? '[' + duration + ']' : '') + filename;
            }
            if (options.addDownloadOrigin) {
                // prefix with origin
                let origin = '[' + getOrigin() + ']';
                filename = origin + filename;
            }
            downloadResource(src, filename);
        }

        function getDurationFromVideo() {
            if (!hz.hzImg) return;
            let video = hz.hzImg.find('video').get(0);
            if (!video) return;
            let src = video.src;
            return hz.secondsToHms(video.duration);
        }

        function getDurationFromAudio() {
            if (!hz.hzImg) return;
            let audio = hz.hzImg.find('audio').get(0);
            if (!audio) return;
            let src = audio.src;
            return hz.secondsToHms(audio.duration);
        }

        // return hostname with special characters replaced by '_'
        function getOrigin() {
            return window.location.hostname.replace(/[\\/:*?"<>|]/g, '_');
        }

        function rotateGalleryImg(rot) {
            cLog('rotateGalleryImg(' + rot + ')');
            var link = hz.currentLink, data = link.data();
            if (!data.hoverZoomGallerySrc || data.hoverZoomGallerySrc.length === 1) {
                return; // no gallery to rotate or gallery with only one image
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
            imgFullSize.on('load', nextGalleryImageOnLoad).on('error', imgFullSizeOnError).attr('src', imgDetails.url);
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

                if (!options.ambilightEnabled) {
                    displayCaptionMiscellaneousDetails();
                }

                posImg();
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

            frameBackgroundColor(options.frameBackgroundColor);
            frameThickness(options.frameThickness);
            fontSize(options.fontSize);

            webSiteExcluded = null;
            body100pct = (body.css('position') != 'static') || (body.css('padding-left') == '0px' && body.css('padding-right') == '0px' && body.css('margin-left') == '0px' && body.css('margin-right') == '0px');
            hz.pageGenerator = $('meta[name="generator"]').attr('content');
            prepareImgLinks();
            bindEvents();
            fixFlash();
        }

        chrome.runtime.onMessage.addListener(onMessage);
        loadOptions();

        // In case we are being used on a website that removes us from the DOM, update the internal data structure to reflect this
        var target = document.getElementsByTagName('html')[0];
        var obs = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.removedNodes.length > 0) {
                    if (mutation.removedNodes[0].querySelector('#hzImg')) {
                        hoverZoom.hzImg = false;
                    }
                }
            });
        });
        config = {attributes: true, childList: true, characterData: true};
        obs.observe(target, config);
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

            if (thumbUrl == url) {
                return;
            }
            url = unescape(url);
            var data = link.data().hoverZoomSrc;
            if (Object.prototype.toString.call(data) === '[object Array]') {
                // avoid duplicates
                if (data.indexOf(url) === -1) {
                    data.unshift(url); // 1st position
                }
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
        var compStyle = (el && el.nodeType == 1) ? getComputedStyle(el) : false,
            backgroundImage = compStyle ? compStyle.backgroundImage : 'none';

        if (backgroundImage.indexOf("url") != -1) {
            if (hoverZoom.isEmbeddedImg(backgroundImage)) return ''; // discard embedded images
            return backgroundImage.replace(/.*url\s*\(\s*(.*)\s*\).*/i, '$1').replace(/"/g,'');
        }

        if (hoverZoom.isEmbeddedImg(el.src)) return ''; // discard embedded images
        return el.src || el.href;
    },

    // Embedded image url look like:  "data:image/png;base64,Base64 encoded string of the image"
    // sample: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
    isEmbeddedImg:function (url) {
        if (!url) return false;
        if (url.indexOf('data:image') === -1 && url.indexOf('base64') === -1) return false;
        return true;
    },

    // Simulates a mousemove event to force a zoom call
    displayPicFromElement:function (el) {
        if (el.is(':hover')) {
            hoverZoom.currentLink = el;
            $(document).mousemove();
        }
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
        hoverZoom.hzImg.css('visibility', 'hidden');
        if (displayNow) {
            hoverZoom.hzImg.stop(true, true).fadeTo(options.fadeDuration, options.picturesOpacity);
        }
    },

    // handle the loading image spinner
    // its color depends on loading staus:
    // - green: loading started
    // - orange: img skipped (reason depends on Options settings: image already big enough, etc)
    // - red: an error occured (displayed in console)
    displayImgLoader:function (status, position) {

        // orange & red spinners are optional
        if (options.displayImageLoader == false && (status == 'skipped' || status == 'error')) return;

        // check that loader exists
        if (hoverZoom.hzImgLoader == null) {
            hoverZoom.hzImgLoader = $('<div id="hzImgLoader"><img src="' + chrome.extension.getURL('images/loading.gif') + '" style="opacity: 0.8; padding: 0; margin: 0" /></div>');
            hoverZoom.hzImgLoader.width('auto').height('auto');
            hoverZoom.hzImgLoader.css(hoverZoom.hzImgLoaderCss);
            if (position) hoverZoom.hzImgLoader.css({top:position.top, left:position.left});
            hoverZoom.hzImgLoader.appendTo(document.body);
        } else {
            // adjust position
            if (position == undefined) {
                position = hoverZoom.hzImgLoader.position(); // reuse position of loader
            }
            hoverZoom.hzImgLoader.css({top:position.top, left:position.left});
        }

        // check loading status
        if (status == 'loading') {
            hoverZoom.hzImgLoader[0].classList = 'imgLoading';
            hoverZoom.hzImgLoader.css(hoverZoom.hzImgLoadingCss);
        }
        if (status == 'skipped') {
            hoverZoom.hzImgLoader[0].classList = 'imgSkipped';
            hoverZoom.hzImgLoader.css(hoverZoom.hzImgSkippedCss);
        }
        if (status == 'error') {
            hoverZoom.hzImgLoader[0].classList = 'imgError';
            hoverZoom.hzImgLoader.css(hoverZoom.hzImgErrorCss);
        }

        if ($('#hzImgLoader').length == 0) hoverZoom.hzImgLoader.appendTo(document.body);
        if (position) hoverZoom.hzImgLoader.css({top:position.top, left:position.left});
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
                $('<img src="' + link.data().hoverZoomSrc[hoverZoomSrcIndex] + '">').on('load',function () {
                    link.data().hoverZoomPreloaded = true;
                    setTimeout(preloadNextImage, preloadDelay);
                    chrome.runtime.sendMessage({action:'preloadProgress', value:preloadIndex, max:links.length});
                }).on('error', function () {
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
            if (data && data.type === 'photo' && data.url) {
                link.data().hoverZoomSrc = [data.url];
                link.addClass('hoverZoomLink');
                hoverZoom.displayPicFromElement(link);
            }
        });
    },

    prepareLink:function (link, src) {
        if (Array.isArray(src)) {
            link.data().hoverZoomGallerySrc = src;
            link.data().hoverZoomGalleryIndex = 0;
            link.data().hoverZoomSrc = src[0];
        } else {
            link.data().hoverZoomSrc = [src];
        }
        link.addClass('hoverZoomLink');
        hoverZoom.displayPicFromElement(link);
    },

    prepareFromDocument:function (link, url, getSrc) {
        url = url.replace('http:', location.protocol);
        chrome.runtime.sendMessage({action:'ajaxRequest', url: url, method: 'GET'}, function(data) {
            var doc = document.implementation.createHTMLDocument();
            doc.open();
            doc.write(data);
            doc.close();
            var httpRefresh = doc.querySelector('meta[http-equiv="refresh"][content]');
            if (httpRefresh) {
                var redirUrl = httpRefresh.content.substr(httpRefresh.content.toLowerCase().indexOf('url=')+4);
                if (redirUrl) {
                    redirUrl = redirUrl.replace('http:', location.protocol);
                    hoverZoom.prepareFromDocument(link, redirUrl, getSrc);
                }
            }
            var src = getSrc(doc);
            if (src)
                hoverZoom.prepareLink(link, src);
        });
    },

    getFullUrl:function (url) {
        url = url.trim();
        if (url.indexOf('http:') !== 0 && url.indexOf('https:') !== 0 && url.indexOf('file:') !== 0 && url.indexOf('blob:http:') !== 0 && url.indexOf('blob:https:') !== 0) {
            if (url.indexOf('//') !== 0) {
                if (url.indexOf('/') === 0) {
                    // image has absolute path (starts with '/')
                    url = url.substr(1);
                }
                else {
                    // image has relative path (doesn't start with '/')
                    var path = window.location.pathname;
                    // use pathname iff valid
                    if (path.startsWith('/') && path.endsWith('/')) {
                        //path = path.substr(0, path.lastIndexOf('/') + 1);
                        url = path + url;
                    }
                }
                // replace // by /
                url = window.location.host + '/' + url;
                url = url.replace(/\/\//g, '\/');
                url = '//' + url;
            }
            url = window.location.protocol + url;
        }
        return url;
    },


    // https://dev.to/alexparra/js-seconds-to-hh-mm-ss-22o6
    // * Convert seconds to HH MM SS
    // * If seconds exceeds 24 hours, hours will be greater than 24 (30 05 10)
    // *
    // * @param {number} seconds
    // * @returns {string}
    secondsToHms:function (seconds) {
        if (isNaN(seconds)) return '';
        const SECONDS_PER_DAY = 86400;
        const HOURS_PER_DAY = 24;
        const days = Math.floor(seconds / SECONDS_PER_DAY);
        const remainderSeconds = seconds % SECONDS_PER_DAY;
        const hms = new Date(remainderSeconds * 1000).toISOString().substring(11, 19);
        return hms.replace(/^(\d+)/, h => `${Number(h) + days * HOURS_PER_DAY}`.padStart(2, '0')).replace(/:/g, ' ');
    },

    // https://css-tricks.com/converting-color-spaces-in-javascript/
    hexToHSL:function (H) {
        // Convert hex to RGB first
        let r = 0, g = 0, b = 0;
        if (H.length == 4) {
            r = "0x" + H[1] + H[1];
            g = "0x" + H[2] + H[2];
            b = "0x" + H[3] + H[3];
        } else if (H.length == 7) {
            r = "0x" + H[1] + H[2];
            g = "0x" + H[3] + H[4];
            b = "0x" + H[5] + H[6];
        }
        // Then to HSL
        r /= 255;
        g /= 255;
        b /= 255;
        let cmin = Math.min(r,g,b),
            cmax = Math.max(r,g,b),
            delta = cmax - cmin,
            h = 0,
            s = 0,
            l = 0;

        if (delta == 0)
            h = 0;
        else if (cmax == r)
            h = ((g - b) / delta) % 6;
        else if (cmax == g)
            h = (b - r) / delta + 2;
        else
            h = (r - g) / delta + 4;

        h = Math.round(h * 60);

        if (h < 0)
            h += 360;

        l = (cmax + cmin) / 2;
        s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);

        let hsl = {};
        hsl.h = h;
        hsl.s = s;
        hsl.l = l;
        return hsl;
    },

    getUrlScheme:function (url) {
        let scheme = '';
        try {
            let urlTmp = new URL(url);
            scheme = urlTmp.protocol;
        } catch {}
        return scheme;
    },

    cLog:function (msg) {

        cLog(msg);
    },

    cTime:function (msg) {

        cTime(msg);
    },

    cTimeEnd:function (msg) {

        cTimeEnd(msg);
    },
};

hoverZoom.loadHoverZoom();
