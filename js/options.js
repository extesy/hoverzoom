var options,
    VK_CTRL = 1024,
    VK_SHIFT = 2048,
    actionKeys = ['actionKey', 'hideKey', 'openImageInWindowKey', 'openImageInTabKey', 'saveImageKey', 'fullZoomKey', 'prevImgKey', 'nextImgKey'];

function getMilliseconds(ctrl) {
    var value = parseFloat(ctrl.val());
    value = isNaN(value) ? 0 : value * 1000;
    ctrl.val(value / 1000);
    return value;
}

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

function initActionKeys() {
    actionKeys.forEach(function(key) {
        var id = key[0].toUpperCase() + key.substr(1);
        console.log(id);
        var title = chrome.i18n.getMessage("opt" + id + "Title");
        var description = chrome.i18n.getMessage("opt" + id + "Description");
        $('<tr><td>' + title + '<p>' + description + '</p></td>' +
            '<td><select id="sel' + id + '" class="actionKey"/></td></tr>').appendTo($('#tableActionKeys'));
        loadKeys($('#sel' + id));
    });
}

function loadKeys(sel) {
    $('<option value="0">None</option>').appendTo(sel);
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
function saveOptions() {
    options.extensionEnabled = $('#chkExtensionEnabled')[0].checked;
    options.zoomVideos = $('#chkZoomVideos')[0].checked;
    options.muteVideos = $('#chkMuteVideos')[0].checked;
    options.mouseUnderlap = $('#chkMouseUnderlap')[0].checked;
    options.pageActionEnabled = $('#chkPageActionEnabled')[0].checked;
    options.showCaptions = $('#chkShowCaptions')[0].checked;
    options.showWhileLoading = $('#chkShowWhileLoading')[0].checked;
    options.showHighRes = $('#chkShowHighRes')[0].checked;
    options.galleriesMouseWheel = $('#chkGalleriesMouseWheel')[0].checked;
    options.displayDelay = getMilliseconds($('#txtDisplayDelay'));
    options.fadeDuration = getMilliseconds($('#txtFadeDuration'));

    options.whiteListMode = $('#chkWhiteListMode')[0].checked;
    options.excludedSites = [];
    $('#selExcludedSites').find('span').each(function () {
        options.excludedSites.push($(this).text());
    });

    actionKeys.forEach(function(key) {
        var id = key[0].toUpperCase() + key.substr(1);
        options[key] = parseInt($('#sel' + id).val());
    });

    options.updateNotifications = $('#chkUpdateNotifications')[0].checked;
    options.addToHistory = $('#chkAddToHistory')[0].checked;
    options.filterNSFW = $('#chkFilterNSFW')[0].checked;
    options.alwaysPreload = $('#chkAlwaysPreload')[0].checked;
    options.enableGalleries = $('#chkEnableGalleries')[0].checked;
    options.enableStats = $('#chkEnableStats')[0].checked;
    options.picturesOpacity = $('#txtPicturesOpacity')[0].value / 100;

    localStorage.options = JSON.stringify(options);  // TODO: Migrate to https://developer.chrome.com/extensions/storage
    sendOptions(options);
    restoreOptions();
    $('#messages').clearQueue().animate({opacity:1}, 500).delay(5000).animate({opacity:0}, 500);
    return false;
}

// Restores options from localStorage.
function restoreOptions() {
    options = loadOptions();

    $('#chkExtensionEnabled')[0].checked = options.extensionEnabled;
    $('#chkZoomVideos')[0].checked = options.zoomVideos;
    $('#chkMuteVideos')[0].checked = options.muteVideos;
    $('#chkMouseUnderlap')[0].checked = options.mouseUnderlap;
    $('#chkPageActionEnabled')[0].checked = options.pageActionEnabled;
    $('#chkShowCaptions')[0].checked = options.showCaptions;
    $('#chkShowWhileLoading')[0].checked = options.showWhileLoading;
    $('#chkShowHighRes')[0].checked = options.showHighRes;
    $('#chkGalleriesMouseWheel')[0].checked = options.galleriesMouseWheel;
    $('#txtDisplayDelay').val((options.displayDelay || 0) / 1000);
    $('#txtFadeDuration').val((options.fadeDuration || 0) / 1000);

    $('#chkWhiteListMode')[0].checked = options.whiteListMode;
    $('#selExcludedSites').empty();
    for (var i = 0; i < options.excludedSites.length; i++) {
        appendExcludedSite(options.excludedSites[i]);
    }

    actionKeys.forEach(function(key) {
        var id = key[0].toUpperCase() + key.substr(1);
        $('#sel' + id).val(options[key]);
    });

    $('#chkUpdateNotifications')[0].checked = options.updateNotifications;
    $('#chkAddToHistory')[0].checked = options.addToHistory;
    $('#chkFilterNSFW')[0].checked = options.filterNSFW;

    $('#chkAlwaysPreload')[0].checked = options.alwaysPreload;
    $('#chkEnableGalleries')[0].checked = options.enableGalleries;
    $('#chkEnableStats')[0].checked = options.enableStats;
    $('#txtPicturesOpacity').val(options.picturesOpacity * 100);

    $('input:checked').trigger('gumby.check');
    return false;
}

function btnAddExcludedSiteOnClick() {
    var field = $('#txtAddExcludedSite');
    var site = field.val().trim().toLowerCase().replace(/.*:\/\//, '');
    if (site) appendExcludedSite(site);
    field.val('').focus();
    return false;
}

function appendExcludedSite(site) {
    $('<li><a href="#"><i class="icon-cancel"></i></a> <span>' + site + '</span></li>').appendTo('#selExcludedSites').find('a').on('click', btnRemoveExcludedSiteOnClick);
}

function btnRemoveExcludedSiteOnClick() {
    $(this).parent().remove();
    return false;
}

function selKeyOnChange(event) {
    var currSel = $(event.target);
    if (currSel.val() != '0') {
        $('.actionKey').each(function () {
            if (!$(this).is(currSel) && $(this).val() == currSel.val()) {
                $(this).val('0').effect("highlight", {color:'red'}, 5000);
            }
        });
    }
}

function chkWhiteListModeOnChange() {
    if ($('#chkWhiteListMode')[0].checked) {
        $('#dis-enabled').text('enabled');
    } else {
        $('#dis-enabled').text('disabled');
    }
}

function chkAddToHistoryModeOnChange() {
    if ($('#chkAddToHistory')[0].checked) {
        chrome.permissions.contains({permissions: ['history']}, function (granted) {
            if (!granted) {
                chrome.permissions.request({permissions: ['history']}, function (granted) {
                    if (!granted) {
                        $("#chkAddToHistory").trigger('gumby.uncheck');
                    }
                });
            }
        });
    }
}

function txtPicturesOpacityOnChange() {
    var value = parseInt(this.value);
    if (isNaN(value)) value = 100;
    if (value < 0) value = 0;
    if (value > 100) value = 100;
    this.value = value;
}

function onMessage(message, sender, callback) {
    switch (message.action) {
        case 'optionsChanged':
            restoreOptions();
            break;
    }
}

$(function () {
    initActionKeys();
    i18n();
    $('#btnSave').click(saveOptions);
    $('#btnReset').click(restoreOptions);
    $('#chkWhiteListMode').parent().on('gumby.onChange', chkWhiteListModeOnChange);
    $('#chkAddToHistory').parent().on('gumby.onChange', chkAddToHistoryModeOnChange);
    $('#txtPicturesOpacity').change(txtPicturesOpacityOnChange);
    $('.actionKey').change(selKeyOnChange);
    $('#btnAddExcludedSite').click(btnAddExcludedSiteOnClick);
    $('#btnRemoveExcludedSite').click(btnRemoveExcludedSiteOnClick);
    $('#aShowUpdateNotification').click(showUpdateNotification);
    restoreOptions();
    chrome.runtime.onMessage.addListener(onMessage);
    $('#versionNumber').text(chrome.app.getDetails().version);
});
