var options,
    hoverZoomPlugins = hoverZoomPlugins || [],
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
        var title = browser.i18n.getMessage("opt" + id + "Title");
        var description = browser.i18n.getMessage("opt" + id + "Description");
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
// TODO: Migrate to https://developer.chrome.com/extensions/storage
function saveOptions() {
    options.extensionEnabled = $('#chkExtensionEnabled')[0].checked;
    options.zoomFactor = $('#txtZoomFactor')[0].value;
    options.zoomVideos = $('#chkZoomVideos')[0].checked;
    options.videoPositionStep = $('#txtVideoPositionStep')[0].value;
    options.muteVideos = $('#chkMuteVideos')[0].checked;
    options.videoTimestamp = $('#chkVideoTimestamp')[0].checked;
    options.videoVolume = $('#txtVideoVolume')[0].value / 100;
    options.mouseUnderlap = $('#chkMouseUnderlap')[0].checked;
    options.pageActionEnabled = $('#chkPageActionEnabled')[0].checked;
    options.showWhileLoading = $('#chkShowWhileLoading')[0].checked;
    options.showHighRes = $('#chkShowHighRes')[0].checked;
    options.galleriesMouseWheel = $('#chkGalleriesMouseWheel')[0].checked;
    options.disableMouseWheelForVideo = $('#chkDisableMouseWheelForVideo')[0].checked;
    options.displayDelay = getMilliseconds($('#txtDisplayDelay'));
    options.displayDelayVideo = getMilliseconds($('#txtDisplayDelayVideo'));
    options.fadeDuration = getMilliseconds($('#txtFadeDuration'));
    options.ambilightEnabled = $('#chkAmbilightEnabled')[0].checked;
    options.centerImages = $('#chkCenterImages')[0].checked;

    options.whiteListMode = $('#chkWhiteListMode')[0].checked;
    options.excludedSites = [];
    $('#selExcludedSites').find('span').each(function () {
        options.excludedSites.push($(this).text());
    });

    options.disabledPlugins = [];
    $('.chkPlugin').each(function () {
        var self = $(this);
        if (!self.is(':checked')) options.disabledPlugins.push(self.attr('id').substr('chkPlugin'.length));
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
    options.picturesOpacity = $('#txtPicturesOpacity')[0].value / 100;
    options.captionLocation = $('#selectCaptionLocation').val();

    localStorage.options = JSON.stringify(options);
    sendOptions(options);
    restoreOptions();
    $('#messages').clearQueue().animate({opacity:1}, 500).delay(5000).animate({opacity:0}, 500);
    return false;
}

// Restores options from localStorage.
function restoreOptions() {
    options = loadOptions();

    $('#chkExtensionEnabled')[0].checked = options.extensionEnabled;
    $('#txtZoomFactor')[0].value = options.zoomFactor;
    $('#chkZoomVideos')[0].checked = options.zoomVideos;
    $('#txtVideoPositionStep')[0].value = options.videoPositionStep;
    $('#chkMuteVideos')[0].checked = options.muteVideos;
    $('#chkVideoTimestamp')[0].checked = options.videoTimestamp;
    $('#rngVideoVolume').val(options.videoVolume * 100);
    $('#txtVideoVolume').val(options.videoVolume * 100);
    $('#chkMouseUnderlap')[0].checked = options.mouseUnderlap;
    $('#chkPageActionEnabled')[0].checked = options.pageActionEnabled;
    $('#chkShowWhileLoading')[0].checked = options.showWhileLoading;
    $('#chkShowHighRes')[0].checked = options.showHighRes;
    $('#chkGalleriesMouseWheel')[0].checked = options.galleriesMouseWheel;
    $('#chkDisableMouseWheelForVideo')[0].checked = options.disableMouseWheelForVideo;
    $('#txtDisplayDelay').val((options.displayDelay || 0) / 1000);
    $('#txtDisplayDelayVideo').val((options.displayDelayVideo || 0) / 1000);
    $('#txtFadeDuration').val((options.fadeDuration || 0) / 1000);
    $('#chkAmbilightEnabled')[0].checked = options.ambilightEnabled;
    $('#chkCenterImages')[0].checked = options.centerImages;
    $('#selectCaptionLocation').val(options.captionLocation);

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
    $('#lblToggle').text(browser.i18n.getMessage($('#chkWhiteListMode')[0].checked ? "optSectionSitesEnabled" : "optSectionSitesDisabled"));
}

function chkAddToHistoryModeOnChange() {
    if ($('#chkAddToHistory')[0].checked) {
        browser.permissions.contains({permissions: ['history']}, function (granted) {
            if (!granted) {
                browser.permissions.request({permissions: ['history']}, function (granted) {
                    if (!granted) {
                        $("#chkAddToHistory").trigger('gumby.uncheck');
                    }
                });
            }
        });
    }
}

function percentageOnChange() {
    var value = parseInt(this.value);
    if (isNaN(value)) value = 100;
    if (value < 1) value = 1;
    if (value > 100) value = 100;
    this.value = value;
}

function updateTxtVideoVolume() {
    $('#txtVideoVolume')[0].value = this.value;
}

function onMessage(message, sender, callback) {
    switch (message.action) {
        case 'optionsChanged':
            restoreOptions();
            break;
    }
}

function getPlugins(callback) {
    browser.runtime.getPackageDirectoryEntry(function(root) {
        root.getDirectory("plugins", {create: false}, function(pluginsdir) {
            var reader = pluginsdir.createReader();
            var entries = [];
            var readEntries = function() {
                reader.readEntries(function(results) {
                    if (results.length) {
                        entries = entries.concat(results.map(function(de){return de.name;}));
                        readEntries();
                    } else {
                        callback(entries);
                    }
                });
            };
            readEntries();
        });
    });
}

function loadPlugins() {
    getPlugins(function(plugins) {
        plugins.forEach(function(plugin) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = '../plugins/' + plugin;
            document.body.appendChild(script);
        });
        window.setTimeout(populatePluginsTable, 500);
    });
}

function populatePluginsTable() {
    var plugins = $.unique(hoverZoomPlugins.map(function(plugin) {return plugin.name}));
    plugins.forEach(function(plugin) {
        var chkName = 'chkPlugin' + plugin.replace(/[^\w]/g, '').toLowerCase();
        $('<div class="field"><label class="checkbox" for="' + chkName + '"><input type="checkbox" id="' + chkName + '" class="chkPlugin"><span></span>&nbsp;<div style="display:inline">' + plugin + '</div></label></div>').appendTo('#tblPlugins');
        $('#' + chkName)[0].checked = !options.disabledPlugins.includes(chkName.substr('chkPlugin'.length));
    });
    Gumby.initialize('checkbox');
}

$(function () {
    initActionKeys();
    i18n();
    chkWhiteListModeOnChange();
    $("#version").text(browser.i18n.getMessage("optFooterVersionCopyright", browser.app.getDetails().version));

    $('#btnSave').click(saveOptions);
    $('#btnReset').click(restoreOptions);
    $('#chkWhiteListMode').parent().on('gumby.onChange', chkWhiteListModeOnChange);
    $('#chkAddToHistory').parent().on('gumby.onChange', chkAddToHistoryModeOnChange);
    $('#txtZoomFactor').change(percentageOnChange);
    $('#txtPicturesOpacity').change(percentageOnChange);
    $('#rngVideoVolume').on('input change', updateTxtVideoVolume);
    $('#txtVideoVolume').change(percentageOnChange);
    $('#txtVideoPositionStep').change(percentageOnChange);
    $('.actionKey').change(selKeyOnChange);
    $('#btnAddExcludedSite').click(btnAddExcludedSiteOnClick);
    $('#btnRemoveExcludedSite').click(btnRemoveExcludedSiteOnClick);
    $('#aShowUpdateNotification').click(showUpdateNotification);

    restoreOptions();
    loadPlugins();

    browser.runtime.onMessage.addListener(onMessage);
});
