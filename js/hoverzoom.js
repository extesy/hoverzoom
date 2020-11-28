var hoverZoomPlugins = hoverZoomPlugins || [],
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
        'border':'4px solid rgba(255, 255, 0, 1)',
        'line-height':'0px',
        'overflow':'hidden',
        'padding':'0px',
        'margin':'4px',
        'position':'absolute',
        'z-index':2147483647,
        'border-radius':'4px',
        'box-shadow':'0px 1px 3px rgba(0, 0, 0, 0.4)'
    },
    hzImgLoaderCss:{
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
        'border-color':'#9aeb3d',
        'background-color':'#9aeb3d'
    },
    hzImgSkippedCss:{ // orange
        'border-color':'#f2860a',
        'background-color':'#f2860a'
    },
    hzImgErrorCss:{ // red
        'border-color':'#ed0707',
        'background-color':'#ed0707'
    },
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
                audioUrl:'',
                host:'',
                naturalHeight:0,
                naturalWidth:0,
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
                'border-radius':'0',
                'background-size':'100% 100%',
                'background-position':'center',
                'background-repeat':'no-repeat'
            },
            hzCaptionCss = {
                'opacity':'1',
                'font':'menu',
                'font-size':'11px',
                'font-weight':'bold',
                'color': '#333',
                'text-align':'center',
                'height':'auto',
                'max-height':'40px',
                'overflow':'hidden',
                'display': '-webkit-box',
                '-webkit-line-clamp': '2',
                '-webkit-box-orient': 'vertical',
                'vertical-align':'top',
                'padding-top':'2px',
                'padding-bottom':'2px'
            },
            hzGalleryInfoCss = {
                'position':'absolute',
                'top':'5px',
                'right':'5px',
                'font':'menu',
                'font-size':'14px',
                'font-weight':'bold',
                'color':'white',
                'padding':'3px',
                'text-shadow':'-2px -2px 1px black, -2px 0 1px black, -2px 2px 1px black, 0 -2px 1px black, 0 2px 1px black, 2px -2px 1px black, 2px 0 1px black, 2px 2px 1px black',
                'text-align':'center',
                'overflow':'hidden',
                'vertical-align':'top',
                'horizontal-align':'right'
            };
        var flashFixDomains = [
            /*'www.youtube.com',*/
            'www.redditmedia.com'
        ];

        // calculate optimal image position and size
        function posImg(position) {

            if (!imgFullSize) {
                hz.displayImgLoader('error', position);
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

            function adjustCaption() {

                if (hzCaption)
                    hzCaption.css('max-width', 0); // needed to avoid a bug when caption is larger than img

                // this is looped 10x max just in case something goes wrong, to avoid freezing the process
                let i = 0;
                while (hz.hzImg.height() > wndHeight - statusBarHeight - scrollBarHeight && i++ < 10) {
                    imgFullSize.height(wndHeight - padding - statusBarHeight - scrollBarHeight - (hzCaption ? hzCaption.height() : 0)).width('auto');
                }

                if (hzCaption) {
                    hzCaption.css('max-width', imgFullSize.width());
                    if (hzCaption.height() > 20) {
                        hzCaption.css('font-weight', 'normal'); // do not use bold font when caption is verbose
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

                imgFullSize.width('auto').height('auto');
                hz.hzImg.width('auto').height('auto');
                hz.hzImg.css('visibility', 'visible');

                // image natural dimensions
                imgDetails.naturalWidth = imgFullSize.width() * options.zoomFactor;
                imgDetails.naturalHeight = imgFullSize.height() * options.zoomFactor;
                if (!imgDetails.naturalWidth || !imgDetails.naturalHeight) {
                    return;
                }

                // width adjustment
                var fullZoom = options.mouseUnderlap || fullZoomKeyDown;
                if (fullZoom) {
                    imgFullSize.width(Math.min(imgDetails.naturalWidth, wndWidth - padding - 2 * scrollBarWidth));
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

                // height adjustment
                if (hz.hzImg.height() > wndHeight - padding - statusBarHeight - scrollBarHeight - (hzCaption ? hzCaption.height() : 0)) {
                    imgFullSize.height(wndHeight - padding - statusBarHeight - scrollBarHeight - (hzCaption ? hzCaption.height() : 0)).width('auto');
                }

                adjustCaption();

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

            if (options.centerImages) {
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

            frameBackgroundColor(options.frameBackgroundColor);
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
            if (url.lastIndexOf('?') > 0)
                url = url.substr(0, url.lastIndexOf('?'));
            var ext = url.substr(url.length - 4).toLowerCase();
            includeGifs = includeGifs || false;
            return (includeGifs && (ext == '.gif' || ext == 'gifv')) || ext == 'webm' || ext == '.mp4' || ext == '3gpp' || url.indexOf('googlevideo.com/videoplayback') > 0 || url.indexOf('v.redd.it') > 0;
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
        function removeTitles() {
            if (titledElements) {
                return;
            }
            titledElements = $('[title]').not('iframe, .lightbox, [rel^="lightbox"]');
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

        //Set frame background color and border to match chosen option
        function frameBackgroundColor(color) {
            hz.hzImg.css('background-color', color);
            hz.hzImg.css('border-color', color);

            color = color.toString().substr(1);
            var textColor = parseInt(color, 16) > 0xffffff/2 ? '#333':'#f0f0f0';

            //change text color based on frame background color
            hzCaptionCss.color = textColor;
        }

        function stopMedia(selector) {
            var el = hz.hzImg.find(selector).get(0);
            if (el) {
                el.pause();
                el.src = '';
            }
        }

        function hideHoverZoomImg(now) {
            cLog('hideHoverZoomImg(' + now + ')');
            if (hz.hzImgLoader) hz.hzImgLoader.remove();
            if ((!now && !imgFullSize) || !hz.hzImg || fullZoomKeyDown) {
                return;
            }
            imgFullSize = null;
            if (loading) {
                now = true;
            }
            hz.hzImg.stop(true, true).fadeOut(now ? 0 : options.fadeDuration, function () {
                stopMedia('video');
                stopMedia('audio');
                hzCaption = null;
                hz.hzImg.empty();
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

                    removeTitles();

                    // If the image source has not been set yet
                    if (!imgFullSize) {
                        hz.currentLink = links;
                        //initLinkRect(hz.currentLink);
                        if (!options.actionKey || actionKeyDown) {
                            var src = normalizeSrc(hoverZoomSrcIndex, links, 'hoverZoomSrc');
                            var audioSrc = normalizeSrc(hoverZoomSrcIndex, links, 'hoverZoomAudioSrc');

                            if (!options.whiteListMode && isExcludedLink(src)) {
                                return;
                            }

                            if (isVideoLink(src) && !options.zoomVideos) { // if we have a video link and don't want to zoom videos, don't do any of the loading
                              return;
                            }

                            imgDetails.url = src;
                            imgDetails.audioUrl = audioSrc;
                            clearTimeout(loadFullSizeImageTimeout);

                            // If the action key has been pressed over an image, no delay is applied
                            var delay = actionKeyDown ? 0 : (isVideoLink(imgDetails.url) ? options.displayDelayVideo : options.displayDelay);
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
                hz.displayImgLoader('loading');
                hz.createHzImg(!hideKeyDown);

                imgDetails.video = isVideoLink(imgDetails.url);
                if (imgDetails.video) {
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
                    imgFullSize = $('<img style="border: none" />').appendTo(hz.hzImg).on('load',imgFullSizeOnLoad).on('error',imgFullSizeOnError).attr('src', imgDetails.url);
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
            var track = video.addTextTrack("captions", "English", "en");
            var duration = Math.ceil(video.duration);
            // create an array that hosts the times from decending order
            // TODO: see if there is a way to optimize this as it causes a small lag
            var timer = [];
            for (var time = duration; time >= 0; time--) {
                var hours = Math.floor(time / 3600);
                var minutes = Math.floor((time - hours*3600) / 60);
                var seconds = time % 60;
                var finalTime = "-";
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

            hz.hzImgLoader.remove();
            hz.hzImgLoader = null;

            hz.hzImg.stop(true, true);
            hz.hzImg.offset({top:-9000, left:-9000});    // hides the image while making it available for size calculations
            hz.hzImg.empty();

            clearTimeout(cursorHideTimeout);
            hz.hzImg.css('cursor', 'none');
            hz.hzImg.css('pointer-events', 'none');

            if (options.ambilightEnabled) {
                hz.hzImg.css('overflow', 'visible');
                hz.hzImg.css('border', '0px');
                hz.hzImg.css('padding', '0px');
                hz.hzImg.css('box-shadow', 'none');
                var background = $('<div/>');
                $(background).css('width', 2 * screen.availWidth)
                             .css('height', 2 * screen.availHeight)
                             .css('position', 'fixed')
                             .css('z-index', -2)
                             .css('top', 0)
                             .css('left', 0)
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

            imgFullSize.css(imgFullSizeCss).appendTo(hz.hzImg).mousemove(imgFullSizeOnMouseMove);

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

                initLinkRect(imgThumb || hz.currentLink);
            }

            if (hz.currentLink) {
                var linkData = hz.currentLink.data();
                if (!options.ambilightEnabled && linkData.hoverZoomCaption) {
                    if (options.captionLocation === "below") {
                        hzCaption = $('<div/>', {id:'hzCaption', text:linkData.hoverZoomCaption}).css(hzCaptionCss).appendTo(hz.hzImg);
                    } else if (options.captionLocation === "above") {
                        hzCaption = $('<div/>', {id:'hzCaption', text:linkData.hoverZoomCaption}).css(hzCaptionCss).prependTo(hz.hzImg);
                    }
                }
                if (linkData.hoverZoomGallerySrc && linkData.hoverZoomGallerySrc.length > 1) {
                    var info = (linkData.hoverZoomGalleryIndex + 1) + '/' + linkData.hoverZoomGallerySrc.length;
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
                var url = hz.currentLink.attr('href') || imgDetails.url;
                if (url.startsWith('/') && url.indexOf('http') < 0)
                    url = window.location.protocol + '//' + window.location.hostname + url;
                chrome.runtime.sendMessage({action:'addUrlToHistory', url:url});
            }
        }

        function imgFullSizeOnError() {
            let src = imgDetails.url;
            if (src === $(this).attr('src')) {
                let hoverZoomSrcIndex = hz.currentLink ? hz.currentLink.data().hoverZoomSrcIndex : 0;
                if (window.location.protocol === 'https:' && src.indexOf('http:') === 0) {
                    // try switching to https if the main site is loaded using https protocol and image is using http
                    src = 'https' + src.substr(src.indexOf(':'));
                } else if (hz.currentLink && hoverZoomSrcIndex < hz.currentLink.data().hoverZoomSrc.length - 1) {
                    // If the link has several possible sources, we try to load the next one
                    hoverZoomSrcIndex++;
                    hz.currentLink.data().hoverZoomSrcIndex = hoverZoomSrcIndex;
                    src = hz.currentLink.data().hoverZoomSrc[hoverZoomSrcIndex];
                } else {
                    src = null;
                }

                if (src) {
                    imgFullSize.remove();
                    imgFullSize = null;
                    console.info('[HoverZoom] Failed to load image: ' + imgDetails.url + '\nTrying next one: ' + src);
                    imgDetails.url = src;
                    clearTimeout(loadFullSizeImageTimeout);
                    loadFullSizeImageTimeout = setTimeout(loadFullSizeImage, 10);
                } else {
                    hideHoverZoomImg();
                    //hz.currentLink.removeClass('hoverZoomLink').removeData();
                    console.warn('[HoverZoom] Failed to load image: ' + src);
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
            if (lastMousePosTop == mousePos.top && lastMousePosLeft == mousePos.left)
                return;

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
                    } else {
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

                    // skip img if displayed size is above 300 x 300 px
                    if (widthAttr > 300 || heightAttr > 300) {
                        return;
                    }

                    hzDownscaled.on('load',function () {
                        setTimeout(function () {
                            // skip img if displayed size * 1.8 > natural size
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

            $(document).mousemove(documentMouseMove).mousedown(documentMouseDown).keydown(documentOnKeyDown).keyup(documentOnKeyUp).mouseleave(cancelImageLoading);
            if (options.galleriesMouseWheel) {
                window.addEventListener('wheel', documentOnMouseWheel, {passive: false});
            }
            if (options.zoomVideos) {
                $(document).on('visibilitychange', hideHoverZoomImg);
            }
        }

        function documentOnMouseWheel(event) {
            if (imgFullSize) {
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
                    changeVideoPosition(-parseInt(options.videoPositionStep));
                    return false;
                }
                // "Next image" key
                if (event.which == options.nextImgKey) {
                    rotateGalleryImg(1);
                    changeVideoPosition(parseInt(options.videoPositionStep));
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

        //stackoverflow.com/questions/49474775/chrome-65-blocks-cross-origin-a-download-client-side-workaround-to-force-down
        function forceDownload(blob, filename) {
          var a = document.createElement('a');
          a.download = filename;
          a.href = blob;
          a.click();
        }

        // Current blob size limit is around 500MB for browsers
        function downloadResource(url, filename) {
          if (!filename) filename = url.split('\\').pop().split('/').pop();
          fetch(url, {
              headers: new Headers({
                'Origin': location.origin
              }),
              mode: 'cors'
            })
            .then(response => response.blob())
            .then(blob => {
              let blobUrl = window.URL.createObjectURL(blob);
              forceDownload(blobUrl, filename);
            })
            .catch(e => console.error(e));
        }

        function saveImage() {
            var filename = imgDetails.url.split('/').pop().split('?')[0];
            downloadResource(imgDetails.url, filename);
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
                if (options.captionLocation != "none" && !options.ambilightEnabled) {
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
            if (!url || typeof link.data() === 'undefined') {
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
                // avoid duplicates
                if (data.indexOf(url) === -1) {
                    data.unshift(url);
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
            return backgroundImage.replace(/.*url\s*\(\s*(.*)\s*\).*/i, '$1').replace(/"/g,'');
        } else {
            return el.src || el.href;
        }
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

    // create and display the loading image container

    displayImgLoader:function (status, position) {

        // check that loader exists
        if (hoverZoom.hzImgLoader == null) {
            hoverZoom.hzImgLoader = $('<div id="hzImgLoader"><img src="' + chrome.extension.getURL('images/loading.gif') + '" style="opacity: 0.8; padding: 0; margin: 0" /></div>');
            hoverZoom.hzImgLoader.width('auto').height('auto');
            hoverZoom.hzImgLoader.css(hoverZoom.hzImgLoaderCss);
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
