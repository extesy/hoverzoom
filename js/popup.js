var options,
    siteHostname,
    prgPreloading, lblPreloading, aPreload,
    VK_CTRL = 1024,
    VK_SHIFT = 2048,
    actionKeys = ['actionKey', 'toggleKey', 'closeKey', 'hideKey', 'openImageInWindowKey', 'openImageInTabKey', 'lockImageKey', 'saveImageKey', 'fullZoomKey', 'prevImgKey', 'nextImgKey', 'flipImageKey', 'copyImageKey', 'copyImageUrlKey'];

function keyCodeToString(key) {
    var s = '';
    if (key & VK_CTRL) {
        s += 'Ctrl+';
        key &= ~VK_CTRL;
    }
    if (key & VK_SHIFT) {
        s += 'Shift+';
        key &= ~VK_SHIFT;
    }
    if (key >= 65 && key < 91) {
        s += String.fromCharCode('A'.charCodeAt(0) + key - 65);
    } else if (key >= 112 && key < 124) {
        s += 'F' + (key - 111);
    }
    return s;
}

// Options that are only enabled for Chromium-based browsers
const chromiumOnly = ['copyImageKey', 'copyImageUrlKey'];

function initActionKeys() {
    actionKeys
    .filter(key => isChromiumBased || !chromiumOnly.includes(key))
    .forEach(key => {
        var id = key[0].toUpperCase() + key.substr(1);
        var title = chrome.i18n.getMessage("opt" + id + "Title");
        var description = "opt" + id + "Description";
        $('<tr><td class="ttip" data-i18n-tooltip="' + description + '">' + title + '</td>' + '<td><select id="sel' + id + '" class="actionKey picker"/></td></tr>').appendTo($('#tableActionKeys'));
        loadKeys($('#sel' + id));
    });
}

function loadKeys(sel) {
    $('<option value="0">None</option>').appendTo(sel);
    if (sel.attr('id') != 'lockImageKey')
        $('<option value="-1">Right Click</option>').appendTo(sel);
    if (sel.attr('id') != 'selOpenImageInTabKey')
        $('<option value="16">Shift</option>').appendTo(sel);
    $('<option value="17">Ctrl</option>').appendTo(sel);
    if (navigator.appVersion.indexOf('Macintosh') > -1) {
        $('<option value="91">Command</option>').appendTo(sel);
    }
    for (var i = 65; i < 91; i++) {
        $('<option value="' + i + '">&#' + i + ';</option>').appendTo(sel);
    }
    for (var i = 112; i < 124; i++) {
        $('<option value="' + i + '">F' + (i - 111) + '</option>').appendTo(sel);
    }
    $('<option value="27">Escape</option>').appendTo(sel);
    $('<option value="33">Page Up</option>').appendTo(sel);
    $('<option value="34">Page Down</option>').appendTo(sel);
    $('<option value="35">End</option>').appendTo(sel);
    $('<option value="36">Home</option>').appendTo(sel);
    $('<option value="37">Left</option>').appendTo(sel);
    $('<option value="38">Up</option>').appendTo(sel);
    $('<option value="39">Right</option>').appendTo(sel);
    $('<option value="40">Down</option>').appendTo(sel);
    $('<option value="45">Insert</option>').appendTo(sel);
    $('<option value="46">Delete</option>').appendTo(sel);
}

// Saves options to localStorage.
// TODO: Migrate to https://developer.chrome.com/extensions/storage
function saveOptions() {

    // Get the excluded site index if it has already been added
    var excludedSiteIndex = -1;
    for (var i = 0; i < options.excludedSites.length; i++) {
        if (options.excludedSites[i] == siteHostname) {
            excludedSiteIndex = i;
            break;
        }
    }

    if ($('#chkExcludeSite')[0].checked) {
        if (excludedSiteIndex == -1)
            options.excludedSites.push(siteHostname);
    } else {
        if (excludedSiteIndex > -1)
            options.excludedSites.splice(excludedSiteIndex, 1);
    }

    actionKeys.forEach(function(key) {
        var id = key[0].toUpperCase() + key.substr(1);
        options[key] = parseInt($('#sel' + id).val());
    });

    localStorage.options = JSON.stringify(options);
    sendOptions(options);
    restoreOptions();
    return false;
}

