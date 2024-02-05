var options,
    hoverZoomPlugins = hoverZoomPlugins || [],
    VK_CTRL = 1024,
    VK_SHIFT = 2048,
    actionKeys = ['actionKey', 'toggleKey', 'closeKey', 'hideKey', 'openImageInWindowKey', 'openImageInTabKey', 'lockImageKey', 'saveImageKey', 'fullZoomKey', 'prevImgKey', 'nextImgKey', 'flipImageKey', 'copyImageKey', 'copyImageUrlKey'];

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

// Options that are only enabled for Chromium-based browsers
const chromiumOnly = ['copyImageKey', 'copyImageUrlKey'];

function initActionKeys() {
    actionKeys
    .filter(key => isChromiumBased || !chromiumOnly.includes(key))
    .forEach(key => {
        var id = key[0].toUpperCase() + key.substr(1);
        var title = chrome.i18n.getMessage("opt" + id + "Title");
        var description = chrome.i18n.getMessage("opt" + id + "Description");
        $('<tr><td>' + title + '<p>' + description + '</p></td>' +
            '<td><select id="sel' + id + '" class="actionKey picker"/></td></tr>').appendTo($('#tableActionKeys'));
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
    $('<option value="18">Alt</option>').appendTo(sel);
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
    options.extensionEnabled = $('#chkExtensionEnabled')[0].checked;
    options.darkMode = $('#chkDarkMode')[0].checked;
    options.zoomFactor = $('#txtZoomFactor')[0].value;
    options.zoomVideos = $('#chkZoomVideos')[0].checked;
    options.videoPositionStep = $('#txtVideoPositionStep')[0].value;
    options.muteVideos = $('#chkMuteVideos')[0].checked;
    options.videoTimestamp = $('#chkVideoTimestamp')[0].checked;
    options.videoVolume = $('#txtVideoVolume')[0].value / 100;
    options.playAudio = $('#chkPlayAudio')[0].checked;
    options.audioVolume = $('#txtAudioVolume')[0].value / 100;
    options.mouseUnderlap = $('#chkMouseUnderlap')[0].checked;
    options.pageActionEnabled = $('#chkPageActionEnabled')[0].checked;
    options.showWhileLoading = $('#chkShowWhileLoading')[0].checked;
    options.showHighRes = $('#chkShowHighRes')[0].checked;
    options.galleriesMouseWheel = $('#chkGalleriesMouseWheel')[0].checked;
    options.disableMouseWheelForVideo = $('#chkDisableMouseWheelForVideo')[0].checked;
    options.displayDelay = getMilliseconds($('#txtDisplayDelay'));
    options.displayDelayVideo = getMilliseconds($('#txtDisplayDelayVideo'));
    options.fadeDuration = getMilliseconds($('#txtFadeDuration'));
    options.hideMouseCursor = $('#chkHideMouseCursor')[0].checked;
    options.hideMouseCursorDelay = getMilliseconds($('#txtHideMouseCursor'));
    options.ambilightEnabled = $('#chkAmbilightEnabled')[0].checked;
    options.ambilightHaloSize = $('#txtAmbilightHaloSize')[0].value / 100;
    options.ambilightBackgroundOpacity = $('#txtAmbilightBackgroundOpacity')[0].value / 100;
    options.centerImages = $('#chkCenterImages')[0].checked;
    options.frameBackgroundColor = $('#pickerFrameBackgroundColor')[0].value;
    options.frameThickness = $('#txtFrameThickness')[0].value;

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

    options.addToHistory = $('#chkAddToHistory')[0].checked;
    options.allowHeadersRewrite = $('#chkAllowHeadersRewrite')[0].checked;

    options.filterNSFW = $('#chkFilterNSFW')[0].checked;
    options.alwaysPreload = $('#chkAlwaysPreload')[0].checked;
    options.enableGalleries = $('#chkEnableGalleries')[0].checked;
    options.enableNoFocusMsg = $('#chkEnableNoFocusMsg')[0].checked;
    options.picturesOpacity = $('#txtPicturesOpacity')[0].value / 100;
    options.captionLocation = $('#selectCaptionLocation').val();
    options.detailsLocation = $('#selectDetailsLocation').val();
    options.fontSize = $('#txtFontSize')[0].value;
    options.fontOutline = $('#chkFontOutline')[0].checked;
    options.displayImageLoader = $('#chkDisplayImageLoader')[0].checked;
    options.downloadFolder = $('#txtDownloadFolder')[0].value;
    options.addDownloadOrigin = $('#chkAddDownloadOrigin')[0].checked;
    options.addDownloadSize = $('#chkAddDownloadSize')[0].checked;
    options.debug = $('#chkEnableDebug')[0].checked;
    options.addDownloadDuration = $('#chkAddDownloadDuration')[0].checked;
    options.useSeparateTabOrWindowForUnloadableUrlsEnabled = $('#chkUseSeparateTabOrWindowForUnloadableUrlsEnabled')[0].checked;
    options.useSeparateTabOrWindowForUnloadableUrls = $('#selectUseSeparateTabOrWindowForUnloadableUrls').val();

    localStorage.options = JSON.stringify(options);

    sendOptions(options);
    restoreOptions();

    return false;
}

function savePermissionOptions() {
    options.addToHistory = $('#chkAddToHistory')[0].checked;
    options.allowHeadersRewrite = $('#chkAllowHeadersRewrite')[0].checked;
    localStorage.options = JSON.stringify(options);
}

// Restores options from factory settings
function restoreOptionsFromFactorySettings() {
    restoreOptions(Object.assign({}, factorySettings));
}

// Restores options from localStorage.
function restoreOptions(optionsFromFactorySettings) {
    options = optionsFromFactorySettings || loadOptions();

    $('#chkExtensionEnabled').trigger(options.extensionEnabled ? 'gumby.check' : 'gumby.uncheck');
    $('#chkDarkMode').trigger(options.darkMode ? 'gumby.check' : 'gumby.uncheck');
    $('#txtZoomFactor')[0].value = options.zoomFactor;
    $('#chkZoomVideos').trigger(options.zoomVideos ? 'gumby.check' : 'gumby.uncheck');
    $('#txtVideoPositionStep')[0].value = options.videoPositionStep;
    $('#chkMuteVideos').trigger(options.muteVideos ? 'gumby.check' : 'gumby.uncheck');
    $('#chkVideoTimestamp').trigger(options.videoTimestamp ? 'gumby.check' : 'gumby.uncheck');
    $('#rngVideoVolume').val(parseInt(options.videoVolume * 100));
    $('#txtVideoVolume').val(parseInt(options.videoVolume * 100));
    $('#chkPlayAudio').trigger(options.playAudio ? 'gumby.check' : 'gumby.uncheck');
    $('#rngAudioVolume').val(parseInt(options.audioVolume * 100));
    $('#txtAudioVolume').val(parseInt(options.audioVolume * 100));
    $('#chkMouseUnderlap').trigger(options.mouseUnderlap ? 'gumby.check' : 'gumby.uncheck');
    $('#chkPageActionEnabled').trigger(options.pageActionEnabled ? 'gumby.check' : 'gumby.uncheck');
    $('#chkShowWhileLoading').trigger(options.showWhileLoading ? 'gumby.check' : 'gumby.uncheck');
    $('#chkShowHighRes').trigger(options.showHighRes ? 'gumby.check' : 'gumby.uncheck');
    $('#chkGalleriesMouseWheel').trigger(options.galleriesMouseWheel ? 'gumby.check' : 'gumby.uncheck');
    $('#chkDisableMouseWheelForVideo').trigger(options.disableMouseWheelForVideo ? 'gumby.check' : 'gumby.uncheck');
    $('#txtDisplayDelay').val((options.displayDelay || 0) / 1000);
    $('#txtDisplayDelayVideo').val((options.displayDelayVideo || 0) / 1000);
    $('#txtFadeDuration').val((options.fadeDuration || 0) / 1000);
    $('#chkHideMouseCursor').trigger(options.hideMouseCursor ? 'gumby.check' : 'gumby.uncheck');
    $('#txtHideMouseCursor').val((options.hideMouseCursorDelay || 0) / 1000);
    $('#chkAmbilightEnabled').trigger(options.ambilightEnabled ? 'gumby.check' : 'gumby.uncheck');
    $('#rngAmbilightHaloSize').val(parseInt(options.ambilightHaloSize * 100));
    $('#txtAmbilightHaloSize').val(parseInt(options.ambilightHaloSize * 100));
    $('#rngAmbilightBackgroundOpacity').val(parseInt(options.ambilightBackgroundOpacity * 100));
    $('#txtAmbilightBackgroundOpacity').val(parseInt(options.ambilightBackgroundOpacity * 100));
    $('#chkCenterImages').trigger(options.centerImages ? 'gumby.check' : 'gumby.uncheck');
    $('#pickerFrameBackgroundColor').val(options.frameBackgroundColor);
    $('#rngFrameThickness').val(parseInt(options.frameThickness));
    $('#txtFrameThickness').val(parseInt(options.frameThickness));
    $('#selectCaptionLocation').val(options.captionLocation);
    $('#selectDetailsLocation').val(options.detailsLocation);
    $('#rngFontSize').val(parseInt(options.fontSize));
    $('#txtFontSize').val(parseInt(options.fontSize));
    $('#chkFontOutline').trigger(options.fontOutline ? 'gumby.check' : 'gumby.uncheck');

    if (options.frameBackgroundColor == "") {
        initColorPicker('#ffffff');
    } else {
        initColorPicker(options.frameBackgroundColor);
    }

    if (options.ambilightEnabled) {
        $('#divAmbilight').removeClass('disabled');
    } else {
        $('#divAmbilight').addClass('disabled');
    }

    var plugins = $.unique(hoverZoomPlugins.map(function(plugin) {return plugin.name})).sort(Intl.Collator().compare);
    plugins.forEach(function(plugin) {
        var chkName = 'chkPlugin' + plugin.replace(/[^\w\-_]/g, '').toLowerCase();
        var disabled = (options.disabledPlugins.includes(chkName.substr('chkPlugin'.length)) ? true : false);
        $('#' + chkName).trigger(disabled ? 'gumby.uncheck' : 'gumby.check');
    });

    $('#chkWhiteListMode').trigger(options.whiteListMode ? 'gumby.check' : 'gumby.uncheck');

    $('#selExcludedSites').empty();
    for (var i = 0; i < options.excludedSites.length; i++) {
        appendExcludedSite(options.excludedSites[i], false);
    }

    actionKeys.forEach(function(key) {
        var id = key[0].toUpperCase() + key.substr(1);
        $('#sel' + id).val(options[key]);
    });

    $('#chkAddToHistory').trigger(options.addToHistory ? 'gumby.check' : 'gumby.uncheck');
    $('#chkAllowHeadersRewrite').trigger(options.allowHeadersRewrite ? 'gumby.check' : 'gumby.uncheck');

    $('#chkFilterNSFW').trigger(options.filterNSFW ? 'gumby.check' : 'gumby.uncheck');
    $('#chkAlwaysPreload').trigger(options.alwaysPreload ? 'gumby.check' : 'gumby.uncheck');
    $('#chkEnableGalleries').trigger(options.enableGalleries ? 'gumby.check' : 'gumby.uncheck');
    $('#chkEnableNoFocusMsg').trigger(options.enableNoFocusMsg ? 'gumby.check' : 'gumby.uncheck');
    $('#txtPicturesOpacity').val(parseInt(options.picturesOpacity * 100));
    $('#chkDisplayImageLoader').trigger(options.displayImageLoader ? 'gumby.check' : 'gumby.uncheck');
    $('#chkEnlargementThresholdEnabled').trigger(options.enlargementThresholdEnabled ? 'gumby.check' : 'gumby.uncheck');
    $('#selectEnlargementThreshold').val(options.enlargementThreshold);
    $('#chkDisplayedSizeThresholdEnabled').trigger(options.displayedSizeThresholdEnabled ? 'gumby.check' : 'gumby.uncheck');
    $('#txtDisplayedSizeThreshold').val(parseInt(options.displayedSizeThreshold));
    $('#chkZoomedSizeThresholdEnabled').trigger(options.zoomedSizeThresholdEnabled ? 'gumby.check' : 'gumby.uncheck');
    $('#txtZoomedSizeThreshold').val(parseInt(options.zoomedSizeThreshold));
    $('#txtDownloadFolder').val(options.downloadFolder);
    $('#chkAddDownloadOrigin').trigger(options.addDownloadOrigin ? 'gumby.check' : 'gumby.uncheck');
    $('#chkAddDownloadSize').trigger(options.addDownloadSize ? 'gumby.check' : 'gumby.uncheck');
    $('#chkAddDownloadDuration').trigger(options.addDownloadDuration ? 'gumby.check' : 'gumby.uncheck');
    $('#chkUseSeparateTabOrWindowForUnloadableUrlsEnabled').trigger(options.useSeparateTabOrWindowForUnloadableUrlsEnabled ? 'gumby.check' : 'gumby.uncheck');
    $('#selectUseSeparateTabOrWindowForUnloadableUrls').val(options.useSeparateTabOrWindowForUnloadableUrls);
    $('#chkEnableDebug').trigger(options.debug ? 'gumby.check' : 'gumby.uncheck');

    $('input[type=checkbox]').each(function() { initCheckBox(this) });
    $('input[type=text]:not("#txtAddExcludedSite")').each(function() { initText(this) });
    $('input[type=range]').each(function() { initRange(this) });
    $('select').each(function() { initSelect(this) });

    checkModifications();
    return false;
}

function initRange(range) {
    if (range.dataset.val0 == undefined) range.dataset.val0 = range.value;
    else range.dataset.val1 = range.value;
}

function updateRange(range) {
    if (range.dataset.val0 == undefined) return; // event fired before init
    range.dataset.val1 = range.value;
    checkModification($(range));
}

function initText(text) {
    let val = text.value.trim();
    if (text.dataset.val0 == undefined) text.dataset.val0 = val;
    else text.dataset.val1 = val;
}

function updateText(text) {
    let val = text.value.trim();
    if (text.dataset.val0 == undefined) return; // event fired before init
    text.dataset.val1 = val;
    checkModification($(text));
}

function initSelect(select) {
    if (select.dataset.val0 == undefined) select.dataset.val0 = select.value;
    else select.dataset.val1 = select.value;
}

function updateSelect(select) {
    if (select.dataset.val0 == undefined) return; // event fired before init
    select.dataset.val1 = select.value;
    checkModification($(select));
}

function initCheckBox(checkbox) {
    if (checkbox.dataset.val0 == undefined) checkbox.dataset.val0 = checkbox.checked;
    else checkbox.dataset.val1 = checkbox.checked;
}

function updateCheckBox(checkbox) {
    if ($(checkbox)[0].type != 'checkbox') checkbox = $(checkbox).find('input')[0];
    if (checkbox.dataset.val0 == undefined) return; // event fired before init
    checkbox.dataset.val1 = checkbox.checked;
    checkModification($(checkbox));
}

function btnAddExcludedSiteOnClick() {
    let field = $('#txtAddExcludedSite');
    try {
        let val = field.val().trim();
        if (val.indexOf('://') === -1)
            val = 'http://' + val;
        let site = new URL(val)['hostname'];
        if (site.substr(0, 4) === 'www.')
            site = site.substr(4);
        if (site)
            appendExcludedSite(site, true);
        field.val('').focus();
    } catch (e) {
        // ignore the exception
    }
    return false;
}

function appendExcludedSite(site, added) {
    // do not add site twice
    var es = $('#selExcludedSites').find('span').filter(function() { if($(this).text() == site) return true; else return false;  });
    if (es.length != 0) return;

    $('<li><a href="#"><i class="icon-cancel"></i></a> <span' + (added ? ' class="added">' : '>') + site + '</span></li>').appendTo('#selExcludedSites').find('a').on('click', btnRemoveExcludedSiteOnClick);
}

function btnRemoveExcludedSiteOnClick() {
    $(this).parent().remove();
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

function chkWhiteListModeOnChange() {
    $('#lblToggle').text(chrome.i18n.getMessage($('#chkWhiteListMode')[0].checked ? "optSectionSitesEnabled" : "optSectionSitesDisabled"));
}

function chkAddToHistoryModeOnChange() {
    if ($('#chkAddToHistory')[0].checked) {
        chrome.permissions.request({permissions: ['history']}, function (granted) {
            if (granted === false) {
                $('#chkAddToHistory').trigger('gumby.uncheck');
            } else {
                savePermissionOptions();
            }
        });
    } else {
        chrome.permissions.remove({permissions: ['history']}, function (removed) {
            if (removed === false) {
                $('#chkAddToHistory').trigger('gumby.check');
            } else {
                savePermissionOptions();
            }
        });
    }
}

function initAddToHistory() {
    $('#chkAddToHistory').parent().on('gumby.onChange', chkAddToHistoryModeOnChange);
}

function chkAllowHeadersRewriteOnChange() {
    if ($('#chkAllowHeadersRewrite')[0].checked) {
        chrome.permissions.request({permissions: ['webRequest','webRequestBlocking']}, function (granted) {
            if (granted === false) {
                $('#chkAllowHeadersRewrite').trigger('gumby.uncheck');
            } else {
                savePermissionOptions();
            }
        });
    } else {
        chrome.permissions.remove({permissions: ['webRequest','webRequestBlocking']}, function (removed) {
            if (removed === false) {
                $('#chkAllowHeadersRewrite').trigger('gumby.check');
            } else {
                savePermissionOptions();
            }
        });
    }
}

function initAllowHeadersRewrite() {
    $('#chkAllowHeadersRewrite').parent().on('gumby.onChange', chkAllowHeadersRewriteOnChange);
}

function percentageOnChange(val) {
    let value = parseInt(typeof val == 'string' ? val : this.value);
    if (isNaN(value)) value = 100;
    if (value <= 0) value = 0;
    if (value > 100) value = 100;
    this.value = value;
    return this.value;
}

function integerOnChange(val) {
    let value = parseInt(typeof val == 'string' ? val : this.value);
    if (isNaN(value)) value = 0;
    if (value <= 0) value = 0;
    this.value = value;
    return this.value;
}

// validate user input
function downloadFolderOnChange(val) {
    let value = (typeof val == 'string' ? val : this.value);
    value = value.trim();
    if (value == '') return '';
    // remove Windows Explorer forbidden characters for folder name -> : * ? " < > |
    // replace \ by / and remove duplicates
    value = value.replace(/[!*:?"<>|]/g, '').replace(/[\/\\]{1,}/g, '/').replace(/\/ +\//, '/');
    // remove useless spaces around slashes
    value = value.replace(/[ ]{0,}\/[ ]{0,}/g, '/');
    // remove starting slash
    value = value.replace(/^\//, '');
    // add ending slash if needed
    if (! value.endsWith('/')) value += '/';
    this.value = value;
    return this.value;
}

function updateDivAmbilight() {
    if ($('#chkAmbilightEnabled')[0].checked) {
        $('#divAmbilight').removeClass('disabled');
    } else {
        $('#divAmbilight').addClass('disabled');
    }
}

function updateUseSeparateTabOrWindowForUnloadableUrls() {
    if ($('#chkUseSeparateTabOrWindowForUnloadableUrlsEnabled')[0].checked) {
        $('#selectUseSeparateTabOrWindowForUnloadableUrls').removeClass('disabled');
    } else {
        $('#selectUseSeparateTabOrWindowForUnloadableUrls').addClass('disabled');
    }
}

function updateDivHideMouseCursor() {
    if ($('#chkHideMouseCursor')[0].checked) {
        $('#divHideMouseCursor').removeClass('disabled');
    } else {
        $('#divHideMouseCursor').addClass('disabled');
    }
}

function updateTxtAmbilightBackgroundOpacity() {
    $('#txtAmbilightBackgroundOpacity')[0].value = this.value;
}

function updateRngAmbilightBackgroundOpacity() {
    this.value = percentageOnChange(this.value);
    $('#rngAmbilightBackgroundOpacity').val(this.value);
}

function updateTxtAmbilightHaloSize() {
    $('#txtAmbilightHaloSize')[0].value = this.value;
}

function updateRngAmbilightHaloSize() {
    this.value = percentageOnChange(this.value);
    $('#rngAmbilightHaloSize').val(this.value);
}

function updateTxtFrameThickness() {
    $('#txtFrameThickness')[0].value = this.value;
}

function updateRngFrameThickness() {
    this.value = percentageOnChange(this.value);
    $('#rngFrameThickness').val(this.value);
}

function updateTxtFontSize() {
    $('#txtFontSize')[0].value = this.value;
}

function updateRngFontSize() {
    this.value = percentageOnChange(this.value);
    $('#rngFontSize').val(this.value);
}

function updateTxtVideoVolume() {
    $('#txtVideoVolume')[0].value = this.value;
}

function updateRngVideoVolume() {
    this.value = percentageOnChange(this.value);
    $('#rngVideoVolume').val(this.value);
}

function updateTxtAudioVolume() {
    $('#txtAudioVolume')[0].value = this.value;
}

function updateRngAudioVolume() {
    this.value = percentageOnChange(this.value);
    $('#rngAudioVolume').val(this.value);
}

function updateDarkMode() {
    if ($('#chkDarkMode')[0].checked) {
        $('body').addClass('darkmode');
    } else {
        $('body').removeClass('darkmode');
    }
}

function onMessage(message, sender, callback) {
    switch (message.action) {
        case 'optionsChanged':
            restoreOptions();
            break;
    }
}

function getPlugins(callback) {
    const plugins = [];
    const manifest = chrome.runtime.getManifest();

    manifest.content_scripts.forEach(script => script.js.forEach((path) => {
        // Path can look like this on Firefox
        // 'moz-extension://d5438889-adf3-4ed5-89b3-caacec62961b/plugins/skyrock.js'
        // or like this on Chrome
        // 'plugins/skyrock.js'

        const split = path.split('/');

        if (split.includes('plugins')) {
            plugins.push(split[split.length - 1]);
        }
    }));

    plugins.sort();
    callback(plugins);
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
    var plugins = $.unique(hoverZoomPlugins.map(function(plugin) {return plugin.name})).sort(Intl.Collator().compare);
    plugins.forEach(function(plugin) {
        var chkName = 'chkPlugin' + plugin.replace(/[^\w\-_]/g, '').toLowerCase();
        $('<div class="field"><label class="checkbox" for="' + chkName + '"><input type="checkbox" id="' + chkName + '" class="chkPlugin"><span></span>&nbsp;<div style="display:inline">' + plugin + '</div></label></div>').appendTo('#tblPlugins');
        $('#' + chkName)[0].checked = !options.disabledPlugins.includes(chkName.substr('chkPlugin'.length));
        $('#' + chkName).each(function() { initCheckBox(this,  $('#' + chkName)[0].checked) });
    });
    $('input[type=checkbox]').each(function() { $(this).parent().on('gumby.onChange', function() { updateCheckBox(this) }) });
    Gumby.initialize('checkbox');
}

function initColorPicker(color){
    var colorPicker = $('#pickerFrameBackgroundColor').spectrum({
        color: color,
        preferredFormat: "hex",
        chooseText: chrome.i18n.getMessage("optFrameBackgroundColorChooseText"),
        cancelText: chrome.i18n.getMessage("optFrameBackgroundColorCancelText"),
        change: function(color) {
            $('#pickerFrameBackgroundColor').attr('value', color.toHexString());
        }
    })
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
    options = loadOptions();
    initActionKeys();
    i18n();
    chkWhiteListModeOnChange();
    initAddToHistory();
    initAllowHeadersRewrite();
    chkDarkMode();
    $("#version").text(chrome.i18n.getMessage("optFooterVersionCopyright", [chrome.runtime.getManifest().version, localStorage['HoverZoomLastUpdate'] ? localStorage['HoverZoomLastUpdate'] : localStorage['HoverZoomInstallation']]));
    $('#btnSave').click(function() { removeModifications(); saveOptions(); displayMsg(Saved); return false; }); // "return false" needed to prevent page scroll
    $('#btnCancel').click(function() { removeModifications(); restoreOptions(); displayMsg(Cancel); return false; });
    $('#btnReset').click(function() { restoreOptionsFromFactorySettings(); displayMsg(Reset); return false; });
    $('#btnDisableAllPlugins').click(function() { disableAllPlugins(); return false; });
    $('#btnEnableAllPlugins').click(function() { enableAllPlugins(); return false; });
    $('#chkWhiteListMode').parent().on('gumby.onChange', chkWhiteListModeOnChange);
    $('#txtZoomFactor').change(percentageOnChange);
    $('#txtPicturesOpacity').change(percentageOnChange);
    $('#rngVideoVolume').on('input change', updateTxtVideoVolume);
    $('#txtVideoVolume').change(updateRngVideoVolume);
    $('#rngAudioVolume').on('input change', updateTxtAudioVolume);
    $('#txtAudioVolume').change(updateRngAudioVolume);
    $('#chkAmbilightEnabled').parent().on('gumby.onChange', updateDivAmbilight);
    $('#rngAmbilightHaloSize').on('input change', updateTxtAmbilightHaloSize);
    $('#txtAmbilightHaloSize').change(updateRngAmbilightHaloSize);
    $('#rngAmbilightBackgroundOpacity').on('input change', updateTxtAmbilightBackgroundOpacity);
    $('#txtAmbilightBackgroundOpacity').change(updateRngAmbilightBackgroundOpacity);
    $('#rngFrameThickness').on('input change', updateTxtFrameThickness);
    $('#txtFrameThickness').change(updateRngFrameThickness);
    $('#rngFontSize').on('input change', updateTxtFontSize);
    $('#txtFontSize').change(updateRngFontSize);
    $('#txtVideoPositionStep').change(percentageOnChange);
    $('.actionKey').change(selKeyOnChange);
    $('#btnAddExcludedSite').click(btnAddExcludedSiteOnClick);
    $('#btnRemoveExcludedSite').click(btnRemoveExcludedSiteOnClick);
    $('#txtDownloadFolder').change(downloadFolderOnChange);
    $('#chkUseSeparateTabOrWindowForUnloadableUrlsEnabled').parent().on('gumby.onChange', updateUseSeparateTabOrWindowForUnloadableUrls);
    $('#chkHideMouseCursor').parent().on('gumby.onChange', updateDivHideMouseCursor);
    $('#chkDarkMode').parent().on('gumby.onChange', updateDarkMode);

    restoreOptions();
    loadPlugins();

    $('input[type=checkbox]').each(function() { $(this).parent().on('gumby.onChange', function() { updateCheckBox(this) }) });
    $('input[type=text]:not("#txtAddExcludedSite")').each(function() { $(this).change(function() { updateText(this) }) });
    $('input[type=range]').each(function() { $(this).change(function() { updateRange(this) }) });
    $('select').each(function() { $(this).change(function() { updateSelect(this) }) });

    chrome.runtime.onMessage.addListener(onMessage);
});

function disableAllPlugins() {
    $('input.chkPlugin').each(function() { $(this).trigger('gumby.uncheck'); })
}

function enableAllPlugins() {
    $('input.chkPlugin').each(function() { $(this).trigger('gumby.check'); })
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
        case 'text':
        case 'range':
            if (highlight) {
                item.addClass('modified');
                item.siblings('input[type=text],input[type=range],span').addClass('modified');
                if (item[0].id == 'pickerFrameBackgroundColor') $('.sp-replacer').addClass('modified');
            }
            else {
                item.removeClass('modified');
                item.siblings('input[type=text],input[type=range],span').removeClass('modified');
                if (item[0].id == 'pickerFrameBackgroundColor') $('.sp-replacer').removeClass('modified');
            }
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
    $('.added').removeClass('added');
    $('[data-val0]').each(function() { delete $(this)[0].dataset.val0; });
    $('[data-val1]').each(function() { delete $(this)[0].dataset.val1; });
}
