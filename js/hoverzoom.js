var hoverZoomPlugins = hoverZoomPlugins || [],
    regexImgUrl = /\.(jpe?g|gifv?|png|webm|mp4|3gpp|svg|webp|bmp|ico|xbm)([\?#].*)?$/i,
    regexSpecialChars = /[\r\n\t\v\f]/g,
    regexForbiddenChars = /[\\/:*?"<>|~]/g,
    debug = false,
    logger = new Logger(),
    hls = null, // https://github.com/video-dev/hls.js/
    fmp4Data = { 'audio': [], 'video': [], 'audiovideo': [] };

function cLog(msg) {
    if (debug && msg) {
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

function Logger() {
    this.logger = {};
    if (debug) {
        for (var m in console) {
            if (typeof console[m] == 'function')
                this.logger[m] = console[m].bind(window.console);
        }

        this.logger.enterFunc = function() { console.info('enter: ' + this.enterFunc.caller.name); }
        this.logger.leaveFunc = function() { console.info('leave: ' + this.leaveFunc.caller.name); }
    } else {
        for (var m in console) {
            if (typeof console[m] == 'function')
                this.logger[m] = function () {}
        }

        this.logger.enterFunc = function() {}
        this.logger.leaveFunc = function() {}
    }
    return this.logger;
}

var hoverZoom = {

    options:{},
    currentLink:null,
    hzViewer:null,
    hzLoader:null,
    hzViewerCss:{
        'background':'none',
        'line-height':'0px',
        'overflow':'hidden',
        'padding':'5px',
        'position':'absolute',
        'z-index':2147483647,
        'transform':''
    },
    hzLoaderCss:{
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
    hzContainerCss:{
        'position':'relative',
        'display':'flex',
        'align-items':'center',
        'justify-content':'center'
    },
    hzViewerLoadingCss:{ // green
        'border-color':'#e1ffbf',
        'background-color':'#e1ffbf'
    },
    hzViewerSkippedCss:{ // orange
        'border-color':'#ffdfbf',
        'background-color':'#ffdfbf'
    },
    hzViewerErrorCss:{ // red
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
            audioControls = null,
            imgThumb = null,
            mousePos = {},
            loading = false,
            loadFullSizeImageTimeout,
            preloadTimeout,
            actionKeyDown = false,
            fullZoomKeyDown = false,
            hideKeyDown = false,
            plusKeyDown = false,
            minusKeyDown = false,
            arrowUpKeyDown = false,
            arrowDownKeyDown = false,
            viewerLocked = false,
            zoomFactor = 1,
            zoomSpeedFactor = 1,
            pageActionShown = false,
            skipFadeIn = false,
            titledElements = null,
            body100pct = true,
            linkRect = null;
            noFocusMsgAlreadyDisplayed = false;
            /*panning = true,
            panningThumb = null;*/

        var srcDetails = {
                url:'',
                audioUrl:'',
                audioMuted:false,
                subtitlesUrl:'',
                host:'',
                naturalHeight:0,
                naturalWidth:0,
                displayedHeight:0,
                displayedWidth:0,
                video:false,
                playlist:false,
                audio:false,
                contentLength:0,
                lastModified:''
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
                'transform':'',
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
                'background-color':'black', // display black background as large images/videos are loading
                'background-size':'100% 100%',
                'background-position':'center',
                'background-repeat':'no-repeat',
                'box-shadow':'1px 1px 5px rgba(0, 0, 0, 0.5), -1px 1px 5px rgba(0, 0, 0, 0.5), 1px -1px 5px rgba(0, 0, 0, 0.5), -1px -1px 5px rgba(0, 0, 0, 0.5)', // cast shadow in every direction
                'outline-style':'none'
            },
            audioControlsWithVideoCss = {
                'opacity':'0',
                'position':'absolute',
                'left':'0',
                'top':'0',
                'max-height':'20%',
                'max-width':'90%',
                'margin':'0',
                'padding':'0',
                'transition':'opacity ease 1s',
                'outline-style':'none'
            },
            audioControlsCss = {
                'opacity':'1',
                'position':'absolute',
                'left':'0',
                'top':'0',
                'max-height':'20%',
                'max-width':'90%',
                'margin':'0',
                'padding':'1',
                'outline-style':'none'
            },
            msgCss = {
                'font':'menu',
                'font-weight':'bold',
                'color':'white',
                'text-shadow':'1px 1px 2px black, -1px 1px 2px black, 1px -1px 2px black, -1px -1px 2px black',
                'text-align':'center',
                'text-overflow':'clip',
                'overflow':'hidden',
                'overflow-wrap':'break-word',
                'width':'100%',
                'position':'absolute',
                'margin':'5px',
                'padding':'5px'
            },
            msgTextCss = {
                'margin':'5px',
                'padding':'5px'
            },
            msgFontSizeXXXLCss = {
                'font-size':'xxx-large'
            },
            msgFontSizeXXLCss = {
                'font-size':'xx-large'
            },
            msgFontSizeXLCss = {
                'font-size':'x-large'
            },
            msgFontSizeLCss = {
                'font-size':'large'
            },
            msgFontSizeMCss = {
                'font-size':'medium'
            },
            msgFontSizeXSCss = {
                'font-size':'x-small'
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
                'align-items':'flex-end',
            },
            hzBelowCss = {
                'background':'none',
                'display':'flex',
                'flex-direction':'row',
                'flex-wrap':'nowrap',
                'align-items':'flex-start',
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
                'min-width':'25%',
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
                'text-shadow':'1px 1px 2px black, -1px 1px 2px black, 1px -1px 2px black, -1px -1px 2px black',
                'text-align':'center',
                'overflow':'hidden',
                'vertical-align':'top',
                'horizontal-align':'right'
            };

        // needed to flip text tracks on videos
        var styleFlip = document.createElement('style');
        styleFlip.innerHTML = `
            .flipX video::-webkit-media-text-track-display {
                transform: matrix(-1, 0, 0, 1, 0, 0) !important;
            }
            .flipXY video::-webkit-media-text-track-display {
                transform: matrix(-1, 0, 0, -1, 0, 0) !important;
            }
            .flipXYX video::-webkit-media-text-track-display {
                transform: matrix(1, 0, 0, -1, 0, 0) !important;
            }`;
        document.head.appendChild(styleFlip);

        // blinker
        var styleBlink = document.createElement('style');
        styleBlink.innerHTML = `
            @keyframes blinkWarning {
                0% { color: red; }
                100% { color: white; }
            }
            @-webkit-keyframes blinkWarning {
                0% { color: red; }
                100% { color: white; }
            }
            .blinkWarning {
                -webkit-animation: blinkWarning 1s linear infinite;
                -moz-animation: blinkWarning 1s linear infinite;
                animation: blinkWarning 1s linear infinite;
            }`;
        document.head.appendChild(styleBlink);

        // calculate optimal viewer position and size
        function posViewer(position) {

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

                while (!viewerLocked && hz.hzViewer.height() > wndHeight - statusBarHeight - scrollBarHeight && i++ < 10) {
                    imgFullSize.height(wndHeight - padding - statusBarHeight - scrollBarHeight - (hzAbove ? hzAbove.height() : 0) - (hzBelow ? hzBelow.height() : 0)).width('auto');
                }

                if (hzCaptionMiscellaneous) {
                    hzCaptionMiscellaneous.css('max-width', imgFullSize[0].clientWidth);
                    hzCaptionMiscellaneous.css('opacity', options.captionOpacity);
                }
                if (hzDetails) {
                    hzDetails.css('max-width', imgFullSize[0].clientWidth);
                    hzDetails.css('opacity', options.detailsOpacity);
                }
                if (hzAbove) {
                    hzAbove.css('max-width', imgFullSize[0].clientWidth);
                    hzAbove.css('top', options.abovePositionOffset + '%');
                    if (options.abovePositionOffset != 0) 
                        hzAbove.css('position', 'absolute');
                }
                if (hzBelow) {
                    hzBelow.css('max-width', imgFullSize[0].clientWidth);
                    hzBelow.css('bottom', options.belowPositionOffset + '%');
                    if (options.belowPositionOffset != 0) 
                        hzBelow.css('position', 'absolute');
                }

                // do not display caption nor details if img is too small
                if (imgFullSize[0].clientWidth < 50) {
                    if (hzAbove) hzAbove.hide();
                    if (hzBelow) hzBelow.hide();
                } else {
                    if (hzAbove) hzAbove.show();
                    if (hzBelow) hzBelow.show();

                    if (hzDetails) {
                        displayDetails();

                        let nb = hzDetails.find('.hzDetail').length;

                        // do not show empty details
                        for (let i = 0; i < nb; i++) {
                            let detail = hzDetails.find('.hzDetail').eq(i);
                            if (!detail.text()) detail.hide();
                        }

                        let i = 0;
                        while (hzDetails[0].scrollWidth - 1 <= hzDetails[0].clientWidth && i < nb ) {
                            let detail = hzDetails.find('.hzDetail').eq(i++);
                            if (detail.text()) detail.show();
                        }
                        i = nb;
                        while (hzDetails[0].scrollWidth - 1 > hzDetails[0].clientWidth && i > 0) {
                            hzDetails.find('.hzDetail').eq(--i).hide();
                        }
                    }
                }
            }

            if ($(hzAbove).height() == 0) hz.hzViewer.css({'padding-top':`${padding}px`});
            if ($(hzBelow).height() == 0) hz.hzViewer.css({'padding-bottom':`${padding}px`});

            if (displayOnRight) {
                position.left += offset;
            } else {
                position.left -= offset;
            }

            if ($('#hzLoader.imgLoading')[0] != undefined) {
                hz.displayImgLoader('loading', position);
                return;
            } else {

                // img fully loaded
                loading = false;
                imgFullSize.css({'background-image':''}); // remove background image displayed during loading

                imgFullSize.width('auto').height('auto');
                hz.hzViewer.width('auto').height('auto');
                //hz.hzViewer.css('visibility', 'visible');

                // image natural dimensions

                srcDetails.naturalWidth = (imgFullSize[0].naturalWidth ? imgFullSize[0].naturalWidth : imgFullSize.width());
                srcDetails.naturalHeight = (imgFullSize[0].naturalHeight ? imgFullSize[0].naturalHeight : imgFullSize.height());

                if (!srcDetails.naturalWidth || !srcDetails.naturalHeight) {
                    return;
                }

                // width adjustment
                const fullZoom = options.mouseUnderlap ||  viewerLocked;
                const fullZoomKey = fullZoomKeyDown;
                if (viewerLocked) {
                    imgFullSize.width(srcDetails.naturalWidth * zoomFactor);
                } else if (fullZoomKey) {
                    // naturalWidth replaced with wndWidth to make image fill window
                    imgFullSize.width(Math.min(wndWidth, wndWidth - padding - 2 * scrollBarWidth)); 
                } else if (fullZoom) {
                    imgFullSize.width(Math.min(srcDetails.naturalWidth * zoomFactor, wndWidth - padding - 2 * scrollBarWidth));
                } else if (displayOnRight) {
                    if (srcDetails.naturalWidth * zoomFactor + padding > wndWidth - position.left) {
                        imgFullSize.width(wndWidth - position.left - padding + wndScrollLeft);
                    }
                } else {
                    if (srcDetails.naturalWidth * zoomFactor + padding > position.left) {
                        imgFullSize.width(position.left - padding - wndScrollLeft);
                    }
                }

                // height adjustment
                if (!viewerLocked && hz.hzViewer.height() > wndHeight - padding - statusBarHeight - scrollBarHeight) {
                    imgFullSize.height(wndHeight - padding - statusBarHeight - scrollBarHeight).width('auto');
                }

                adjustCaptionMiscellaneousDetails();

                position.top -= hz.hzViewer.height() / 2;

                // display viewer on the left side if the mouse is on the right
                if (!displayOnRight) {
                    position.left -= hz.hzViewer.width() + padding;
                }

                // horizontal position adjustment if full zoom
                if (fullZoom) {
                    if (displayOnRight) {
                        position.left = Math.min(position.left, wndScrollLeft + wndWidth - hz.hzViewer.width() - padding - 2 * scrollBarWidth);
                    } else {
                        position.left = Math.max(position.left, wndScrollLeft);
                    }
                }

                // vertical position adjustments
                var maxTop = wndScrollTop + wndHeight - hz.hzViewer.height() - padding - statusBarHeight - scrollBarHeight;
                if (position.top > maxTop) {
                    position.top = maxTop;
                }
                if (position.top < wndScrollTop + 0.5 * padding) {
                    position.top = wndScrollTop + 0.5 * padding;
                }

                if (options.ambilightEnabled) {
                    updateAmbilight();
                } else {
                    // in case of images with transparent background add background color = frame color
                    let ext = getExtensionFromUrl(srcDetails.url, srcDetails.video, srcDetails.playlist, srcDetails.audio);
                    if (ext == 'gif' || ext == 'svg' || ext == 'png')
                        imgFullSize.css('background-color', options.frameBackgroundColor);
                }
            }

            if (options.centerImages || viewerLocked) {
                hz.hzViewer.css('top', (wndHeight / 2 - hz.hzViewer.height() / 2 - padding / 2 - statusBarHeight / 2 - scrollBarHeight / 2) + 'px');
                hz.hzViewer.css('left', (wndWidth / 2 - hz.hzViewer.width() / 2 - padding / 2 - scrollBarWidth / 2) + 'px');
                hz.hzViewer.css('position', 'fixed');
            } else {
                // this fixes positioning when the body's width is not 100%
                if (body100pct) {
                    position.left -= (wndWidth - bodyWidth) / 2;
                }

                // check that viewer is not too much on the left side
                if (position.left < wndScrollLeft + 0.5 * padding) {
                    position.left = wndScrollLeft + 0.5 * padding;
                }

                // check that viewer is not too much on the right side
                if (position.left + imgFullSize.width() + 2 * padding > wndScrollLeft + wndWidth) {
                    position.left = wndScrollLeft + 0.5 * padding;
                }

                hz.hzViewer.css({top:Math.round(position.top), left:Math.round(position.left)});
            }
        }

        function panLockedViewer(event) {
            var width = imgFullSize[0].width || imgFullSize[0].videoWidth * zoomFactor;
            var height = imgFullSize[0].height || imgFullSize[0].videoHeight * zoomFactor;
            var widthOffset = (width - window.innerWidth) / 2;
            var heightOffset = (height - window.innerHeight) / 2;
            var ratioX = 1 - (2 * event.clientX / window.innerWidth);
            var ratioY = 1 - (2 * event.clientY / window.innerHeight);
            var dx = widthOffset > 0 ? ratioX * (widthOffset + 50) : 0;
            var dy = heightOffset > 0 ? ratioY * (heightOffset + 50) : 0;
            hz.hzViewer.css('transform', `translate(${dx}px, ${dy}px)`);
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

        const videoExtensions = new Set(['3gpp', 'm4v', 'mkv', 'mp4', 'ogv', 'webm']);
        const videoExtensionsWithGif = new Set(['3gpp', 'gif', 'gifv', 'm4v', 'mkv', 'mp4', 'ogv', 'webm']);
        const audioExtensions = new Set(['flac', 'm4a', 'mp3', 'oga', 'ogg', 'opus', 'wav']);

        function isVideoLink(url, includeGifs = false) {
            if (url.indexOf('.video') !== -1)
                return true;

            url = url.replace(/.gif(\?width=\d*&|\?)format=mp4/, '.mp4?'); // Fixes reddit preview links, these are mp4 masquerading as gif
            if (url.lastIndexOf('?') > 0)
                url = url.substring(0, url.lastIndexOf('?'));
            const ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();

            return (includeGifs ? videoExtensionsWithGif.has(ext) : videoExtensions.has(ext))
                || url.indexOf('googlevideo.com/videoplayback') > 0
                || url.indexOf('v.redd.it') > 0;
        }

        function isPlaylistLink(url) {
            return url.indexOf('.m3u8') !== -1 || url.indexOf('.mpd') !== -1;
        }

        function isAudioLink(url) {
            if (url.indexOf('.audio') !== -1) {
                return true;
            }

            if (url.lastIndexOf('?') > 0)
                url = url.substring(0, url.lastIndexOf('?'));
            const ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
            return audioExtensions.has(ext);
        }

        function isImageLink(url) {
            if (isVideoLink(url)) return false;
            if (isAudioLink(url)) return false;
            if (isPlaylistLink(url)) return false;
            return true;
        }

        // some plug-ins append:
        // .video to video streams so url = videourl.video
        // .audio to audio streams so url = audiourl.audio
        // .subtitles to subtitles streams so url = subtitlesurl.subtitles
        // url = videourl.video (mandatory) + _audiourl.audio (optional) + _subtitlesurl.subtitles (optional)
        function getVideoAudioSubtitlesFromUrl() {
            const videourl = srcDetails.url.split('.video')[0];
            const audiosubtitlesurl = srcDetails.url.split('.video')[1] || '';
            const subtitlesurl = audiosubtitlesurl.split('.audiomuted')[1] || audiosubtitlesurl.split('.audio')[1] || audiosubtitlesurl;
            const audiourl = (audiosubtitlesurl.indexOf('.audio') != -1 ? (audiosubtitlesurl.indexOf('.audiomuted') != -1 ? audiosubtitlesurl.split('.audiomuted')[0] + '.audiomuted' : (audiosubtitlesurl.split('.audio')[0] + '.audio' || '')) : '');

            if (audiourl.endsWith('.audio')) {
                srcDetails.audioUrl = audiourl.replace(/^_/, '').replace('.audio', '');
                srcDetails.audioMuted = false;
            }
            if (audiourl.endsWith('.audiomuted')) {
                srcDetails.audioUrl = audiourl.replace(/^_/, '').replace('.audiomuted', '');
                srcDetails.audioMuted = true;  // in case of video with audio track embeded + distinct audio track: mute distinct audio track
            }
            srcDetails.subtitlesUrl = '';
            if (subtitlesurl.endsWith('.subtitles')) {
                srcDetails.subtitlesUrl = subtitlesurl.replace(/^_/, '').replace('.subtitles', '');
            }

            srcDetails.url = videourl;
        }

        function updateAmbilight() {
            if (!hz.hzViewer) return;
            var canvas = hz.hzViewer.find('canvas')[0];
            if (!canvas || !imgFullSize) return;

            var isVideo = isVideoLink(srcDetails.url, true);

            if (!(isVideo || (imgFullSize.get(0).complete && imgFullSize.get(0).naturalWidth))) {
                window.setTimeout(updateAmbilight, 20);
                return;
            }

            imgFullSize.css('background-color', '');

            // if image or video is flipped then canvas must be flipped too
            let transfo = imgFullSize.css('transform');
            let transfoX = 1;
            let transfoY = 1;
            if (transfo == 'matrix(-1, 0, 0, 1, 0, 0)') {
                transfoX = -1;
            } else if (transfo == 'matrix(1, 0, 0, -1, 0, 0)') {
                transfoY = -1;
            } else if (transfo == 'matrix(-1, 0, 0, -1, 0, 0)') {
                transfoX = -1;
                transfoY = -1;
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
                     .css('transform', ' scale(' + transfoX * scaleW + ',' + transfoY * scaleH + ') ');
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
                posViewer();
                if ($('#hzLoader.imgLoading')[0] != undefined && imgFullSize && imgFullSize.height() > 0) {
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
            imgFullSizeCss.borderColor = hzCaptionCss.backgroundColor = hzDetailCss.backgroundColor = hzMiscellaneousCss.backgroundColor = color;

            if (options.fontOutline) {
                // outline text: white font + thin black border
                hzCaptionCss.color = hzMiscellaneousCss.color = hzDetailCss.color = 'white';
                hzCaptionCss.textShadow = hzMiscellaneousCss.textShadow = hzDetailCss.textShadow = '1px 1px 1px black, -1px 1px 1px black, 1px -1px 1px black, -1px -1px 1px black';
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
            // add 1px padding to hide a void that may occur between img & border
            if (thickness == "0") imgFullSizeCss.padding = '0px';
            else imgFullSizeCss.padding = '1px';

            imgFullSizeCss.borderWidth = imgFullSizeCss.borderRadius = thickness + 'px';
            audioControlsCss.margin = audioControlsWithVideoCss.margin = thickness + 'px';
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

        function removeMedias() {
            stopMedias();

            if (imgFullSize) {
                imgFullSize.remove();
                imgFullSize = null;
                viewerLocked = false;
            }

            if (audioControls) {
                audioControls.remove();
                audioControls = null;
                viewerLocked = false;
            }
        }

        function stopMedias() {
            stopMedia('video');
            stopMedia('audio');
        }

        function stopMedia(selector) {
            if (!hz.hzViewer) return;
            var el = hz.hzViewer.find(selector).get(0);
            if (el) {
                if (selector === 'audio') {
                    el.pause();
                    el.src = '';
                }
                if (selector === 'video') {
                    if (hls) {
                        hls.detachMedia();
                        hls.destroy(); // free resources
                    }
                    el.pause();
                    el.src = '';
                }
            }
        }

        function pauseMedias() {
            pauseMedia('video');
            pauseMedia('audio');
        }

        function pauseMedia(selector) {
            cLog('pauseMedia selector=' + selector);
            if (!hz.hzViewer) return;
            var el = hz.hzViewer.find(selector).get(0);
            if (el) {
                if (selector == 'audio') {
                    cLog('pause audio');
                    el.pause();
                }
                if (selector == 'video') {
                    cLog('pause video');
                    el.pause();
                }
            }
        }

        function playMedias() {
            playMedia('video');
            playMedia('audio');
        }

        function playMedia(selector) {
            cLog('playMedia selector=' + selector);
            if (!hz.hzViewer) return;
            var el = hz.hzViewer.find(selector).get(0);
            if (el) {
                if (selector == 'audio') {
                    cLog('play audio');
                    el.play();
                }
                if (selector == 'video') {
                    cLog('play video');
                    el.play();
                }
            }
        }

        function closeHoverZoomViewer(now) {
            cLog('closeHoverZoomImg(' + now + ')');
            if (hz.hzLoader) { hz.hzLoader.remove(); hz.hzLoader = null; }
            if ((!now && !imgFullSize) || !hz.hzViewer || fullZoomKeyDown || viewerLocked) {
                return;
            }

            $('#hzAbove').remove();
            $('#hzBelow').remove();
            restoreTitles();

            removeMedias();

            if (loading) {
                now = true;
            }
            hz.hzViewer.stop(true, true).fadeOut(now ? 0 : options.fadeDuration, function () {
                stopMedias();
                hzCaptionMiscellaneous = null;
                hzDetails = null;
                hz.hzViewer.empty();
                if (imgFullSize) {
                    imgFullSize.remove();
                    imgFullSize = null;
                    viewerLocked = false;
                }
                if (audioControls) {
                    audioControls.remove();
                    audioControls = null;
                    viewerLocked = false;
                }
            });
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

        var lastMousePosTop = -1, lastMousePosLeft = -1, cursorHideTimeout = 0;

        function documentMouseMove(event) {
            if (!options.extensionEnabled || fullZoomKeyDown || isExcludedSite() || wnd.height() < 30 || wnd.width() < 30) {
                return;
            }

            // check that mouse really moved
            if (lastMousePosTop !== mousePos.top || lastMousePosLeft !== mousePos.left) {
                lastMousePosTop = mousePos.top;
                lastMousePosLeft = mousePos.left;

                if (viewerLocked) {
                    // Don't hide cursor on locked viewer & allow clicking.
                    if (hz.hzViewer) { hz.hzViewer.css('cursor', 'pointer'); hz.hzViewer.css('pointer-events', 'auto'); }
                    if (imgFullSize) panLockedViewer(event);
                    return;
                }

                if (hz.hzViewer && imgFullSize) {
                    showCursor();

                    if (options.hideMouseCursor) {
                        // hide cursor after <delay> ms without mouse move
                        clearTimeout(cursorHideTimeout);
                        cursorHideTimeout = setTimeout(hideCursor, options.hideMouseCursorDelay);
                    }
                }
            }

            var links,
                target = $(event.target),
            // Test if the action key was pressed without moving the mouse
                explicitCall = typeof(event.pageY) === 'undefined';

            // If so, the MouseMove event was triggered programmaticaly, and we don't have details
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
                    hz.hzViewer && hz.hzViewer.length && target[0] === hz.hzViewer[0])) {
                if (mousePos.top > linkRect.top && mousePos.top < linkRect.bottom && mousePos.left > linkRect.left && mousePos.left < linkRect.right) {
                    return;
                }
            }

            if (links && links.length > 0) {
                var hoverZoomSrcIndex = links.data().hoverZoomSrcIndex || 0;
                if (links.data().hoverZoomSrc && typeof(links.data().hoverZoomSrc) !== 'undefined' &&
                    links.data().hoverZoomSrc[hoverZoomSrcIndex] &&
                    typeof(links.data().hoverZoomSrc[hoverZoomSrcIndex]) !== 'undefined') {
                    // Happens when the mouse goes from an image to another without hovering the page background
                    if (srcDetails.url && links.data().hoverZoomSrc[hoverZoomSrcIndex] !== srcDetails.url) {
                        cLog(`hiding because ${links.data().hoverZoomSrc[hoverZoomSrcIndex]} !== ${srcDetails.url}`);
                        closeHoverZoomViewer();
                    }

                    removeTitles(target);

                    // if the image source has not been set yet
                    if (!imgFullSize) {
                        hz.currentLink = links;

                        if (links.data().hoverZoomSrc && (!options.actionKey || actionKeyDown)) {
                            const src = hoverZoom.getFullUrl(links.data().hoverZoomSrc[hoverZoomSrcIndex]);
                            const audioSrc = links.data().hoverZoomAudioSrc ? hoverZoom.getFullUrl(links.data().hoverZoomAudioSrc[hoverZoomSrcIndex]) : undefined;

                            // only works after img has been loaded
                            /*let height = undefined;
                            let width = undefined;
                            let imgDim = hz.getImageDimensions(src, width, height);*/

                            srcDetails.displayedWidth = links.width();
                            srcDetails.displayedHeight = links.height();

                            srcDetails.url = src;
                            srcDetails.audioUrl = audioSrc;
                            clearTimeout(loadFullSizeImageTimeout);

                            // if the action key has been pressed over an image, no delay is applied
                            const delay = actionKeyDown || explicitCall ? 0 : (isVideoLink(srcDetails.url) ? options.displayDelayVideo : options.displayDelay);
                            loadFullSizeImageTimeout = setTimeout(loadFullSizeImage, delay);

                            loading = true;
                        }
                    } else {
                        posViewer();
                    }
                }
            } else if (hz.currentLink) {
                cancelSourceLoading();
            }
        }

        let longRightPressTimer; // create timer
        let longMiddlePressTimer; 
        let longPressRight = false;
        let shortPressRight = false;
        let shortPressMiddle = false;
        
        function mouseButtonKeyHandler(mouseButtonKey, img) {
            const timerDuration = 150;
            // -2 or -4 is hold or tap middle click, -1 or -3 is hold or tap right click
            switch (mouseButtonKey) {
                case -3:
                    shortPressRight = true;
                case -1:
                    longRightPressTimer = setTimeout(longClick.bind(img), timerDuration, mouseButtonKey);
                    break;
                case -4:
                    shortPressMiddle = true;
                case -2:
                    longMiddlePressTimer = setTimeout(longClick.bind(img), timerDuration, mouseButtonKey);
                    break;
                default:
            }
        }

        function clearMouseButtonTimers(mouseButtonKey) {
            // -2 or -4 is hold or tap middle click, -1 or -3 is hold or tap right click
            switch (mouseButtonKey) {
                case -1:
                case -3:
                    clearTimeout(longRightPressTimer);
                    return;
                case -2:
                case -4:
                    clearTimeout(longMiddlePressTimer);
                    return;
                default:
            }
        }
        
        function longClick(mouseButtonKey) {
            switch (mouseButtonKey) {
                case -1:
                    longPressRight = true;
                    shortPressRight = false;
                    break;
                case -2:
                    shortPressMiddle = false;
                    break
                case -3:
                    shortPressRight = false;
                    return;
                case -4:
                    shortPressMiddle = false;
                    return;
                default:
            }
            mouseAction(mouseButtonKey, this);
        }
        
        function mouseAction(mouseButtonKey,img) {
            displayContextMenuImgFullSize = !imgFullSize;
            switch (mouseButtonKey) {
                case options.actionKey:
                    actionKeyDown = true;
                    $(img).mousemove();
                    if (loading || imgFullSize) {
                        return false;
                    }
                    break;
                case options.lockImageKey:
                    lockViewer();
                    return;
                case options.toggleKey: {
                    let returnStatement = toggleKey() ? true : false;
                    return returnStatement;
                }
                case options.fullZoomKey:
                    if (!fullZoomKeyDown) {
                        fullZoomKeyDown = true;
                        posViewer();
                        if (imgFullSize) {
                            return false;
                        }
                    }
                    return;
                case options.closeKey: {
                    let returnStatement = closeKey() ? true : false;
                    return returnStatement;
                }
                case options.hideKey: {
                    if (!hideKeyDown) {
                        let returnStatement = hideKey() ? true : false;
                        return returnStatement;
                    }
                    return;
                }
                case options.copyImageKey:
                    if (isChromiumBased) {
                        if (keyCode === options.copyImageKey) {
                            copyImage();
                            return false;
                        }
                    }
                    return false;
                case options.copyImageUrlKey:
                    copyLink();
                    return false;
                // "Previous image" key
                case options.prevImgKey:
                    var linkData = hz.currentLink.data();
                    if (linkData.hoverZoomGallerySrc && linkData.hoverZoomGallerySrc.length > 1) rotateGalleryImg(-1);
                    else changeVideoPosition(-parseInt(options.videoPositionStep));
                    return false;
                // "Next image" key
                case options.nextImgKey:
                    var linkData = hz.currentLink.data();
                    if (linkData.hoverZoomGallerySrc && linkData.hoverZoomGallerySrc.length > 1) rotateGalleryImg(1);
                    else changeVideoPosition(parseInt(options.videoPositionStep));
                    return false;
                // "Flip image" key
                case options.flipImageKey:
                    flipImage();
                    return false;
                case options.openImageInWindowKey:
                    if (srcDetails.video) openVideoInWindow();
                    else if (srcDetails.audio) openAudioInWindow();
                    else openImageInWindow();
                    return false;
                case options.openImageInTabKey:
                    if (srcDetails.video) openVideoInTab(event.shiftKey);
                    else if (srcDetails.audio) openAudioInTab();
                    else openImageInTab(event.shiftKey);
                    return false;
                case options.saveImageKey:
                    saveImage();
                    return false;
                default:
            }
        }

        function documentContextMenu(event) {
            // If right click is a long press or short press (if right click set to tap), prevent context menu
            if (longPressRight || shortPressRight) {
                longPressRight = false;
                shortPressRight = false;
                if (displayContextMenuImgFullSize)
                    return;
                displayContextMenuImgFullSize = true; // Enables context menu for next right click
                event.preventDefault();
            }
        }

        function documentMouseDown(event) {
            // if image is locked and left click is pressed outside of locked image
            if (event.button === 0 && imgFullSize && event.target !== hz.hzViewer[0] && event.target !== imgFullSize[0]) {
                if (viewerLocked) {
                    viewerLocked = false;
                }
                cancelSourceLoading();
                restoreTitles();
                displayContextMenuImgFullSize = true
                return;
            } else if (event.button === 0) { // We don't need left click
                return;
            }

            // Gets mouse button key from event.button
            // -2 or -4 is hold or tap middle click, -1 or -3 is hold or tap right click
            let rightButtonKey = options.rightTap ? -3 : -1;
            let middleButtonKey = options.middleTap ? -4 : -2;
            let mouseButtonKey = [null,middleButtonKey,rightButtonKey,null,null][event.button];
            if (options.rightTapAndHold) {
                mouseButtonKey = -1;
                shortPressRight = true;
            }
            if (options.middleTapAndHold) {
                mouseButtonKey = -2;
                shortPressMiddle = true;
            }

            switch (mouseButtonKey) {
                case options.actionKey:
                case options.toggleKey:
                case options.fullZoomKey:
                case options.closeKey:
                case options.hideKey:
                    mouseButtonKeyHandler(mouseButtonKey, this);
                    return;
                default:
                    // The following only trigger when image is displayed
                    if (imgFullSize) { 
                        switch (mouseButtonKey) {
                            case options.lockImageKey:
                            case options.copyImageKey:
                            case options.copyImageUrlKey:
                            case options.flipImageKey:
                            case options.openImageInWindowKey:
                            case options.openImageInTabKey:
                            case options.saveImageKey:
                                mouseButtonKeyHandler(mouseButtonKey, this);
                                return;
                            default:
                        }
                    }
                    return;
            }
        }

        function mouseShortClickHandler(mouseButtonKey, img) {
            switch (mouseButtonKey) {
                case options.toggleKey:
                case options.closeKey:
                    mouseAction(mouseButtonKey, img);
                    break;
                default:
                    // The following only trigger when image is displayed
                    if (imgFullSize) { 
                        switch (mouseButtonKey) {
                            case options.lockImageKey:
                            case options.copyImageKey:
                            case options.copyImageUrlKey:
                            case options.flipImageKey:
                            case options.openImageInWindowKey:
                            case options.openImageInTabKey:
                            case options.saveImageKey:
                                mouseAction(mouseButtonKey, img);
                                break;
                            default:
                        }
                    }
            }
        }

        function documentMouseUp(event) {
            if (event.button === 0) return; // If left click, return
            // -2 or -4 is middle click, -1 or -3 is right click
            let rightButtonKey = options.rightTap ? -3 : -1;
            let middleButtonKey = options.middleTap ? -4 : -2;
            let mouseButtonKey = [null,middleButtonKey,rightButtonKey,null,null][event.button];
            
            if (options.rightTapAndHold && !shortPressRight)
                mouseButtonKey = -1;
            if (options.middleTapAndHold && !shortPressMiddle)
                mouseButtonKey = -2;
            
            switch (mouseButtonKey) {
                case options.actionKey:
                    if (actionKeyDown) {
                        actionKeyDown = false;
                        closeHoverZoomViewer();
                    }
                    break;
                case options.fullZoomKey:
                    fullZoomKeyDown = false;
                    $(this).mousemove();
                    break;
                case options.hideKey:
                    hideKeyDown = false;
                    if (imgFullSize) {
                        hz.hzViewer.show();
                        playMedias();
                    }
                    $(this).mousemove();
                    break;
                default:
                    if ((mouseButtonKey == -3 || options.rightTapAndHold) && shortPressRight)
                        mouseShortClickHandler(-3, this);
                    if ((mouseButtonKey == -4 || options.middleTapAndHold) && shortPressMiddle)
                        mouseShortClickHandler(-4, this);
            }

            
            clearMouseButtonTimers(mouseButtonKey);
        }

        // select correct font size for msg depending on img or video width
        function getMsgFontSize() {
            let w = 0;
            let img = hz.hzViewer.find('img').get(0);
            if (img) w = $(img).width()
            let video = hz.hzViewer.find('video').get(0);
            if (video) w = $(video).width();

            if (w > 500) return msgFontSizeXXXLCss;
            if (w > 400) return msgFontSizeXXLCss;
            if (w > 300) return msgFontSizeXLCss;
            if (w > 200) return msgFontSizeLCss;
            if (w > 100) return msgFontSizeMCss;
            return msgFontSizeXSCss;
        }

        function loadFullSizeImage() {
            cLog('loadFullSizeImage');
            // If no image is currently displayed...
            if (!imgFullSize) {
                hz.displayImgLoader('loading');
                hz.createHzViewer(!hideKeyDown);
                zoomFactor = parseInt(options.zoomFactor);

                srcDetails.video = isVideoLink(srcDetails.url);
                srcDetails.playlist = isPlaylistLink(srcDetails.url);
                srcDetails.audio = isAudioLink(srcDetails.url);

                if (srcDetails.video) {
                    getVideoAudioSubtitlesFromUrl();

                    if (!options.zoomVideos) {
                        cancelSourceLoading();
                        return;
                    }

                    const video = document.createElement('video');
                    video.style.width = 0;
                    video.style.height = 0;
                    video.controls = viewerLocked;
                    video.loop = true;
                    video.autoplay = true;
                    video.muted = options.muteVideos;
                    video.volume = options.videoVolume;
                    video.src = srcDetails.url;
                    // MKV
                    if (video.src.indexOf('.mkv') !== -1) video.type = 'video/mp4';
                    imgFullSize = $(video).appendTo(hz.hzViewer);

                    video.addEventListener('error', srcFullSizeOnError);
                    video.addEventListener('loadedmetadata', function() {
                        posViewer();
                        if (options.videoTimestamp) {
                            addTimestampTrack(video);
                        }
                    });
                    video.addEventListener('loadeddata', function() {
                        srcFullSizeOnLoad();
                        let startPlayPromise = video.play();
                        if (startPlayPromise !== undefined) {
                            startPlayPromise.then(() => {
                                cLog("play started");
                                video.removeAttribute('poster');
                            }).catch(error => {
                                if (error.name === "NotAllowedError") {
                                    // NotAllowedError: play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD
                                    $(hz.hzViewer.hzContainer).css(hz.hzContainerCss);
                                    cLog("Play not allowed: " + error);
                                    displayMsg("msgClickPageToPlayVideo");
                                    video.removeAttribute('poster');
                                } else {
                                    cLog("Play error: " + error);
                                }
                            });
                        }
                    });

                    if (srcDetails.audioUrl) {
                        const audio = document.createElement('audio');
                        audio.controls = viewerLocked;
                        audio.autoplay = false;
                        audio.muted = (srcDetails.audioMuted ? true : options.muteVideos);
                        audio.volume = options.videoVolume;
                        audio.src = srcDetails.audioUrl;
                        audioControls = $(audio).appendTo(hz.hzViewer);

                        // synchronize audio controls with video controls
                        video.addEventListener('play', function() {
                            audio.play();
                        });

                        video.addEventListener('pause', function() {
                            audio.pause();
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
                } else if (srcDetails.audio) {

                    if (!options.playAudio) {
                        cancelSourceLoading();
                        return;
                    }

                    var src = (srcDetails.audioUrl ? srcDetails.audioUrl : srcDetails.url).replace('.audio', '');

                    // audio controls are displayed on top of an image provided by extension: 'images/spectrogram.png'
                    srcDetails.url = chrome.extension.getURL('images/spectrogram.png');
                    srcDetails.audioUrl = src;

                    imgFullSize = $('<img style="border: none" />').appendTo(hz.hzViewer).attr('src', srcDetails.url).addClass('hzPlaceholder');

                    var audio = document.createElement('audio');
                    audio.controls = true; // controls always visible even if not locked
                    audio.autoplay = true;
                    audio.volume = options.audioVolume;
                    audio.src = srcDetails.audioUrl;
                    audioControls = $(audio).appendTo(hz.hzViewer);

                    audio.addEventListener('error', srcFullSizeOnError);
                    audio.addEventListener('loadedmetadata', function() {
                        posViewer();
                    });
                    audio.addEventListener('loadeddata', function() {
                        let startPlayPromise = audio.play();
                        if (startPlayPromise !== undefined) {
                            startPlayPromise.then(() => {
                                cLog("play started");
                            }).catch(error => {
                                if (error.name === "NotAllowedError") {
                                    // NotAllowedError: play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD
                                    $(hz.hzViewer.hzContainer).css(hz.hzContainerCss);
                                    cLog("Play not allowed: " + error);
                                    displayMsg("msgClickPageToPlayVideo");
                                } else {
                                    cLog("Play error: " + error);
                                }
                            });
                        }
                    });
                    audio.load();
                } else if (srcDetails.playlist) {
                    // instantiate a specific player (= HLS) for playlists (= M3U8 files)
                    // this is needed for browsers that do not support natively playlists, such as Chrome

                    if (!options.zoomVideos) {
                        cancelSourceLoading();
                        return;
                    }

                    const video = document.createElement('video');
                    video.style.width = 0;
                    video.style.height = 0;
                    video.controls = viewerLocked;
                    video.loop = true;
                    video.autoplay = true;
                    video.muted = options.muteVideos;
                    video.volume = options.videoVolume;
                    imgFullSize = $(video).appendTo(hz.hzViewer);
                    hls = new Hls({
                        debug: debug,
                    });

                    // MP4 buffering
                    // ref: https://github.com/huzhlei/DASH-to-HLS-Playback
                    fmp4Data = { 'audio': [], 'video': [], 'audiovideo': [] };
                    hls.on(Hls.Events.BUFFER_APPENDING, function(event, data) {
                        fmp4Data[data.type].push(data.data);
                    });
                    hls.on('hlsError', function(event, data) {
                        cLog(`event: ${event}`);
                        cLog(`type: ${data.type}`);
                        cLog(`reason: ${data.reason}`);
                        cLog(`details: ${data.details}`);
                        if (data.response) {
                            cLog(`response.data: ${data.response.data}`);
                            // retry in case of DASH-MPD
                            if (data.response.data && data.response.data.indexOf('MPD') != -1) {
                                // convert MPD to M3U8 playlist then feed it to HLS
                                const mpdRaw = data.response.data;
                                var MpdInfo = extractMpdInfo(mpdRaw);
                                cLog(`MpdInfo: ${MpdInfo}`);
                                // extract base url
                                // e.g: https://scontent-cdg4-3.xx.fbcdn.net/hvideo-odn-cln/_nc_cat-111/_nc_sr_t-4/v/rASdx8eImJZyLhAH2flcBQSRy4PYoZZVMdadGC0-MOxAyBA/_nc_ohc-xn2oxj7yZsQAX-2l08Z/live-dash/dash-abr3/794256226039541.mpd?ccb=2-4&ms=m_CTPAL&sc_t=1&oh=00_AfDEa7gEh5wVOsGUdnpotv4Pt7rA_YNQN6BvbjgxQ0oYPA&oe=651B3A07
                                // => https://scontent-cdg4-3.xx.fbcdn.net/hvideo-odn-cln/_nc_cat-111/_nc_sr_t-4/v/rASdx8eImJZyLhAH2flcBQSRy4PYoZZVMdadGC0-MOxAyBA/_nc_ohc-xn2oxj7yZsQAX-2l08Z/live-dash/dash-abr3/
                                var url = data.url.split('?')[0];
                                url = url.substr(0, url.lastIndexOf('/') + 1);
                                url = url.replace('/live-dash/', '/live-dash/ID/'); // needed for Facebook live
                                var masterAddress = createMasterPlaylist(MpdInfo, createMediaPlaylist(MpdInfo, url));
                                hls.loadSource(masterAddress);
                                hls.attachMedia(video);
                            }
                        }
                    });

                    // <-- original code from : https://github.com/huzhlei/DASH-to-HLS-Playback/blob/master/conversion.js
                    function extractMpdInfo(textToDec)
                    {
                        var reg = /(\w+)=\"(.*?)\"/g; // find the pattern [xxx="yyy"], remember xxx and yyy
                        var key = [];
                        var item = [];
                        while(array = reg.exec(textToDec))
                        {
                            key.push(array[1]);	// push into array
                            item.push(array[2]);
                        }
                        return [key,item];
                    }

                    function createMediaPlaylist(MpdInfo, url)
                    {
                        var header = "#EXTM3U\n" + "#EXT-X-VERSION:6\n";
                        var tail = "#EXT-X-ENDLIST\n";
                        var mediaPlaylistBlob = [];

                        var key = MpdInfo[0];
                        var item = MpdInfo[1];

                        var videoKey = new RegExp('video');
                        var audioKey = new RegExp('audio');
                        var idx = key.indexOf('mimeType');
                        while (idx != -1)
                        {
                            var segmentType = item[idx];

                            // #EXT-X-TARGETDURATION:
                            var rawDuration = item[key.indexOf('duration')] || '30000S';   // use period's total duration as upper bound of media segments, default duration: 30000s
                            var timePatternFull = /(\d*)H(\d*)M(.*)S/;
                            var timePatternSec = /(\d*)S/;
                            var time = timePatternFull.exec(rawDuration);
                            if (time)
                            {
                                var maxDuration = parseFloat(time[1]) * 3600 + parseFloat(time[2]) * 60 + parseFloat(time[3]);
                            }
                            else
                            {
                                var time = timePatternSec.exec(rawDuration);
                                var maxDuration = parseFloat(time[1]);
                            }
                            var maxSegmentDuration = '#EXT-X-TARGETDURATION:' + maxDuration + '\n';

                            // #EXT-X-MEDIA-SEQUENCE:
                            var firstSequence = item[key.indexOf('startNumber', idx)] || 100;   // by default, number starts from 100
                            var startSequence = '#EXT-X-MEDIA-SEQUENCE:' + firstSequence + '\n';

                            // #EXT-X-PLAYLIST-TYPE:EVENT
                            switch (item[key.indexOf('type')])
                            {
                                case 'static':
                                    var playlistType = '#EXT-X-PLAYLIST-TYPE:EVENT\n';  // VOD
                                    break;
                                case 'live':
                                    var playlistType = '#EXT-X-PLAYLIST-TYPE:EVENT\n';
                                    break;
                                default:
                                    var playlistType = '#EXT-X-PLAYLIST-TYPE:EVENT\n';
                                    break;
                            }

                            // #EXT-X-MAP:URI="tears_of_steel_1080p_1000k_h264_dash_track1_init.mp4"
                            var mapInit = '#EXT-X-MAP:URI="' + url.substring(0, url.lastIndexOf('/') + 1) + item[key.indexOf('initialization', idx)] + '"\n';

                            // #EXT-X-MLB-INFO:max-bw=999120,duration=4.000
                            // totalDuration
                            var rawtotalDuration = item[key.indexOf('mediaPresentationDuration')];
                            var totalTime = timePatternFull.exec(rawDuration);
                            if (totalTime)
                            {
                                var totalDuration = parseFloat(totalTime[1]) * 3600 + parseFloat(totalTime[2]) * 60 + parseFloat(totalTime[3]);
                            }
                            else
                            {
                                var totalTime = timePatternSec.exec(rawDuration);
                                var totalDuration = parseFloat(totalTime[1]);
                            }
                            var info = '#EXT-X-MLB-INFO:' + 'max-bw=' + item[key.indexOf('bandwidth', idx)] + ',duration=' + totalDuration + '\n';

                            var segmentsName = item[key.indexOf('media', idx)];
                            var segmentDuration = parseFloat(item[key.indexOf('duration', idx)] || item[key.indexOf('FBAverageDuration', idx)] || 2000) / parseFloat(item[key.indexOf('timescale', idx)]); // Facebook uses "FBAverageDuration" instead of "duration"
                            var numSegment = Math.ceil(totalDuration/segmentDuration);    // how many segments of the representation
                            var segmentUnit = "";

                            if (videoKey.test(segmentType))
                            {
                                for (i = firstSequence; i <= numSegment; i++)
                                {
                                    if (i === numSegment)
                                    {
                                        segmentDuration = totalDuration - segmentDuration * (numSegment - 1);
                                    }
                                    // #EXTINF
                                    inf = '#EXTINF:' + segmentDuration  + '\n';
                                    // tears_of_steel_1080p_1000k_h264_dash_track1_$Number$.m4s
                                    segment = url.substring(0, url.lastIndexOf('/') + 1) + segmentsName.replace(/\$.*?\$/,i) + '\n';
                                    segmentUnit += inf + segment;
                                }

                               // #EXT-X-MLB-VIDEO-INFO:codecs="avc1.640028",width="1920",height="1080",sar="1:1",frame-duration=12288
                               var video_info = '#EXT-X-MLB-VIDEO-INFO:' + 'codecs="' + item[key.indexOf('codecs', idx)] + '",' + 'width="' + item[key.indexOf('width', idx)] + '",' + 'height="' + item[key.indexOf('height', idx)] + '",' + 'sar="' + item[key.indexOf('sar', idx)] + '",' + 'frame-duration=' + item[key.indexOf('timescale', idx)] + '\n';	

                               var output = maxSegmentDuration + startSequence + playlistType + mapInit + segmentUnit + video_info + info;
                            }
                            else if (audioKey.test(segmentType))
                            {
                                for (i = firstSequence; i <= numSegment; i++)
                                {
                                    if (i === numSegment)
                                    {
                                        segmentDuration = totalDuration - segmentDuration * (numSegment - 1);
                                    }
                                    // #EXTINF:2.000
                                    inf = '#EXTINF:' + segmentDuration  + '\n';
                                    // tears_of_steel_1080p_1000k_h264_dash_track1_$Number$.m4s
                                    segment = url.substring(0, url.lastIndexOf('/') + 1) + segmentsName.replace(/\$.*?\$/,i) +'\n';
                                    segmentUnit += inf + segment;
                                }

                                // #EXT-X-MLB-AUDIO-INFO:codecs="mp4a.40.2",audioSamplingRate="48000"
                                var audio_info = '#EXT-X-MLB-AUDIO-INFO:' + 'codecs="' + item[key.indexOf('codecs', idx)] + '",' + 'audioSamplingRate="' + item[key.indexOf('audioSamplingRate', idx)] + '"\n';

                                // #EXT-X-MLB-AUDIO-CHANNEL-INFO:schemeIdUri="urn:mpeg:dash:23003:3:audio_channel_configuration:2011",value="2"
                                var channel_info = '#EXT-X-MLB-AUDIO-CHANNEL-INFO:schemeIdUri="' + item[key.indexOf('schemeIdUri', idx)] + '",' + 'value="' + item[key.indexOf('value', idx)] + '\n';

                                var output = maxSegmentDuration + startSequence + playlistType + mapInit + segmentUnit + audio_info + channel_info + info;
                            }

                            idx = key.indexOf('mimeType', idx + 1);
                            mediaPlaylistBlob.push(saveTextAsBlob(header + output + tail));
                        }
                        return mediaPlaylistBlob;
                    }

                    function createMasterPlaylist(MpdInfo, mediaPlaylistBlob)
                    {
                        var header = "#EXTM3U\n" + "#EXT-X-VERSION:6\n";
                        var output = header;

                        var key = MpdInfo[0];
                        var item = MpdInfo[1];
                        // segment type
                        var videoKey = new RegExp('video');
                        var audioKey = new RegExp('audio');
                        var idx = key.indexOf('mimeType');
                        var j = 0;
                        while (idx != -1)
                        {
                            var segmentType = item[idx];

                            if (videoKey.test(segmentType))
                            {
                                // video segments
                                var videoMasterInfo = '#EXT-X-STREAM-INF:AUDIO="audio",'; // audio name be improved according to audio segments!
                                videoMasterInfo += 'CODECS="' + item[key.indexOf('codecs', idx)] + '",';
                                videoMasterInfo += 'RESOLUTION=' + item[key.indexOf('width', idx)] + '*' + item[key.indexOf('height', idx)] + ',';
                                if (key.indexOf('frameRate', idx) !== -1)
                                {
                                videoMasterInfo += 'FRAME_RATE=' + item[key.indexOf('frameRate', idx)] + ',';
                                }
                                videoMasterInfo += 'BANDWIDTH=' + item[key.indexOf('bandwidth', idx)];

                                var mediaRep = item[key.indexOf('media', idx)];	// may need improvement
                                var videoMediaPlaylist = mediaPlaylistBlob[j];
                                j = j + 1;
                                output += videoMasterInfo + '\n' + videoMediaPlaylist + '\n';
                            }
                            else if (audioKey.test(segmentType))
                            {
                                // audio segments
                                var mediaRep = item[key.indexOf('media', idx)];
                                var audioMaster = '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",URI="' + mediaPlaylistBlob[j] + '"\n';
                                output += audioMaster;
                            }	
                            idx = key.indexOf('mimeType', idx + 1);
                        }
                        return saveTextAsBlob(output);
                    }

                    function saveTextAsBlob(textToSave)
                    {
                        var textToSaveAsBlob = new Blob([textToSave], {type:"text/plain"});
                        return window.URL.createObjectURL(textToSaveAsBlob);
                    }
                    // -->

                    hls.loadSource(srcDetails.url);
                    hls.attachMedia(video);

                    video.addEventListener('error', srcFullSizeOnError);
                    video.addEventListener('loadedmetadata', function() {
                        posViewer();
                        if (options.videoTimestamp) {
                            addTimestampTrack(video);
                        }
                    });
                    video.addEventListener('loadeddata', function() {
                        displayFullSizeImage();

                        let startPlayPromise = video.play();
                        if (startPlayPromise !== undefined) {
                            startPlayPromise.then(() => {
                                cLog("play started");
                                video.removeAttribute('poster');
                            }).catch(error => {
                                if (error.name === "NotAllowedError") {
                                    // NotAllowedError: play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD
                                    $(hz.hzViewer.hzContainer).css(hz.hzContainerCss);
                                    cLog("Play not allowed: " + error);
                                    displayMsg("msgClickPageToPlayVideo");
                                    video.removeAttribute('poster');
                                } else {
                                    cLog("Play error: " + error);
                                }
                            });
                        }
                    });
                } else {
                    hz.hzViewer.hzContainer = $('<div id="hzContainer"/>').css(hz.hzContainerCss).appendTo(hz.hzViewer);
                    imgFullSize = $('<img style="border: none" />').appendTo(hz.hzViewer.hzContainer).on('load', srcFullSizeOnLoad).on('error', srcFullSizeOnError).attr('src', srcDetails.url);
                    // Note for Chrome: if image is loaded from cache then 'load' event is never fired
                }

                // if video comes with distinct url for audio then get additonal infos for video url only
                const urlDetails = (srcDetails.audio && !srcDetails.video ? srcDetails.audioUrl : srcDetails.url);
                srcDetails.host = getHostFromUrl(urlDetails);
                getAdditionalInfosFromServer(urlDetails);

                skipFadeIn = false;
                imgFullSize.css(progressCss);
                if (options.showWhileLoading && !srcDetails.video) {
                    posWhileLoading();
                }
                posViewer();
            }
            posViewer();
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

        function srcFullSizeOnLoad() {
            logger.enterFunc();
            // only the last hovered link gets displayed
            if (srcDetails.url == $(imgFullSize).prop('src')) {
                loading = false;
                displayFullSizeImage();
            }
        }

        function initLinkRect(elem) {
            linkRect = elem.offset();
            linkRect.bottom = linkRect.top + elem.height();
            linkRect.right = linkRect.left + elem.width();
        }

        function displayMsg(msgId) {
            $('#hzMsg').remove(); // remove previous msg
            let fontSizeCss = getMsgFontSize();
            let msgDiv = $('<div/>', {id:'hzMsg'}).css(msgCss).css(fontSizeCss);
            $('<p/>').text(chrome.i18n.getMessage(msgId)).addClass('blinkWarning').css(msgTextCss).appendTo(msgDiv);
            $(msgDiv).appendTo(hz.hzViewer.hzContainer);
        }

        function displayFullSizeImage() {
            cLog('displayFullSizeImage');

            // if autoLockImages option is checked
            if (options.autoLockImages)
                viewerLocked = true;

            // check focus
            let focus = document.hasFocus();

            if (hz.hzLoader) { hz.hzLoader.remove(); hz.hzLoader = null; }

            hz.hzViewer.stop(true, true);
            hz.hzViewer.offset({top:-9000, left:-9000}); // hides the image while making it available for size calculations
            hz.hzViewer.empty();

            hz.hzViewer.css('visibility', 'visible');

            if (options.ambilightEnabled) {

                imgFullSizeCss.boxShadow = 'none';
                imgFullSizeCss.borderColor = 'none';
                imgFullSizeCss.borderRadius = 'none';
                imgFullSizeCss.borderStyle = 'none';
                imgFullSizeCss.borderWidth = 'none';

                hz.hzViewer.css('overflow', 'visible');
                hz.hzViewer.css('border', '0px');
                hz.hzViewer.css('padding', '10px');
                hz.hzViewer.css('box-shadow', 'none');
                var background = $('<div/>');
                $(background).css('width', 20 * screen.availWidth) // background canvas must be very large in case of zooming
                             .css('height', 20 * screen.availHeight)
                             .css('position', 'fixed')
                             .css('z-index', -2)
                             .css('top', -screen.availHeight)
                             .css('left', -screen.availWidth)
                             .css('pointer-events', 'none')
                             .css('background-color', 'black')
                             .css('opacity', options.ambilightBackgroundOpacity);
                background.appendTo(hz.hzViewer);

                var canvas = $('<canvas/>');
                $(canvas).css('position', 'absolute')
                         .css('z-index', -1)
                         .css('pointer-events', 'none')
                         .css('opacity', 1);
                canvas.appendTo(hz.hzViewer);
            }

            hz.hzViewer.hzContainer = $('<div id="hzContainer"/>').css(hz.hzContainerCss).appendTo(hz.hzViewer);
            imgFullSize.css(imgFullSizeCss).appendTo(hz.hzViewer.hzContainer);
            // when page looses focus all action keys become inactive
            if (options.enableNoFocusMsg && !focus && !noFocusMsgAlreadyDisplayed) {
                displayMsg("msgClickPageToActivateActionKeys");
                noFocusMsgAlreadyDisplayed = true; // display msg only once so user is warned but not disturbed too much (user might not use action keys at all btw!)
            }

            // in case of video:
            // - display video controls only when video is locked
            // - display also audio controls if needed (distinct sources for audio & video)
            let video = hz.hzViewer.find('video')[0];
            if (video) {
                let audio = null;
                if (audioControls)
                    audio = audioControls[0];
                if (audio)
                    $(audio).css(audioControlsWithVideoCss).appendTo(hz.hzViewer.hzContainer);
                if (viewerLocked) {
                    video.controls = true;
                    if (audio) {
                        audio.controls = true;

                        $(audio).hover(function() {
                            clearTimeout(audio.controlsTimeout);
                            audio.style.opacity = 1;
                        });

                        imgFullSize.mousemove(function() {
                            clearTimeout(audio.controlsTimeout);
                            audio.style.opacity = 1;
                            audio.controlsTimeout = setTimeout(function() { audio.style.opacity = 0 }, 2500);
                        });

                        imgFullSize.mouseleave(function() {
                            clearTimeout(audio.controlsTimeout);
                            audio.style.opacity = 0;
                        });
                    }
                }
            } else {
                // audio controls alone
                if (audioControls)
                    audioControls.css(audioControlsCss).appendTo(hz.hzViewer.hzContainer);
            }

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
                        lowResSrc = hz.getThumbUrl(imgThumb[0]);
                    }
                }
                lowResSrc = lowResSrc || 'noimage';
                if (loading && lowResSrc.indexOf('noimage') === -1) {
                    var ext = srcDetails.url.substring(srcDetails.url.length - 3).toLowerCase();
                    if (ext != 'gif' && ext != 'svg' && ext != 'png') {
                        var imgRatio = imgFullSize.width() / imgFullSize.height(),
                            thumbRatio = imgThumb.width() / imgThumb.height();

                        imgFullSize.css({'background-image':'url(' + lowResSrc + ')'});
                    }
                } else {
                    imgThumb = null;
                }
                // set background color = frame color
                if (!options.ambilightEnabled && options.frameThickness != "0") imgFullSize.css('background-color', options.frameBackgroundColor);

                //hz.hzViewer.css('cursor', 'pointer');

                if (viewerLocked) {
                    // Allow clicking on locked image.
                    hz.hzViewer.css('pointer-events', 'auto');
                }

                initLinkRect(imgThumb || hz.currentLink);
            }

            if (hz.currentLink) {
                var linkData = hz.currentLink.data();

                if (!options.ambilightEnabled) displayCaptionMiscellaneousDetails();

                if (linkData.hoverZoomGallerySrc && linkData.hoverZoomGallerySrc.length > 1) {
                    var info = (linkData.hoverZoomGalleryIndex + 1) + '/' + linkData.hoverZoomGallerySrc.length;
                    hzGallery = $('<div/>', {id:'hzGallery', text:info}).css(hzGalleryInfoCss).prependTo(hz.hzViewer.hzContainer);
                    if (linkData.hoverZoomGalleryIndex == 0 && linkData.hoverZoomGallerySrc.length > 1) {
                        preloadGalleryImage(1);
                    }
                }
            }

            if (!skipFadeIn && !hideKeyDown) {
                hz.hzViewer.hide().fadeTo(options.fadeDuration, options.picturesOpacity);
            }

            // The image size is not yet available in the onload so I have to delay the positioning
            setTimeout(posViewer, options.showWhileLoading ? 0 : 10);

            if (options.addToHistory && !chrome.extension.inIncognitoContext) {
                chrome.runtime.sendMessage({action:'addUrlToHistory', url:srcDetails.url});
                // #881: add link url to history if available, this is needed to turn hovered links purple
                let linkUrl = hz.currentLink.prop('href');
                if (linkUrl && linkUrl != srcDetails.url) chrome.runtime.sendMessage({action:'addUrlToHistory', url:linkUrl});
            }
        }

        function displayCaptionMiscellaneousDetails() {

            $('#hzAbove').remove();
            $('#hzBelow').remove();
            hzAbove = $('<div/>', {id:'hzAbove'}).css(hzAboveCss).prependTo(hz.hzViewer);
            hzBelow = $('<div/>', {id:'hzBelow'}).css(hzBelowCss).appendTo(hz.hzViewer);

            if (options.detailsLocation != "none") displayDetails();
            if (options.captionLocation != "none") displayCaptionMiscellaneous();
        }

        function displayCaptionMiscellaneous() {
            let linkData = hz.currentLink.data();
            let caption = linkData.hoverZoomCaption;
            let miscellaneous = getTextSelected();

            if (caption || miscellaneous) {
                if (options.captionLocation === "above")
                    if (hzAbove.find('#hzCaptionMiscellaneous').length == 0)
                        hzCaptionMiscellaneous = $('<div/>', {id:'hzCaptionMiscellaneous'}).css(hzCaptionMiscellaneousCss).appendTo(hzAbove);
                if (options.captionLocation === "below")
                    if (hzBelow.find('#hzCaptionMiscellaneous').length == 0)
                        hzCaptionMiscellaneous = $('<div/>', {id:'hzCaptionMiscellaneous'}).css(hzCaptionMiscellaneousCss).appendTo(hzBelow);

                if (caption)
                    if (hzCaptionMiscellaneous.find('#hzCaption').length == 0)
                        $('<div/>', {id:'hzCaption', text:caption}).css(hzCaptionCss).appendTo(hzCaptionMiscellaneous);
                if (miscellaneous)
                    if (hzCaptionMiscellaneous.find('#hzMiscellaneous').length == 0)
                        $('<div/>', {id:'hzMiscellaneous', text:miscellaneous}).css(hzMiscellaneousCss).appendTo(hzCaptionMiscellaneous);
            }
        }

        function displayDetails() {
            let details = getSrcDetails(hz.currentLink);
            if (details) {
                if (options.detailsLocation === "above")
                    if (hzAbove.find('#hzDetails').length == 0)
                        hzDetails = $('<div/>', {id:'hzDetails'}).css(hzDetailsCss).appendTo(hzAbove);
                if (options.detailsLocation === "below")
                    if (hzBelow.find('#hzDetails').length == 0)
                        hzDetails = $('<div/>', {id:'hzDetails'}).css(hzDetailsCss).appendTo(hzBelow);
                if (options.showDetailFilename) {
                    if (hzDetails.find('#hzDetailFilename').length == 0)
                        $('<div/>', {id:'hzDetailFilename', text:details.filename, class:'hzDetail'}).css(hzDetailCss).prependTo(hzDetails);
                    else
                        $('#hzDetailFilename').text(details.filename);
                }
                if (options.showDetailHost) {
                    if (hzDetails.find('#hzDetailHost').length == 0)
                        $('<div/>', {id:'hzDetailHost', text:details.host, class:'hzDetail'}).css(hzDetailCss).prependTo(hzDetails);
                    else
                        $('#hzDetailHost').text(details.host);
                }
                if (options.showDetailLastModified) {
                    if (hzDetails.find('#hzDetailLastModified').length == 0)
                        $('<div/>', {id:'hzDetailLastModified', text:details.lastModified, class:'hzDetail'}).css(hzDetailCss).prependTo(hzDetails);
                    else
                        $('#hzDetailLastModified').text(details.lastModified);
                }
                if (options.showDetailExtension) {
                    if (hzDetails.find('#hzDetailExtension').length == 0)
                        $('<div/>', {id:'hzDetailExtension', text:details.extension.toUpperCase(), class:'hzDetail'}).css(hzDetailCss).prependTo(hzDetails);
                    else
                        $('#hzDetailExtension').text(details.extension.toUpperCase());
                }
                if (options.showDetailContentLength) {
                    if (hzDetails.find('#hzDetailContentLength').length == 0)
                        $('<div/>', {id:'hzDetailContentLength', text:details.contentLength, class:'hzDetail'}).css(hzDetailCss).prependTo(hzDetails);
                    else
                        $('#hzDetailContentLength').text(details.contentLength);
                }
                if (options.showDetailDuration) {
                    if (hzDetails.find('#hzDetailDuration').length == 0)
                        $('<div/>', {id:'hzDetailDuration', text:details.duration, class:'hzDetail'}).css(hzDetailCss).prependTo(hzDetails);
                    else
                        $('#hzDetailDuration').text(details.duration);
                }
                if (options.showDetailScale) {
                    if (hzDetails.find('#hzDetailScale').length == 0)
                        $('<div/>', {id:'hzDetailScale', text:details.scale, class:'hzDetail'}).css(hzDetailCss).prependTo(hzDetails);
                    else
                        $('#hzDetailScale').text(details.scale);
                }
                if (options.showDetailRatio) {
                    if (hzDetails.find('#hzDetailRatio').length == 0)
                        $('<div/>', {id:'hzDetailRatio', text:details.ratio, class:'hzDetail'}).css(hzDetailCss).prependTo(hzDetails);
                    else
                        $('#hzDetailRatio').text(details.ratio);
                }
                if (options.showDetailDimensions) {
                    if (hzDetails.find('#hzDetailDimensions').length == 0)
                        $('<div/>', {id:'hzDetailDimensions', text:details.dimensions, class:'hzDetail'}).css(hzDetailCss).prependTo(hzDetails);
                    else
                        $('#hzDetailDimensions').text(details.dimensions);
                }
            }
        }

        function srcFullSizeOnError(e) {

            var tryAgainWithCustomHeaders = options.allowHeadersRewrite;

            if (srcDetails.url === $(this).prop('src') || srcDetails.url === unescape($(this).prop('src'))) {
                let hoverZoomSrcIndex = hz.currentLink ? (hz.currentLink.data().hoverZoomSrcIndex || 0) : 0;

                removeMedias();

                // if "abortOnFirstError" flag is set to true then:
                // - do not try to load next possible source(s)
                // - in case of gallery, do not try to display next images & remove them from list
                if (hz.currentLink.data().abortOnFirstError) {
                    console.info('[HoverZoom] Failed to load source: ' + srcDetails.url + '\nAborting.');
                    if (hz.currentLink.data().hoverZoomGallerySrc && hz.currentLink.data().hoverZoomGallerySrc.length) {
                        hz.currentLink.data().hoverZoomGallerySrc = hz.currentLink.data().hoverZoomGallerySrc.slice(0, hz.currentLink.data().hoverZoomGalleryIndex);
                        hz.currentLink.data().hoverZoomGalleryIndex = 0;
                        hz.currentLink.data().hoverZoomSrc = hz.currentLink.data().hoverZoomGallerySrc[0];
                    }
                } else if (tryAgainWithCustomHeaders && hz.currentLink && hz.currentLink.data().tryAgainWithCustomHeadersUrl != srcDetails.url) {
                    // try again to load image using custom HTTP(S) headers for request and/or response
                    console.info('[HoverZoom] Failed to load source: ' + srcDetails.url + '\nTrying again with custom headers...');
                    hz.currentLink.data().tryAgainWithCustomHeadersUrl = srcDetails.url;
                    var url = srcDetails.url.replaceAll(' ', '%20');
                    var referer = hz.currentLink.data().hoverZoomCustomReferer || url;
                    loadWithCustomHeaders(url, referer, function() { clearTimeout(loadFullSizeImageTimeout); loadFullSizeImageTimeout = setTimeout(loadFullSizeImage, 100); });
                } else if (hz.currentLink && hoverZoomSrcIndex < hz.currentLink.data().hoverZoomSrc.length - 1) {
                    // if the link has several possible sources, try to load the next one
                    hoverZoomSrcIndex++;
                    hz.currentLink.data().hoverZoomSrcIndex = hoverZoomSrcIndex;
                    let nextSrc = hz.currentLink.data().hoverZoomSrc[hoverZoomSrcIndex];
                    console.info('[HoverZoom] Failed to load source: ' + srcDetails.url + '\nTrying next one: ' + nextSrc);
                    srcDetails.url = nextSrc;
                    clearTimeout(loadFullSizeImageTimeout);
                    loadFullSizeImageTimeout = setTimeout(loadFullSizeImage, 100);
                } else {
                    // no more sources to try
                    loading = false;
                    if (options.useSeparateTabOrWindowForUnloadableUrlsEnabled) {
                        // last attempt to display image in separate tab or window
                        console.info('[HoverZoom] Failed to load source: ' + srcDetails.url + ' in current window.\nTrying to load source in separate window or tab...');
                        if (options.useSeparateTabOrWindowForUnloadableUrls == 'window') {
                            openImageInWindow();
                        } else if (options.useSeparateTabOrWindowForUnloadableUrls == 'tab') {
                            openImageInTab(true); // do not focus tab
                        }
                    } else {
                        console.warn('[HoverZoom] Failed to load source: ' + srcDetails.url);
                    }
                }
            }
        }

        // rewrite HTTP(S) headers for url in parameter:
        // - request:  "referer" = referer
        // - response:  "Access-Control-Allow-Origin" = "*"
        // then try to load url through callback
        function loadWithCustomHeaders(url, referer, callback) {
            // to deal with redirections: do not use full url for matching but only pathname + search
            try {
                const newUrl = new URL(url);
                url = newUrl.pathname + newUrl.search;
            } catch {}
            chrome.runtime.sendMessage({action:"storeHeaderSettings",
                                                plugin:"custom",
                                                settings:
                                                    [{"type":"request",
                                                    "urls":[url],
                                                    "headers":[{"name":"referer", "value":referer, "typeOfUpdate":"add"}]},
                                                    {"type":"response",
                                                    "urls":[url],
                                                    "headers":[{"name":"Access-Control-Allow-Origin", "value":"*", "typeOfUpdate":"add"}]}]
                                                }, callback());
        }

        function hideCursor() {
            if (!hz.hzViewer) return;
            hz.hzViewer.css('cursor', 'none');
            hz.hzViewer.css('pointer-events', 'auto');
        }

        function showCursor() {
            if (!hz.hzViewer) return;
            hz.hzViewer.css('cursor', 'pointer');
            hz.hzViewer.css('pointer-events', 'none');
        }

        function cancelSourceLoading() {
            cLog('cancelSourceLoading');
            loading = false;
            hz.currentLink = null;
            clearTimeout(loadFullSizeImageTimeout);
            closeHoverZoomViewer();
        }

        function getTextSelected() {
            // remove carriage returns
            return window.getSelection().toString().replace(/\n/g, " "); // "&crarr;"
        }

        function getSrcDetails(link) {
            let details = {};
            if (!srcDetails.audio || srcDetails.video) {
                if (srcDetails.naturalWidth) details.dimensions = Math.round(srcDetails.naturalWidth / parseInt(options.zoomFactor)) + 'x' + Math.round(srcDetails.naturalHeight / parseInt(options.zoomFactor));
                if (srcDetails.naturalWidth) details.ratio = getImgRatio(srcDetails.naturalWidth, srcDetails.naturalHeight);
                let displayedWidth = imgFullSize.width() || imgFullSize[0].width;
                if (srcDetails.naturalWidth) details.scale = Math.round(100.0 * displayedWidth / srcDetails.naturalWidth) + '%';
            }

            // if video comes with distinct url for audio then extension = video's extension
            details.extension = getExtensionFromUrl(srcDetails.audio && !srcDetails.video ? srcDetails.audioUrl : srcDetails.url, srcDetails.video, srcDetails.playlist, srcDetails.audio);
            details.host = srcDetails.host;
            let filename = getFilename();
            if (filename) details.filename = filename;
            let duration = (srcDetails.audio && !srcDetails.video ? getDurationFromAudio() : getDurationFromVideo());
            if (duration) details.duration = duration.replace(/ /g, ':');

            let additionaInfos = sessionStorage.getItem('hoverZoomAdditionalInfos');
            if (additionaInfos) {
                try {
                    additionaInfos = JSON.parse(additionaInfos);
                    let infos = additionaInfos[srcDetails.audio && !srcDetails.video ? srcDetails.audioUrl : srcDetails.url];
                    if (infos) {
                        details.contentLength = infos.contentLength;
                        details.lastModified = infos.lastModified;
                    }
                } catch {}
            }

            return details;
        }

        // try to display image's width/height as a "small" ratio (e.g: 4:3)
        // if not possible then simply display a float number
        function getImgRatio(w, h) {
            if (w == 0|| h == 0) return '';
            let redux = hz.reduceFraction(w, h);
            let wRedux = redux[0];
            let hRedux = redux[1];
            if (wRedux == w || hRedux == h || wRedux > 20 || hRedux > 20) return (w/h).toFixed(2);
            return wRedux + ':' + hRedux;
        }

        function prepareImgCaption(link) {
            logger.enterFunc();
            logger.info(link[0].outerHTML);

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
        function imgLinksPrepared(links, name) {
            // If the extension is disabled or the site is excluded, we only need to know
            // whether the page action needs to be shown or not.
            if (!options.extensionEnabled || isExcludedSite()) {
                return;
            }

            if (links.length > 0) {
                cLog(name);
                cLog(links);
            }

            var showPageAction = false;
            links.each(function () {
                var link = $(this),
                    linkData = link.data();
                if (!linkData.hoverZoomSrc && !linkData.hoverZoomGallerySrc && !linkData.href && $.isEmptyObject(linkData.meta)) {
                    prepareImgLinksAsync(true);
                } else {
                    // Skip if the image has the same URL as the thumbnail.
                    if (linkData.hoverZoomSrc && linkData.hoverZoomSrc.length) {
                        var url = linkData.hoverZoomSrc[0],
                            skip = (link.is('img') && url === link.attr('src'));
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
                if (!options.disabledPlugins.includes(hoverZoomPlugins[i].name.replace(/[^\w\-_]/g, '').toLowerCase()))
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
            var url = undefined;
            try {
                url = new URL(href);
            } catch {
                return url;
            }
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
            if (prepareImgLinksDelay > 1000) prepareImgLinksDelay = 1000;
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
                closeHoverZoomViewer();
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
            let linkHostname = new URL(link)['hostname'];
            let excluded = !options.whiteListMode;
            for (let i = 0; i < options.excludedSites.length; i++) {

                // check if excluded site is included in link hostname
                // e.g:
                // link hostname = www.tiktok.com
                // excluded site = tiktok
                // => link excluded
                let es = options.excludedSites[i];
                if (linkHostname.indexOf(es) !== -1) return excluded;
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

        // deals with messages sent by background.js
        function onMessage(message, sender, sendResponse) {
            if (message.action === 'optionsChanged') {
                options = message.options;
                applyOptions();
            }
        }

        const observer = new MutationObserver(windowOnDOMMutation);

        function bindObserver() {
            observer.observe(document.body, { childList: true, subtree: true });
        }

        function unbindObserver() {
            observer.disconnect();
        }

        function windowOnDOMMutation(mutations, observer) {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (const insertedNode of mutation.addedNodes) {
                        if (insertedNode.nodeType === 1) // ELEMENT_NODE
                            onNodeInserted(insertedNode);
                    }
                }
            }
        }

        function onNodeInserted(insertedNode) {
            if (insertedNode.nodeName === 'A' ||
                insertedNode.nodeName === 'IMG' ||
                insertedNode.getElementsByTagName('A').length > 0 ||
                insertedNode.getElementsByTagName('IMG').length > 0) {
                if (insertedNode.id !== 'hzViewer' &&
                    insertedNode.id !== 'hzDownscaled' &&
                    insertedNode.id !== 'hzLoader' &&
                    (insertedNode.parentNode === null ||
                       (insertedNode.parentNode.id !== 'hzViewer' &&
                        insertedNode.parentNode.id !== 'hzContainer'))) {
                    prepareImgLinksAsync();
                }
                bindJsaction();
            }
        }

        function windowOnLoad(event) {
            prepareImgLinksAsync();
        }

        var lastScrollTop = 0;
        var deltaMin = 1000;
        function bindEvents() {
            bindObserver();
            wnd.on('load',windowOnLoad).scroll(cancelSourceLoading).blur(cancelSourceLoading);

            // to deal with lazy loading : prepare imgs links when user scrolls down more than deltaMin pixels, even if no node inserted
            // for instance, on TripAdvisor:
            // img's src placeholder is replaced by real img url stored in data-lazyurl as user scrolls down
            $(document).on('scroll mousewheel', function() {
                let scrollTop = window.scrollY || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
                if (scrollTop < lastScrollTop) {
                    lastScrollTop = scrollTop < 0 ? 0 : scrollTop; // For Mobile or negative scrolling
                } else if (scrollTop > lastScrollTop + deltaMin) {
                    lastScrollTop = scrollTop < 0 ? 0 : scrollTop; // For Mobile or negative scrolling
                    prepareImgLinksAsync();
                }
            });

            // needed when navigating galleries fullscreen
            $(document).on('click', function() { prepareImgLinksAsync(); });
            $(document).mouseup(prepareImgLinksAsync);

            $(document).contextmenu(documentContextMenu);
            $(document).mousemove(documentMouseMove).mousedown(documentMouseDown).mouseleave(cancelSourceLoading);
            $(document).on('mouseup', function(event) { documentMouseUp(event); })
            $(document).keydown(documentOnKeyDown).keyup(documentOnKeyUp);
            if (options.galleriesMouseWheel) {
                window.addEventListener('wheel', documentOnMouseWheel, {passive: false});
            }
            if (options.zoomVideos) {
                $(document).on('visibilitychange', closeHoverZoomViewer);
            }

            bindJsaction();
        }

        // jsaction hides binding performed at document level by HZ+ in bindEvents() function, so some extra bindings are needed
        // note: jsaction is used by Google Maps (at least)
        function bindJsaction() {
            $('[jsaction*=mousemove]').each(function() {
                //if (getEventListeners(this)['mousemove'] == undefined) // only works in Chrome console
                if ($._data(this, 'events') == undefined || $._data(this, 'events')['mousemove'] == undefined)
                    $(this).on('mousemove', documentMouseMove);
            });

            $('[jsaction*=keyup]').each(function() {
                if ($._data(this, 'events') == undefined || $._data(this, 'events')['keyup'] == undefined)
                    $(this).on('keyup', documentOnKeyUp);
            });
        }

        function documentOnMouseWheel(event) {
            if (viewerLocked) {
                event.preventDefault();
                // Scale up or down locked viewer then clamp between 0.1x and 10x.
                // For large imgs (= width or height > 1000px), a smaller step is needed
                let stepInit = 0.1 / (1.0 + Math.floor(Math.max(srcDetails.naturalWidth, srcDetails.naturalHeight) / 1000.0));
                let step = zoomFactor < 2 ? stepInit : stepInit * Math.floor(zoomFactor);
                if (plusKeyDown || arrowUpKeyDown) {
                    zoomSpeedFactor *= 2.0;
                }
                if (minusKeyDown || arrowDownKeyDown) {
                    zoomSpeedFactor *= 0.5;
                }
                step *= zoomSpeedFactor;
                zoomFactor = zoomFactor + (event.deltaY < 0 ? 1 : -1) * step;
                zoomFactor = Math.max(Math.min(zoomFactor, 10), stepInit);
                posViewer();
                panLockedViewer(event);
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
                    var video = hz.hzViewer.find('video').get(0);
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

        function toggleKey() {
            options.extensionEnabled = !options.extensionEnabled;
            if (!options.extensionEnabled) {
                // close zoomed image or video
                viewerLocked = false;
                if (hz.hzViewer) {
                    stopMedias();
                    hz.hzViewer.hide();
                }
                if (imgFullSize) {
                    return false;
                }
                return true
            }
        }

        function closeKey() {
            viewerLocked = false;
            if (hz.hzViewer) {
                stopMedias();
                hz.hzViewer.hide();
            }
            if (imgFullSize) {
                cancelSourceLoading();
                return false;
            }
            return true
        }

        function hideKey(){
            hideKeyDown = true;
            if (hz.hzViewer) {
                pauseMedias();
                hz.hzViewer.hide();
            }
            if (imgFullSize) {
                return false;
            }
            return true
        }

        function documentOnKeyDown(event) {
            // Skips if an input controlled is focused
            if (event.target && ['INPUT','TEXTAREA','SELECT'].indexOf(event.target.tagName) > -1) {
                return;
            }

            const keyCode = event.which;

            // Toggle key is pressed down
            if (keyCode === options.toggleKey) {
                let returnStatement = toggleKey() ? true : false;
                return returnStatement;
            }

            // Action key (zoom image) is pressed down
            if (keyCode === options.actionKey && !actionKeyDown) {
                actionKeyDown = true;
                $(this).mousemove();
                if (loading || imgFullSize) {
                    return false;
                }
            }

            // Full zoom key is pressed down
            if (keyCode === options.fullZoomKey && !fullZoomKeyDown) {
                fullZoomKeyDown = true;
                posViewer();
                if (imgFullSize) {
                    return false;
                }
            }

            // close key (close zoomed image) is pressed down
            // => zoomed image is closed immediately
            if (keyCode === options.closeKey) {
                let returnStatement = closeKey() ? true : false;
                return returnStatement;
            }

            // hide key (hide zoomed image) is pressed down
            // => zoomed image remains hidden until key is released
            if (keyCode === options.hideKey && !hideKeyDown) {
                let returnStatement = hideKey() ? true : false;
                return returnStatement;
            }

            // the following keys are processed only if an image is displayed
            if (imgFullSize) {
                // Cancels event if an action key is held down (auto-repeat may trigger additional events)
                if (keyCode === options.actionKey ||
                    keyCode === options.fullZoomKey ||
                    keyCode === options.hideKey) {
                    return false;
                }
                // "Lock image" key
                if (keyCode === options.lockImageKey) {
                    if (!viewerLocked) {
                        let width = imgFullSize.width() || imgFullSize[0].width;
                        zoomFactorFit = width / srcDetails.naturalWidth;
                        lockViewer();
                    }
                    else {
                        if (zoomFactor > 1.1 * zoomFactorFit || zoomFactor < 0.9 * zoomFactorFit) {
                            // restore zoom factor such as img or video fits screen size
                            zoomFactor = zoomFactorFit || parseInt(options.zoomFactor);
                        } else {
                            // zoom factor = default
                            zoomFactor = parseInt(options.zoomFactor);
                        }
                        posViewer();
                        panLockedViewer(event);
                    }
                    return false;
                }
                // "Copy image" key
                if (isChromiumBased) {
                    if (keyCode === options.copyImageKey) {
                        copyImage();
                        return false;
                    }
                }
                // "Copy image url" key
                if (keyCode === options.copyImageUrlKey) {
                    copyLink();
                    return false;
                }
                // "Previous image" key
                if (keyCode === options.prevImgKey) {
                    var linkData = hz.currentLink.data();
                    if (linkData.hoverZoomGallerySrc && linkData.hoverZoomGallerySrc.length > 1) rotateGalleryImg(-1);
                    else changeVideoPosition(-parseInt(options.videoPositionStep));
                    return false;
                }
                // "Next image" key
                if (keyCode === options.nextImgKey) {
                    var linkData = hz.currentLink.data();
                    if (linkData.hoverZoomGallerySrc && linkData.hoverZoomGallerySrc.length > 1) rotateGalleryImg(1);
                    else changeVideoPosition(parseInt(options.videoPositionStep));
                    return false;
                }
                // "Flip image" key
                if (keyCode === options.flipImageKey) {
                    flipImage();
                    return false;
                }
                // "+" key is pressed
                if (event.which == 107) {
                    event.preventDefault();
                    plusKeyDown = true;
                    zoomSpeedFactor = 1; // reset zoom speed factor on locked images & videos
                    return false;
                }
                // "-" key is pressed
                if (event.which == 109) {
                    event.preventDefault();
                    minusKeyDown = true;
                    zoomSpeedFactor = 1; // reset zoom speed factor on locked images & videos
                    return false;
                }
                // "Arrow Up" key is pressed
                if (event.which == 38) {
                    event.preventDefault();
                    arrowUpKeyDown = true;
                    zoomSpeedFactor = 1; // reset zoom speed factor on locked images & videos
                    return false;
                }
                // "Arrow Down" key is pressed
                if (event.which == 40) {
                    event.preventDefault();
                    arrowDownKeyDown = true;
                    zoomSpeedFactor = 1; // reset zoom speed factor on locked images & videos
                    return false;
                }
            }
        }

        function changeVideoPosition(amount) {
            const video = hz.hzViewer.find('video').get(0);
            if (video && video.currentTime) {
                video.currentTime = Math.max(video.currentTime + amount, 0);
            }
        }

        function documentOnKeyUp(event) {
            // Skips if an input controlled is focused
            if (event.target && ['INPUT','TEXTAREA','SELECT'].indexOf(event.target.tagName) > -1) {
                return;
            }

            const keyCode = event.which;

            // Action key (zoom image) is released
            if (keyCode === options.actionKey) {
                actionKeyDown = false;
                closeHoverZoomViewer();
            }
            // Full zoom key is released
            if (keyCode === options.fullZoomKey) {
                fullZoomKeyDown = false;
                $(this).mousemove();
            }
            // Hide key is released
            if (keyCode === options.hideKey) {
                hideKeyDown = false;
                if (imgFullSize) {
                    hz.hzViewer.show();
                    playMedias();
                }
                $(this).mousemove();
            }
            // the following keys are processed only if an image is displayed
            if (imgFullSize) {
                // "Open image in a new window" key
                if (keyCode === options.openImageInWindowKey) {
                    if (srcDetails.video) openVideoInWindow();
                    else if (srcDetails.audio) openAudioInWindow();
                    else openImageInWindow();
                    return false;
                }
                // "Open image in a new tab" key
                if (keyCode === options.openImageInTabKey) {
                    if (srcDetails.video) openVideoInTab(event.shiftKey);
                    else if (srcDetails.audio) openAudioInTab();
                    else openImageInTab(event.shiftKey);
                    return false;
                }
                // "Save image" key
                if (keyCode === options.saveImageKey) {
                    saveImage();
                    return false;
                }
                // "+" key is released
                if (event.which == 107) {
                    event.preventDefault();
                    plusKeyDown = false;
                    zoomSpeedFactor = 1; // reset zoom speed factor on locked images & videos
                }
                // "-" key is released
                if (event.which == 109) {
                    event.preventDefault();
                    minusKeyDown = false;
                    zoomSpeedFactor = 1; // reset zoom speed factor on locked images & videos
                }
                // "Arrow Up" key is released
                if (event.which == 38) {
                    event.preventDefault();
                    arrowUpKeyDown = false;
                    zoomSpeedFactor = 1; // reset zoom speed factor on locked images & videos
                }
                // "Arrow Down" key is released
                if (event.which == 40) {
                    event.preventDefault();
                    arrowDownKeyDown = false;
                    zoomSpeedFactor = 1; // reset zoom speed factor on locked images & videos
                }
            }
        }

        function getExtensionFromUrl(url, video, playlist, audio) {
            let fullurl = url;
            // remove trailing / & trailing query
            url = url.replace(/\/$/, '').split(/[\?!#&]/)[0];
            // extract filename
            let filename = url.split('/').pop().split(':')[0].replace(regexForbiddenChars, '');
            let ext = (filename.lastIndexOf('.') === -1 ? '' : filename.substr(filename.lastIndexOf('.') + 1));
            if (ext == '' || ext.length > 5) {
                // try to guess correct extension
                if (!video && !playlist && !audio) ext = 'jpg'; // default image extension
                if (playlist) ext = 'm3u8'; // default playlist extension
                if (video) {
                    if (fullurl.indexOf('mp4') !== -1) ext = 'mp4';
                    else if (fullurl.indexOf('webm') !== -1) ext = 'webm';
                    else ext = 'video';
                }
                if (audio) {
                    ext = 'mp3';
                }
            }
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
                let popupBorder = {width:16, height:39};

                if (data) {
                    try {
                        popupBorder = JSON.parse(data);
                    }
                    catch (e) {
                    }
                }

                // If image bigger than screen, adjust window dimensions to match image's aspect ratio
                let createDataWidth = srcDetails.naturalWidth + popupBorder.width;
                let createDataHeight = srcDetails.naturalHeight + popupBorder.height;
                if (createDataHeight > screen.availHeight) {
                    let imgHeight = screen.availHeight - popupBorder.height;
                    let imgWidth = Math.round(imgHeight * srcDetails.naturalWidth / srcDetails.naturalHeight);
                    createDataWidth = imgWidth + popupBorder.width;
                    createDataHeight = screen.availHeight;
                } else if (createDataWidth > screen.availWidth) {
                    let imgWidth = screen.availWidth - popupBorder.width;
                    let imgHeight = Math.round(imgWidth * srcDetails.naturalHeight / srcDetails.naturalWidth);
                    createDataWidth = screen.availWidth;
                    createDataHeight = imgHeight + popupBorder.height;
                }

                // Center window vertically & horizontally
                let createDataTop = Math.round(screen.availHeight / 2 - createDataHeight / 2);
                let createDataLeft = Math.round(screen.availWidth / 2 - createDataWidth / 2);

                let createData = {
                    url:srcDetails.url,
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

        function openAudioInWindow() {
            chrome.runtime.sendMessage({action:'getItem', id:'popupBorder'}, function (data) {
                let popupBorder = {width:16, height:39};

                if (data) {
                    try {
                        popupBorder = JSON.parse(data);
                    }
                    catch (e) {}
                }

                let body = '<body/>';
                body = $(body);
                body[0].style.margin = 0;
                body[0].style.backgroundImage = 'url(' + chrome.extension.getURL('images/spectrogram.png') + ')';

                let audio = '<audio/>';
                audio = $(audio);
                audio[0].controls = true;
                audio[0].src = srcDetails.audioUrl;
                audio[0].setAttribute('onloadeddata', 'this.volume = ' + options.audioVolume + ';');
                audio.css(audioControlsCss);
                body.append(audio);

                let imgDim = hz.getImageDimensions(chrome.extension.getURL('images/spectrogram.png'));
                let createDataWidth = imgDim.width + popupBorder.width;
                let createDataHeight = imgDim.height + popupBorder.height;

                // Center window vertically & horizontally
                let createDataTop = Math.round(screen.availHeight / 2 - createDataHeight / 2);
                let createDataLeft = Math.round(screen.availWidth / 2 - createDataWidth / 2);

                let createData = {
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

        function openVideoInWindow() {
            chrome.runtime.sendMessage({action:'getItem', id:'popupBorder'}, function (data) {
                var popupBorder = {width:16, height:39};

                if (data) {
                    try {
                        popupBorder = JSON.parse(data);
                    }
                    catch (e) {}
                }

                let body = '<body/>';
                body = $(body);
                body[0].style.margin = 0;
                let video = '<video/>';
                video = $(video);
                video[0].style.position = 'absolute';
                video[0].controls = true;
                video[0].src = srcDetails.url;
                video[0].setAttribute('onloadeddata', 'this.volume = ' + options.videoVolume + '; this.muted = ' + options.muteVideos + ';');
                body.append(video);

                if (srcDetails.audioUrl) {
                    // add audio source if not embedded in video
                    let audio = '<audio/>';
                    audio = $(audio);
                    audio[0].controls = true;
                    audio[0].src = srcDetails.audioUrl;
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
                let createDataWidth = srcDetails.naturalWidth + popupBorder.width;
                let createDataHeight = srcDetails.naturalHeight + popupBorder.height;
                if (createDataHeight > screen.availHeight) {
                    let videoHeight = screen.availHeight - popupBorder.height;
                    let videoWidth = Math.round(videoHeight * srcDetails.naturalWidth / srcDetails.naturalHeight);
                    video[0].height = videoHeight;
                    video[0].width = videoWidth;
                    createDataWidth = videoWidth + popupBorder.width;
                    createDataHeight = screen.availHeight;
                } else if (createDataWidth > screen.availWidth) {
                    let videoWidth = screen.availWidth - popupBorder.width;
                    let videoHeight = Math.round(videoWidth * srcDetails.naturalHeight / srcDetails.naturalWidth);
                    video[0].height = videoHeight;
                    video[0].width = videoWidth;
                    createDataWidth = screen.availWidth;
                    createDataHeight = videoHeight + popupBorder.height;
                }

                // Center window vertically & horizontally
                let createDataTop = Math.round(screen.availHeight / 2 - createDataHeight / 2);
                let createDataLeft = Math.round(screen.availWidth / 2 - createDataWidth / 2);

                let createData = {
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
                    url:srcDetails.url,
                    active:!background
                }
            });
        }

        function openAudioInTab(background) {
            let body = '<body/>';
            body = $(body);
            body[0].style.backgroundColor = 'rgb(0,0,0)';

            let audio = '<audio/>';
            audio = $(audio);
            audio[0].controls = true;
            audio[0].src = srcDetails.audioUrl;
            audio[0].setAttribute('onloadeddata', 'this.volume = ' + options.audioVolume + ';');
            body.append(audio);

            let createData = {
                url:'data:text/html,' + body[0].outerHTML,
                active:!background
            };

            chrome.runtime.sendMessage({
                action:'openViewTab',
                createData:createData
            });
        }

        function openVideoInTab(background) {
            let body = '<body/>';
            body = $(body);
            body[0].style.backgroundColor = 'rgb(0,0,0)';

            let video = '<video/>';
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
            video[0].src = srcDetails.url;
            video[0].setAttribute('onloadeddata', 'this.volume = ' + options.videoVolume + '; this.muted = ' + options.muteVideos + ';');
            body.append(video);

            if (srcDetails.audioUrl) {
                // add audio source if not embedded in video
                let audio = '<audio/>';
                audio = $(audio);
                audio[0].controls = true;
                audio[0].src = srcDetails.audioUrl;
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
            let createDataWidth = srcDetails.naturalWidth;
            let createDataHeight = srcDetails.naturalHeight;
            if (createDataHeight > screen.availHeight) {
                let videoHeight = screen.availHeight;
                let videoWidth = Math.round(videoHeight * srcDetails.naturalWidth / srcDetails.naturalHeight);
                video[0].height = videoHeight;
                video[0].width = videoWidth;
            } else if (createDataWidth > screen.availWidth) {
                let videoWidth = screen.availWidth;
                let videoHeight = Math.round(videoWidth * srcDetails.naturalHeight / srcDetails.naturalWidth);
                video[0].height = videoHeight;
                video[0].width = videoWidth;
            }

            let createData = {
                url:'data:text/html,' + body[0].outerHTML,
                active:!background
            };

            chrome.runtime.sendMessage({
                action:'openViewTab',
                createData:createData
            });
        }

        // get all headers from servers
        function getAdditionalInfosFromServer(url) {

            // check if additional infos already received
            let additionaInfos = sessionStorage.getItem('hoverZoomAdditionalInfos');
            if (additionaInfos) {
                try {
                    additionaInfos = JSON.parse(additionaInfos);
                    let infos = additionaInfos[url];
                    if (infos) return;
                } catch {}
            }

            chrome.runtime.sendMessage({
                action: 'ajaxGetHeaders',
                url: url
            }, function(response) {
                if (response == null) return;
                let infos = parseHeaders(response.headers);
                if (!$.isEmptyObject(infos)) {
                    // store infos
                    let additionalInfos = sessionStorage.getItem('hoverZoomAdditionalInfos') || '{}';
                    try {
                        additionalInfos = JSON.parse(additionalInfos);
                        if (!additionalInfos[response.url]) {
                            additionalInfos[response.url] = infos;
                            sessionStorage.setItem('hoverZoomAdditionalInfos', JSON.stringify(additionalInfos));
                        }
                    } catch {}
                }
                posViewer();
            } );
        }

        // extract content-Length & Last-Modified values from headers
        function parseHeaders(headers) {
            let infos = {}
            let contentLength = headers.match(/content-length:(.*)/i);
            if (contentLength) {
                contentLength = contentLength[1].trim();
                if (!isNaN(contentLength) && contentLength > 0) {
                    contentLength /= 1024;
                    if (contentLength < 1000) infos.contentLength = (contentLength).toFixed(0) + ' KB';
                    else infos.contentLength = (contentLength / 1024).toFixed(1) + ' MB';
                }
            }
            let lastModified = headers.match(/last-modified:(.*)/i);
            if (lastModified && lastModified[1].indexOf('01 Jan 1970') === -1) infos.lastModified = lastModified[1].trim();
            return infos;
        }

        //stackoverflow.com/questions/49474775/chrome-65-blocks-cross-origin-a-download-client-side-workaround-to-force-down
        function forceDownload(blob, filename) {
          var a = document.createElement('a');
          a.download = filename;
          a.href = blob;
          a.click();
        }

        function downloadResource(url, filename, callback) {
            cLog('download: ' + url);
            if (!filename) filename = url.split('\\').pop().split('/').pop();
            if (filename.startsWith('.')) filename = 'download' + filename;
            // prefix with download folder if needed
            if (options.downloadFolder) {
                cLog('options.downloadFolder: ' + options.downloadFolder);
                let downloadFolder = options.downloadFolder;
                filename = downloadFolder + filename;
                cLog('filename: ' + filename);
            }

            // pixiv.net: use "blob" workaround as regular download always fails
            if (url.indexOf('//i.pximg.net/') !== -1) {
                chrome.runtime.sendMessage({action: 'downloadFileBlob',
                                            url: url,
                                            filename: filename,
                                            conflictAction: 'uniquify'});
            } else { // all sites except pixiv.net
                // 1st attempt to download file (Chrome API)
                chrome.runtime.sendMessage({action: 'downloadFile',
                                            url: url,
                                            filename: filename,
                                            conflictAction: 'uniquify'},
                                            function (downloadKO) {
                                                if (downloadKO === true) {
                                                    // 2nd attempt (blob + Chrome API)
                                                    chrome.runtime.sendMessage({action: 'downloadFileBlob',
                                                                                url: url,
                                                                                filename: filename,
                                                                                conflictAction: 'uniquify'});
                                                }
                                            });
            }
        }

        // 5 types of media can be saved to disk: image, video, audio, playlist, subtitles
        const fileMedias = {
            IMG : "IMG",
            VIDEO : "VIDEO",
            AUDIO : "AUDIO",
            PLAYLIST : "PLAYLIST",
            SUBTITLES : "SUBTITLES"
        }

        // return filename without knowing type of media displayed
        function getFilename() {

            let filename = getFilenameByMedia(fileMedias.IMG, false);
            if (filename) return filename;
            filename = getFilenameByMedia(fileMedias.VIDEO, false);
            if (filename) return filename;
            filename = getFilenameByMedia(fileMedias.AUDIO, false);
            if (filename) return filename;
            filename = getFilenameByMedia(fileMedias.PLAYLIST, false);
            if (filename) return filename;
            filename = getFilenameByMedia(fileMedias.SUBTITLES, false);
            if (filename) return filename;
            return '';
        }

        function replaceOriginalFilename(filename) {
            if (options.replaceOriginalFilename) {
                if (filename.indexOf('.') !== -1) filename = filename.replace(/(.*)\.(.*)/, `${options.downloadFilename}.$2`);
                else filename = options.downloadFilename;
            }
            return filename;
        }

        // return original or download filename according to type of media in param
        function getFilenameByMedia(fileMedia, download = true) {

            let src, filename;
            switch (fileMedia) {
                case fileMedias.IMG:
                    if (!hz.hzViewer) return undefined;
                    let img = hz.hzViewer.find('img:not(.hzPlaceholder)').get(0);
                    if (!img) return undefined;
                    src = img.src;
                    // remove trailing / & trailing query
                    src = src.replace(/\/$/, '').split(/[\?!#&]/)[0];
                    // extract filename
                    filename = src.split('/').pop().split(':')[0].replace(regexForbiddenChars, '');
                    if (filename === '') {
                        filename = 'image';
                    }
                    if (download) {
                        filename = replaceOriginalFilename(filename);
                        if (filename.indexOf('.') === -1) filename = filename + '.jpg'; // add default extension for download
                    }
                    return filename;

                case fileMedias.VIDEO:
                    if (!hz.hzViewer) return undefined;
                    let video = hz.hzViewer.find('video').get(0);
                    if (!video) return undefined;
                    src = video.src;
                    if (src.startsWith('blob:')) return undefined;
                    // remove trailing / & trailing query
                    src = src.replace(/\/$/, '').split(/[\?!#&]/)[0];
                    // extract filename
                    filename = src.split('/').pop().split(':')[0].replace(regexForbiddenChars, '');
                    if (filename === '') {
                        filename = 'video';
                    }
                    if (download) {
                        filename = replaceOriginalFilename(filename);
                        if (filename.indexOf('.') === -1) filename = filename + '.mp4'; // add default extension for download
                    }
                    return filename;

                case fileMedias.AUDIO:
                    if (!hz.hzViewer) return undefined;
                    let audio = hz.hzViewer.find('audio').get(0);
                    if (!audio) return undefined;
                    src = audio.src;
                    // remove trailing / & trailing query
                    src = src.replace(/\/$/, '').split(/[\?!#&]/)[0];
                    // extract filename
                    filename = src.split('/').pop().split(':')[0].replace(regexForbiddenChars, '');
                    if (filename === '') {
                        filename = 'audio';
                    }
                    if (download) {
                        filename = replaceOriginalFilename(filename);
                        if (filename.indexOf('.') === -1) filename = filename + '.mp4'; // add default extension for download
                    }
                    return filename;

                case fileMedias.PLAYLIST:
                    if (!hz.hzViewer) return undefined;
                    if (!srcDetails.playlist) return undefined;
                    src = srcDetails.url;
                    // remove trailing / & trailing query
                    src = src.replace(/\/$/, '').split(/[\?!#&]/)[0];
                    // extract filename
                    filename = src.split('/').pop().split(':')[0].replace(regexForbiddenChars, '');
                    if (download) {
                        filename = replaceOriginalFilename(filename);
                        filename = 'playlist-' + filename;
                        if (filename.indexOf('.') === -1) filename = filename + '.m3u8'; // add default extension for download
                    }
                    return filename;

                case fileMedias.SUBTITLES:
                    if (!hz.hzViewer) return undefined;
                    if (!srcDetails.subtitlesUrl) return undefined;
                    src = srcDetails.subtitlesUrl;
                    // remove trailing / & trailing query
                    src = src.replace(/\/$/, '').split(/[\?!#&]/)[0];
                    // extract filename
                    filename = src.split('/').pop().split(':')[0].replace(regexForbiddenChars, '');
                    if (download) {
                        filename = replaceOriginalFilename(filename);
                        filename = 'subtitles-' + filename;
                        if (filename.indexOf('.') === -1) filename = filename + '.txt'; // add default extension for download
                    }
                    return filename;
            }
            return '';
        }

        function lockViewer() {
            viewerLocked = true;
            displayFullSizeImage();
        }

        // alternately flip image or video vertically and horizontally
        function flipImage() {
            if (!imgFullSize) return;

            let flip = '';
            if (imgFullSize.css('transform') == 'matrix(1, 0, 0, 1, 0, 0)' || imgFullSize.css('transform') == 'none' || imgFullSize.css('transform') == '') {
                imgFullSize.css('transform', 'matrix(-1, 0, 0, 1, 0, 0)'); // scaleX(-1)
                flip = 'flipX';
            }
            else if (imgFullSize.css('transform') == 'matrix(-1, 0, 0, 1, 0, 0)') {
                imgFullSize.css('transform', 'matrix(-1, 0, 0, -1, 0, 0)'); // scaleX(-1) scaleY(-1)
                flip = 'flipXY';
            }
            else if (imgFullSize.css('transform') == 'matrix(-1, 0, 0, -1, 0, 0)') {
                imgFullSize.css('transform', 'matrix(1, 0, 0, -1, 0, 0)'); // scaleX(-1) scaleY(-1) scaleX(-1)
                flip = 'flipXYX';
            }
            else if (imgFullSize.css('transform') == 'matrix(1, 0, 0, -1, 0, 0)')
                imgFullSize.css('transform', '');

            if (options.ambilightEnabled)
                updateAmbilight();

            // flip timestamp on videos
            if (imgFullSize.is('video') && options.videoTimestamp) {
                $('#hzContainer').removeClass('flipX flipXY flipXYX');
                $('#hzContainer').addClass(flip);
                addTimestampTrack(imgFullSize[0]);
            }
        }

        function saveImage() {
            saveImg();
            saveVideo();
            saveAudio();
            savePlaylist();
            saveSubtitles();
        }

        function copyLink() {
            const url = (srcDetails.audio && !srcDetails.video ? srcDetails.audioUrl : srcDetails.url);
            if (!url) return;
            navigator.clipboard.writeText(url);
        }

        function copyImage() {
            if (! srcDetails.url) return;
            const url = srcDetails.url.replaceAll(' ', '%20');

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
            if (!hz.hzViewer) return;
            let img = hz.hzViewer.find('img').get(0);
            if (!img) return;
            let src = img.src;
            let filename = getFilenameByMedia(fileMedias.IMG);
            if (!filename) return;

            if (options.addDownloadCaption) {
                // prefix with caption
                let caption = getCaption();
                if (caption) {
                    caption = '[' + caption + ']';
                    filename = caption + filename;
                }
            }
            if (options.addDownloadSize) {
                // prefix with size [WxH]
                let size = '[' + getSizeImage(img) + ']';
                filename = size + filename;
            }
            if (options.addDownloadIndex) {
                let gallery = hz.currentLink.data().hoverZoomGallerySrc;
                let index = hz.currentLink.data().hoverZoomGalleryIndex;
                if (gallery) {
                    index++;
                    let indexLen = index.toString().length;
                    let galleryLen = gallery.length.toString().length
                    let galleryIndex = `[${index.toString().padStart(galleryLen,'0')}-${gallery.length}]`;
                    filename = galleryIndex + filename;
                }
            }
            if (options.addDownloadOrigin) {
                // prefix with origin
                let origin = '[' + getOrigin() + ']';
                filename = origin + filename;
            }
            downloadResource(src, filename);
        }

        function saveVideo() {
            if (!hz.hzViewer) return;
            let video = hz.hzViewer.find('video').get(0);
            if (!video) return;
            let src = video.src;
            if (src.startsWith('blob:')) return;
            let filename = getFilenameByMedia(fileMedias.VIDEO);
            if (!filename) return;

            if (options.addDownloadCaption) {
                // prefix with caption
                let caption = getCaption();
                if (caption) {
                    caption = '[' + caption + ']';
                    filename = caption + filename;
                }
            }
            if (options.addDownloadSize) {
                // prefix with size [WxH]
                let size = '[' + getSizeVideo(video) + ']';
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
            if (!hz.hzViewer) return;
            let audio = hz.hzViewer.find('audio').get(0);
            if (!audio) return;
            let src = audio.src;
            let filename = getFilenameByMedia(fileMedias.AUDIO);
            if (!filename) return;

            if (options.addDownloadCaption) {
                // prefix with caption
                let caption = getCaption();
                if (caption) {
                    caption = '[' + caption + ']';
                    filename = caption + filename;
                }
            }
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

        function saveSubtitles() {
            if (!hz.hzViewer) return;
            let video = hz.hzViewer.find('video').get(0);
            let audio = hz.hzViewer.find('audio').get(0);
            if (!video && !audio) return;
            let filename = getFilenameByMedia(fileMedias.SUBTITLES);
            if (!filename) return;

            if (options.addDownloadCaption) {
                // prefix with caption
                let caption = getCaption();
                if (caption) {
                    caption = '[' + caption + ']';
                    filename = caption + filename;
                }
            }
            if (options.addDownloadOrigin) {
                // prefix with origin
                let origin = '[' + getOrigin() + ']';
                filename = origin + filename;
            }
            downloadResource(srcDetails.subtitlesUrl, filename);
        }

        // save the *** URL *** of playlist so user can load it in a video player such as VLC
        // the playlist itself is pretty useless
        function savePlaylist() {
            if (!hz.hzViewer) return;
            let video = hz.hzViewer.find('video').get(0);
            if (!video) return;
            let filename = getFilenameByMedia(fileMedias.PLAYLIST);
            if (!filename) return;

            if (options.addDownloadCaption) {
                // prefix with caption
                let caption = getCaption();
                if (caption) {
                    caption = '[' + caption + ']';
                    filename = caption + filename;
                }
            }
            if (options.addDownloadSize) {
                // prefix with size [WxH]
                let size = '[' + getSizeVideo(video) + ']';
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

            // download KO: This function must be called during a user gesture => debugger must be closed
            downloadResource(srcDetails.url, filename);
            savePlaylistAsMP3MP4(filename);
        }
        // save playlist to 2 distinct files:
        // - filename.m3u8.mp4 (video part)
        // - filename.m3u8.mp3 (audio part)
        function savePlaylistAsMP3MP4(filename) {
            // prefix with download folder if needed
            if (options.downloadFolder) {
                cLog.log('options.downloadFolder: ' + options.downloadFolder);
                let downloadFolder = options.downloadFolder;
                filename = downloadFolder + filename;
                cLog.log('filename: ' + filename);
            }

            // audio
            if (fmp4Data['audio'].length) {
                const blobAudio = new Blob([arrayConcat(fmp4Data['audio'])], {type:'application/octet-stream'});
                const blobAudioUrl = URL.createObjectURL(blobAudio);
                forceDownload(blobAudioUrl, filename + '.mp3');
                URL.revokeObjectURL(blobAudioUrl);
            }

            // video
            if (fmp4Data['video'].length) {
                const blobVideo = new Blob([arrayConcat(fmp4Data['video'])], {type:'application/octet-stream'});
                const blobVideoUrl = URL.createObjectURL(blobVideo);
                forceDownload(blobVideoUrl, filename + '.mp4');
                URL.revokeObjectURL(blobVideoUrl);
            }

            // audio & video
            if (fmp4Data['audiovideo'].length) {
                const blobAudioVideo = new Blob([arrayConcat(fmp4Data['audiovideo'])], {type:'application/octet-stream'});
                const blobAudioVideoUrl = URL.createObjectURL(blobAudioVideo);
                forceDownload(blobAudioVideoUrl, filename + '.mp4');
                URL.revokeObjectURL(blobAudioVideoUrl);
            }
        }

        function arrayConcat(inputArray) {
            var totalLength = inputArray.reduce( function(prev, cur) { return prev + cur.length} ,0);
            var result = new Uint8Array(totalLength);
            var offset = 0;
            inputArray.forEach(function(element) {
                result.set(element, offset);
                offset += element.length;
            });
            return result;
        }

        function getDurationFromVideo() {
            if (!hz.hzViewer) return;
            let video = hz.hzViewer.find('video').get(0);
            if (!video) return;
            let src = video.src;
            return hz.secondsToHms(video.duration);
        }

        function getDurationFromAudio() {
            if (!hz.hzViewer) return;
            let audio = hz.hzViewer.find('audio').get(0);
            if (!audio) return;
            let src = audio.src;
            return hz.secondsToHms(audio.duration);
        }

        // return hostname with forbidden characters replaced by '_'
        function getOrigin() {
            return window.location.hostname.replace(regexForbiddenChars, '_');
        }

        // return displayed size (W x H)
        function getSizeVideo(video) {
            return video.videoWidth + 'x' + video.videoHeight;
        }

        // return displayed size (W x H)
        function getSizeImage(img) {
            return img.naturalWidth + 'x' + img.naturalHeight;
        }

        // return caption with forbidden characters replaced by '_'
        function getCaption() {
            let caption = hz.currentLink.data().hoverZoomCaption || hz.currentLink.data().hoverZoomGalleryCaption || '';
            return caption.replace(regexForbiddenChars, '_');
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
            // keep same viewer when switching from image to image
            // recreate viewer when switching to video, audio or playlist
            let isImgLinkPrev = isImageLink(srcDetails.url);
            srcDetails.url = hz.currentLink.data().hoverZoomSrc[hz.currentLink.data().hoverZoomSrcIndex];
            let isImgLinkNext = isImageLink(srcDetails.url);
            if (isImgLinkPrev && isImgLinkNext) {
                imgFullSize.on('load', nextGalleryImageOnLoad).on('error', srcFullSizeOnError).attr('src', srcDetails.url);
            } else {
                removeMedias();
                loadFullSizeImage();
            }
            getAdditionalInfosFromServer(srcDetails.url);
        }

        function nextGalleryImageOnLoad() {
            cLog('nextGalleryImageOnLoad');
            if (loading) {
                loading = false;
                posViewer();

                data = hz.currentLink.data();
                if (data.hoverZoomGallerySrc.length > 0) {
                    hzGallery.text((data.hoverZoomGalleryIndex + 1) + '/' + data.hoverZoomGallerySrc.length);
                }

                if (!options.ambilightEnabled) {
                    displayCaptionMiscellaneousDetails();
                }

                posViewer();
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
            if (!window.innerHeight || !window.innerWidth || !options.extensionEnabled || isExcludedSite()) {
                return;
            }

            frameBackgroundColor(options.frameBackgroundColor);
            frameThickness(options.frameThickness);
            fontSize(options.fontSize);

            webSiteExcluded = null;
            body100pct = (body.css('position') != 'static') || (body.css('padding-left') == '0px' && body.css('padding-right') == '0px' && body.css('margin-left') == '0px' && body.css('margin-right') == '0px' && (body.css('max-width') == 'none' || body.css('max-width') == '100%'));
            hz.pageGenerator = $('meta[name="generator"]').attr('content');
            prepareImgLinks();
            bindEvents();

            debug = options.debug;
        }

        chrome.runtime.onMessage.addListener(onMessage);
        loadOptions();

        // In case we are being used on a website that removes us from the DOM, update the internal data structure to reflect this
        var target = document.getElementsByTagName('html')[0];
        var obs = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.removedNodes.length > 0) {
                    if (mutation.removedNodes[0].querySelector('#hzViewer')) {
                        hoverZoom.hzViewer = false;
                    }
                }
            });
        });
        obs.observe(target, {attributes: true, childList: true, characterData: true});
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
                if (Array.isArray(parentFilter)) {
                    // try each filter until parent is found
                    // if filter == '' then parent = this
                    $.each(parentFilter, function(k, v) {
                        if (v == '') {
                            link = _this;
                            return false;
                        }
                        link = _this.parents(v);
                        if (link[0]) {
                            return false;
                        }
                    });
                } else {
                    link = _this.parents(parentFilter);
                }
            } else {
                link = _this;
            }
            if (!link[0]) {
                return;
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
    // If image and backgroundImage are both present: choose image
    getThumbUrl:function (el) {
        var compStyle = (el && el.nodeType == 1) ? getComputedStyle(el) : false,
            backgroundImage = compStyle ? compStyle.backgroundImage : 'none';

        var imageSrc = '';
        var backgroundImageSrc = '';

        if (backgroundImage.indexOf("url") !== -1) {
            if (hoverZoom.isEmbeddedImg(backgroundImage)) backgroundImageSrc = ''; // discard embedded images
            else backgroundImageSrc = backgroundImage.replace(/.*url\s*\(\s*(.*)\s*\).*/i, '$1').replace(/"/g,'');
        }

        if (hoverZoom.isEmbeddedImg(el.src)) imageSrc = ''; // discard embedded images
        else imageSrc = el.src;

        return imageSrc || el.getAttribute('data-src') || backgroundImageSrc || el.href;
    },

    // Embedded image url look like:  "data:image/png;base64,Base64 encoded string of the image"
    // sample: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
    isEmbeddedImg:function (url) {
        if (!url) return false;
        return !(url.indexOf('data:image') === -1 && url.indexOf('base64') === -1);

    },

    // Simulates a mousemove event to force a zoom call
    displayPicFromElement:function (el, force) {
        if (el.filter(':hover').length > 0 || force) {
            hoverZoom.currentLink = el;
            $(document).mousemove();
        }
    },

    // Create and displays the zoomed image or video viewer
    createHzViewer:function (displayNow) {
        if (!hoverZoom.hzViewer) {
            hoverZoom.hzViewer = $('<div id="hzViewer"></div>').appendTo(document.body);

            // If the user clicks the image, this simulates a click underneath
            hoverZoom.hzViewer.click(function (event) {
                if (hoverZoom.currentLink && hoverZoom.currentLink.length) {
                    var simEvent = document.createEvent('MouseEvents');
                    simEvent.initMouseEvent('click', event.bubbles, event.cancelable, event.view, event.detail,
                        event.screenX, event.screenY, event.clientX, event.clientY,
                        event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, event.button, null);
                    hoverZoom.currentLink[0].dispatchEvent(simEvent);
                }
            });

        }
        hoverZoom.hzViewer.css(hoverZoom.hzViewerCss);
        hoverZoom.hzViewer.empty();
        hoverZoom.hzViewer.css('visibility', 'hidden');
        if (displayNow) {
            hoverZoom.hzViewer.stop(true, true).fadeTo(options.fadeDuration, options.picturesOpacity);
        }
    },

    // handle the loading image spinner
    // its color depends on loading staus:
    // - green: loading started
    // - orange: img skipped (reason depends on Options settings: image already big enough, etc)
    // - red: an error occured (displayed in console)
    displayImgLoader:function (status, position) {

        // orange & red spinners are optional
        if (options.displayImageLoader === false && (status === 'skipped' || status === 'error')) return;

        // check that loader exists
        if (hoverZoom.hzLoader == null) {
            hoverZoom.hzLoader = $('<div id="hzLoader"><img src="' + chrome.extension.getURL('images/loading.gif') + '" style="opacity: 0.8; padding: 0; margin: 0" /></div>');
            hoverZoom.hzLoader.width('auto').height('auto');
            hoverZoom.hzLoader.css(hoverZoom.hzLoaderCss);
            if (position) hoverZoom.hzLoader.css({top:position.top, left:position.left});
            hoverZoom.hzLoader.appendTo(document.body);
        } else {
            // adjust position
            if (position === undefined) {
                position = hoverZoom.hzLoader.position(); // reuse position of loader
            }
            hoverZoom.hzLoader.css({top:position.top, left:position.left});
        }

        // check loading status
        if (status === 'loading') {
            hoverZoom.hzLoader[0].classList = 'imgLoading';
            hoverZoom.hzLoader.css(hoverZoom.hzViewerLoadingCss);
        }
        if (status === 'skipped') {
            hoverZoom.hzLoader[0].classList = 'imgSkipped';
            hoverZoom.hzLoader.css(hoverZoom.hzViewerSkippedCss);
        }
        if (status === 'error') {
            hoverZoom.hzLoader[0].classList = 'imgError';
            hoverZoom.hzLoader.css(hoverZoom.hzViewerErrorCss);
        }

        if ($('#hzLoader').length === 0) hoverZoom.hzLoader.appendTo(document.body);
        if (position) hoverZoom.hzLoader.css({top:position.top, left:position.left});
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
                var nextSrc = link.data().hoverZoomSrc ? link.data().hoverZoomSrc[hoverZoomSrcIndex] : '';
                if (nextSrc)
                    $('<img src="' + nextSrc + '">').on('load', function () {
                        link.data().hoverZoomPreloaded = true;
                        setTimeout(preloadNextImage, preloadDelay);
                        chrome.runtime.sendMessage({action:'preloadProgress', value:preloadIndex, max:links.length});
                    }).on('error', function () {
                            if (hoverZoomSrcIndex < link.data().hoverZoomSrc.length - 1) {
                                link.data().hoverZoomSrcIndex++;
                                preloadIndex--;
                            } else {
                                // all attempts to pre-load img have failed and there are no more src to try,
                                // so tag img as preloaded and move to next img
                                link.data().hoverZoomPreloaded = true;
                            }
                            setTimeout(preloadNextImage, preloadDelay);
                        });
            }
        }

        setTimeout(preloadNextImage, preloadDelay);
    },

    prepareOEmbedLink:function (link, apiEndpoint, linkUrl) {
        if (!linkUrl) {
            linkUrl = hoverZoom.getThumbUrl(link);
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
            if (Array.isArray(link.data().hoverZoomGalleryCaption)) {
                link.data().hoverZoomCaption = link.data().hoverZoomGalleryCaption[0];
            }
        } else {
            link.data().hoverZoomSrc = [src];
        }
        if (!link.data().hoverZoomCaption && link.attr('alt')) {
            link.data().hoverZoomCaption = link.attr('alt');
        }
        link.addClass('hoverZoomLink');
        link.addClass('hoverZoomLinkFromPlugIn');
        hoverZoom.displayPicFromElement(link);
    },

    prepareFromDocument:function (link, url, getSrc, isAsync = false) {
        url = url.replace('http:', location.protocol);
        chrome.runtime.sendMessage({action:'ajaxRequest', url: url, method: 'GET'}, function(data) {
            let doc = document.implementation.createHTMLDocument();
            doc.body.innerHTML = data;
            const httpRefresh = doc.querySelector('meta[http-equiv="refresh"][content]');
            if (httpRefresh) {
                let redirUrl = httpRefresh.content.substr(httpRefresh.content.toLowerCase().indexOf('url=') + 4);
                if (redirUrl) {
                    redirUrl = redirUrl.replace('http:', location.protocol);
                    hoverZoom.prepareFromDocument(link, redirUrl, getSrc, isAsync);
                }
            }

            const handleSrc = function (src) {
                if (src)
                    hoverZoom.prepareLink(link, src);
            };

            if (isAsync) {
                getSrc(doc, handleSrc);
            } else {
                let src = getSrc(doc);
                handleSrc(src);
            }
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

    // https://github.com/carlosascari/chrome-cache-reader/blob/master/index.js
    getImageDimensions:function (url, width, height) {
        let img = new Image;
        img.src = url;
        let imgDim = {};
        imgDim.width = img.width;
        imgDim.height = img.height;
        return imgDim;
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

    // Reduce a fraction by finding the Greatest Common Divisor and dividing by it.
    reduceFraction:function (numerator, denominator) {
        var gcd = function gcd (a, b) {
            return b ? gcd(b, a%b) : a;
            };
        gcd = gcd(numerator,denominator);
        return [numerator/gcd, denominator/gcd];
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

    // Find key(s) in JSON object and return corresponding value(s) and path(s)
    // If key not found then return []
    // Search is NOT case-sensitive
    // https://gist.github.com/killants/569c4af5f2983e340512916e15a48ac0
    getKeysInJsonObject:function (jsonObj, searchKey, isRegex, maxDeepLevel, currDeepLevel) {

        var bShowInfo = false;

        maxDeepLevel = ( maxDeepLevel || maxDeepLevel == 0 ) ? maxDeepLevel : 100;
        currDeepLevel = currDeepLevel ? currDeepLevel : 1 ;
        isRegex = isRegex ? isRegex : false;

        // check RegEx validity if needed
        var re;
        if (isRegex) {
            try {
                re = new RegExp(searchKey);
            } catch (e) {
                cLog(e);
                return [];
            }
        }

        if ( currDeepLevel > maxDeepLevel ) {
            return [];
        } else {

            var keys = [];

            for ( var curr in jsonObj ) {
                var currElem = jsonObj[curr];

                if ( currDeepLevel == 1 && bShowInfo ) { cLog("getKeysInJsonObject : Looking property \"" + curr + "\" ") }

                if ( isRegex ? re.test(curr) : curr.toLowerCase() === searchKey.toLowerCase() ){
                    var r = {};
                    r.key = curr;
                    r.value = currElem;
                    r.path = '["' + curr + '"]';
                    r.depth = currDeepLevel;
                    keys.push( r );
                }

                if ( typeof currElem == "object" ) { // object is "object" and "array" is also in the eyes of "typeof"
                    // search again :D
                    var deepKeys = hoverZoom.getKeysInJsonObject( currElem, searchKey, isRegex, maxDeepLevel, currDeepLevel + 1 );

                    for ( var e = 0; e < deepKeys.length; e++ ) {
                        // update path backwards
                        deepKeys[e].path = '["' + curr + '"]' + deepKeys[e].path;
                        keys.push( deepKeys[e] );
                    }
                }
            }
            return keys;
        }
    },

    // Find value(s) in JSON object and return corresponding key(s) and path(s)
    // If value not found then return []
    // Search is NOT case-sensitive
    // ref: https://gist.github.com/killants/569c4af5f2983e340512916e15a48ac0
    getValuesInJsonObject:function (jsonObj, searchValue, isRegex, isPartialMatch, isFirstMatchOnly, maxDeepLevel, currDeepLevel) {

        var bShowInfo = false;

        maxDeepLevel = ( maxDeepLevel || maxDeepLevel == 0 ) ? maxDeepLevel : 100;
        currDeepLevel = currDeepLevel ? currDeepLevel : 1 ;
        isRegex = isRegex ? isRegex : false;

        // check RegEx validity if needed
        var re;
        if ( isRegex ) {
            try {
                re = new RegExp(searchValue);
            } catch (e) {
                cLog(e);
                return [];
            }
        } else {
            searchValue = searchValue.toString().toLowerCase();
        }

        if ( currDeepLevel > maxDeepLevel ) {
            return [];
        } else {

            var keys = [];

            for ( var curr in jsonObj ) {
                var currElem = jsonObj[curr];

                if ( currDeepLevel == 1 && bShowInfo ) { cLog("getValuesInJsonObject : Looking property \"" + curr + "\" ") }

                if ( typeof currElem == "undefined" ) continue;

                if ( typeof currElem == "object" ) { // object is "object" and "array" is also in the eyes of "typeof"
                    // search again :D
                    var deepKeys = hoverZoom.getValuesInJsonObject( currElem, searchValue, isRegex, isPartialMatch, isFirstMatchOnly, maxDeepLevel, currDeepLevel + 1 );
                    for ( var e = 0; e < deepKeys.length; e++ ) {
                        // update path backwards
                        deepKeys[e].path = '["' + curr + '"]' + deepKeys[e].path;
                        keys.push( deepKeys[e] );
                    }
                } else {

                    if ( isRegex ? re.test(currElem) : ( isPartialMatch ? currElem.toString().toLowerCase().indexOf(searchValue) !== -1 : currElem.toString().toLowerCase() === searchValue ) ){

                        var r = {};
                        r.key = curr;
                        r.value = currElem;
                        r.path = '["' + curr + '"]';
                        r.depth = currDeepLevel;
                        keys.push( r );
                        if (isFirstMatchOnly) return keys;
                    }
                }
            }
            return keys;
        }
    },

    // Return JSON object corresponding to path, without using the Evil eval
    // path syntax: [key 1][key 2][key 3]...[key n-2][key n-1][key n]
    // if level = 0 or undefined: use full path ([key 1]...[key n]) to return child
    // if level = 1: shorten path ([key 1]...[key n-1]) to return parent
    // if level = 2: shorten path ([key 1]...[key n-2]) to return grand-parent
    // ...
    getJsonObjectFromPath:function (jsonObj, path, level) {
        if (!path || path.length < 4) return jsonObj;
        var keys = path.substr(2, path.length - 4).split('"]["');
        let result = jsonObj;
        if (level) {
            keys = keys.slice(0, Math.max(keys.length - level, 1));
        }
        keys.forEach(key => result = result[key]);
        return result;
    },

    // Replace unicode by decoded chars
    // e.g: https:u002Fu002Fwww.deviantart.comu002Fjoensou002Fartu002FLate-to-the-party-984921567
    //   => https://www.deviantart.com/joenso/art/Late-to-the-party-984921567
    decodeUnicode:function(strUnicode) {
        const re = /u00([0-9A-F]{2})/gi;
        return strUnicode.replace(re, function (match, grp) { return String.fromCharCode(parseInt(grp, 16)); });
    },

    // Find matching bracket : {...}, (...), [...], ...
    //                             ^      ^      ^
    // credits: https://github.com/alfnielsen/find-matching-bracket
    // return:
    // => position (0-based) of matching bracket if found
    // => -1 if cursor comes to end of code without finding maching bracket
    // => -2 if startPostion don't match start bracket
    // => -3 if end bracket dont match start bracket
    //
    // ex1 : '{"comments":7,"favourites":72,"views":38946,"downloads":1,"privatelyCollected":0}'
    // => matchBracket(ex1, 0) returns 80
    // ex2 : '{"comments":7,"favourites":72,"views":38946,"downloads":1,"privatelyCollected":0]'
    // => matchBracket(ex2, 0) returns -1
    // ex3 : '{"t":"92S","r":0,"c":"/v1/crop/w_92,h_92,x_11,y_0,scl_0.13469985358712,q_70,strp/<prettyName>-92s.jpg","h":92,"w":92,"ss":[{"x":2,"c":"/v1/crop/w_184,h_184,x_23,y_0,scl_0.26939970717423,q_70,strp/<prettyName>-92s-2x.jpg","w":184,"h":184}]}'
    // => matchBracket(ex3, 123) returns 236
    // => matchBracket(ex3, 124) returns 237
    matchBracket:function(data, startPosition) {
        return matchBracket(data, startPosition);
    },

    // Given data position, find closest matching brackets : {.....{........................................}.....}
    //                                                             ^                   ^                    ^
    //                                                             |                   |                    |
    //                                                             |               data position            |
    //                                                         open bracket                             close bracket
    //
    // return:
    // => positions (0-based) of matching brackets if found e.g: { 100, 155 }
    // => { -1, -1 } if no matching brackets found
    matchBrackets:function(data, dataPosition, validOpenBrackets) {
        let openPosition = dataPosition; // start searching at closest position
        let result = {};
        // move left step-by-step from dataPosition until an enclosing match is found
        while (openPosition >= 0) {
            let closePosition = matchBracket(data, openPosition);
            if (closePosition < 0) {
                openPosition = openPosition - 1; // move left
            } else if (closePosition < dataPosition) {
                // matching brackets found but they do not enclose target data position so go on searching
                openPosition = openPosition - 1; // move left
            } else {
                // check that brackets are valid, usually we are looking for { or [
                let openBracket = data[openPosition];
                if (validOpenBrackets.indexOf(openBracket) == -1) {
                    openPosition = openPosition - 1; // move left
                } else {
                    result.openPos = openPosition;
                    result.closePos = closePosition;
                    return result;
                }
            }
        }
        result.openPos = result.closePos = -1;
        return result;
    },

    // Return largest src available in srcset according to width and density
    // samples srcsets:
    // "http://static.picto.fr/wp-content/uploads/2017/05/Grand-Trouble.jpg"
    // "http://static.picto.fr/wp-content/uploads/2017/05/Grand-Trouble.jpg 489w, http://static.picto.fr/wp-content/uploads/2017/05/Grand-Trouble-768x1099.jpg 768w"
    // "http://static.picto.fr/wp-content/uploads/2017/05/Grand-Trouble.jpg 1x, http://static.picto.fr/wp-content/uploads/2017/05/Grand-Trouble-768x1099.jpg 2x"
    // "resize1-lejdd.ladmedia.fr/rcrop/620,310/img/var/europe1/storage/images/lejdd/jdd-paris/paris-le-nouveau-palais-de-justice-ou-lon-ne-peut-pas-se-garer-3627203/47706995-1-fre-FR/Paris-Le-nouveau-palais-de-justice-ou-l-on-ne-peut-pas-se-garer.jpg 620w,
    // resize1-lejdd.ladmedia.fr/rcrop/300,150/img/var/europe1/storage/images/lejdd/jdd-paris/paris-le-nouveau-palais-de-justice-ou-lon-ne-peut-pas-se-garer-3627203/47706995-1-fre-FR/Paris-Le-nouveau-palais-de-justice-ou-l-on-ne-peut-pas-se-garer.jpg 300w,
    // resize1-lejdd.ladmedia.fr/rcrop/710,355/img/var/europe1/storage/images/lejdd/jdd-paris/paris-le-nouveau-palais-de-justice-ou-lon-ne-peut-pas-se-garer-3627203/47706995-1-fre-FR/Paris-Le-nouveau-palais-de-justice-ou-l-on-ne-peut-pas-se-garer.jpg 710w,
    // resize1-lejdd.ladmedia.fr/rcrop/940,470/img/var/europe1/storage/images/lejdd/jdd-paris/paris-le-nouveau-palais-de-justice-ou-lon-ne-peut-pas-se-garer-3627203/47706995-1-fre-FR/Paris-Le-nouveau-palais-de-justice-ou-l-on-ne-peut-pas-se-garer.jpg 940w"
    // "https://video-images.vice.com/_uncategorized/1522934375314-retinite1.png?resize=400:*, https://video-images.vice.com/_uncategorized/1522934375314-retinite1.png?resize=600:* 2x"
    // "https://www.parismatch.com/lmnr/f/webp/r/72,48,forcex,center-middle/img/var/pm/public/media/image/2024/03/31/12/2024-03-31t094641z_493903911_rc2xw6a0kxis_rtrmadp_3_britain-royals.jpg?VersionId=V90sjBHDp8nZOHJEoSwrJK3SThPIaGtD,
    // https://www.parismatch.com/lmnr/f/webp/r/144,96,forcex,center-middle/img/var/pm/public/media/image/2024/03/31/12/2024-03-31t094641z_493903911_rc2xw6a0kxis_rtrmadp_3_britain-royals.jpg?VersionId=V90sjBHDp8nZOHJEoSwrJK3SThPIaGtD 2x"
    getBiggestSrcFromSrcset:function(srcset) {

        if (srcset == undefined)
            return undefined;

        // discard inline images
        if (hoverZoom.isEmbeddedImg(srcset))
            return undefined;

        var src = undefined;
        srcset = srcset.trim();

        srcset = srcset.replace(/,http/g, ', http');
        if (srcset.indexOf(", ") != -1) {

            if (srcset.indexOf("x, ") != -1) { srcset = srcset.split("x, "); }
            else if (srcset.indexOf("w, ") != -1) { srcset = srcset.split("w, "); }
            else { srcset = srcset.split(", "); }

            var urls = new Map();
            var xws = [];
            // separate urls and density/width
            for (var i = 0; i < srcset.length; i++) {
                var el = srcset[i].trim();
                var url, xw;
                if (el.indexOf(' ') == -1) {
                    url =  el;
                    xw  = "1x"; // default value
                }
                else {
                    url = el.split(' ')[0];
                    xw = el.split(' ')[1];
                }
                xw = xw.replace('x','').replace('w','');
                urls.set(parseInt(xw), url);
                xws.push(parseInt(xw));
            }
            // sort density/width
            xws.sort(function(a, b){return b-a});
            // select url associated to largest density/width
            src = urls.get(xws[0]);
        }
        else {
            srcset = srcset.trim();
            if (srcset.indexOf(' ') == -1) { src = srcset; }
            else {
                src = srcset.split(' ')[0].trim();
            }
        }
        return src;
    },

    emptyHoverZoomViewer:function(now) {
        if (!hoverZoom.hzViewer) return;
        hoverZoom.hzViewer.stop(true, true).fadeOut(now ? 0 : options.fadeDuration, function () {
            hoverZoom.hzViewer.empty();
        });
    },

    // In JavaScript, keys can be strings, numbers, or identifier names WITHOUT single or double quotes
    // e.g: person = {name:"John", age:31, city:"New York"};
    strToJavascriptObj:function(e) {
        if (typeof e == "string") {
            let obj = new Function("return" + e);
            try {
                return obj();
            } catch {}
        }
    }
};

hoverZoom.loadHoverZoom();
