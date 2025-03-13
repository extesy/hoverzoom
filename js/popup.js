var options,
    siteHostname,
    actionKeys = ['actionKey', 'toggleKey', 'closeKey', 'hideKey', 'banKey', 'openImageInWindowKey', 'openImageInTabKey', 'lockImageKey', 'saveImageKey', 'fullZoomKey', 'prevImgKey', 'nextImgKey', 'flipImageKey', 'rotateImageKey', 'copyImageKey', 'copyImageUrlKey'];

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

async function saveOptions() {
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

    let rightButtonActive = false;
    let middleButtonActive = false;
    options.rightShortClickAndHold = false;
    options.middleShortClickAndHold = false;
    options.rightShortClick = false;
    options.middleShortClick = false;

    actionKeys.forEach(function(key) {
        var id = key[0].toUpperCase() + key.substring(1);
        options[key] = parseInt($('#sel' + id).val());

        switch (options[key]) {
            case -3:
                options.rightShortClick = true;
            case -1:
                if (rightButtonActive) // if both selected
                    options.rightShortClickAndHold = true;
                else
                    rightButtonActive = true;
                break;
            case -4:
                options.middleShortClick = true;
            case -2:
                if (middleButtonActive) // if both selected
                    options.middleShortClickAndHold = true;
                else
                    middleButtonActive = true;
                break;
            default:
        }
    });

    await optionsStorageSet(options);
    sendOptions(options);
    // await restoreOptions();
    return false;
}

// Restores options from factory settings
async function restoreOptionsFromFactorySettings() {
    await restoreOptions(Object.assign({}, factorySettings));
}

// Restores options from localStorage.
async function restoreOptions(optionsFromFactorySettings) {
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
        options = await loadOptions();
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

    let rightButtonActive = false;
    let middleButtonActive = false;
    options.rightShortClickAndHold = false;
    options.middleShortClickAndHold = false;
    options.rightShortClick = false;
    options.middleShortClick = false;

    actionKeys.forEach(function(key) {
        var id = key[0].toUpperCase() + key.substring(1);
        $('#sel' + id).val(options[key]);
        if ($('#sel' + id)[0].dataset.val0 == undefined) $('#sel' + id)[0].dataset.val0 = options[key];
        else $('#sel' + id)[0].dataset.val1 = options[key];

        switch (options[key]) {
            case -3:
                options.rightShortClick = true;
            case -1:
                if (rightButtonActive) { // if both selected
                    options.rightShortClickAndHold = true;
                } else {
                    rightButtonActive = true;
                }
                break;
            case -4:
                options.middleShortClick = true;
            case -2:
                if (middleButtonActive) { // if both selected
                    options.middleShortClickAndHold = true;
                } else {
                    middleButtonActive = true;
                }
                break;
            default:
        }
    });

    checkModifications();
    return false;
}

function selKeyOnChange(event) {
    const noneKey = '0'; // sel key code for 'none'
    let currSel = $(event.target);
    if (currSel[0].dataset.val0 == undefined) return; // event fired before init
    currSel[0].dataset.val1 = currSel.val();
    checkModification(currSel);
    if (currSel.val() != noneKey) {
        $('.actionKey').each(function () {
            if (!$(this).is(currSel) && $(this).val() == currSel.val()) {
                $(this).val(noneKey);
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

$(async function () {
    initActionKeys();
    i18n();
    options = await loadOptions();
    chkDarkMode();

    $('#btnSave').click(function() { removeModifications(); saveOptions().then(() => displayMsg(Saved)); return false; }); // "return false" needed to prevent page scroll
    $('#btnCancel').click(function() { removeModifications(); restoreOptions().then(() => displayMsg(Cancel)); return false; });
    $('#btnReset').click(function() { restoreOptionsFromFactorySettings().then(() => displayMsg(Reset)); return false; });

    $('.actionKey').change(selKeyOnChange);

    setTabHook(options);
    $('#chkExcludeSite').parent().on('gumby.onChange', chkExcludeSiteOnChange);

    await restoreOptions();
    chrome.runtime.onMessage.addListener(onMessage);
});

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