// Restores options from factory settings
function restoreOptionsFromFactorySettings() {
    restoreOptions(Object.assign({}, factorySettings));
}

// Restores options from localStorage.
function restoreOptions(optionsFromFactorySettings) {

    if (optionsFromFactorySettings) {
        // only reset popup settings (actions keys & excluded site)
        // other settings are not reset
        let excludedSiteIndex = -1;
        for (var i = 0; i < options.excludedSites.length; i++) {
            if (options.excludedSites[i] == siteHostname) {
                excludedSiteIndex = i;
                break;
            }
        }
        if (excludedSiteIndex > -1)
            options.excludedSites.splice(excludedSiteIndex, 1);

        actionKeys.forEach(function(key) {
            options[key] = optionsFromFactorySettings[key];
        });

    } else {
        options = loadOptions();
    }

    // update display
    chrome.tabs.query({active: true, currentWindow: true}, function (tabArr) {
        var tab = tabArr[0];
        if (options.whiteListMode) {
            $('#chkExcludeSite').trigger(isExcludedSite(tab.url) ? 'gumby.uncheck' : 'gumby.check');
            if ($('#chkExcludeSite')[0].dataset.val0 == undefined) $('#chkExcludeSite')[0].dataset.val0 = (isExcludedSite(tab.url) ? 'unchecked' : 'checked');
            else $('#chkExcludeSite')[0].dataset.val1 = (isExcludedSite(tab.url) ? 'unchecked' : 'checked');
        }
        else {
            $('#chkExcludeSite').trigger(isExcludedSite(tab.url) ? 'gumby.check' : 'gumby.uncheck');
            if ($('#chkExcludeSite')[0].dataset.val0 == undefined) $('#chkExcludeSite')[0].dataset.val0 = (isExcludedSite(tab.url) ? 'checked' : 'unchecked');
            else $('#chkExcludeSite')[0].dataset.val1 = (isExcludedSite(tab.url) ? 'checked' : 'unchecked');
        }
    });

    actionKeys.forEach(function(key) {
        var id = key[0].toUpperCase() + key.substr(1);
        $('#sel' + id).val(options[key]);
        if ($('#sel' + id)[0].dataset.val0 == undefined) $('#sel' + id)[0].dataset.val0 = options[key];
        else $('#sel' + id)[0].dataset.val1 = options[key];
    });

    checkModifications();
    return false;
}

function selKeyOnChange(event) {
    var currSel = $(event.target);
    if (currSel[0].dataset.val0 == undefined) return; // event fired before init
    currSel[0].dataset.val1 = currSel.val();
    checkModification(currSel);
    if (currSel.val() != '0') {
        $('.actionKey').each(function () {
            if (!$(this).is(currSel) && $(this).val() == currSel.val()) {
                $(this).val('0');
                $(this)[0].dataset.val1 = $(this).val();
                checkModification($(this));
            }
        });
    }
}

function chkExcludeSiteOnChange(event) {
    let checkbox = $(event.target).find('input')[0];
    if (checkbox.dataset.val0 == undefined) return; // event fired before init
    checkbox.dataset.val1 = (checkbox.checked ? 'checked' : 'unchecked');
    checkModification($(checkbox));
}

