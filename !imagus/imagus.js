(function(win, doc) {
    if (browser.safari && location.protocol === "safari-extension:") return;
    if (!win.location.hash.lastIndexOf("#" + app.name.toUpperCase() + "_SVG", 0)) {
        (function() {
            var counter = 10;
            var units = {
                "pt": 1.25,
                "pc": 15,
                "mm": 3.543307,
                "cm": 35.43307,
                "in": 90
            };
            var checkSVG = function(root, r) {
                if (!(root = doc.documentElement)) return;
                if (root.nodeName.indexOf("svg") === 0) {
                    r = /^(\d+(?:\.\d+)?|\.\d+)\s*(p[xtc]|[cm]m|in)?$/;
                    r = [(root.getAttribute("width") || "").trim().match(r), (root.getAttribute("height") || "").trim().match(r)];
                    r = r[0] && r[1] ? r[0][1] * (units[r[0][2]] || 1) / (r[1][1] * (units[r[1][2]] || 1)) : null;
                    if (!r && (r = root.getAttribute("viewBox"))) {
                        r = r.split(/\s+|,/);
                        r = parseFloat(r[2]) / parseFloat(r[3])
                    }
                    if (!r && root.offsetWidth) r = root.offsetWidth / root.offsetHeight;
                    if (!r) {
                        r = root.getBBox();
                        r = !isNaN(parseFloat(r.width)) && isFinite(r.width) ? r.width / r.height : null
                    }
                    if (!r) r = 1
                }
                clearInterval(svg_timer);
                win.parent.postMessage({
                    "IMGS_message_CMD": "svg_info",
                    "url": win.location.href,
                    "ratio": r
                }, "*")
            };
            if (doc.documentElement) {
                checkSVG();
                return
            }
            var svg_timer =
                setInterval(function() {
                    checkSVG();
                    if (--counter) {
                        clearInterval(svg_timer);
                        return
                    }
                }, 500)
        })();
        return
    }
    if (!doc || doc instanceof win.HTMLDocument === false) return;
    var imgDoc = doc.images && doc.images.length === 1 && doc.images[0];
    if (imgDoc && imgDoc.parentNode === doc.body && imgDoc.src === win.location.href) return;
    var flip = function(el, ori) {
        if (!el.scale) el.scale = {
            "h": 1,
            "v": 1
        };
        el.scale[ori ? "h" : "v"] *= -1;
        ori = el.scale.h !== 1 || el.scale.v !== 1 ? "scale(" + el.scale.h + "," + el.scale.v + ")" : "";
        if (el.curdeg) ori += " rotate(" + el.curdeg + "deg)";
        el.style[browser["transform"]] = ori
    };
    var pdsp = function(e, d, p) {
        if (!e || !e.preventDefault || !e.stopPropagation) return;
        if (d === void 0 || d === true) e.preventDefault();
        if (p !== false) e.stopImmediatePropagation()
    };
    var imageSendTo = function(sf) {
        if (!sf.url && !sf.name && !sf.url || sf.url && !/^http/.test(sf.url)) {
            alert("Invalid URL! (" + sf.url.slice(0, sf.url.indexOf(":") + 1));
            return
        }
        var i = 0,
            hosts = cfg.tls.sendToHosts,
            go = [];
        for (; i < hosts.length; ++i)
            if (sf.host === i || sf.host === void 0 && hosts[i][0][0] === "+") go.push(hosts[i][1].replace("%url",
                encodeURIComponent(sf.url)));
        Port.send({
            "cmd": "open",
            "url": go,
            "nf": !!sf.nf
        })
    };
    var shortcut = {
        specKeys: {
            8: "Backspace",
            9: "Tab",
            13: "Enter",
            16: "shift",
            17: "ctrl",
            18: "alt",
            27: "Esc",
            32: "Space",
            33: "PgUp",
            34: "PgDn",
            35: "End",
            36: "Home",
            37: "Left",
            38: "Up",
            39: "Right",
            40: "Down",
            45: "Ins",
            46: "Del",
            96: "0",
            97: "1",
            98: "2",
            99: "3",
            100: "4",
            101: "5",
            102: "6",
            103: "7",
            104: "8",
            105: "9",
            106: "*",
            107: "+",
            109: "-",
            110: ".",
            111: "/",
            173: "-",
            186: ";",
            187: "=",
            188: ",",
            189: "-",
            190: ".",
            191: "/",
            192: "`",
            219: "[",
            220: "\\",
            221: "]",
            222: "'",
            112: "F1",
            113: "F2",
            114: "F3",
            115: "F4",
            116: "F5",
            117: "F6",
            118: "F7",
            119: "F8",
            120: "F9",
            121: "F10",
            122: "F11",
            123: "F12"
        },
        isModifier: function(e) {
            return e.which > 15 && e.which < 19
        },
        key: function(e) {
            return this.specKeys[e.which] || String.fromCharCode(e.which).toUpperCase()
        }
    };
    var checkBG = function(imgs) {
        if (imgs)
            if (Array.isArray(imgs = imgs.match(/\burl\(([^'"\)][^\)]*|"[^"\\]+(?:\\.[^"\\]*)*|'[^'\\]+(?:\\.[^'\\]*)*)(?=['"]?\))/g))) {
                var i = imgs.length;
                while (i--) imgs[i] = imgs[i].slice(/'|"/.test(imgs[i][4]) ? 5 : 4);
                return imgs
            }
        return null
    };
    var checkIMG = function(node) {
        var nname = node.nodeName.toUpperCase();
        if (nname === "IMG" || node.type === "image" || nname === "EMBED") return node.src;
        else if (nname === "CANVAS") return node.toDataURL();
        else if (nname === "OBJECT" && node.data) return node.data;
        else if (nname === "AREA") {
            var img = doc.querySelector('img[usemap="#' + node.parentNode.name + '"]');
            return img.src
        } else if (nname === "VIDEO") {
            nname = doc.createElement("canvas");
            nname.width = node.clientWidth;
            nname.height = node.clientHeight;
            nname.getContext("2d").drawImage(node,
                0, 0, nname.width, nname.height);
            return nname.toDataURL("image/jpeg")
        } else if (node.poster) return node.poster;
        return null
    };
    var mdownstart, winW, winH, topWinW, topWinH;
    var rgxHash = /#(?![?!].).*/;
    var rgxIsSVG = /\.svgz?$/i;
    var viewportDimensions = function(targetDoc) {
        var d = targetDoc || doc;
        d = d.compatMode === "BackCompat" && d.body || d.documentElement;
        var w = d.clientWidth;
        var h = d.clientHeight;
        if (targetDoc) return {
            width: w,
            height: h
        };
        if (w === winW && h === winH) return;
        winW = w;
        winH = h;
        topWinW = w;
        topWinH = h
    };
    var release_freeze = function(e) {
        if (typeof PVI.freeze ===
            "number") {
            PVI.freeze = !cfg.hz.deactivate;
            return
        }
        if (e.type === "mouseup") {
            if (e.target !== PVI.CNT || PVI.fullZm || e.button !== 0) return;
            if (e.ctrlKey || e.shiftKey || e.altKey) return;
            if (PVI.md_x !== e.clientX || PVI.md_y !== e.clientY) return;
            PVI.reset(true);
            return
        }
        if (PVI.keyup_freeze_on) PVI.keyup_freeze()
    };
    win.addEventListener("mouseup", release_freeze, true);
    win.addEventListener("dragend", release_freeze, true);
    if (browser.chrome) win.addEventListener("blur", release_freeze, true);
    win.addEventListener("mousedown", function(e) {
        var d =
            doc.compatMode && doc.compatMode[0] === "B" ? doc.body : doc.documentElement;
        if (!cfg || e.clientX >= d.clientWidth || e.clientY >= d.clientHeight) return;
        d = e.button === 2 && PVI.freeze && PVI.SRC !== void 0 && !cfg.hz.deactivate;
        if (PVI.fireHide && PVI.state < 3 && !d) {
            PVI.m_over({
                "relatedTarget": PVI.TRG
            });
            if (!PVI.freeze || PVI.lastScrollTRG) PVI.freeze = 1;
            return
        }
        if (e.button === 0) {
            if (PVI.fullZm) {
                mdownstart = true;
                if (e.ctrlKey || PVI.fullZm !== 2) return;
                pdsp(e);
                ++PVI.fullZm;
                win.addEventListener("mouseup", PVI.fzDragEnd, true);
                return
            }
            if (browser.opera &&
                (e.target.clientWidth && e.offsetX >= e.target.clientWidth || e.target.clientHeight && e.offsetY >= e.target.clientHeight)) return;
            if (e.target === PVI.CNT) {
                PVI.md_x = e.clientX;
                PVI.md_y = e.clientY;
                return
            }
            if (PVI.fireHide) PVI.m_over({
                "relatedTarget": PVI.TRG,
                "clientX": e.clientX,
                "clientY": e.clientY
            });
            if (!PVI.freeze || PVI.lastScrollTRG) PVI.freeze = 1;
            return
        }
        if (e.button !== 2) return;
        if (cfg.hz.actTrigger === "m2") {
            if (PVI.fireHide && d) PVI.SRC = {
                "m2": PVI.SRC === null ? PVI.TRG.IMGS_c_resolved : PVI.SRC.m2 || PVI.SRC
            };
            PVI.freeze = cfg.hz.deactivate
        } else if (PVI.keyup_freeze_on) {
            PVI.keyup_freeze();
            PVI.freeze = PVI.freeze ? 1 : 0
        }
        mdownstart = e.timeStamp;
        PVI.md_x = e.clientX;
        PVI.md_y = e.clientY;
        if (browser.chrome && (e.target.href || (d = e.target.parentNode) && d.href)) e.preventDefault()
    }, true);
    win.addEventListener("contextmenu", function(e) {
        if (!mdownstart || e.button !== 2 || PVI.md_x !== e.clientX || PVI.md_y !== e.clientY) {
            if (mdownstart) mdownstart = null;
            if (e.button === 2 && (!PVI.fireHide || PVI.state > 2) && (Math.abs(PVI.md_x - e.clientX) > 5 || Math.abs(PVI.md_y - e.clientY) > 5) && cfg.hz.actTrigger === "m2" && !cfg.hz.deactivate) pdsp(e);
            return
        }
        var i,
            elapsed = e.timeStamp - mdownstart >= 300;
        mdownstart = null;
        i = PVI.state > 2 && (elapsed && cfg.hz.fzOnPress === 2 || !elapsed && !PVI.fullZm && cfg.hz.fzOnPress === 1);
        if (i) PVI.key_action({
            "which": 13,
            "shiftKey": PVI.fullZm ? true : e.shiftKey
        });
        else if (i = PVI.state < 3 && PVI.SRC && PVI.SRC.m2 !== void 0) {
            PVI.load(PVI.SRC.m2);
            PVI.SRC = void 0
        } else if (elapsed && PVI.state > 2 && !PVI.fullZm && cfg.hz.fzOnPress === 1) return;
        if (i) pdsp(e);
        else if (e.target === PVI.CNT) pdsp(e, false);
        else if (e.ctrlKey && !elapsed && !e.shiftKey && !e.altKey && cfg.tls.opzoom && PVI.state <
            2 && (i = checkIMG(e.target) || checkBG(win.getComputedStyle(e.target).backgroundImage))) {
            PVI.TRG = PVI.nodeToReset = e.target;
            PVI.fireHide = true;
            PVI.x = e.clientX;
            PVI.y = e.clientY;
            PVI.set(Array.isArray(i) ? i[0] : i);
            pdsp(e)
        }
    }, true);
    var PVI = {
        TRG: null,
        DIV: null,
        IMG: null,
        CAP: null,
        HLP: doc.createElement("a"),
        anim: {},
        stack: {},
        timers: {},
        resolving: [],
        lastTRGStyle: {
            cursor: null,
            outline: null
        },
        iFrame: false,
        state: null,
        rgxHTTPs: /^https?:\/\/(?:www\.)?/,
        pageProtocol: win.location.protocol.replace(/^(?!https?:).+/, "http:"),
        palette: {
            "load": "rgb(255, 255, 255)",
            "R_load": "rgb(255, 204, 204)",
            "res": "rgb(222, 255, 205)",
            "R_res": "rgb(255, 234, 128)",
            "R_js": "rgb(200, 200, 200)",
            "pile_fg": "#000",
            "pile_bg": "rgb(255, 255, 0)"
        },
        convertSieveRegexes: function() {
            var s = cfg.sieve,
                i;
            if (!Array.isArray(s) || !(i = s.length) || typeof(s[0].link || s[0].img) !== "string") return;
            while (i--) {
                if (s[i].link) s[i].link = RegExp(s[i].link, s[i].ci && s[i].ci & 1 ? "i" : "");
                if (s[i].img) s[i].img = RegExp(s[i].img, s[i].ci && s[i].ci & 2 ? "i" : "")
            }
        },
        create: function() {
            if (PVI.DIV) return;
            var x, y, z, p;
            PVI.HLP = doc.createElement("a");
            PVI.DIV = doc.createElement("div");
            PVI.VID = doc.createElement("video");
            PVI.IMG = doc.createElement("img");
            PVI.LDR = PVI.IMG.cloneNode(false);
            PVI.CNT = PVI.IMG;
            PVI.DIV.IMGS_ = PVI.DIV.IMGS_c = PVI.LDR.IMGS_ = PVI.LDR.IMGS_c = PVI.VID.IMGS_ = PVI.VID.IMGS_c = PVI.IMG.IMGS_ = PVI.IMG.IMGS_c = true;
            PVI.DIV.style.cssText = "margin: 0; padding: 0; " + (cfg.hz.css || "") + "; visibility: visible; cursor: default; display: none; z-index: 2147483647; " + "position: fixed !important; box-sizing: content-box !important; left: auto; top: auto; right: auto; bottom: auto; width: auto; height: auto;";
            PVI.DIV.curdeg = 0;
            PVI.LDR.wh = [38, 38];
            PVI.LDR.load = function() {
                this.removeEventListener("load", PVI.LDR.load, false);
                this.load = null;
                var x = this.style;
                this.wh = [x.width ? parseInt(x.width, 10) : this.naturalWidth || this.wh[0], x.height ? parseInt(x.height, 10) : this.naturalHeight || this.wh[1]]
            };
            PVI.LDR.addEventListener("load", PVI.LDR.load, false);
            PVI.LDR.alt = "";
            PVI.LDR.draggable = false;
            PVI.LDR.style.cssText = (cfg.hz.LDRcss || "padding: 5px; border-radius: 50% !important; box-shadow: 0px 0px 5px 1px #a6a6a6 !important; background-clip: padding-box; width: 38px; height: 38px") +
                "; position: fixed !important; z-index: 2147483647; display: none; left: auto; top: auto; right: auto; bottom: auto; margin: 0; box-sizing: border-box !important; " + (cfg.hz.LDRanimate ? browser["transition_css"] + ": background-color .5s, opacity .2s ease, top .15s ease-out, left .15s ease-out" : "");
            PVI.LDR.src = cfg.hz.LDRsrc || "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOng9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWluWU1pbiBub25lIj48Zz48cGF0aCBpZD0icCIgZD0iTTMzIDQyYTEgMSAwIDAgMSA1NS0yMCAzNiAzNiAwIDAgMC01NSAyMCIvPjx1c2UgeDpocmVmPSIjcCIgdHJhbnNmb3JtPSJyb3RhdGUoNzIgNTAgNTApIi8+PHVzZSB4OmhyZWY9IiNwIiB0cmFuc2Zvcm09InJvdGF0ZSgxNDQgNTAgNTApIi8+PHVzZSB4OmhyZWY9IiNwIiB0cmFuc2Zvcm09InJvdGF0ZSgyMTYgNTAgNTApIi8+PHVzZSB4OmhyZWY9IiNwIiB0cmFuc2Zvcm09InJvdGF0ZSgyODggNTAgNTApIi8+PGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJyb3RhdGUiIHZhbHVlcz0iMzYwIDUwIDUwOzAgNTAgNTAiIGR1cj0iMS44cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48L2c+PC9zdmc+";
            x = "display: none; visibility: inherit !important; background: none; position: relative; width: 100%; height: 100%; max-width: inherit; max-height: inherit; margin: 0; padding: 0; border: 0;";
            PVI.IMG.alt = "";
            PVI.IMG.style.cssText = x;
            PVI.IMG.addEventListener("error", PVI.content_onerror);
            PVI.DIV.appendChild(PVI.IMG);
            if (browser.chrome || browser.maxthon) PVI.VID.poster = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";
            PVI.VID.volume = cfg.hz.mediaVolume / 100;
            PVI.VID.autoplay = true;
            PVI.VID.style.cssText =
                x + "box-shadow: 0 0 0 1px #f16529";
            PVI.VID.addEventListener("loadeddata", PVI.content_onready);
            PVI.VID.addEventListener("error", PVI.content_onerror, true);
            PVI.DIV.appendChild(PVI.VID);
            if (cfg.hz.thumbAsBG || cfg.hz.history) {
                PVI.IMG.addEventListener("load", PVI.content_onload);
                PVI.VID.addEventListener("canplay", PVI.content_onload)
            }
            if (cfg.hz.hideIdleCursor >= 50) {
                PVI.DIV.cursor_hide = function() {
                    PVI.CNT.style.cursor = browser.opera ? "text" : "none";
                    PVI.timers.cursor_hide = null
                };
                PVI.DIV.addEventListener("mousemove",
                    function(e) {
                        if (e.target !== PVI.CNT || PVI.CNT === PVI.VID && PVI.VID.clientHeight - 35 < (e.offsetY || e.layerY || 0)) {
                            clearTimeout(PVI.timers.cursor_hide);
                            return
                        }
                        if (PVI.timers.cursor_hide) clearTimeout(PVI.timers.cursor_hide);
                        else PVI.CNT.style.cursor = "";
                        PVI.timers.cursor_hide = setTimeout(PVI.DIV.cursor_hide, cfg.hz.hideIdleCursor)
                    });
                PVI.DIV.addEventListener("mouseout", function(e) {
                    if (e.target !== PVI.CNT) return;
                    clearTimeout(PVI.timers.cursor_hide);
                    PVI.CNT.style.cursor = ""
                }, false)
            } else if (cfg.hz.hideIdleCursor >= 0) PVI.IMG.style.cursor =
                browser.opera ? "text" : "none";
            x = doc.documentElement;
            x.appendChild(PVI.DIV);
            x.appendChild(PVI.LDR);
            PVI.DBOX = {};
            x = win.getComputedStyle(PVI.DIV);
            y = {
                "mt": "marginTop",
                "mr": "marginRight",
                "mb": "marginBottom",
                "ml": "marginLeft",
                "bt": "borderTopWidth",
                "br": "borderRightWidth",
                "bb": "borderBottomWidth",
                "bl": "borderLeftWidth",
                "pt": "paddingTop",
                "pr": "paddingRight",
                "pb": "paddingBottom",
                "pl": "paddingLeft"
            };
            for (z in y) {
                if (z[0] === "m") PVI.DBOX[z] = parseInt(x[y[z]], 10);
                if (z[1] === "t" || z[1] === "b") {
                    p = z[1] + (z[0] === "p" ? "p" : "bm");
                    PVI.DBOX[p] = (PVI.DBOX[p] || 0) + parseInt(x[y[z]], 10)
                }
                p = (z[1] === "l" || z[1] === "r" ? "w" : "h") + (z[0] === "m" ? "m" : "pb");
                PVI.DBOX[p] = (PVI.DBOX[p] || 0) + parseInt(x[y[z]], 10)
            }
            PVI.anim = {
                maxDelay: 0,
                opacityTransition: function() {
                    PVI.BOX.style.opacity = PVI.BOX.opacity || "1"
                }
            };
            y = browser["transition"];
            if (x[y + "Property"]) {
                p = /,\s*/;
                p = [x[y + "Property"].split(p), x[y + "Duration"].replace(/initial/g, "0s").split(p)];
                PVI.anim.css = x[y] || PVI.DIV.style[y];
                ["opacity", "left", "top", "width", "height"].forEach(function(el) {
                    var idx = p[0].indexOf(el),
                        val = parseFloat(p[1][idx]) * 1E3;
                    if (val > 0 && idx > -1) {
                        PVI.anim[el] = val;
                        if (val > PVI.anim.maxDelay) PVI.anim.maxDelay = val;
                        if (el === "opacity" && x.opacity) PVI.DIV.opacity = "" + Math.max(.01, x.opacity)
                    }
                })
            }
            if (cfg.hz.capText || cfg.hz.capWH) PVI.createCAP();
            if (!browser.opera && doc.querySelector("embed, object")) {
                PVI.DIV.insertBefore(doc.createElement("iframe"), PVI.DIV.firstElementChild);
                PVI.DIV.firstChild.style.cssText = "z-index: -1; width: 100%; height: 100%; position: absolute; left: 0; top: 0; border: 0"
            }
            PVI.reset()
        },
        createCAP: function() {
            if (PVI.CAP) return;
            PVI.CAP = doc.createElement("div");
            buildNodes(PVI.CAP, [{
                tag: "b",
                attrs: {
                    style: "display: none; " + browser["transition_css"] + ": background-color .1s; border-radius: 3px; padding: 0 2px"
                }
            }, " ", {
                tag: "b",
                attrs: {
                    style: "display: " + (cfg.hz.capWH ? "inline-block" : "none")
                }
            }, " ", {
                tag: "span",
                attrs: {
                    style: "color: inherit; display: " + (cfg.hz.capText ? "inline-block" : "none")
                }
            }]);
            var n = PVI.CAP.firstElementChild;
            do n.IMGS_ = n.IMGS_c = true; while (n = n.nextElementSibling);
            PVI.CAP.IMGS_ = PVI.CAP.IMGS_c =
                true;
            PVI.create();
            n = cfg.hz.capStyle;
            PVI.palette.wh_fg = n ? "rgb(100, 0, 0)" : "rgb(204, 238, 255)";
            PVI.palette.wh_fg_hd = n ? "rgb(255, 0, 0)" : "rgb(120, 210, 255)";
            PVI.CAP.style.cssText = 'left:0; right:auto; display:block; cursor:default; position:absolute; width:auto; height:auto; border:0; white-space:nowrap; font:13px/1.4em "Trebuchet MS",sans-serif; background:rgba(' + (n ? "255,255,255,.95" : "0,0,0,.75") + ") !important; color:#" + (n ? "000" : "fff") + " !important; box-shadow: 0 0 1px #" + (n ? "666" : "ddd") + " inset; padding:0 4px; border-radius: 3px";
            n = cfg.hz.capPos ? "bottom" : "top";
            PVI.CAP.overhead = Math.max(-18, Math.min(0, PVI.DBOX[n[0] + "p"] - 18));
            PVI.CAP.style[n] = PVI.CAP.overhead + "px";
            PVI.CAP.overhead = Math.max(0, -PVI.CAP.overhead - PVI.DBOX[n[0] + "bm"]);
            PVI.DIV.appendChild(PVI.CAP)
        },
        prepareCaption: function(trg, caption) {
            if (caption && typeof caption === "string") {
                PVI.HLP.innerHTML = caption.replace(/<[^>]+>/g, "").replace(/</g, "&lt;");
                trg.IMGS_caption = PVI.HLP.textContent.trim().replace(/[\n\r]+/g, " ");
                PVI.HLP.textContent = ""
            } else trg.IMGS_caption = ""
        },
        flash_caption: function() {
            PVI.timers.pileflicker =
                0;
            PVI.timers.pile_flash = setInterval(PVI.flick_caption, 150)
        },
        flick_caption: function() {
            if (PVI.timers.pileflicker++ >= cfg.hz.capFlashCount * 2) {
                PVI.timers.pileflicker = null;
                clearInterval(PVI.timers.pile_flash);
                return
            }
            var s = PVI.CAP.firstChild.style;
            s.backgroundColor = s.backgroundColor === PVI.palette.pile_bg ? "red" : PVI.palette.pile_bg
        },
        updateCaption: function() {
            var c = PVI.CAP,
                h;
            if (!c || c.state === 0) return;
            if (c.style.display !== "none") return;
            if (PVI.TRG.IMGS_album)
                if (c.firstChild.style.display === "none" && (h = PVI.stack[PVI.TRG.IMGS_album]) &&
                    h[2]) {
                    h = c.firstChild.style;
                    h.color = PVI.palette.pile_fg;
                    h.backgroundColor = PVI.palette.pile_bg;
                    h.display = "inline-block";
                    if (cfg.hz.capFlashCount) {
                        if (cfg.hz.capFlashCount > 5) cfg.hz.capFlashCount = 5;
                        clearTimeout(PVI.timers.pile_flash);
                        PVI.timers.pile_flash = setTimeout(PVI.flash_caption, PVI.anim.maxDelay)
                    }
                }
            if (PVI.CNT !== PVI.IFR) {
                h = c.children[1];
                if (cfg.hz.capWH || c.state === 2) {
                    h.style.display = "inline-block";
                    h.style.color = PVI.palette[PVI.TRG.IMGS_HD === false ? "wh_fg_hd" : "wh_fg"];
                    h.textContent = (PVI.TRG.IMGS_SVG ? PVI.stack[PVI.IMG.src] : [PVI.CNT.naturalWidth, PVI.CNT.naturalHeight]).join("\u00d7")
                } else h.style.display = "none"
            }
            h = c.lastChild;
            if (cfg.hz.capText || c.state === 2) {
                h.textContent = PVI.TRG.IMGS_caption || "";
                h.style.display = "inline"
            } else h.style.display = "none";
            c.style.display = PVI.DIV.curdeg % 360 ? "none" : "block"
        },
        attrObserver: function(target, isStyle, oldValue) {
            if (!isStyle) {
                PVI.resetNode(target);
                return
            }
            var bgImage = target.style.backgroundImage;
            if (!bgImage || oldValue.indexOf(bgImage.slice(5, -2)) !== -1) return;
            PVI.resetNode(target)
        },
        onAttrChange: function(e) {
            if (e.attrChange !==
                1) return;
            var target = e.target;
            switch (e.attrName) {
                case "style":
                    var bgImg = target.style.backgroundImage;
                    if (!bgImg || e.prevValue.indexOf(bgImg.slice(5, -2)) !== -1) return;
                case "href":
                case "src":
                case "title":
                case "alt":
                    if (target === PVI.TRG) PVI.nodeToReset = target;
                    else PVI.resetNode(target);
                    target.removeEventListener("DOMAttrModified", PVI.onAttrChange)
            }
            e.stopPropagation()
        },
        listen_attr_changes: function(node) {
            if (PVI.mutObserver) PVI.mutObserver.observe(node, PVI.mutObserverConf);
            else node.addEventListener("DOMAttrModified",
                PVI.onAttrChange)
        },
        resetNode: function(node, keepAlbum) {
            delete node.IMGS_c;
            delete node.IMGS_c_resolved;
            delete node.IMGS_thumb;
            delete node.IMGS_thumb_ok;
            delete node.IMGS_SVG;
            delete node.IMGS_HD;
            delete node.IMGS_HD_stack;
            delete node.IMGS_fallback_zoom;
            if (!keepAlbum) delete node.IMGS_album;
            if (node.localName !== "a") return;
            var childNodes = node.querySelectorAll('img[src], :not(img)[style*="background-image"],' + "b, i, u, strong, em, span, div");
            if (childNodes.length)[].forEach.call(childNodes, function(el) {
                if (el.IMGS_c) PVI.resetNode(el)
            })
        },
        getImages: function(el) {
            var imgs, p;
            var isHTMLElement = el && el instanceof win.HTMLElement;
            if (isHTMLElement)
                if (el.childElementCount > 0 && el.childElementCount < 3) {
                    imgs = el.firstElementChild;
                    if (imgs.childElementCount && imgs.childElementCount < 4)
                        if (imgs.firstElementChild.localName === "img") imgs = imgs.firstElementChild;
                        else if (imgs.lastElementChild.localName === "img") imgs = imgs.lastElementChild;
                    if (imgs.src && !/\S/.test(el.textContent) && el.offsetWidth - imgs.offsetWidth < 25 && el.offsetHeight - imgs.offsetHeight < 25) el = imgs
                } else if (!el.childElementCount &&
                el.parentNode.childElementCount <= 5 && (el.localName === "img" ? el.src.lastIndexOf("data:", 0) !== 0 || el.naturalWidth < 3 || el.naturalHeight < 3 : !/\S/.test(el.textContent)) && el.style.backgroundImage[0] !== "u") {
                p = el.previousElementSibling;
                [p && p.previousElementSibling, p, el.nextElementSibling].some(function(sib) {
                    if (sib && sib.localName === "img" && sib.offsetParent === el.offsetParent && Math.abs(sib.offsetLeft - el.offsetLeft) <= 10 && Math.abs(sib.offsetTop - el.offsetTop) <= 10 && Math.abs(sib.clientWidth - el.clientWidth) <= 30 && Math.abs(sib.clientHeight -
                            el.clientHeight) <= 30) {
                        el = sib;
                        return true
                    }
                })
            }
            if (el.clientWidth > topWinW * .7 && el.clientHeight > topWinH * .7) return null;
            imgs = {
                imgSRC_o: el.src || el.data || null
            };
            if (!imgs.imgSRC_o && el.localName === "image") {
                imgs.imgSRC_o = el.getAttributeNS("http://www.w3.org/1999/xlink", "href");
                if (imgs.imgSRC_o) imgs.imgSRC_o = PVI.normalizeURL(imgs.imgSRC_o);
                else delete imgs.imgSRC_o
            }
            if (imgs.imgSRC_o) {
                if (!isHTMLElement) imgs.imgSRC_o = PVI.normalizeURL(imgs.imgSRC_o);
                else if (el.naturalWidth > 0 && el.naturalWidth < 3 || el.naturalHeight > 0 &&
                    el.naturalHeight < 3) imgs.imgSRC_o = null;
                if (imgs.imgSRC_o) imgs.imgSRC = imgs.imgSRC_o.replace(PVI.rgxHTTPs, "")
            }
            if (!isHTMLElement) return imgs.imgSRC ? imgs : null;
            if (el.style.backgroundImage[0] === "u") imgs.imgBG_o = el.style.backgroundImage;
            else if (el.parentNode) {
                p = el.parentNode;
                if (p.offsetParent === el.offsetParent && p.style && p.style.backgroundImage[0] === "u")
                    if (Math.abs(p.offsetLeft - el.offsetLeft) <= 10 && Math.abs(p.offsetTop - el.offsetTop) <= 10 && Math.abs(p.clientWidth - el.clientWidth) <= 30 && Math.abs(p.clientHeight - el.clientHeight) <=
                        30) imgs.imgBG_o = p.style.backgroundImage
            }
            if (!imgs.imgBG_o) return imgs.imgSRC ? imgs : null;
            imgs.imgBG_o = imgs.imgBG_o.match(/\burl\(([^'"\)][^\)]*|"[^"\\]+(?:\\.[^"\\]*)*|'[^'\\]+(?:\\.[^'\\]*)*)(?=['"]?\))/g);
            if (!imgs.imgBG_o || imgs.imgBG_o.length !== 1) return imgs.imgSRC ? imgs : null;
            el = imgs.imgBG_o[0];
            imgs.imgBG_o = PVI.normalizeURL(el.slice(/'|"/.test(el[4]) ? 5 : 4));
            imgs.imgBG = imgs.imgBG_o.replace(PVI.rgxHTTPs, "");
            return imgs
        },
        _replace: function(rule, addr, http, attr, to, trg) {
            var ret, i;
            if (typeof to === "function") PVI.node =
                trg;
            var r = to ? addr.replace(rule[attr], to) : addr;
            if (typeof to === "function") {
                if (r === "") return 2;
                else if (r === "null") return null;
                if (r.indexOf("\n", 7) > -1) {
                    ret = [];
                    r = r.trim().split(/[\n\r]+/g);
                    for (i = 0; i < r.length; ++i) {
                        r[i] = PVI._replace(rule, r[i], http, attr, "", trg);
                        if (Array.isArray(r[i])) ret = ret.concat(r[i]);
                        else ret.push(r[i])
                    }
                    return ret.length > 1 ? ret : ret[0]
                }
            }
            if (rule.dc && (attr === "link" && rule.dc !== 2 || attr === "img" && rule.dc > 1)) r = decodeURIComponent(decodeURIComponent(r));
            if (to[0] === "#" && r[0] !== "#") r = "#" + r.replace("#",
                "");
            r = PVI.httpPrepend(r, http);
            ret = r.indexOf("#", 1);
            if (ret > 1 && (ret = [ret, r.indexOf("#", ret + 1)])[1] > 1) {
                ret = r.slice(ret[0], ret[1] + 1);
                r = r.split(ret).join("#");
                ret = ret.slice(1, -1).split(" ")
            } else ret = false;
            if (ret) {
                if (r[0] === "#") {
                    r = r.slice(1);
                    addr = "#"
                } else addr = "";
                for (i = 0; i < ret.length; ++i) ret[i] = addr + r.replace("#", ret[i]);
                r = ret.length > 1 ? ret : ret[0]
            }
            return r
        },
        replace: function(rule, addr, http, attr, trg) {
            var ret, i, j;
            if (PVI.toFunction(rule, "to") === false) return 1;
            if (trg.IMGS_TRG) trg = trg.IMGS_TRG;
            http = http.slice(0,
                http.length - addr.length);
            if (Array.isArray(rule.to)) {
                ret = [];
                for (i = 0; i < rule.to.length; ++i) {
                    j = PVI._replace(rule, addr, http, attr, rule.to[i], trg);
                    if (Array.isArray(j)) ret = ret.concat(j);
                    else ret.push(j)
                }
            } else if (rule.to) ret = PVI._replace(rule, addr, http, attr, rule.to, trg);
            else ret = PVI.httpPrepend(addr, http);
            return ret
        },
        toFunction: function(rule, param, inline) {
            if (typeof rule[param] !== "function" && (inline ? /^:\s*\S/ : /^:\n\s*\S/).test(rule[param])) try {
                rule[param] = Function("var $ = arguments; " + (inline ? "return " : "") +
                    rule[param].slice(1)).bind(PVI)
            } catch (ex) {
                console.error(app.name + ": " + param + " - " + ex.message);
                return false
            }
        },
        httpPrepend: function(url, preDomain) {
            if (preDomain) url = url.replace(/^(?!#?(?:https?:|\/\/|data:)|$)(#?)/, "$1" + preDomain);
            if (url[1] === "/")
                if (url[0] === "/") url = PVI.pageProtocol + url;
                else if (url[0] === "#" && url[2] === "/") url = "#" + PVI.pageProtocol + url.slice(1);
            return url
        },
        normalizeURL: function(url) {
            if (url[1] === "/" && url[0] === "/") url = PVI.pageProtocol + url;
            PVI.HLP.href = url;
            return PVI.HLP.href
        },
        resolve: function(URL,
            rule, trg, nowait) {
            if (!trg || trg.IMGS_c) return false;
            if (trg.IMGS_c_resolved && typeof trg.IMGS_c_resolved.URL !== "string") return false;
            URL = URL.replace(rgxHash, "");
            if (PVI.stack[URL]) {
                trg.IMGS_album = URL;
                URL = PVI.stack[URL];
                return URL[URL[0]][0]
            }
            var params, i;
            if (rule.rule) {
                params = rule;
                rule = params.rule
            } else {
                params = {};
                i = 0;
                while (i < rule.$.length) params[i] = rule.$[i++];
                params.length = rule.$.length;
                delete rule.$;
                params.rule = rule
            }
            if (cfg.sieve[rule.id].res === 1) rule.req_res = true;
            else if (rule.skip_resolve)
                if (typeof cfg.sieve[rule.id].res ===
                    "function") {
                    params.url = [URL];
                    return PVI.onMessage({
                        "cmd": "resolved",
                        "id": -1,
                        "m": false,
                        "return_url": true,
                        "params": params
                    })
                } else delete rule.skip_resolve;
            if (!cfg.hz.waitHide && (PVI.fireHide && PVI.state > 2 || PVI.state === 2 || PVI.hideTime && Date.now() - PVI.hideTime < 200)) nowait = true;
            if (!PVI.resolve_delay) clearTimeout(PVI.timers.resolver);
            trg.IMGS_c_resolved = {
                "URL": URL,
                "params": params
            };
            PVI.timers.resolver = setTimeout(function() {
                PVI.timers.resolver = null;
                Port.send({
                    "cmd": "resolve",
                    "url": URL,
                    "params": params,
                    "id": PVI.resolving.push(trg) -
                        1
                })
            }, PVI.resolve_delay || (nowait ? 50 : Math.max(50, cfg.hz.delay)));
            return null
        },
        find: function(trg) {
            var i = 0,
                n = trg,
                ret = false,
                URL, rule, imgs, use_img, tmp_el, attrModNode;
            do {
                if (n.nodeType !== void 0)
                    if (n.nodeType !== 1 || n === doc.body) break;
                    else if (n.localName !== "a") continue;
                if (!n.href) break;
                if (trg instanceof win.HTMLElement) {
                    if (n.childElementCount && n.querySelector("iframe, object, embed, video, audio")) break;
                    if (trg.childElementCount && ((tmp_el = doc.evaluate('.//*[self::img[@src] or self::*[contains(@style, "background-image:")]] | preceding-sibling::img[@src][1] | following-sibling::img[@src][1]',
                            trg, null, 8, null).singleNodeValue) && (tmp_el.src !== void 0 || !/\S/.test(trg.textContent)) || n.parentNode.style.backgroundImage[0] === "u" && (tmp_el = n.parentNode) && tmp_el.childElementCount < 3 || n.style.backgroundImage[0] === "u" && (tmp_el = n)) && Math.abs(trg.offsetWidth - tmp_el.offsetWidth) <= 25 && Math.abs(trg.offsetHeight - tmp_el.offsetHeight) <= 25) imgs = PVI.getImages(tmp_el);
                    if (tmp_el) tmp_el = null;
                    attrModNode = n
                } else n.href = PVI.normalizeURL(n.href);
                URL = n.href.replace(PVI.rgxHTTPs, "");
                if (imgs && (URL === imgs.imgSRC || URL ===
                        imgs.imgBG)) break;
                if (win.location.href.replace(rgxHash, "") === n.href.replace(rgxHash, "")) break;
                for (i = 0; rule = cfg.sieve[i]; ++i) {
                    if (!(rule.link && rule.link.test(URL)) && !(rule.img && (tmp_el = rule.img.test(URL)))) continue;
                    if (rule.useimg && rule.img) {
                        if (!imgs) imgs = PVI.getImages(trg);
                        if (imgs && (imgs.imgSRC && rule.img.test(imgs.imgSRC) || imgs.imgBG && (use_img = rule.img.test(imgs.imgBG)))) {
                            use_img = [i, use_img];
                            break
                        }
                    }
                    if (rule.res && (!tmp_el || !rule.to && rule.url)) {
                        if (PVI.toFunction(rule, "url", true) === false) return 1;
                        if (typeof rule.url ===
                            "function") PVI.node = trg;
                        ret = rule.url ? URL.replace(rule[tmp_el ? "img" : "link"], rule.url) : URL;
                        ret = PVI.resolve(PVI.httpPrepend(ret || URL, n.href.slice(0, n.href.length - URL.length)), {
                            "id": i,
                            "$": [n.href].concat((URL.match(rule[tmp_el ? "img" : "link"]) || []).slice(1)),
                            "loop_param": tmp_el ? "img" : "link",
                            "skip_resolve": ret === ""
                        }, trg.IMGS_TRG || trg)
                    } else ret = PVI.replace(rule, URL, n.href, tmp_el ? "img" : "link", trg);
                    if (ret === 1) return 1;
                    else if (ret === 2) ret = false;
                    if (typeof ret === "string" && n !== trg && trg.hasAttribute("src") && trg.src.replace(/^https?:\/\//,
                            "") === ret.replace(/^#?(https?:)?\/\//, "")) ret = false;
                    break
                }
                break
            } while (++i < 5 && (n = n.parentNode));
            if (!ret && ret !== null) {
                imgs = PVI.getImages(trg) || imgs;
                if (imgs && (imgs.imgSRC || imgs.imgBG)) {
                    if (use_img) {
                        i = use_img[0];
                        use_img[0] = true
                    } else {
                        i = 0;
                        use_img = []
                    }
                    for (; rule = cfg.sieve[i]; ++i)
                        if (use_img[0] || rule.img && (imgs.imgSRC && rule.img.test(imgs.imgSRC) || imgs.imgBG && (use_img[1] = rule.img.test(imgs.imgBG)))) {
                            if (!use_img[1] && imgs.imgSRC) {
                                use_img = 1;
                                URL = imgs.imgSRC;
                                imgs = imgs.imgSRC_o
                            } else {
                                use_img = 2;
                                URL = imgs.imgBG;
                                imgs = imgs.imgBG_o
                            }
                            if (!rule.to &&
                                rule.res && rule.url) {
                                if (PVI.toFunction(rule, "url", true) === false) return 1;
                                if (typeof rule.url === "function") PVI.node = trg;
                                ret = PVI.resolve(PVI.httpPrepend(URL.replace(rule.img, rule.url), imgs.slice(0, imgs.length - URL.length)), {
                                    id: i,
                                    $: [imgs].concat((URL.match(rule.img) || []).slice(1)),
                                    loop_param: "img"
                                }, trg.IMGS_TRG || trg)
                            } else ret = PVI.replace(rule, URL, imgs, "img", trg);
                            if (ret === 1) return 1;
                            else if (ret === 2) return false;
                            if (trg.nodeType === 1) {
                                attrModNode = trg;
                                if (cfg.hz.history) trg.IMGS_nohistory = true
                            }
                            break
                        }
                }
            }
            if (rule &&
                rule.loop && typeof ret === "string" && ((use_img || tmp_el) && rule.loop > 1 || !use_img && rule.loop !== 2)) {
                if (trg.nodeType !== 1 && ret === trg.href || trg.IMGS_loop_count > 5) return false;
                rule = ret;
                ret = PVI.find({
                    href: ret,
                    IMGS_TRG: trg.IMGS_TRG || trg,
                    IMGS_loop_count: 1 + (trg.IMGS_loop_count || 0)
                });
                if (ret) ret = Array.isArray(ret) ? ret.concat(rule) : [ret, rule];
                else if (ret !== null) ret = rule
            }
            if (tmp_el === true) trg.IMGS_fallback_zoom = n.href;
            if (ret && (typeof ret === "string" || Array.isArray(ret))) {
                URL = [n && n.href && n.href.replace(/^https?:\/\//,
                    ""), trg.nodeType === 1 && trg.hasAttribute("src") && trg.src.replace(/^https?:\/\//, ""), /^#?(https?:)?\/\//];
                if (typeof ret === "string") ret = [ret];
                for (i = 0; i < ret.length; ++i) {
                    var url = ret[i].replace(URL[2], "");
                    if (URL[1] === url) {
                        if (ret[i][0] === "#") {
                            use_img = ret = false;
                            break
                        }
                        ret.splice(i--, 1)
                    } else if (URL[0] === url)
                        if (tmp_el === true) tmp_el = 1;
                        else if (tmp_el === 1) ret.splice(i--, 1)
                }
                if (!ret.length) ret = false;
                else if (ret.length === 1) ret = ret[0][0] === "#" ? ret[0].slice(1) : ret[0]
            }
            if (trg.nodeType !== 1) return ret;
            if (trg.localName ===
                "img" && trg.hasAttribute("src")) {
                if (ret)
                    if (ret === trg.src && (!n || !n.href || n !== trg)) use_img = ret = false;
                    else if (use_img) use_img = 3;
                if (!rgxIsSVG.test(trg.src)) {
                    rule = PVI.isEnlargeable(trg);
                    var oParent = trg;
                    i = 0;
                    if (!rule) {
                        do {
                            if (oParent === doc.body || oParent.nodeType !== 1) break;
                            tmp_el = win.getComputedStyle(oParent);
                            if (tmp_el.position === "fixed") break;
                            if (i === 0) continue;
                            if (tmp_el.overflowY === "visible" && tmp_el.overflowX === "visible") continue;
                            switch (tmp_el.display) {
                                case "block":
                                case "inline-block":
                                case "flex":
                                case "inline-flex":
                                case "list-item":
                                case "table-caption":
                                    break;
                                default:
                                    continue
                            }
                            if (oParent.offsetWidth <= 32 || oParent.offsetHeight <= 32) continue;
                            if (!PVI.isEnlargeable(oParent, trg, true)) continue;
                            trg.IMGS_overflowParent = oParent;
                            trg.IMGS_fallback_zoom = trg.IMGS_fallback_zoom ? [trg.IMGS_fallback_zoom, trg.src] : trg.src;
                            rule = true;
                            break
                        } while (++i < 5 && (oParent = oParent.parentNode))
                    }
                    if (rule) {
                        attrModNode = trg;
                        if (ret === null || Array.isArray(ret)) trg.IMGS_fallback_zoom = trg.src;
                        else {
                            if (!ret && cfg.hz.history) trg.IMGS_nohistory = true;
                            ret = ret ? [ret, trg.src] : trg.src
                        }
                    }
                }
            }
            if (!ret && ret !== null) {
                if (attrModNode) PVI.listen_attr_changes(attrModNode);
                return ret
            }
            if (use_img && imgs) {
                if (use_img === 2) trg.IMGS_thumb_ok = true;
                trg.IMGS_thumb = imgs
            } else if (use_img === 3) trg.IMGS_thumb = true;
            tmp_el = n && n.href ? n.textContent.trim() : null;
            i = 0;
            n = trg;
            do {
                if (n.IMGS_caption || n.title && (!trg.hasAttribute("src") || trg.src !== n.title)) trg.IMGS_caption = n.IMGS_caption || n.title;
                if (browser.mx || browser.safari) {
                    n.title = "";
                    continue
                }
                if (i === 0 && !cfg.hz.capNoSBar) trg.title = "";
                if (trg.IMGS_caption) break
            } while (++i <= 5 && (n = n.parentNode) && n.nodeType === 1);
            if (!trg.IMGS_caption)
                if (trg.alt && trg.alt !==
                    trg.src && trg.alt !== imgs) trg.IMGS_caption = trg.alt;
                else if (cfg.hz.capLinkText && (trg.href || tmp_el) && (trg.href || tmp_el) !== trg.textContent.trim()) trg.IMGS_caption = tmp_el || trg.textContent;
            if (trg.IMGS_caption)
                if (!cfg.hz.capLinkText && trg.IMGS_caption === tmp_el || trg.IMGS_caption === trg.href) delete trg.IMGS_caption;
                else PVI.prepareCaption(trg, trg.IMGS_caption);
            if (attrModNode) PVI.listen_attr_changes(attrModNode);
            return ret
        },
        delayed_loader: function() {
            if (PVI.TRG && PVI.state < 4) PVI.show(PVI.LDR_msg, true)
        },
        show: function(msg,
            delayed) {
            if (PVI.iFrame) {
                win.parent.postMessage({
                    "IMGS_message_CMD": "from_frame",
                    "msg": msg
                }, "*");
                return
            }
            if (!delayed && typeof msg === "string") {
                PVI.DIV.style.display = "none";
                PVI.HD_cursor(true);
                PVI.BOX = PVI.LDR;
                PVI.LDR.style.backgroundColor = cfg.hz.LDRbgOpacity < 100 ? PVI.palette[msg].replace(/\(([^\)]+)/, "a($1, " + cfg.hz.LDRbgOpacity / 100) : PVI.palette[msg];
                if (cfg.hz.LDRdelay > 20) {
                    clearTimeout(PVI.timers.delayed_loader);
                    if (msg[0] !== "R" && PVI.state !== 3 && !PVI.fullZm) {
                        PVI.state = 3;
                        PVI.LDR_msg = msg;
                        PVI.timers.delayed_loader =
                            setTimeout(PVI.delayed_loader, cfg.hz.LDRdelay);
                        return
                    }
                }
            }
            var box;
            if (msg) {
                if (PVI.state === 2 && cfg.hz.waitHide) return;
                viewportDimensions();
                if (PVI.state < 3 || PVI.LDR_msg) {
                    PVI.LDR_msg = null;
                    win.addEventListener(browser["wheel"], PVI.wheeler, true)
                }
                if (msg === true) {
                    PVI.BOX = PVI.DIV;
                    PVI.LDR.style.display = "none";
                    if (cfg.hz.LDRanimate) PVI.LDR.style.opacity = "0";
                    PVI.CNT.style.display = "block";
                    (PVI.CNT === PVI.IMG ? PVI.VID : PVI.IMG).style.display = "none";
                    if (typeof PVI.DIV.cursor_hide === "function") PVI.DIV.cursor_hide()
                } else if (PVI.state <
                    4) {
                    if (PVI.anim.left || PVI.anim.top) {
                        PVI.DIV.style.left = PVI.x + "px";
                        PVI.DIV.style.top = PVI.y + "px"
                    }
                    if (PVI.anim.width || PVI.anim.height) PVI.DIV.style.width = PVI.DIV.style.height = "0"
                }
                box = PVI.BOX.style;
                if ((PVI.state < 3 || PVI.BOX === PVI.LDR) && box.display === "none" && ((PVI.anim.left || PVI.anim.top) && PVI.BOX === PVI.DIV || cfg.hz.LDRanimate && PVI.BOX === PVI.LDR)) PVI.show(null);
                box.display = "block";
                if (box.opacity === "0" && (PVI.BOX === PVI.DIV && PVI.anim.opacity || PVI.BOX === PVI.LDR && cfg.hz.LDRanimate))
                    if (PVI.state === 2) PVI.anim.opacityTransition();
                    else setTimeout(PVI.anim.opacityTransition, 0);
                PVI.state = PVI.BOX === PVI.LDR ? 3 : 4
            }
            var x = PVI.x;
            var y = PVI.y;
            var rSide = winW - x;
            var bSide = winH - y;
            var left, top, rot, w, h, ratio;
            if (msg === void 0 && PVI.state === 4 || msg === true) {
                msg = false;
                if (PVI.TRG.IMGS_SVG) {
                    h = PVI.stack[PVI.IMG.src];
                    w = h[0];
                    h = h[1]
                } else if (w = PVI.CNT.naturalWidth) h = PVI.CNT.naturalHeight;
                else msg = true
            }
            if (PVI.fullZm) {
                if (!PVI.BOX) PVI.BOX = PVI.LDR;
                if (msg === false) {
                    box = PVI.DIV.style;
                    box.visibility = "hidden";
                    PVI.resize(0);
                    PVI.m_move();
                    box.visibility = "visible";
                    PVI.updateCaption()
                } else PVI.m_move();
                return
            }
            if (msg === false) {
                rot = PVI.DIV.curdeg % 180 !== 0;
                if (rot) {
                    ratio = w;
                    w = h;
                    h = ratio
                }
                if (cfg.hz.placement === 3) {
                    box = PVI.TBOX;
                    x = box.left;
                    y = box.top;
                    rSide = winW - box.right;
                    bSide = winH - box.bottom
                }
                box = PVI.DBOX;
                ratio = w / h;
                var fs = cfg.hz.fullspace || cfg.hz.placement === 2,
                    cap_size = PVI.CAP && PVI.CAP.overhead && !(PVI.DIV.curdeg % 360) && PVI.CAP.state !== 0 && (PVI.CAP.state === 2 || PVI.TRG.IMGS_caption && cfg.hz.capText || PVI.TRG.IMGS_album || cfg.hz.capWH) ? PVI.CAP.overhead : 0,
                    vH = box["wm"] + (rot ? box["hpb"] : box["wpb"]),
                    hH = box["hm"] + (rot ? box["wpb"] :
                        box["hpb"]) + cap_size,
                    vW = Math.min(w, (fs ? winW : x < rSide ? rSide : x) - vH),
                    hW = Math.min(w, winW - vH);
                vH = Math.min(h, winH - hH);
                hH = Math.min(h, (fs ? winH : y < bSide ? bSide : y) - hH);
                if ((fs = vW / ratio) > vH) vW = vH * ratio;
                else vH = fs;
                if ((fs = hH * ratio) > hW) hH = hW / ratio;
                else hW = fs;
                if (hW > vW) {
                    w = Math.round(hW);
                    h = Math.round(hH)
                } else {
                    w = Math.round(vW);
                    h = Math.round(vH)
                }
                vW = w + box["wm"] + (rot ? box["hpb"] : box["wpb"]);
                vH = h + box["hm"] + (rot ? box["wpb"] : box["hpb"]) + cap_size;
                hW = PVI.TRG !== PVI.HLP && cfg.hz.minPopupDistance;
                switch (cfg.hz.placement) {
                    case 1:
                        hH = (x <
                            rSide ? rSide : x) < vW;
                        if (hH && cfg.hz.fullspace && (winH - vH <= winW - vW || vW <= (x < rSide ? rSide : x))) hH = false;
                        left = x - (hH ? vW / 2 : x < rSide ? 0 : vW);
                        top = y - (hH ? y < bSide ? 0 : vH : vH / 2);
                        break;
                    case 2:
                        left = (winW - vW) / 2;
                        top = (winH - vH) / 2;
                        hW = false;
                        break;
                    case 3:
                        left = x < rSide || vW >= PVI.x && winW - PVI.x >= vW ? PVI.TBOX.right : x - vW;
                        top = y < bSide || vH >= PVI.y && winH - PVI.y >= vH ? PVI.TBOX.bottom : y - vH;
                        hH = (x < rSide ? rSide : x) < vW || (y < bSide ? bSide : y) >= vH && winW >= vW && (PVI.TBOX.width >= winW / 2 || Math.abs(PVI.x - left) >= winW / 3.5);
                        if (!cfg.hz.fullspace || (hH ? vH <= (y < bSide ? bSide :
                                y) : vW <= (x < rSide ? rSide : x))) {
                            fs = PVI.TBOX.width / PVI.TBOX.height;
                            if (hH) {
                                left = (PVI.TBOX.left + PVI.TBOX.right - vW) / 2;
                                if (fs > 10) left = x < rSide ? Math.max(left, PVI.TBOX.left) : Math.min(left, PVI.TBOX.right - vW)
                            } else {
                                top = (PVI.TBOX.top + PVI.TBOX.bottom - vH) / 2;
                                if (fs < .1) top = y < bSide ? Math.min(top, PVI.TBOX.top) : Math.min(top, PVI.TBOX.bottom - vH)
                            }
                        }
                        break;
                    case 4:
                        left = x - vW / 2;
                        top = y - vH / 2;
                        hW = false;
                        break;
                    default:
                        hH = null;
                        left = x - (x < rSide ? Math.max(0, vW - rSide) : vW);
                        top = y - (y < bSide ? Math.max(0, vH - bSide) : vH)
                }
                if (hW)
                    if (hH || (x < rSide ? rSide : x) < vW ||
                        winH < vH) {
                        hH = y < bSide ? box["mt"] : box["mb"];
                        if (hW > hH) {
                            hW -= hH;
                            top += y < bSide ? hW : -hW
                        }
                    } else {
                        hH = x < rSide ? box["ml"] : box["mr"];
                        if (hW > hH) {
                            hW -= hH;
                            left += x < rSide ? hW : -hW
                        }
                    }
                left = left < 0 ? 0 : left > winW - vW ? winW - vW : left;
                top = top < 0 ? 0 : top > winH - vH ? winH - vH : top;
                if (cap_size && !cfg.hz.capPos) top += cap_size;
                if (rot) {
                    rot = w;
                    w = h;
                    h = rot;
                    rot = (vW - vH) / 2;
                    left += rot;
                    top -= rot
                }
                PVI.DIV.style.width = w + "px";
                PVI.DIV.style.height = h + "px";
                PVI.updateCaption()
            } else {
                if (cfg.hz.placement === 1) {
                    left = cfg.hz.minPopupDistance;
                    top = PVI.LDR.wh[1] / 2
                } else {
                    left = 13;
                    top = y <
                        bSide ? -13 : PVI.LDR.wh[1] + 13
                }
                left = x - (x < rSide ? -left : PVI.LDR.wh[0] + left);
                top = y - top
            }
            if (left !== void 0) {
                PVI.BOX.style.left = left + "px";
                PVI.BOX.style.top = top + "px"
            }
        },
        album: function(idx, manual) {
            var s, i;
            if (!PVI.TRG || !PVI.TRG.IMGS_album) return;
            var album = PVI.stack[PVI.TRG.IMGS_album];
            if (!album || album.length < 2) return;
            if (!PVI.fullZm && PVI.timers.no_anim_in_album) {
                clearInterval(PVI.timers.no_anim_in_album);
                PVI.timers.no_anim_in_album = null;
                PVI.DIV.style[browser["transition"]] = "all 0s"
            }
            switch (typeof idx) {
                case "boolean":
                    idx =
                        idx ? 1 : album.length - 1;
                    break;
                case "number":
                    idx = album[0] + (idx || 0);
                    break;
                default:
                    if (/^[+-]?\d+$/.test(idx)) {
                        i = parseInt(idx, 10);
                        idx = idx[0] === "+" || idx[0] === "-" ? album[0] + i : i || 1
                    } else {
                        idx = idx.trim();
                        if (!idx) return;
                        idx = RegExp(idx, "i");
                        s = album[0];
                        i = s + 1;
                        for (i = i < album.length ? i : 1; i !== s; ++i < album.length ? 0 : i = 1)
                            if (album[i][1] && idx.test(album[i][1])) {
                                idx = i;
                                break
                            }
                        if (typeof idx !== "number") return
                    }
            }
            if (cfg.hz.pileCycle) {
                s = album.length - 1;
                idx = idx % s || s;
                idx = idx < 0 ? s + idx : idx
            } else idx = Math.max(1, Math.min(idx, album.length - 1));
            s = album[0];
            if (s === idx && manual && PVI.state > 3) return;
            album[0] = idx;
            PVI.resetNode(PVI.TRG, true);
            PVI.CAP.style.display = "none";
            PVI.CAP.firstChild.textContent = idx + " / " + (album.length - 1);
            if (cfg.hz.capText) PVI.prepareCaption(PVI.TRG, album[idx][1]);
            PVI.set(album[idx][0]);
            s = s <= idx && !(s === 1 && idx === album.length - 1) || s === album.length - 1 && idx === 1 ? 1 : -1;
            i = 0;
            var until = cfg.hz.preload < 3 ? 1 : 3;
            while (i++ <= until) {
                if (!album[idx + i * s] || idx + i * s < 1) return;
                PVI._preload(album[idx + i * s][0])
            }
        },
        set: function(src) {
            var i, src_left, src_HD;
            if (!src) return;
            if (PVI.iFrame) {
                i = PVI.TRG;
                win.parent.postMessage({
                    "IMGS_message_CMD": "from_frame",
                    "src": src,
                    "thumb": i.IMGS_thumb ? [i.IMGS_thumb, i.IMGS_thumb_ok] : null,
                    "album": i.IMGS_album ? {
                        "id": i.IMGS_album,
                        "list": PVI.stack[i.IMGS_album]
                    } : null,
                    "caption": i.IMGS_caption
                }, "*");
                return
            }
            clearInterval(PVI.timers.onReady);
            PVI.create();
            if (Array.isArray(src)) {
                if (!src.length) {
                    PVI.show("R_load");
                    return
                }
                src_left = [];
                src_HD = [];
                for (i = 0; i < src.length; ++i) {
                    if (!src[i]) continue;
                    if (src[i][0] === "#") src_HD.push(PVI.httpPrepend(src[i].slice(1)));
                    else src_left.push(PVI.httpPrepend(src[i]))
                }
                if (!src_left.length) src_left = src_HD;
                else if (src_HD.length) {
                    PVI.TRG.IMGS_HD = cfg.hz.hiRes;
                    i = cfg.hz.hiRes ? src_left : src_HD;
                    PVI.TRG.IMGS_HD_stack = i.length > 1 ? i : i[0];
                    src_left = cfg.hz.hiRes ? src_HD : src_left
                }
                PVI.TRG.IMGS_c_resolved = src_left;
                src = src_left[0]
            } else if (src[0] === "#") src = src.slice(1);
            if (src[1] === "/") src = PVI.httpPrepend(src);
            if (src.indexOf("&amp;") !== -1) src = src.replace(/&amp;/g, "&");
            if (rgxIsSVG.test(src)) PVI.TRG.IMGS_SVG = true;
            else delete PVI.TRG.IMGS_SVG;
            if (src === PVI.CNT.src) {
                PVI.checkContentRediness(src);
                return
            }
            if (/^[^?#]+\.(?:m(?:4[abprv]|p[34])|og[agv]|webm)(?:$|[?#])/.test(src) || /#(mp[34]|og[gv]|webm)$/.test(src)) {
                PVI.CNT = PVI.VID;
                PVI.show("load");
                PVI.VID.naturalWidth = 0;
                PVI.VID.naturalHeight = 0;
                PVI.VID.src = src;
                PVI.VID.load();
                return
            }
            if (PVI.CNT !== PVI.IMG) {
                PVI.CNT = PVI.IMG;
                PVI.VID.removeAttribute("src");
                PVI.VID.load()
            }
            if (cfg.hz.thumbAsBG) {
                if (PVI.interlacer) PVI.interlacer.style.display = "none";
                PVI.CNT.loaded = PVI.TRG.IMGS_SVG || PVI.stack[src] === 1
            }
            if (!PVI.TRG.IMGS_SVG &&
                !PVI.stack[src] && cfg.hz.preload === 1)(new Image).src = src;
            PVI.CNT.removeAttribute("src");
            if (PVI.TRG.IMGS_SVG && !PVI.stack[src]) {
                var obj = doc.createElement("object");
                obj.style.cssText = ["width: 0", "height: 0", "box-sizing: border-box", ""].join(" !important;");
                obj.onerror = obj.onload = function(e) {
                    obj.onerror = obj.onload = null;
                    setTimeout(function() {
                        if (e.target && e.target.parentNode) e.target.parentNode.removeChild(e.target)
                    }, 1E3)
                };
                obj.data = src + "#" + app.name.toUpperCase() + "_SVG";
                PVI.DIV.parentNode.appendChild(obj);
                PVI.show("load");
                return
            }
            PVI.CNT.src = src;
            PVI.checkContentRediness(src, true)
        },
        checkContentRediness: function(src, showLoader) {
            if (PVI.CNT.naturalWidth || PVI.TRG.IMGS_SVG && PVI.stack[src]) {
                PVI.assign_src();
                return
            }
            if (showLoader) PVI.show("load");
            PVI.timers.onReady = setInterval(PVI.content_onready, PVI.CNT === PVI.IMG ? 100 : 300)
        },
        content_onready: function() {
            if (!PVI.CNT || !PVI.fireHide) {
                clearInterval(PVI.timers.onReady);
                if (!PVI.fireHide) PVI.reset();
                return
            }
            if (PVI.CNT === PVI.VID) {
                if (!PVI.VID.duration) {
                    if (PVI.VID.readyState >
                        PVI.VID.HAVE_NOTHING) PVI.content_onerror.call(PVI.VID);
                    return
                }
                PVI.VID.naturalWidth = PVI.VID.videoWidth || 300;
                PVI.VID.naturalHeight = PVI.VID.videoHeight || 40;
                PVI.VID.audio = !PVI.VID.videoHeight;
                PVI.VID.loop = !PVI.VID.duration || PVI.VID.duration <= 60;
                if (PVI.VID.audio) {
                    PVI.VID._controls = PVI.VID.controls;
                    PVI.VID.controls = true
                } else PVI.VID.controls = PVI.fullZm ? true : PVI.VID._controls;
                var autoplay = PVI.VID.autoplay;
                if (autoplay && PVI.VID.paused) PVI.VID.play();
                if (autoplay && browser.opera) setTimeout(function() {
                    if (PVI.VID.paused) return;
                    if (!PVI.VID.audio && PVI.VID.currentTime >= .5) return;
                    PVI.VID.pause();
                    PVI.VID.play()
                }, 1500)
            } else if (!PVI.IMG.naturalWidth) return;
            clearInterval(PVI.timers.onReady);
            PVI.assign_src()
        },
        content_onerror: function() {
            clearInterval(PVI.timers.onReady);
            if (!PVI.TRG || this !== PVI.CNT) return;
            var src_left;
            var t = PVI.TRG;
            var src_res_arr = t.IMGS_c_resolved;
            var src = this.src;
            if (!src) return;
            this.removeAttribute("src");
            do src_left = Array.isArray(src_res_arr) ? src_res_arr.shift() : null; while (src_left === src);
            if (!src_res_arr || !src_res_arr.length)
                if (src_left) t.IMGS_c_resolved =
                    src_left;
                else delete t.IMGS_c_resolved;
            if (src_left && !src_left.URL) PVI.set(src_left);
            else if (t.IMGS_HD_stack) {
                src_left = t.IMGS_HD_stack;
                delete t.IMGS_HD_stack;
                delete t.IMGS_HD;
                PVI.set(src_left)
            } else if (t.IMGS_fallback_zoom) {
                PVI.set(t.IMGS_fallback_zoom);
                delete t.IMGS_fallback_zoom
            } else {
                if (PVI.CAP) PVI.CAP.style.display = "none";
                delete t.IMGS_c_resolved;
                PVI.show("R_load")
            }
            console.info(app.name + ": [" + (this.audio ? "AUDIO" : this.nodeName) + "] Load error > " + src)
        },
        content_onload: function(e) {
            if (cfg.hz.thumbAsBG) this.loaded =
                true;
            if (PVI.TRG) delete PVI.TRG.IMGS_c_resolved;
            if (PVI.stack[this.src] && !(PVI.TRG || e).IMGS_SVG) PVI.stack[this.src] = 1;
            if (PVI.interlacer) PVI.interlacer.style.display = "none"
        },
        history: function(manual) {
            var url, i, n;
            if (!PVI.CNT || !PVI.TRG || browser.chrome && chrome.extension.inIncognitoContext || browser.maxthon) return;
            if (manual) {
                cfg.hz.history = !cfg.hz.history;
                return
            }
            manual = manual !== void 0;
            if (!manual && PVI.TRG.IMGS_nohistory) return;
            if (PVI.TRG.IMGS_album) {
                url = PVI.stack[PVI.TRG.IMGS_album];
                if (!manual && (url.in_history ||
                        url.length > 4 && url[0] === 1)) return;
                url.in_history = !url.in_history
            }
            n = PVI.TRG;
            i = 0;
            do
                if (n.href) {
                    url = n.href;
                    break
                }
            while (++i < 5 && (n = n.parentNode) && n.nodeType === 1);
            if (!url) return;
            if (!browser.opera && !browser.safari) {
                Port.send({
                    "cmd": "history",
                    "url": url,
                    "manual": manual
                });
                return
            }
            n = function() {
                var i = doc.createElement("iframe");
                i.style.cssText = ["position: fixed", "visibility: hidden", "height: 1px", ""].join("!important;");
                i.onload = function() {
                    this.onload = null;
                    if (browser.opera) {
                        this.parentNode.removeChild(this);
                        return
                    }
                    setTimeout(function() {
                            i.parentNode.removeChild(i)
                        },
                        800)
                };
                doc.body.appendChild(i);
                i.src = url
            };
            if (browser.safari) {
                n();
                return
            }
            setTimeout(n, Math.min(PVI.anim.maxDelay, 500))
        },
        HD_cursor: function(reset) {
            if (!PVI.TRG || !reset && (cfg.hz.capWH || PVI.TRG.IMGS_HD === void 0)) return;
            if (reset) {
                if (PVI.DIV) PVI.DIV.style.cursor = "";
                if (PVI.lastTRGStyle.cursor !== null) {
                    PVI.TRG.style.cursor = PVI.lastTRGStyle.cursor;
                    PVI.lastTRGStyle.cursor = null
                }
            } else {
                if (PVI.lastTRGStyle.cursor === null) PVI.lastTRGStyle.cursor = PVI.TRG.style.cursor;
                PVI.DIV.style.cursor = PVI.TRG.style.cursor = "crosshair"
            }
        },
        isEnlargeable: function(img, oImg, isOverflow) {
            if (PVI.CNT && PVI.CNT !== PVI.IMG) return true;
            if (!oImg) oImg = img;
            var w = img.clientWidth;
            var h = img.clientHeight;
            var ow = oImg.naturalWidth;
            var oh = oImg.naturalHeight;
            if (ow <= 64 && oh <= 64 && !isOverflow || ow <= 1 || oh <= 1) return false;
            if (isOverflow) {
                w = img.getBoundingClientRect();
                ow = oImg.getBoundingClientRect();
                if (ow.right - 10 > w.right || ow.bottom - 10 > w.bottom || ow.left + 10 < w.left || ow.top + 10 < w.top) return true;
                return false
            }
            if (img === oImg) {
                if (ow < 1E3 && oh < 1E3 && Math.abs(ow / 2 - (img.width ||
                        w)) < 8 && Math.abs(oh / 2 - (img.height || h)) < 8) return false
            } else if (/^[^?#]+\.(?:gif|apng)(?:$|[?#])/.test(oImg.src)) return true;
            if ((w >= ow || h >= oh) && Math.abs(ow / oh - w / h) <= .2) return false;
            return w < topWinW * .9 && 100 - w * 100 / ow >= cfg.hz.zoomresized || h < topWinH * .9 && 100 - h * 100 / oh >= cfg.hz.zoomresized
        },
        not_enlargeable: function() {
            PVI.resetNode(PVI.TRG);
            PVI.TRG.IMGS_c = true;
            PVI.reset();
            if (!cfg.hz.markOnHover) return;
            if (cfg.hz.markOnHover === "cr") {
                PVI.lastTRGStyle.cursor = PVI.TRG.style.cursor;
                PVI.TRG.style.cursor = "not-allowed";
                return
            }
            if (PVI.lastTRGStyle.outline === null) PVI.lastTRGStyle.outline = PVI.TRG.style.outline;
            PVI.lastScrollTRG = PVI.TRG;
            PVI.TRG.style.outline = "1px solid purple"
        },
        assign_src: function() {
            if (!PVI.TRG || PVI.switchToHiResInFZ()) return;
            if (PVI.TRG.IMGS_album) {
                delete PVI.TRG.IMGS_thumb;
                delete PVI.TRG.IMGS_thumb_ok;
                if (PVI.interlacer) PVI.interlacer.style.display = "none"
            } else if (!PVI.TRG.IMGS_SVG) {
                if (PVI.TRG !== PVI.HLP && PVI.TRG.IMGS_thumb && !PVI.isEnlargeable(PVI.TRG, PVI.IMG)) {
                    if (PVI.TRG.IMGS_HD_stack && !PVI.TRG.IMGS_HD) {
                        PVI.show("load");
                        PVI.key_action({
                            "which": 9
                        });
                        return
                    }
                    if (!PVI.TRG.IMGS_fallback_zoom) {
                        PVI.not_enlargeable();
                        return
                    }
                    PVI.TRG.IMGS_thumb = false
                }
                if (PVI.CNT === PVI.IMG && !PVI.IMG.loaded && cfg.hz.thumbAsBG && PVI.TRG.IMGS_thumb !== false && !PVI.TRG.IMGS_album) {
                    var inner_thumb, w, h;
                    if (typeof PVI.TRG.IMGS_thumb !== "string") {
                        PVI.TRG.IMGS_thumb = null;
                        if (PVI.TRG.hasAttribute("src")) PVI.TRG.IMGS_thumb = PVI.TRG.src;
                        else if (PVI.TRG.childElementCount) {
                            inner_thumb = PVI.TRG.querySelector("img[src]");
                            if (inner_thumb) PVI.TRG.IMGS_thumb = inner_thumb.src
                        }
                    }
                    if (PVI.TRG.IMGS_thumb ===
                        PVI.IMG.src) {
                        delete PVI.TRG.IMGS_thumb;
                        delete PVI.TRG.IMGS_thumb_ok
                    } else if (PVI.TRG.IMGS_thumb) {
                        w = true;
                        if (!PVI.TRG.IMGS_thumb_ok) {
                            w = (inner_thumb || PVI.TRG).clientWidth;
                            h = (inner_thumb || PVI.TRG).clientHeight;
                            PVI.TRG.IMGS_thumb_ok = Math.abs(PVI.IMG.naturalWidth / PVI.IMG.naturalHeight - w / h) <= .2;
                            w = w < 1024 && h < 1024 && w < PVI.IMG.naturalWidth && h < PVI.IMG.naturalHeight
                        }
                        if (w && PVI.TRG.IMGS_thumb_ok) {
                            if (PVI.interlacer) w = PVI.interlacer.style;
                            else {
                                PVI.interlacer = doc.createElement("div");
                                h = PVI.interlacer;
                                if (cfg.hz.thumbAsBGOpacity >
                                    0) {
                                    w = parseInt(cfg.hz.thumbAsBGColor.slice(1), 16);
                                    h.appendChild(doc.createElement("div")).style.cssText = "width: 100%; height: 100%; background-color: rgba(" + (w >> 16) + "," + (w >> 8 & 255) + "," + (w & 255) + "," + parseFloat(cfg.hz.thumbAsBGOpacity) + ")"
                                }
                                w = h.style;
                                w.cssText = "position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-size: 100% 100%; background-repeat: no-repeat";
                                PVI.DIV.insertBefore(h, PVI.IMG)
                            }
                            w.backgroundImage = "url(" + PVI.TRG.IMGS_thumb + ")";
                            w.display = "block"
                        }
                        delete PVI.TRG.IMGS_thumb;
                        delete PVI.TRG.IMGS_thumb_ok
                    }
                }
            }
            delete PVI.TRG.IMGS_c_resolved;
            PVI.TRG.IMGS_c = PVI.CNT.src;
            if (browser.opera && PVI.TRG.IMGS_SVG) PVI.DIV.replaceChild(PVI.IMG, PVI.IMG);
            if (!PVI.TRG.IMGS_SVG) PVI.stack[PVI.IMG.src] = true;
            PVI.show(true);
            PVI.HD_cursor(PVI.TRG.IMGS_HD !== false);
            if (cfg.hz.history) PVI.history();
            if (!PVI.fullZm && PVI.anim.maxDelay && PVI.TRG.IMGS_album) PVI.timers.no_anim_in_album = setTimeout(function() {
                PVI.DIV.style[browser["transition"]] = PVI.anim.css
            }, 100)
        },
        hide: function(e) {
            PVI.HD_cursor(true);
            PVI.fireHide =
                false;
            if (PVI.iFrame) {
                win.parent.postMessage({
                    "IMGS_message_CMD": "from_frame",
                    "hide": true
                }, "*");
                return
            } else win.removeEventListener("mousemove", PVI.m_move, true);
            if (PVI.state < 3 || PVI.LDR_msg || PVI.state === null) {
                if (PVI.state >= 2) PVI.reset();
                return
            }
            var animDIV = PVI.BOX === PVI.DIV && PVI.anim.maxDelay;
            var animLDR = PVI.BOX === PVI.LDR && cfg.hz.LDRanimate;
            if (!animDIV && !animLDR || PVI.fullZm) {
                if (!cfg.hz.waitHide) PVI.hideTime = Date.now();
                PVI.reset();
                return
            }
            PVI.state = 2;
            if (PVI.CAP) {
                PVI.HLP.textContent = "";
                PVI.CAP.style.display =
                    "none"
            }
            if (animDIV && PVI.anim.left || animLDR) PVI.BOX.style.left = (cfg.hz.follow ? e.clientX || PVI.x : parseInt(PVI.BOX.style.left, 10) + PVI.BOX.offsetWidth / 2) + "px";
            if (animDIV && PVI.anim.top || animLDR) PVI.BOX.style.top = (cfg.hz.follow ? e.clientY || PVI.y : parseInt(PVI.BOX.style.top, 10) + PVI.BOX.offsetHeight / 2) + "px";
            if (animDIV) {
                if (PVI.anim.width) PVI.DIV.style.width = "0";
                if (PVI.anim.height) PVI.DIV.style.height = "0"
            }
            if (animDIV && PVI.anim.opacity || animLDR) PVI.BOX.style.opacity = "0";
            PVI.timers.anim_end = setTimeout(PVI.reset, PVI.anim.maxDelay)
        },
        reset: function(preventImmediateHover) {
            if (!PVI.DIV) return;
            if (PVI.iFrame) win.parent.postMessage({
                "IMGS_message_CMD": "from_frame",
                "reset": true
            }, "*");
            if (PVI.state) win.removeEventListener("mousemove", PVI.m_move, true);
            PVI.node = null;
            clearTimeout(PVI.timers.delayed_loader);
            win.removeEventListener(browser["wheel"], PVI.wheeler, true);
            PVI.DIV.style.display = PVI.LDR.style.display = "none";
            PVI.DIV.style.width = PVI.DIV.style.height = "0";
            PVI.CNT.removeAttribute("src");
            if (PVI.CNT === PVI.VID) PVI.VID.load();
            if (PVI.anim.left ||
                PVI.anim.top) PVI.DIV.style.left = PVI.DIV.style.top = "auto";
            if (PVI.anim.opacity) PVI.DIV.style.opacity = "0";
            if (cfg.hz.LDRanimate) {
                PVI.LDR.style.left = "auto";
                PVI.LDR.style.top = "auto";
                PVI.LDR.style.opacity = "0"
            }
            if (PVI.CAP) PVI.CAP.firstChild.style.display = PVI.CAP.style.display = "none";
            if (PVI.IMG.scale) {
                delete PVI.IMG.scale;
                PVI.IMG.style[browser["transform"]] = ""
            }
            if (PVI.VID.scale) {
                delete PVI.VID.scale;
                PVI.VID.style[browser["transform"]] = ""
            }
            PVI.DIV.curdeg = 0;
            PVI.DIV.style[browser["transform"]] = "";
            PVI.HD_cursor(true);
            if (PVI.fullZm) {
                PVI.fullZm = false;
                PVI.hideTime = null;
                if (PVI.anim.maxDelay) PVI.DIV.style[browser["transition"]] = PVI.anim.css;
                win.removeEventListener("click", PVI.fzClickAct, true);
                win.addEventListener("mouseover", PVI.m_over, true);
                doc.addEventListener(browser["wheel"], PVI.scroller, true);
                doc.documentElement.addEventListener(browser["mouseleave"], PVI.m_leave)
            }
            if (preventImmediateHover) {
                PVI.lastScrollTRG = PVI.TRG;
                PVI.scroller()
            }
            PVI.state = 1
        },
        keyup_freeze: function(e) {
            if (!e || shortcut.key(e) === cfg.hz.actTrigger) {
                PVI.freeze = !cfg.hz.deactivate;
                PVI.keyup_freeze_on = false;
                win.removeEventListener("keyup", PVI.keyup_freeze, true)
            }
        },
        key_action: function(e) {
            var pv, key;
            if (!cfg) return;
            if (shortcut.isModifier(e)) {
                if (PVI.keyup_freeze_on || typeof PVI.freeze === "number") return;
                if (e.repeat || shortcut.key(e) !== cfg.hz.actTrigger) return;
                if (PVI.fireHide && PVI.state < 3)
                    if (cfg.hz.deactivate) PVI.m_over({
                        "relatedTarget": PVI.TRG
                    });
                    else PVI.load(PVI.SRC === null ? PVI.TRG.IMGS_c_resolved : PVI.SRC);
                PVI.freeze = !!cfg.hz.deactivate;
                PVI.keyup_freeze_on = true;
                win.addEventListener("keyup",
                    PVI.keyup_freeze, true);
                return
            }
            if (!e.repeat)
                if (PVI.keyup_freeze_on) PVI.keyup_freeze();
                else if (PVI.freeze === false && !PVI.fullZm && PVI.lastScrollTRG) PVI.mover({
                "target": PVI.lastScrollTRG
            });
            key = shortcut.key(e);
            if (PVI.state < 3 && PVI.fireHide && key === "Esc") PVI.m_over({
                "relatedTarget": PVI.TRG
            });
            pv = e.target;
            if (cfg.hz.scOffInInput && pv && (pv.isContentEditable || (pv = pv.nodeName.toUpperCase()) && (pv[2] === "X" || pv === "INPUT"))) return;
            if (e.altKey && e.shiftKey) {
                pv = true;
                if (key === cfg.keys.hz_preload) win.top.postMessage({
                        "IMGS_message_CMD": "preload"
                    },
                    "*");
                else if (key === cfg.keys.hz_toggle) {
                    if (win.sessionStorage.IMGS_suspend) delete win.sessionStorage.IMGS_suspend;
                    else win.sessionStorage.IMGS_suspend = "1";
                    win.top.postMessage({
                        "IMGS_message_CMD": "toggle"
                    }, "*")
                } else pv = false
            } else if (!(e.altKey || e.metaKey) && (PVI.state > 2 || PVI.LDR_msg)) {
                pv = !e.ctrlKey;
                if (e.ctrlKey) {
                    if (PVI.state === 4)
                        if (key === "C") {
                            if (!e.shiftKey) {
                                pv = true;
                                if (PVI.timers.copy) {
                                    clearTimeout(PVI.timers.copy);
                                    key = PVI.TRG.IMGS_caption
                                } else key = PVI.CNT.src;
                                if (key) PVI.timers.copy = setTimeout(function() {
                                    PVI.timers.copy =
                                        null;
                                    Port.send({
                                        "cmd": "clipboard",
                                        "copy": key
                                    })
                                }, 500)
                            }
                        } else if (key === "S") {
                        if (!browser.opera && !e.repeat && PVI.CNT.src) {
                            pv = "";
                            PVI.HLP.href = PVI.CNT.src;
                            if (e.shiftKey) {
                                key = PVI.TRG.IMGS_caption;
                                pv = prompt("/c - caption (max. 200 char)\n/n - filename\n/f - filename.ext\n/h - host (www.example.com)");
                                if (pv) pv = pv.replace(/\/[cnfh]/g, function(t) {
                                    switch (t[1]) {
                                        case "c":
                                            return key && key.slice(0, 200) || "";
                                        case "n":
                                            t = PVI.HLP.pathname.slice(1).split(".");
                                            return t.slice(0, t[1] ? -1 : t.length).join(".") || t.join(".");
                                        case "f":
                                            return PVI.HLP.pathname.split("/").pop();
                                        case "h":
                                            return PVI.HLP.hostname.replace(/\./g, "-")
                                    }
                                })
                            }
                            if (pv !== null)
                                if (browser.firefox) {
                                    key = PVI.HLP.pathname.split("/").pop().split(".");
                                    Port.send({
                                        "cmd": "download",
                                        "name": pv + (pv && key.length > 1 ? "." + key[1] : ""),
                                        "url": PVI.HLP.href,
                                        "showDialog": e.shiftKey && !pv
                                    })
                                } else if (PVI.HLP.download !== void 0) {
                                PVI.HLP.setAttribute("download", pv || "");
                                PVI.HLP.dispatchEvent(new MouseEvent("click"))
                            }
                        }
                        pv = true
                    } else if (key === cfg.keys.hz_open) {
                        key = {};
                        ((PVI.TRG.IMGS_caption || "").match(/\b((?:www\.[\w-]+(\.\S{2,7}){1,4}|https?:\/\/)\S+)/g) || []).forEach(function(el) {
                            key[el[0] === "w" ? "http://" + el : el] = 1
                        });
                        key = Object.keys(key);
                        if (key.length) {
                            Port.send({
                                "cmd": "open",
                                "url": key,
                                "nf": e.shiftKey
                            });
                            if (!e.shiftKey && !PVI.fullZm) PVI.reset();
                            pv = true
                        }
                    }
                } else if (key === "-" || key === "+" || key === "=") PVI.resize(key === "-" ? "-" : "+");
                else if (key === "Tab") {
                    if (PVI.TRG.IMGS_HD_stack) {
                        if (PVI.CAP) PVI.CAP.style.display = "none";
                        PVI.TRG.IMGS_HD = !PVI.TRG.IMGS_HD;
                        key = PVI.TRG.IMGS_c || PVI.TRG.IMGS_c_resolved;
                        delete PVI.TRG.IMGS_c;
                        PVI.set(PVI.TRG.IMGS_HD_stack);
                        PVI.TRG.IMGS_HD_stack =
                            key
                    }
                    if (e.shiftKey) cfg.hz.hiRes = !cfg.hz.hiRes
                } else if (key === "Esc")
                    if (PVI.CNT === PVI.VID && (win.fullScreen || doc.fullscreenElement || topWinW == win.screen.width && topWinH == win.screen.height)) pv = false;
                    else PVI.reset(true);
                else if (key === cfg.keys.hz_fullZm || key === "Enter")
                    if (PVI.fullZm)
                        if (e.shiftKey) PVI.fullZm = PVI.fullZm === 1 ? 2 : 1;
                        else PVI.reset(true);
                else {
                    win.removeEventListener("mouseover", PVI.m_over, true);
                    doc.removeEventListener(browser["wheel"], PVI.scroller, true);
                    doc.documentElement.removeEventListener(browser["mouseleave"],
                        PVI.m_leave, false);
                    PVI.fullZm = cfg.hz.fzMode !== 1 !== !e.shiftKey ? 1 : 2;
                    PVI.switchToHiResInFZ();
                    if (PVI.anim.maxDelay) setTimeout(function() {
                        if (PVI.fullZm) PVI.DIV.style[browser["transition"]] = "all 0s"
                    }, PVI.anim.maxDelay);
                    pv = PVI.DIV.style;
                    if (PVI.CNT === PVI.VID) PVI.VID.controls = true;
                    if (PVI.state > 2 && PVI.fullZm !== 2) {
                        pv.visibility = "hidden";
                        PVI.resize(0);
                        PVI.m_move();
                        pv.visibility = "visible"
                    }
                    if (!PVI.iFrame) win.addEventListener("mousemove", PVI.m_move, true);
                    win.addEventListener("click", PVI.fzClickAct, true)
                } else if (e.which >
                    31 && e.which < 41) {
                    pv = null;
                    if (PVI.CNT === PVI.VID) {
                        pv = true;
                        if (key === "Space")
                            if (e.shiftKey) {
                                if (!PVI.VID.audio) PVI.VID.controls = PVI.VID._controls = !PVI.VID._controls
                            } else if (PVI.VID.paused) PVI.VID.play();
                        else PVI.VID.pause();
                        else if (key === "Up" || key === "Down") {
                            if (e.shiftKey) PVI.VID.playbackRate *= key === "Up" ? 4 / 3 : .75
                        } else if (!e.shiftKey && (key === "PgUp" || key === "PgDn"))
                            if (PVI.VID.audio) PVI.VID.currentTime += key === "PgDn" ? 4 : -4;
                            else {
                                PVI.VID.pause();
                                PVI.VID.currentTime = (PVI.VID.currentTime * 25 + (key === "PgDn" ? 1 : -1)) / 25 +
                                    1E-5
                            }
                        else pv = null
                    }
                    if (!pv && PVI.TRG.IMGS_album) {
                        switch (key) {
                            case "End":
                                if (e.shiftKey && (pv = prompt("#", PVI.stack[PVI.TRG.IMGS_album].search || "") || null)) PVI.stack[PVI.TRG.IMGS_album].search = pv;
                                else pv = false;
                                break;
                            case "Home":
                                pv = true;
                                break;
                            case "Up":
                            case "Down":
                                pv = null;
                                break;
                            default:
                                pv = (key === "Space" && !e.shiftKey || key === "Right" || key === "PgDn" ? 1 : -1) * (e.shiftKey && key !== "Space" ? 5 : 1)
                        }
                        if (pv !== null) {
                            PVI.album(pv, true);
                            pv = true
                        }
                    }
                } else if (key === cfg.keys.mOrig || key === cfg.keys.mFit || key === cfg.keys.mFitW || key === cfg.keys.mFitH) PVI.resize(key);
                else if (key === cfg.keys.hz_fullSpace) {
                    cfg.hz.fullspace = !cfg.hz.fullspace;
                    PVI.show()
                } else if (key === cfg.keys.flipH) flip(PVI.CNT, 0);
                else if (key === cfg.keys.flipV) flip(PVI.CNT, 1);
                else if (key === cfg.keys.rotL || key === cfg.keys.rotR) {
                    PVI.DIV.curdeg += key === cfg.keys.rotR ? 90 : -90;
                    if (PVI.CAP && PVI.CAP.textContent && PVI.CAP.state !== 0) PVI.CAP.style.display = PVI.DIV.curdeg % 360 ? "none" : "block";
                    PVI.DIV.style[browser["transform"]] = PVI.DIV.curdeg ? "rotate(" + PVI.DIV.curdeg + "deg)" : "";
                    if (PVI.fullZm) PVI.m_move();
                    else PVI.show()
                } else if (key ===
                    cfg.keys.hz_caption)
                    if (e.shiftKey) {
                        PVI.createCAP();
                        switch (PVI.CAP.state) {
                            case 0:
                                key = cfg.hz.capWH || cfg.hz.capText ? 1 : 2;
                                break;
                            case 2:
                                key = 0;
                                break;
                            default:
                                key = cfg.hz.capWH && cfg.hz.capText ? 0 : 2
                        }
                        PVI.CAP.state = key;
                        PVI.CAP.style.display = "none";
                        PVI.updateCaption();
                        PVI.show()
                    } else {
                        if (PVI.CAP) PVI.CAP.style.whiteSpace = PVI.CAP.style.whiteSpace === "nowrap" ? "normal" : "nowrap"
                    }
                else if (key === cfg.keys.hz_history) PVI.history(e.shiftKey);
                else if (key === cfg.keys.send) {
                    if (PVI.CNT === PVI.IMG) imageSendTo({
                        "url": PVI.CNT.src,
                        "nf": e.shiftKey
                    })
                } else if (key ===
                    cfg.keys.hz_open) {
                    if (PVI.CNT.src) {
                        Port.send({
                            "cmd": "open",
                            "url": PVI.CNT.src.replace(rgxHash, ""),
                            "nf": e.shiftKey
                        });
                        if (!e.shiftKey && !PVI.fullZm) PVI.reset()
                    }
                } else if (key === cfg.keys.prefs) {
                    Port.send({
                        "cmd": "open",
                        "url": "options.html#settings"
                    });
                    if (!PVI.fullZm) PVI.reset()
                } else pv = false
            } else pv = false;
            if (pv) pdsp(e)
        },
        switchToHiResInFZ: function() {
            if (PVI.fullZm && cfg.hz.hiResOnFZ && PVI.TRG.IMGS_HD === false && (PVI.IMG.naturalWidth >= 800 || PVI.IMG.naturalHeight >= 800)) {
                var ratio = PVI.IMG.naturalWidth / PVI.IMG.naturalHeight;
                if ((ratio < 1 ? 1 / ratio : ratio) >= cfg.hz.hiResOnFZ) {
                    PVI.show("load");
                    PVI.key_action({
                        "which": 9
                    });
                    return true
                }
            }
        },
        fzDragEnd: function() {
            PVI.fullZm = PVI.fullZm > 1 ? 2 : 1;
            win.removeEventListener("mouseup", PVI.fzDragEnd, true)
        },
        fzClickAct: function(e) {
            if (e.button !== 0) return;
            if (mdownstart === false) {
                mdownstart = null;
                pdsp(e);
                return
            }
            if (e.target === PVI.CAP || e.target.parentNode && e.target.parentNode === PVI.CAP) {
                if (PVI.TRG.IMGS_HD_stack) PVI.key_action({
                    "which": 9
                })
            } else if (e.target === PVI.VID)
                if ((e.offsetY || e.layerY || 0) < Math.min(PVI.CNT.clientHeight -
                        40, 2 * PVI.CNT.clientHeight / 3)) PVI.reset(true);
                else {
                    if ((e.offsetY || e.layerY || 0) < PVI.CNT.clientHeight - 40 && (e.offsetY || e.layerY || 0) > 2 * PVI.CNT.clientHeight / 3)
                        if (PVI.VID.paused) PVI.VID.play();
                        else PVI.VID.pause()
                }
            else PVI.reset(true);
            if (e.target.IMGS_) pdsp(e, false)
        },
        scroller: function(e) {
            if (e) {
                if (PVI.fullZm) return;
                if (!e.target.IMGS_) PVI.lastScrollTRG = e.target
            }
            if (PVI.freeze || PVI.keyup_freeze_on) return;
            if (e) {
                if (PVI.fireHide) PVI.m_over({
                    "relatedTarget": PVI.TRG
                });
                PVI.x = e.clientX;
                PVI.y = e.clientY
            }
            PVI.freeze = true;
            win.addEventListener("mousemove", PVI.mover, true)
        },
        mover: function(e) {
            if (PVI.x === e.clientX && PVI.y === e.clientY) return;
            win.removeEventListener("mousemove", PVI.mover, true);
            if (PVI.keyup_freeze_on) {
                PVI.lastScrollTRG = null;
                return
            }
            if (PVI.freeze === true) PVI.freeze = !cfg.hz.deactivate;
            if (PVI.state && PVI.lastScrollTRG !== e.target) {
                PVI.hideTime -= 1E3;
                PVI.m_over(e)
            }
            PVI.lastScrollTRG = null
        },
        wheeler: function(e) {
            if (e.clientX >= winW || e.clientY >= winH) return;
            var d = cfg.hz.scrollDelay;
            if (PVI.state > 2 && d >= 20)
                if (e.timeStamp - (PVI.lastScrollTime ||
                        0) < d) d = null;
                else PVI.lastScrollTime = e.timeStamp;
            if (PVI.TRG && PVI.TRG.IMGS_album && cfg.hz.pileWheel && (!PVI.fullZm || e.clientX < 50 && e.clientY < 50 || PVI.CAP && e.target === PVI.CAP.firstChild)) {
                if (d !== null) {
                    if (cfg.hz.pileWheel === 2) {
                        if (!e.deltaX && !e.wheelDeltaX) return;
                        d = (e.deltaX || -e.wheelDeltaX) > 0
                    } else d = (e.deltaY || -e.wheelDelta) > 0;
                    PVI.album(d ? 1 : -1, true)
                }
                pdsp(e);
                return
            }
            if (PVI.fullZm && PVI.fullZm < 4) {
                if (d !== null) PVI.resize((e.deltaY || -e.wheelDelta) > 0 ? "-" : "+", PVI.fullZm > 1 ? e.target === PVI.CNT ? [e.offsetX || e.layerX ||
                    0, e.offsetY || e.layerY || 0
                ] : [] : null);
                pdsp(e);
                return
            }
            PVI.lastScrollTRG = PVI.TRG;
            PVI.reset()
        },
        resize: function(x, xy_img) {
            if (PVI.state !== 4 || !PVI.fullZm) return;
            var s = PVI.TRG.IMGS_SVG ? PVI.stack[PVI.IMG.src].slice() : [PVI.CNT.naturalWidth, PVI.CNT.naturalHeight];
            var k = cfg.keys;
            var rot = PVI.DIV.curdeg % 180;
            viewportDimensions();
            if (rot) s.reverse();
            if (x === k.mFit)
                if (winW / winH < s[0] / s[1]) x = winW > s[0] ? 0 : k.mFitW;
                else x = winH > s[1] ? 0 : k.mFitH;
            switch (x) {
                case k.mFitW:
                    winW -= PVI.DBOX["wpb"];
                    s[1] *= winW / s[0];
                    s[0] = winW;
                    if (PVI.fullZm >
                        1) PVI.y = 0;
                    break;
                case k.mFitH:
                    winH -= PVI.DBOX["hpb"];
                    s[0] *= winH / s[1];
                    s[1] = winH;
                    if (PVI.fullZm > 1) PVI.y = 0;
                    break;
                case "+":
                case "-":
                    k = [parseInt(PVI.DIV.style.width, 10), 0];
                    k[1] = k[0] * s[rot ? 0 : 1] / s[rot ? 1 : 0];
                    if (xy_img) {
                        if (xy_img[1] === void 0 || rot) {
                            xy_img[0] = k[0] / 2;
                            xy_img[1] = k[1] / 2
                        } else if (PVI.DIV.curdeg % 360)
                            if (!(PVI.DIV.curdeg % 180)) {
                                xy_img[0] = k[0] - xy_img[0];
                                xy_img[1] = k[1] - xy_img[1]
                            }
                        xy_img[0] /= k[rot ? 1 : 0];
                        xy_img[1] /= k[rot ? 0 : 1]
                    }
                    x = x === "+" ? 4 / 3 : .75;
                    s[0] = x * Math.max(16, k[rot ? 1 : 0]);
                    s[1] = x * Math.max(16, k[rot ? 0 : 1]);
                    if (xy_img) {
                        xy_img[0] *=
                            k[rot ? 1 : 0] - s[0];
                        xy_img[1] *= k[rot ? 0 : 1] - s[1]
                    }
            }
            if (!xy_img) xy_img = [true, null];
            xy_img.push(s[rot ? 1 : 0], s[rot ? 0 : 1]);
            PVI.m_move(xy_img)
        },
        m_leave: function(e) {
            if (!PVI.fireHide || e.relatedTarget) return;
            if (PVI.x === e.clientX && PVI.y === e.clientY) return;
            PVI.m_over({
                "relatedTarget": PVI.TRG,
                "clientX": e.clientX,
                "clientY": e.clientY
            })
        },
        m_over: function(e) {
            var src, trg, cache;
            if (PVI.freeze && cfg.hz.deactivate) return;
            if (PVI.fireHide) {
                if (e.target && (e.target.IMGS_ || (e.relatedTarget || e).IMGS_ && e.target === PVI.TRG)) {
                    if (cfg.hz.capNoSBar) e.preventDefault();
                    return
                }
                if (PVI.CAP) {
                    PVI.CAP.style.display = "none";
                    PVI.CAP.firstChild.style.display = "none"
                }
                clearTimeout(PVI.timers.preview);
                clearInterval(PVI.timers.onReady);
                if (PVI.timers.resolver) {
                    clearTimeout(PVI.timers.resolver);
                    PVI.timers.resolver = null
                }
                if (e.relatedTarget) {
                    trg = PVI.lastTRGStyle;
                    if (trg.outline !== null) {
                        e.relatedTarget.style.outline = trg.outline;
                        trg.outline = null
                    }
                    if (trg.cursor !== null) {
                        e.relatedTarget.style.cursor = trg.cursor;
                        trg.cursor = null
                    }
                }
                if (PVI.nodeToReset) {
                    PVI.resetNode(PVI.nodeToReset);
                    PVI.nodeToReset =
                        null
                }
                if (PVI.TRG) {
                    if (PVI.DIV)
                        if (PVI.timers.no_anim_in_album) {
                            PVI.timers.no_anim_in_album = null;
                            PVI.DIV.style[browser["transition"]] = PVI.anim.css
                        }
                    PVI.TRG = null
                }
                if (PVI.hideTime === 0 && PVI.state < 3) PVI.hideTime = Date.now();
                if (!e.target) {
                    PVI.hide(e);
                    return
                }
            }
            if (e.target.IMGS_c === true) {
                if (PVI.fireHide) PVI.hide(e);
                return
            }
            trg = e.target;
            cache = trg.IMGS_c;
            if (!cache)
                if (trg.IMGS_c_resolved) src = trg.IMGS_c_resolved;
                else PVI.TRG = trg;
            if (cache || src || (src = PVI.find(trg)) || src === null) {
                if (src === 1) src = false;
                if (cfg.hz.capNoSBar) e.preventDefault();
                clearTimeout(PVI.timers.preview);
                if (!cfg.hz.waitHide) clearTimeout(PVI.timers.anim_end);
                if (!PVI.iFrame) win.addEventListener("mousemove", PVI.m_move, true);
                if (!cache && src && !trg.IMGS_c_resolved) {
                    if (cfg.hz.preload === 2 && !PVI.stack[src]) PVI._preload(src);
                    trg.IMGS_c_resolved = src
                }
                PVI.TRG = trg;
                PVI.SRC = cache || src;
                PVI.x = e.clientX;
                PVI.y = e.clientY;
                cache = PVI.freeze && !cfg.hz.deactivate;
                if (!cache && (!cfg.hz.waitHide || cfg.hz.delay < 15) && (PVI.fireHide && PVI.state > 2 || (PVI.state === 2 || PVI.hideTime && Date.now() - PVI.hideTime <
                        200))) {
                    if (PVI.hideTime) PVI.hideTime = 0;
                    PVI.fireHide = 1;
                    PVI.load(PVI.SRC);
                    return
                }
                if (PVI.fireHide && PVI.state > 2 && (cfg.hz.waitHide || !cfg.hz.deactivate)) {
                    PVI.hide(e);
                    if (!PVI.anim.maxDelay && !PVI.iFrame) win.addEventListener("mousemove", PVI.m_move, true);
                    if (PVI.hideTime) PVI.hideTime = 0
                }
                PVI.fireHide = true;
                if (cfg.hz.markOnHover && (cache || cfg.hz.delay >= 25))
                    if (cfg.hz.markOnHover === "cr") {
                        PVI.lastTRGStyle.cursor = trg.style.cursor;
                        trg.style.cursor = browser["zoom-in"]
                    } else {
                        PVI.lastTRGStyle.outline = trg.style.outline;
                        trg.style.outline =
                            "1px " + cfg.hz.markOnHover + " red"
                    }
                if (cache) {
                    clearTimeout(PVI.timers.resolver);
                    return
                }
                cache = (PVI.state === 2 || PVI.hideTime) && cfg.hz.waitHide ? PVI.anim.maxDelay : cfg.hz.delay;
                if (cache) PVI.timers.preview = setTimeout(PVI.load, cache);
                else PVI.load(PVI.SRC)
            } else {
                trg.IMGS_c = true;
                PVI.TRG = null;
                if (PVI.fireHide) PVI.hide(e)
            }
        },
        load: function(src) {
            if ((cfg.hz.waitHide || !cfg.hz.deactivate) && PVI.anim.maxDelay && !PVI.iFrame) win.addEventListener("mousemove", PVI.m_move, true);
            if (!PVI.TRG) return;
            if (src === void 0) src = cfg.hz.delayOnIdle &&
                PVI.TRG.IMGS_c_resolved || PVI.SRC;
            if (PVI.SRC !== void 0) PVI.SRC = void 0;
            PVI.TBOX = (PVI.TRG.IMGS_overflowParent || PVI.TRG).getBoundingClientRect();
            PVI.TBOX.Left = PVI.TBOX.left + win.pageXOffset;
            PVI.TBOX.Right = PVI.TBOX.Left + PVI.TBOX.width;
            PVI.TBOX.Top = PVI.TBOX.top + win.pageYOffset;
            PVI.TBOX.Bottom = PVI.TBOX.Top + PVI.TBOX.height;
            if (cfg.hz.markOnHover !== "cr") PVI.TRG.style.outline = "";
            else if (PVI.lastTRGStyle.cursor !== null) {
                if (PVI.DIV) PVI.DIV.style.cursor = "";
                PVI.TRG.style.cursor = PVI.lastTRGStyle.cursor
            }
            if (src === null ||
                src && src.params || src === false) {
                if (src === false || src && (src = PVI.resolve(src.URL, src.params, PVI.TRG)) === 1) {
                    PVI.create();
                    PVI.show("R_js");
                    return
                }
                if (src === false) {
                    PVI.reset();
                    return
                }
                if (src === null) {
                    if (PVI.state < 4 || !PVI.TRG.IMGS_c) {
                        if (PVI.state > 3) PVI.IMG.removeAttribute("src");
                        PVI.create();
                        PVI.show("res")
                    }
                    return
                }
            }
            if (PVI.TRG.IMGS_album) {
                PVI.createCAP();
                PVI.album("" + PVI.stack[PVI.TRG.IMGS_album][0]);
                return
            }
            PVI.set(src)
        },
        m_move: function(e) {
            if (e && PVI.x === e.clientX && PVI.y === e.clientY) return;
            if (PVI.fullZm) {
                var x =
                    PVI.x,
                    y = PVI.y,
                    w, h;
                if (!e) e = {};
                if (mdownstart === true) mdownstart = false;
                if (e.target) {
                    PVI.x = e.clientX;
                    PVI.y = e.clientY
                }
                if (PVI.fullZm > 1 && e[0] !== true) {
                    w = PVI.BOX.style;
                    if (PVI.fullZm === 3 && e.target) {
                        x = parseInt(w.left, 10) - x + e.clientX;
                        y = parseInt(w.top, 10) - y + e.clientY
                    } else if (e[1] !== void 0) {
                        x = parseInt(w.left, 10) + e[0];
                        y = parseInt(w.top, 10) + e[1]
                    } else x = null
                } else {
                    var rot = PVI.state === 4 && PVI.DIV.curdeg % 180;
                    if (PVI.BOX === PVI.DIV) {
                        if (PVI.TRG.IMGS_SVG) {
                            h = PVI.stack[PVI.IMG.src];
                            h = h[1] / h[0]
                        }
                        w = e[2] || parseInt(PVI.DIV.style.width,
                            10);
                        h = parseInt(w * (h || PVI.CNT.naturalHeight / PVI.CNT.naturalWidth) + PVI.DBOX["hpb"], 10);
                        w += PVI.DBOX["wpb"]
                    } else {
                        w = PVI.LDR.wh[0];
                        h = PVI.LDR.wh[1]
                    }
                    if (rot) {
                        rot = w;
                        w = h;
                        h = rot;
                        rot = (w - h) / 2
                    } else rot = 0;
                    x = (w - PVI.DBOX["wpb"] > winW ? -(PVI.x * (w - winW + 80) / winW) + 40 : (winW - w) / 2) + rot - PVI.DBOX["ml"];
                    y = (h - PVI.DBOX["hpb"] > winH ? -(PVI.y * (h - winH + 80) / winH) + 40 : (winH - h) / 2) - rot - PVI.DBOX["mt"]
                }
                if (e[2] !== void 0) {
                    PVI.BOX.style.width = e[2] + "px";
                    PVI.BOX.style.height = e[3] + "px"
                }
                if (x !== null) {
                    PVI.BOX.style.left = x + "px";
                    PVI.BOX.style.top = y + "px"
                }
                return
            }
            PVI.x =
                e.clientX;
            PVI.y = e.clientY;
            if (PVI.freeze) return;
            if (PVI.state < 3) {
                if (cfg.hz.delayOnIdle && PVI.fireHide !== 1 && PVI.state < 2) {
                    if (PVI.timers.resolver) clearTimeout(PVI.timers.resolver);
                    clearTimeout(PVI.timers.preview);
                    PVI.timers.preview = setTimeout(PVI.load, cfg.hz.delay)
                }
            } else if (e.target.IMGS_ && PVI.TBOX && (PVI.TBOX.Left > e.pageX || PVI.TBOX.Right < e.pageX || PVI.TBOX.Top > e.pageY || PVI.TBOX.Bottom < e.pageY) || !e.target.IMGS_ && PVI.TRG !== e.target) PVI.m_over({
                "relatedTarget": PVI.TRG,
                "clientX": e.clientX,
                "clientY": e.clientY
            });
            else if (cfg.hz.move && PVI.state > 2 && !PVI.timers.m_move && (PVI.state === 3 || cfg.hz.placement < 2 || cfg.hz.placement > 3)) PVI.timers.m_move = win.requestAnimationFrame(PVI.m_move_show)
        },
        m_move_show: function() {
            if (PVI.state > 2) PVI.show();
            PVI.timers.m_move = null
        },
        _preload: function(srcs) {
            if (!Array.isArray(srcs)) {
                if (typeof srcs !== "string") return;
                srcs = [srcs]
            }
            for (var i = 0, lastIdx = srcs.length - 1; i <= lastIdx; ++i) {
                var url = srcs[i];
                var isHDUrl = url[0] === "#";
                if (!(cfg.hz.hiRes && isHDUrl || !cfg.hz.hiRes && !isHDUrl)) {
                    if (i !== lastIdx) continue;
                    if (i !== 0) {
                        url = srcs[0];
                        isHDUrl = url[0] === "#"
                    }
                }
                if (isHDUrl) url = url.slice(1);
                if (url.indexOf("&amp;") !== -1) url = url.replace(/&amp;/g, "&");
                (new Image).src = url[1] === "/" ? PVI.httpPrepend(url) : url;
                return
            }
        },
        preload: function(e) {
            if (PVI.preloading) {
                if (!e || e.type !== "DOMNodeInserted") {
                    if (e === false) {
                        delete PVI.preloading;
                        doc.body.removeEventListener("DOMNodeInserted", PVI.preload, true)
                    }
                    return
                }
            } else {
                e = null;
                PVI.preloading = [];
                doc.body.addEventListener("DOMNodeInserted", PVI.preload, true)
            }
            var nodes = e && e.target || doc.body;
            if (!nodes || nodes.IMGS_ || nodes.nodeType !== 1 || !(nodes = nodes.querySelectorAll('img[src], :not(img)[style*="background-image"], a[href]')) || !nodes.length) return;
            nodes = [].slice.call(nodes);
            PVI.preloading = PVI.preloading ? PVI.preloading.concat(nodes) : PVI.preloading;
            nodes = function() {
                var node, src;
                var process_amount = 50;
                var onImgError = function() {
                    this.src = this.IMGS_src_arr.shift().replace(/^#/, "");
                    if (!this.IMGS_src_arr.length) this.onerror = null
                };
                PVI.resolve_delay = 200;
                while (node = PVI.preloading.shift()) {
                    if (node.nodeName.toUpperCase() ===
                        "A" && node.childElementCount || node.IMGS_c_resolved || node.IMGS_c || typeof node.IMGS_caption === "string" || node.IMGS_thumb) continue;
                    if (src = PVI.find(node)) {
                        node.IMGS_c_resolved = src;
                        if (Array.isArray(src)) {
                            var i, img = new Image;
                            img.IMGS_src_arr = [];
                            for (i = 0; i < src.length; ++i)
                                if (cfg.hz.hiRes && src[i][0] === "#") img.IMGS_src_arr.push(src[i].slice(1));
                                else if (src[i][0] !== "#") img.IMGS_src_arr.push(src[i]);
                            if (!img.IMGS_src_arr.length) return;
                            img.onerror = onImgError;
                            img.onerror()
                        } else if (typeof src === "string" && !rgxIsSVG.test(src))(new Image).src =
                            src;
                        break
                    }
                    if (src === null || process_amount-- < 1) break
                }
                PVI.resolve_delay = 0;
                if (PVI.preloading.length) PVI.timers.preload = setTimeout(nodes, 300);
                else delete PVI.timers.preload
            };
            if (PVI.timers.preload) {
                clearTimeout(PVI.timers.preload);
                PVI.timers.preload = setTimeout(nodes, 300)
            } else nodes()
        },
        toggle: function(disable) {
            if (PVI.state || disable === true) PVI.init(null, true);
            else if (cfg) PVI.init();
            else Port.send({
                "cmd": "hello",
                "no_grants": true
            })
        },
        winOnResize: function() {
            viewportDimensions();
            if (PVI.state < 3) return;
            if (!PVI.fullZm) PVI.show();
            else if (PVI.fullZm === 1) PVI.m_move()
        },
        winOnMessage: function(e) {
            var d = e.data,
                cmd = d && d.IMGS_message_CMD;
            if (cmd === "toggle" || cmd === "preload" || cmd === "isFrame") {
                var frms = win.frames,
                    i;
                if (!frms) return;
                i = frms.length;
                while (i--)
                    if (frms[i] && frms[i].postMessage) frms[i].postMessage({
                        "IMGS_message_CMD": cmd,
                        "parent": doc.body.nodeName.toUpperCase()
                    }, "*");
                if (cmd === "isFrame") {
                    PVI.iFrame = d.parent === "BODY";
                    if (!PVI.iFrame) win.addEventListener("resize", PVI.winOnResize, true)
                } else PVI[cmd](d)
            } else if (cmd === "svg_info") {
                if (PVI.iFrame) {
                    d.fromFrame =
                        true;
                    win.parent.postMessage(d, "*");
                    return
                }
                var url = d.url.replace(/#.*/, "");
                PVI.create();
                if (!d.ratio) {
                    PVI.show("R_load");
                    return
                }
                if (d.fromFrame) {
                    PVI.TRG = PVI.HLP;
                    PVI.x = PVI.y = 0;
                    PVI.TRG.IMGS_SVG = true;
                    delete PVI.TRG.IMGS_caption
                }
                PVI.stack[url] = [win.screen.width, Math.round(win.screen.width / d.ratio)];
                PVI.IMG.src = url;
                PVI.assign_src()
            } else if (cmd === "from_frame") {
                if (PVI.iFrame) {
                    win.parent.postMessage(d, "*");
                    return
                }
                if (PVI.fullZm) return;
                if (d.reset) {
                    PVI.reset();
                    return
                }
                PVI.create();
                PVI.fireHide = true;
                PVI.TRG = PVI.HLP;
                PVI.resetNode(PVI.TRG);
                if (d.hide) {
                    PVI.hide({
                        "target": PVI.TRG,
                        "clientX": PVI.DIV.offsetWidth / 2 + cfg.hz.margin,
                        "clientY": PVI.DIV.offsetHeight / 2 + cfg.hz.margin
                    });
                    return
                }
                PVI.x = PVI.y = 0;
                if (typeof d.msg === "string") {
                    PVI.show(d.msg);
                    return
                }
                if (!d.src) return;
                PVI.TRG.IMGS_caption = d.caption;
                if (d.album) {
                    PVI.TRG.IMGS_album = d.album.id;
                    if (!PVI.stack[d.album.id]) PVI.stack[d.album.id] = d.album.list;
                    d.album = "" + PVI.stack[d.album.id][0]
                }
                if (d.thumb && d.thumb[0]) {
                    PVI.TRG.IMGS_thumb = d.thumb[0];
                    PVI.TRG.IMGS_thumb_ok = d.thumb[1]
                }
                if (d.album) PVI.album(d.album);
                else PVI.set(d.src)
            }
        },
        onMessage: function(d) {
            if (d.cmd === "resolved") {
                var trg = PVI.resolving[d.id] || PVI.TRG;
                var rule = cfg.sieve[d.params.rule.id];
                delete PVI.resolving[d.id];
                if (!d.return_url) PVI.create();
                if (!d.cache && (d.m === true || d.params.rule.skip_resolve)) {
                    try {
                        if (rule.res === 1 && typeof d.params.rule.req_res === "string") rule.res = Function("$", d.params.rule.req_res);
                        PVI.node = trg;
                        d.m = rule.res.call(PVI, d.params)
                    } catch (ex) {
                        console.error(app.name + ": [rule " + d.params.rule.id + "] " + ex.message);
                        if (!d.return_url && trg ===
                            PVI.TRG) PVI.show("R_js");
                        return 1
                    }
                    if (d.params.url) d.params.url = d.params.url.join("");
                    if (cfg.tls.sieveCacheRes && !d.params.rule.skip_resolve && d.m) Port.send({
                        "cmd": "resolve_cache",
                        "url": d.params.url,
                        "cache": JSON.stringify(d.m),
                        "rule_id": d.params.rule.id
                    })
                }
                if (d.m && !Array.isArray(d.m) && typeof d.m === "object")
                    if (d.m[""]) {
                        if (typeof d.m.idx === "number") d.idx = d.m.idx + 1;
                        d.m = d.m[""]
                    } else if (typeof d.m.loop === "string") {
                    d.loop = true;
                    d.m = d.m.loop
                }
                if (Array.isArray(d.m))
                    if (d.m.length) {
                        if (Array.isArray(d.m[0])) {
                            d.m.forEach(function(el) {
                                if (Array.isArray(el[0]) &&
                                    el[0].length === 1) el[0] = el[0][0]
                            });
                            if (d.m.length > 1) {
                                trg.IMGS_album = d.params.url;
                                if (PVI.stack[d.params.url]) {
                                    d.m = PVI.stack[d.params.url];
                                    d.m = d.m[d.m[0]]
                                } else {
                                    PVI.createCAP();
                                    d.idx = Math.max(1, Math.min(d.idx, d.m.length)) || 1;
                                    d.m.unshift(d.idx);
                                    PVI.stack[d.params.url] = d.m;
                                    d.m = d.m[d.idx];
                                    d.idx += ""
                                }
                            } else d.m = d.m[0]
                        }
                        if (cfg.hz.capText && d.m[0])
                            if (d.m[1]) PVI.prepareCaption(trg, d.m[1]);
                            else if (cfg.hz.capLinkText && trg.IMGS_caption) d.m[1] = trg.IMGS_caption;
                        d.m = d.m[0]
                    } else d.m = null;
                else if (typeof d.m !== "object" &&
                    typeof d.m !== "string") d.m = false;
                if (d.m) {
                    if (!d.noloop && !trg.IMGS_album && typeof d.m === "string" && (d.loop || rule.loop && (d.params.rule.loop_param === "img" && rule.loop > 1 || rule.loop !== 2))) {
                        d.m = PVI.find({
                            "href": d.m,
                            "IMGS_TRG": trg
                        });
                        if (d.m === null || d.m === 1) return d.m;
                        else if (d.m === false) {
                            if (!d.return_url) PVI.show("R_res");
                            return d.m
                        }
                    }
                    if (d.return_url) return d.m;
                    if ((Array.isArray(d.m) || typeof d.m === "string") && PVI.TRG && PVI.TRG.hasAttribute("src") && PVI.TRG.src.replace(/^https?:/, "") === (Array.isArray(d.m) ? d.m[0] : d.m).replace(/^https?:/,
                            ""))
                        if (!PVI.isEnlargeable(PVI.TRG)) {
                            if (PVI.timers.preview) clearTimeout(PVI.timers.preview);
                            PVI.not_enlargeable();
                            return false
                        }
                    if (trg === PVI.TRG)
                        if (trg.IMGS_album) PVI.album(d.idx || "1");
                        else PVI.set(d.m);
                    else {
                        if (cfg.hz.preload > 1 || PVI.preloading) PVI._preload(d.m);
                        trg.IMGS_c_resolved = d.m
                    }
                } else if (d.return_url) {
                    delete PVI.TRG.IMGS_c_resolved;
                    return d.m
                } else if (trg === PVI.TRG) {
                    if (trg.IMGS_fallback_zoom) {
                        PVI.set(trg.IMGS_fallback_zoom);
                        delete trg.IMGS_fallback_zoom;
                        return
                    }
                    if (d.m === false) {
                        PVI.m_over({
                            "relatedTarget": trg
                        });
                        trg.IMGS_c = true;
                        delete trg.IMGS_c_resolved
                    } else PVI.show("R_res")
                }
            } else if (d.cmd === "toggle" || d.cmd === "preload") win.top.postMessage({
                "IMGS_message_CMD": d.cmd
            }, "*");
            else if (d.cmd === "hello") {
                var e = !!PVI.DIV;
                PVI.init(null, true);
                PVI.init(d);
                if (e) PVI.create()
            }
        },
        init: function(e, deinit) {
            if (deinit) {
                PVI.reset();
                PVI.state = 0;
                if (!PVI.iFrame) win.removeEventListener("resize", PVI.winOnResize, true);
                if (PVI.DIV) {
                    doc.documentElement.removeChild(PVI.DIV);
                    doc.documentElement.removeChild(PVI.LDR);
                    PVI.BOX = PVI.DIV = PVI.CNT =
                        PVI.VID = PVI.IMG = PVI.CAP = PVI.TRG = PVI.interlacer = null
                }
                PVI.lastScrollTRG = null
            } else {
                if (e !== void 0) {
                    if (!e) return;
                    if (e.prefs === null) {
                        PVI.init(null, true);
                        return
                    }
                    cfg = e.prefs;
                    if (!cfg.hz.deactivate && cfg.hz.actTrigger === "0") {
                        cfg.sieve = null;
                        return
                    }
                    PVI.freeze = !cfg.hz.deactivate;
                    PVI.convertSieveRegexes();
                    var pageLoaded = function() {
                        doc.removeEventListener("DOMContentLoaded", pageLoaded);
                        if ((!browser.maxthon || cfg.hz.zoomFromFrame) && win.top)
                            if (win.top === win) win.addEventListener("resize", PVI.winOnResize, true);
                            else win.top.postMessage({
                                    "IMGS_message_CMD": "isFrame"
                                },
                                "*");
                        if (doc.body) doc.body.IMGS_c = true;
                        if (cfg.hz.preload === 3) PVI.preload()
                    };
                    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", pageLoaded);
                    else pageLoaded()
                } else if (!cfg) return;
                viewportDimensions();
                Port.listen(PVI.onMessage);
                browser.onkeydown = PVI.key_action;
                browser.onmessage = PVI.winOnMessage;
                e = doc.documentElement || doc.createElement("div");
                browser["mouseleave"] = "mouse" + (e.onmouseleave === void 0 ? "out" : "leave");
                e = null
            }
            e = (deinit ? "remove" : "add") + "EventListener";
            doc[e](browser["wheel"],
                PVI.scroller, true);
            win[e]("mouseover", PVI.m_over, true);
            doc.documentElement[e](browser.mouseleave, PVI.m_leave, false);
            if (win.MutationObserver) {
                PVI.onAttrChange = null;
                if (PVI.mutObserver) {
                    PVI.mutObserver.disconnect();
                    PVI.mutObserver = null
                }
                if (!deinit) {
                    PVI.mutObserver = new win.MutationObserver(function(muts) {
                        var i = muts.length;
                        while (i--) {
                            var m = muts[i];
                            var trg = m.target;
                            var attr = m.attributeName;
                            if (trg !== PVI.TRG || !PVI.fireHide) {
                                PVI.attrObserver(trg, attr === "style", m.oldValue);
                                continue
                            }
                            if (attr === "title" || attr ===
                                "alt") {
                                if (trg[attr] === "") continue
                            } else if (attr === "style") {
                                var bgImg = trg.style.backgroundImage;
                                if (!bgImg) continue;
                                if (m.oldValue.indexOf(bgImg) !== -1) continue
                            }
                            PVI.nodeToReset = trg
                        }
                    });
                    PVI.mutObserverConf = {
                        attributes: true,
                        attributeOldValue: true,
                        attributeFilter: ["href", "src", "style", "alt", "title"]
                    }
                }
            } else PVI.attrObserver = null;
            try {
                if (!deinit && win.sessionStorage.IMGS_suspend === "1") PVI.toggle(true)
            } catch (ex) {}
            if (PVI.capturedMoveEvent) {
                window.removeEventListener("mousemove", PVI.onInitMouseMove, true);
                if (!PVI.x ||
                    PVI.state !== null) PVI.m_over(PVI.capturedMoveEvent);
                delete PVI.onInitMouseMove;
                delete PVI.capturedMoveEvent
            }
        }
    };
    if (win.top !== win && win.top === win.parent) {
        PVI.capturedMoveEvent = null;
        PVI.onInitMouseMove = function(e) {
            if (PVI.capturedMoveEvent) {
                PVI.capturedMoveEvent = e;
                return
            }
            PVI.capturedMoveEvent = e;
            Port.listen(PVI.init);
            Port.send({
                "cmd": "hello"
            })
        };
        window.addEventListener("mousemove", PVI.onInitMouseMove, true);
        browser.onmessage = PVI.winOnMessage
    } else {
        Port.listen(PVI.init);
        Port.send({
            "cmd": "hello"
        })
    }
    if (browser.opera) opera.extension.addEventListener("disconnect",
        function() {
            PVI.init(null, true)
        });
    (function() {
        var count = 0;
        var ping = setInterval(function() {
            if (!cfg && ++count <= 4) {
                Port.send({
                    cmd: "hello"
                });
                return
            }
            clearInterval(ping);
            if (!PVI.capturedMoveEvent) return;
            window.addEventListener("mousemove", PVI.onInitMouseMove, true);
            delete PVI.onInitMouseMove;
            delete PVI.capturedMoveEvent;
            browser.onmessage = PVI.winOnMessage
        }, 4E3)
    })()
})(window, document);