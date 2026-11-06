// Marks links as visited after their media has been previewed.
//
// Since Chrome 136 :visited is partitioned by (link URL, top-level site, frame origin). chrome.history.addUrl()
// records an unpartitioned visit, so a previewed link only turns "visited" when it points to the page's own
// origin; cross-origin links (e.g. i.redd.it images on reddit.com) never do. Extensions cannot write to the
// partitioned store, so we keep our own list of previewed URLs (in the background script) and tag matching
// anchors with a data attribute. The page's own :visited rules are cloned onto that attribute, so marked links
// look exactly like natively visited ones.
var hzVisitedLinks = (function () {
    'use strict';

    const ATTR = 'data-hz-visited';
    const MARK = '[' + ATTR + ']';
    const STYLE_ID = 'hzVisitedLinksStyle';
    // Only these properties are honored by browsers for :visited, so only these are copied.
    const VISITED_PROPS = new Set([
        'color', 'background-color', 'border-color', 'border-top-color', 'border-right-color', 'border-bottom-color',
        'border-left-color', 'border-block-color', 'border-block-start-color', 'border-block-end-color',
        'border-inline-color', 'border-inline-start-color', 'border-inline-end-color', 'outline-color',
        'column-rule-color', 'text-decoration-color', 'text-emphasis-color', 'fill', 'stroke', 'caret-color',
        '-webkit-text-fill-color', '-webkit-text-stroke-color'
    ]);

    let enabled = false;
    let persist = false;      // false in incognito: nothing is stored or read
    let forcedColor = '';
    let observer = null;
    let styleEl = null;
    let styleDirty = true;
    const visited = new Set();      // normalized urls known to be visited
    const queried = new Set();      // normalized urls already asked to the background
    const toQuery = new Set();
    let queryTimer = null;
    let restyleTimer = null;
    const sheetCache = new Map();   // stylesheet href -> rewritten css text (cross-origin fetches)

    function normalize(url) {
        if (!url || typeof url !== 'string') return null;
        try {
            const u = new URL(url, location.href);
            if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
            u.hash = '';
            return u.href;
        } catch (e) {
            return null;
        }
    }

    // ---- marking ----

    function markAnchor(a) {
        const url = normalize(a.href);
        if (url && visited.has(url)) {
            if (!a.hasAttribute(ATTR)) a.setAttribute(ATTR, '');
            return true;
        }
        return false;
    }

    function anchorsIn(root) {
        if (!root || root.nodeType !== 1) return [];
        const list = Array.from(root.querySelectorAll ? root.querySelectorAll('a[href], area[href]') : []);
        if (root.matches && root.matches('a[href], area[href]')) list.push(root);
        return list;
    }

    function scan(root) {
        if (!enabled) return;
        let marked = false;
        for (const a of anchorsIn(root)) {
            if (markAnchor(a)) {
                marked = true;
            } else if (persist) {
                const url = normalize(a.href);
                if (url && !queried.has(url)) toQuery.add(url);
            }
        }
        if (marked) ensureStyle();
        if (toQuery.size && !queryTimer) queryTimer = setTimeout(flushQuery, 50);
    }

    function flushQuery() {
        queryTimer = null;
        if (!toQuery.size) return;
        const urls = Array.from(toQuery);
        toQuery.clear();
        urls.forEach(u => queried.add(u));
        try {
            chrome.runtime.sendMessage({action: 'visitedLinksQuery', urls: urls}, function (result) {
                if (chrome.runtime.lastError || !Array.isArray(result) || !result.length) return;
                result.forEach(u => visited.add(u));
                const hits = new Set(result);
                let marked = false;
                for (const a of document.querySelectorAll('a[href], area[href]')) {
                    const url = normalize(a.href);
                    if (url && hits.has(url)) { a.setAttribute(ATTR, ''); marked = true; }
                }
                if (marked) ensureStyle();
            });
        } catch (e) {
            // extension context invalidated (extension reloaded) - nothing to do
        }
    }

    // Called when a preview is displayed. Accepts any number of candidate urls (link href, media url, permalink...).
    function add(urls) {
        if (!enabled) return;
        const fresh = [];
        for (const raw of urls) {
            const url = normalize(raw);
            if (url && !visited.has(url)) {
                visited.add(url);
                queried.add(url);
                fresh.push(url);
            }
        }
        if (!fresh.length) return;
        if (persist) {
            try { chrome.runtime.sendMessage({action: 'visitedLinksAdd', urls: fresh}); } catch (e) {}
        }
        const set = new Set(fresh);
        let marked = false;
        for (const a of document.querySelectorAll('a[href], area[href]')) {
            const url = normalize(a.href);
            if (url && set.has(url)) { a.setAttribute(ATTR, ''); marked = true; }
        }
        if (marked) ensureStyle();
    }

    // ---- styling: clone the site's :visited rules onto [data-hz-visited] ----

    // Split a selector list on top-level commas (ignores commas inside :is(), :not(), attribute values...).
    function splitSelectorList(text) {
        const parts = [];
        let depth = 0, quote = null, start = 0;
        for (let i = 0; i < text.length; i++) {
            const c = text[i];
            if (quote) {
                if (c === '\\') i++;
                else if (c === quote) quote = null;
            } else if (c === '"' || c === "'") quote = c;
            else if (c === '\\') i++;
            else if (c === '(' || c === '[') depth++;
            else if (c === ')' || c === ']') depth--;
            else if (c === ',' && depth === 0) { parts.push(text.slice(start, i)); start = i + 1; }
        }
        parts.push(text.slice(start));
        return parts.map(s => s.trim()).filter(Boolean);
    }

    function rewriteStyleRule(rule) {
        const sel = rule.selectorText;
        if (!sel || sel.indexOf(':visited') === -1) return '';
        const selectors = splitSelectorList(sel)
            .filter(s => s.indexOf(':visited') !== -1)
            .map(s => s.replace(/:visited\b/g, MARK));
        if (!selectors.length) return '';
        const decls = [];
        const style = rule.style;
        for (let i = 0; i < style.length; i++) {
            const prop = style[i];
            if (!VISITED_PROPS.has(prop)) continue;
            const value = style.getPropertyValue(prop);
            if (!value) continue;
            decls.push(prop + ':' + value + (style.getPropertyPriority(prop) ? ' !important' : ''));
        }
        if (!decls.length) return '';
        return selectors.join(',') + '{' + decls.join(';') + '}';
    }

    function rewriteRules(rules) {
        let out = '';
        for (const rule of rules) {
            if (rule instanceof CSSStyleRule) {
                out += rewriteStyleRule(rule);
            } else if (rule instanceof CSSImportRule) {
                if (rule.styleSheet) out += rewriteSheet(rule.styleSheet) || '';
            } else if (rule.cssRules) {
                const inner = rewriteRules(rule.cssRules);
                if (!inner) continue;
                if (rule instanceof CSSMediaRule) out += '@media ' + rule.media.mediaText + '{' + inner + '}';
                else if (rule instanceof CSSSupportsRule) out += '@supports ' + rule.conditionText + '{' + inner + '}';
                else if (typeof CSSLayerBlockRule !== 'undefined' && rule instanceof CSSLayerBlockRule) out += '@layer ' + rule.name + '{' + inner + '}';
                else if (typeof CSSContainerRule !== 'undefined' && rule instanceof CSSContainerRule) out += '@container ' + rule.conditionText + '{' + inner + '}';
                else out += inner;
            }
        }
        return out;
    }

    // Returns rewritten css, or null if the sheet is cross-origin (cssRules not readable).
    function rewriteSheet(sheet) {
        let rules;
        try {
            rules = sheet.cssRules;
        } catch (e) {
            return null;
        }
        return rules ? rewriteRules(rules) : '';
    }

    function fetchCrossOriginSheet(href) {
        return new Promise(resolve => {
            try {
                chrome.runtime.sendMessage({action: 'visitedLinksFetchCss', url: href}, function (text) {
                    if (chrome.runtime.lastError || typeof text !== 'string') return resolve('');
                    try {
                        const sheet = new CSSStyleSheet();
                        sheet.replaceSync(text); // @import rules are ignored, which is fine
                        resolve(rewriteRules(sheet.cssRules));
                    } catch (e) {
                        resolve('');
                    }
                });
            } catch (e) {
                resolve('');
            }
        });
    }

    async function buildCss() {
        let css = '';
        const pending = [];
        const sheets = Array.from(document.styleSheets).concat(Array.from(document.adoptedStyleSheets || []));
        for (const sheet of sheets) {
            if (sheet.ownerNode && sheet.ownerNode.id === STYLE_ID) continue;
            if (sheet.disabled) continue;
            if (sheet.href && sheetCache.has(sheet.href)) {
                pending.push(sheetCache.get(sheet.href));
                continue;
            }
            const text = rewriteSheet(sheet);
            if (text !== null) {
                css += text;
            } else if (sheet.href) {
                if (!sheetCache.has(sheet.href)) sheetCache.set(sheet.href, fetchCrossOriginSheet(sheet.href));
                pending.push(sheetCache.get(sheet.href));
            }
        }
        for (const text of await Promise.all(pending)) css += text;
        // Behaves like the UA default for visited links: loses to any author color rule.
        css = ':where(a' + MARK + ', area' + MARK + '){color:VisitedText}' + css;
        if (forcedColor) css += MARK + ',' + MARK + ' *{color:' + forcedColor + ' !important}';
        return css;
    }

    async function restyle() {
        restyleTimer = null;
        styleDirty = false;
        const css = await buildCss();
        if (!styleEl || !styleEl.isConnected) {
            styleEl = document.createElement('style');
            styleEl.id = STYLE_ID;
        }
        styleEl.textContent = css;
        // keep it last so it wins ties with the rules it was cloned from
        const parent = document.head || document.documentElement;
        if (styleEl.parentNode !== parent || styleEl !== parent.lastElementChild) parent.appendChild(styleEl);
    }

    function ensureStyle() {
        if (!styleDirty && styleEl && styleEl.isConnected) return;
        if (!restyleTimer) restyleTimer = setTimeout(restyle, 0);
    }

    function invalidateStyle() {
        styleDirty = true;
        if (!styleEl) return; // nothing marked yet, build lazily
        clearTimeout(restyleTimer);
        restyleTimer = setTimeout(restyle, 300);
    }

    // ---- lifecycle ----

    function onMutations(mutations) {
        for (const m of mutations) {
            if (m.type === 'attributes') {
                if (m.target.nodeType === 1 && m.target.matches('a[href], area[href]')) {
                    m.target.removeAttribute(ATTR);
                    scan(m.target);
                }
                continue;
            }
            for (const node of m.addedNodes) {
                if (node.nodeType !== 1 || node === styleEl) continue;
                if (node.nodeName === 'LINK' || node.nodeName === 'STYLE') invalidateStyle();
                else scan(node);
            }
        }
    }

    function start() {
        if (observer || !document.documentElement) return;
        observer = new MutationObserver(onMutations);
        observer.observe(document.documentElement, {childList: true, subtree: true, attributes: true, attributeFilter: ['href']});
        scan(document.documentElement);
        // stylesheets loaded after DOMContentLoaded
        window.addEventListener('load', invalidateStyle, {once: true});
    }

    function stop() {
        if (observer) observer.disconnect();
        observer = null;
        if (styleEl) styleEl.remove();
        styleEl = null;
        document.querySelectorAll(MARK).forEach(a => a.removeAttribute(ATTR));
    }

    function init(options) {
        const wasEnabled = enabled;
        enabled = !!(options && options.extensionEnabled !== false && options.markVisitedLinks);
        persist = !chrome.extension.inIncognitoContext;
        const color = ((options && options.visitedLinksColor) || '').trim();
        const colorChanged = color !== forcedColor;
        forcedColor = color && CSS.supports('color', color) ? color : '';
        if (!enabled) { if (wasEnabled) stop(); return; }
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
        else start();
        if (colorChanged) invalidateStyle();
    }

    return {init: init, add: add, scan: scan, ATTR: ATTR};
})();