const Saved = Symbol("saved");
const Cancel = Symbol("cancel");
const Reset = Symbol("reset");
function displayMsg(msg) {
    switch (msg)  {
        case Saved:
            $('#msgtxt').removeClass().addClass('centered text-center alert success').text(chrome.i18n.getMessage('optSaved')).clearQueue().animate({opacity:1}, 500).delay(5000).animate({opacity:0}, 500);
            break;
        case Cancel:
            $('#msgtxt').removeClass().addClass('centered text-center alert warning').text(chrome.i18n.getMessage('optCancel')).clearQueue().animate({opacity:1}, 500).delay(5000).animate({opacity:0}, 500);
            break;
        case Reset:
            $('#msgtxt').removeClass().addClass('centered text-center alert info').text(chrome.i18n.getMessage('optReset')).clearQueue().animate({opacity:1}, 500).delay(5000).animate({opacity:0}, 500);
            break;
        default:
            break;
    }
}

$(function () {
    initActionKeys();
    i18n();
    options = loadOptions();
    chkDarkMode();

    $('#btnSave').click(function() { removeModifications(); saveOptions(); displayMsg(Saved); return false; }); // "return false" needed to prevent page scroll
    $('#btnCancel').click(function() { removeModifications(); restoreOptions(); displayMsg(Cancel); return false; });
    $('#btnReset').click(function() { restoreOptionsFromFactorySettings(); displayMsg(Reset); return false; });

    $('.actionKey').change(selKeyOnChange);

    chrome.permissions.contains({permissions: ['tabs']}, function (granted) {
        if (granted) {
            setTabHook(options);
            $('#chkExcludeSite').parent().on('gumby.onChange', chkExcludeSiteOnChange);
        } else {
            $('#lblToggle').text(chrome.i18n.getMessage('popAllowPerSiteToggle'));
            $('#chkExcludeSite').parent().on('gumby.onChange', askTabsPermissions);
        }
    });

    restoreOptions();
    chrome.runtime.onMessage.addListener(onMessage);
});

function askTabsPermissions() {
    chrome.permissions.contains({permissions: ['tabs']}, function (granted) {
        if (!granted) {
            chrome.permissions.request({permissions: ['tabs']}, function (granted) {
                if (granted) {
                    setTabHook(options);
                    location.reload();
                }
            });
        }
    });
}

function setTabHook(options) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabArr) {
        var tab = tabArr[0];
        siteHostname = new URL(tab.url)['hostname'];
        if (siteHostname.substr(0, 4) === 'www.')
            siteHostname = siteHostname.substr(4);
        $('#lblToggle').text(chrome.i18n.getMessage(options.whiteListMode ? 'popEnableForSite' : 'popDisableForSite'));
        $('#lblSite').removeClass().addClass(options.whiteListMode ? 'enableForSite' : 'disableForSite').text(siteHostname);
        $('#chkExcludeSite')[0].checked = (options.whiteListMode ? !isExcludedSite(tab.url) : isExcludedSite(tab.url));
        $('input:checked').trigger('gumby.check');
    });
}

function onMessage(message, sender, callback) {
    switch (message.action) {
        case 'optionsChanged':
            restoreOptions();
            break;
        case 'askTabsPermissions':
            chrome.permissions.request({permissions: ['tabs']}, function (granted) {
                callback(granted);
            });
            break;
    }
}

// highlight item if modified, unhighlight if not modified
function checkModification(item) {
    if (item[0].dataset.val1 == undefined) return;
    let highlight = (item[0].dataset.val0 != item[0].dataset.val1 ? true : false);

    // choose which control to highlight/unhighlight depending on item's type
    switch (item[0].type) {
        case 'checkbox':
            if (highlight) item.siblings('span').addClass('modified');
            else item.siblings('span').removeClass('modified');
            break;
        case 'select-one':
            if (highlight) item.addClass('modified');
            else item.removeClass('modified');
            break;
        default:
            break;
    }
}

// highlight/unhighlight all items
function checkModifications() {
    $('[data-val0]').each(function() { checkModification($(this)); });
}

function removeModifications() {
    $('.modified').removeClass('modified');
    $('[data-val0]').each(function() { delete $(this)[0].dataset.val0; });
    $('[data-val1]').each(function() { delete $(this)[0].dataset.val1; });
}
