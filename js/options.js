var options,
    hoverZoomPlugins = hoverZoomPlugins || [],
    actionKeys = ['actionKey', 'toggleKey', 'closeKey', 'hideKey', 'banKey', 'openImageInWindowKey', 'openImageInTabKey', 'lockImageKey', 'saveImageKey', 'fullZoomKey', 'prevImgKey', 'nextImgKey', 'flipImageKey', 'rotateImageKey', 'copyImageKey', 'copyImageUrlKey'];

function getMilliseconds(ctrl) {
    var value = parseFloat(ctrl.val());
    value = isNaN(value) ? 0 : value * 1000;
    ctrl.val(value / 1000);
    return value;
}

// Options that are only enabled for Chromium-based browsers
const chromiumOnly = [];

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

async function saveOptions(exportSettings = false) {
    options.extensionEnabled = $('#chkExtensionEnabled')[0].checked;
    options.darkMode = $('#chkDarkMode')[0].checked;
    options.zoomFactor = $('#txtZoomFactor')[0].value;
    options.maxWidth = $('#txtMaxWidth')[0].value;
    options.maxHeight = $('#txtMaxHeight')[0].value;
    options.zoomVideos = $('#chkZoomVideos')[0].checked;
    options.videoPositionStep = $('#txtVideoPositionStep')[0].value;
    options.muteVideos = $('#chkMuteVideos')[0].checked;
    options.videoTimestamp = $('#chkVideoTimestamp')[0].checked;
    options.videoVolume = $('#txtVideoVolume')[0].value / 100;
    options.playAudio = $('#chkPlayAudio')[0].checked;
    options.audioVolume = $('#txtAudioVolume')[0].value / 100;
    options.mouseClickHoldTime = $('#txtMouseClickHoldTime')[0].value;
    options.mouseUnderlap = $('#chkMouseUnderlap')[0].checked;
    options.lockImageZoomFactorEnabled = $('#chkLockImageZoomFactorEnabled')[0].checked;
    options.lockImageZoomDefaultEnabled = $('#chkLockImageZoomDefaultEnabled')[0].checked;
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
    options.viewerShadowEnabled = $('#chkViewerShadowEnabled')[0].checked;
    options.captionDetailShadowEnabled = $('#chkCaptionDetailShadowEnabled')[0].checked;
    options.ambilightEnabled = $('#chkAmbilightEnabled')[0].checked;
    options.ambilightHaloSize = $('#txtAmbilightHaloSize')[0].value / 100;
    options.ambilightBackgroundOpacity = $('#txtAmbilightBackgroundOpacity')[0].value / 100;
    options.imagePaddingSize = $('#txtImagePaddingSize')[0].value;
    options.fullZoomHidesDetailsCaptions = $('#chkFullZoomHidesDetailsCaptions')[0].checked;
    options.statusBarOverlap = $('#chkStatusBarOverlap')[0].checked;
    options.hScrollBarOverlap = $('#chkHScrollBarOverlap')[0].checked;
    options.centerImages = $('#chkCenterImages')[0].checked;
    options.autoLockImages = $('#chkAutoLockImages')[0].checked;
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

    options.showDetailFilename = $('#chkShowDetailFilename')[0].checked;
    options.showDetailHost = $('#chkShowDetailHost')[0].checked;
    options.showDetailLastModified = $('#chkShowDetailLastModified')[0].checked;
    options.showDetailExtension = $('#chkShowDetailExtension')[0].checked;
    options.showDetailContentLength = $('#chkShowDetailContentLength')[0].checked;
    options.showDetailDuration = $('#chkShowDetailDuration')[0].checked;
    options.showDetailScale = $('#chkShowDetailScale')[0].checked;
    options.showDetailRatio = $('#chkShowDetailRatio')[0].checked;
    options.showDetailDimensions = $('#chkShowDetailDimensions')[0].checked;
    
    options.filterNSFW = $('#chkFilterNSFW')[0].checked;
    options.alwaysPreload = $('#chkAlwaysPreload')[0].checked;
    options.enableGalleries = $('#chkEnableGalleries')[0].checked;
    options.enableNoFocusMsg = $('#chkEnableNoFocusMsg')[0].checked;
    options.picturesOpacity = $('#txtPicturesOpacity')[0].value / 100;
    options.captionLocation = $('#selectCaptionLocation').val();
    options.detailsLocation = $('#selectDetailsLocation').val();
    options.fontSize = $('#txtFontSize')[0].value;
    options.fontOutline = $('#chkFontOutline')[0].checked;
    options.belowPositionOffset = $('#txtBelowPositionOffset')[0].value;
    options.belowPositionOffsetUnit = $('#selectBelowUnitType').val();
    options.abovePositionOffset = $('#txtAbovePositionOffset')[0].value;
    options.abovePositionOffsetUnit = $('#selectAboveUnitType').val();
    options.captionOpacity = $('#txtCaptionOpacity')[0].value / 100;
    options.detailsOpacity = $('#txtDetailsOpacity')[0].value / 100;
    options.displayImageLoader = $('#chkDisplayImageLoader')[0].checked;
    options.useClipboardNameWhenSaving = $('#chkUseClipboardNameWhenSaving')[0].checked;
    options.downloadFolder = $('#txtDownloadFolder')[0].value;
    options.addDownloadOrigin = $('#chkAddDownloadOrigin')[0].checked;
    options.addDownloadSize = $('#chkAddDownloadSize')[0].checked;
    options.addDownloadDuration = $('#chkAddDownloadDuration')[0].checked;
    options.addDownloadIndex = $('#chkAddDownloadIndex')[0].checked;
    options.addDownloadCaption = $('#chkAddDownloadCaption')[0].checked;
    options.replaceOriginalFilename = $('#chkDownloadReplaceOriginalFilename')[0].checked;
    options.downloadFilename = $('#txtDownloadReplaceOriginalFilename')[0].value;
    options.debug = $('#chkEnableDebug')[0].checked;
    options.useSeparateTabOrWindowForUnloadableUrlsEnabled = $('#chkUseSeparateTabOrWindowForUnloadableUrlsEnabled')[0].checked;
    options.useSeparateTabOrWindowForUnloadableUrls = $('#selectUseSeparateTabOrWindowForUnloadableUrls').val();

    if (exportSettings) { 
        $('#txtBoxImportExportSettings').val(JSON.stringify(options));
    } else {
        await optionsStorageSet(options);
        sendOptions(options);
        // await restoreOptions();
    }
    return false;
}

async function savePermissionOptions() {
    await optionsStorageSet(options);
}

// Restores options from factory settings
async function restoreOptionsFromFactorySettings() {
    await restoreOptions(Object.assign({}, factorySettings));
}

// Restores options from storage
async function restoreOptions(optionsFromFactorySettings) {
    options = optionsFromFactorySettings || await loadOptions();

    $('#chkExtensionEnabled').trigger(options.extensionEnabled ? 'gumby.check' : 'gumby.uncheck');
    $('#chkDarkMode').trigger(options.darkMode ? 'gumby.check' : 'gumby.uncheck');
    $('#txtZoomFactor')[0].value = options.zoomFactor;
    $('#txtMaxWidth')[0].value = options.maxWidth;
    $('#txtMaxHeight')[0].value = options.maxHeight;
    $('#chkZoomVideos').trigger(options.zoomVideos ? 'gumby.check' : 'gumby.uncheck');
    $('#txtVideoPositionStep')[0].value = options.videoPositionStep;
    $('#chkMuteVideos').trigger(options.muteVideos ? 'gumby.check' : 'gumby.uncheck');
    $('#chkVideoTimestamp').trigger(options.videoTimestamp ? 'gumby.check' : 'gumby.uncheck');
    $('#rngVideoVolume').val(parseInt(options.videoVolume * 100));
    $('#txtVideoVolume').val(parseInt(options.videoVolume * 100));
    $('#chkPlayAudio').trigger(options.playAudio ? 'gumby.check' : 'gumby.uncheck');
    $('#rngAudioVolume').val(parseInt(options.audioVolume * 100));
    $('#txtAudioVolume').val(parseInt(options.audioVolume * 100));
    $('#rngMouseClickHoldTime').val(parseInt(options.mouseClickHoldTime));
    $('#txtMouseClickHoldTime').val(parseInt(options.mouseClickHoldTime));
    $('#chkMouseUnderlap').trigger(options.mouseUnderlap ? 'gumby.check' : 'gumby.uncheck');
    $('#chkLockImageZoomFactorEnabled').trigger(options.lockImageZoomFactorEnabled ? 'gumby.check' : 'gumby.uncheck');
    $('#chkLockImageZoomDefaultEnabled').trigger(options.lockImageZoomDefaultEnabled ? 'gumby.check' : 'gumby.uncheck');
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
    $('#chkViewerShadowEnabled').trigger(options.viewerShadowEnabled ? 'gumby.check' : 'gumby.uncheck');
    $('#chkCaptionDetailShadowEnabled').trigger(options.captionDetailShadowEnabled ? 'gumby.check' : 'gumby.uncheck');
    $('#chkAmbilightEnabled').trigger(options.ambilightEnabled ? 'gumby.check' : 'gumby.uncheck');
    $('#rngAmbilightHaloSize').val(parseInt(options.ambilightHaloSize * 100));
    $('#txtAmbilightHaloSize').val(parseInt(options.ambilightHaloSize * 100));
    $('#rngAmbilightBackgroundOpacity').val(parseInt(options.ambilightBackgroundOpacity * 100));
    $('#txtAmbilightBackgroundOpacity').val(parseInt(options.ambilightBackgroundOpacity * 100));
    $('#chkFullZoomHidesDetailsCaptions').trigger(options.fullZoomHidesDetailsCaptions ? 'gumby.check' : 'gumby.uncheck');
    $('#chkStatusBarOverlap').trigger(options.statusBarOverlap ? 'gumby.check' : 'gumby.uncheck');
    $('#chkHScrollBarOverlap').trigger(options.hScrollBarOverlap ? 'gumby.check' : 'gumby.uncheck');
    $('#chkCenterImages').trigger(options.centerImages ? 'gumby.check' : 'gumby.uncheck');
    $('#chkAutoLockImages').trigger(options.autoLockImages ? 'gumby.check' : 'gumby.uncheck');
    $('#pickerFrameBackgroundColor').val(options.frameBackgroundColor);
    $('#rngFrameThickness').val(parseInt(options.frameThickness));
    $('#txtFrameThickness').val(parseInt(options.frameThickness));
    $('#selectCaptionLocation').val(options.captionLocation);
    $('#selectDetailsLocation').val(options.detailsLocation);
    $('#rngFontSize').val(parseInt(options.fontSize));
    $('#txtFontSize').val(parseInt(options.fontSize));
    $('#chkFontOutline').trigger(options.fontOutline ? 'gumby.check' : 'gumby.uncheck');
    $('#rngImagePaddingSize').val(parseInt(options.imagePaddingSize));
    $('#txtImagePaddingSize').val(parseInt(options.imagePaddingSize));
    $('#txtBelowPositionOffset').val(parseFloat(options.belowPositionOffset));
    $('#selectBelowUnitType').val(options.belowPositionOffsetUnit);
    $('#txtAbovePositionOffset').val(parseFloat(options.abovePositionOffset));
    $('#selectAboveUnitType').val(options.abovePositionOffsetUnit);
    $('#txtCaptionOpacity').val(parseInt(options.captionOpacity * 100));
    $('#txtDetailsOpacity').val(parseInt(options.detailsOpacity * 100));

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

    let rightButtonActive = false;
    let middleButtonActive = false;
    options.rightShortClickAndHold = false;
    options.middleShortClickAndHold = false;
    options.rightShortClick = false;
    options.middleShortClick = false;

    actionKeys.forEach(function(key) {
        var id = key[0].toUpperCase() + key.substring(1);
        $('#sel' + id).val(options[key]);

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

    $('#chkShowDetailFilename').trigger(options.showDetailFilename ? 'gumby.check' : 'gumby.uncheck');
    $('#chkShowDetailHost').trigger(options.showDetailHost ? 'gumby.check' : 'gumby.uncheck');
    $('#chkShowDetailLastModified').trigger(options.showDetailLastModified ? 'gumby.check' : 'gumby.uncheck');
    $('#chkShowDetailExtension').trigger(options.showDetailExtension ? 'gumby.check' : 'gumby.uncheck');
    $('#chkShowDetailContentLength').trigger(options.showDetailContentLength ? 'gumby.check' : 'gumby.uncheck');
    $('#chkShowDetailDuration').trigger(options.showDetailDuration ? 'gumby.check' : 'gumby.uncheck');
    $('#chkShowDetailScale').trigger(options.showDetailScale ? 'gumby.check' : 'gumby.uncheck');
    $('#chkShowDetailRatio').trigger(options.showDetailRatio ? 'gumby.check' : 'gumby.uncheck');
    $('#chkShowDetailDimensions').trigger(options.showDetailDimensions ? 'gumby.check' : 'gumby.uncheck');

    $('#chkFilterNSFW').trigger(options.filterNSFW ? 'gumby.check' : 'gumby.uncheck');
    $('#chkAlwaysPreload').trigger(options.alwaysPreload ? 'gumby.check' : 'gumby.uncheck');
    $('#chkEnableGalleries').trigger(options.enableGalleries ? 'gumby.check' : 'gumby.uncheck');
    $('#chkEnableNoFocusMsg').trigger(options.enableNoFocusMsg ? 'gumby.check' : 'gumby.uncheck');
    $('#txtPicturesOpacity').val(parseInt(options.picturesOpacity * 100));
    $('#chkUseClipboardNameWhenSaving').trigger(options.useClipboardNameWhenSaving ? 'gumby.check' : 'gumby.uncheck');
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
    $('#chkAddDownloadIndex').trigger(options.addDownloadIndex ? 'gumby.check' : 'gumby.uncheck');
    $('#chkAddDownloadCaption').trigger(options.addDownloadCaption ? 'gumby.check' : 'gumby.uncheck');
    $('#chkDownloadReplaceOriginalFilename').trigger(options.replaceOriginalFilename ? 'gumby.check' : 'gumby.uncheck');
    $('#txtDownloadReplaceOriginalFilename').val(options.downloadFilename);
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

function chkWhiteListModeOnChange() {
    $('#lblToggle').text(chrome.i18n.getMessage($('#chkWhiteListMode')[0].checked ? "optSectionSitesEnabled" : "optSectionSitesDisabled"));
}

async function chkPermissionOnChange(permission, selector) {
    if ($(selector)[0].checked) {
        const granted = await new Promise(resolve => {
            chrome.permissions.request({permissions: [permission]}, resolve);
        });
        if (granted === false) {
            $(selector).trigger('gumby.uncheck');
        }
    } else {
        const removed = await new Promise(resolve => {
            chrome.permissions.remove({permissions: [permission]}, resolve);
        });
        if (removed === false) {
            $(selector).trigger('gumby.check');
        }
    }
}

async function initPermission(permission, selector) {
    // This timeout ensures that the check is performed in a user gesture context.
    setTimeout(async () => {
        const contained = await new Promise(resolve => {
            chrome.permissions.contains({ permissions: [permission] }, resolve);
        });
        $(selector).trigger(contained ? 'gumby.check' : 'gumby.uncheck');
    }, 10);

    $(selector).parent().on('gumby.onChange', async function() {
        await chkPermissionOnChange(permission, selector);
    });
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

// validate user input
function replaceOriginalFilenameOnChange(val) {
    let value = (typeof val == 'string' ? val : this.value);
    value = value.trim();
    // remove Windows Explorer forbidden characters for file name -> : * ? " < > | /
    value = value.replace(/[!*:?"<>|\/\\]/g, '');
    this.value = value;
    return this.value;
}

function btnResetAllBannedImagesOnClick() {
    const request = {action:'resetBannedImages'};
    chrome.runtime.sendMessage(request);
}

function updateDivAmbilight() {
    if ($('#chkAmbilightEnabled')[0].checked) {
        $('#divAmbilight').removeClass('disabled');
    } else {
        $('#divAmbilight').addClass('disabled');
    }
}

function updateDownloadReplaceOriginalFilename() {
    if ($('#chkDownloadReplaceOriginalFilename')[0].checked) {
        $('#txtDownloadReplaceOriginalFilename').removeClass('disabled');
    } else {
        $('#txtDownloadReplaceOriginalFilename').addClass('disabled');
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

function updateTxtImagePaddingSize() {
    $('#txtImagePaddingSize')[0].value = this.value;
}

function updateRngImagePaddingSize() {
    this.value = percentageOnChange(this.value);
    $('#rngImagePaddingSize').val(this.value);
}

function updateTxtBelowPositionOffset() {
    $('#txtBelowPositionOffset')[0].value = this.value;
}

function updateTxtAbovePositionOffset() {
    $('#txtAbovePositionOffset')[0].value = this.value;
}

function updateTxtCaptionOpacity() {
    $('#txtCaptionOpacity')[0].value = this.value;
}
function updateTxtDetailsOpacity() {
    $('#txtDetailsOpacity')[0].value = this.value;
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

function updateTxtMouseClickHoldTime() {
    $('#txtMouseClickHoldTime')[0].value = this.value;
}

function updateRngMouseClickHoldTime() {
    this.value = percentageOnChange(this.value);
    $('#rngMouseClickHoldTime').val(this.value);
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
const Imported = Symbol("imported");
const ImportFail = Symbol("importFail");
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
        case Imported:
            $('#msgtxt').removeClass().addClass('centered text-center alert success').text(chrome.i18n.getMessage('optImport')).clearQueue().animate({opacity:1}, 500).delay(5000).animate({opacity:0}, 500);
            break;
        case ImportFail:
            $('#msgtxt').removeClass().addClass('centered text-center alert danger').text(chrome.i18n.getMessage('optImportFailed')).clearQueue().animate({opacity:1}, 500).delay(5000).animate({opacity:0}, 500);
            break;
        default:
            break;
    }
}

$(async function () {
    options = await loadOptions();
    initActionKeys();
    i18n();
    chkWhiteListModeOnChange();
    await initPermission('history', '#chkAddToHistory');
    await initPermission('downloads', '#chkAllowMediaSaving');
    chkDarkMode();
    $("#version").text(chrome.i18n.getMessage("optFooterVersionCopyright", [chrome.runtime.getManifest().version, new Date().getFullYear()]));
    $('#btnSave').click(function() { removeModifications(); saveOptions().then(() => displayMsg(Saved)); return false; }); // "return false" needed to prevent page scroll
    $('#btnCancel').click(function() { removeModifications(); restoreOptions().then(() => displayMsg(Cancel)); return false; });
    $('#btnReset').click(function() { restoreOptionsFromFactorySettings().then(() => displayMsg(Reset)); return false; });
    $('#btnDisableAllPlugins').click(function() { disableAllPlugins(); return false; });
    $('#btnEnableAllPlugins').click(function() { enableAllPlugins(); return false; });
    $('#btnImportSettings').click(function() { importSettings(); return false; });
    $('#btnExportSettings').click(function() { exportSettings(); return false; });
    $('#btnMigrateOldSettings').click(function() { migrateOldSettings(); return false; });
    $('#chkWhiteListMode').parent().on('gumby.onChange', chkWhiteListModeOnChange);
    $('#txtZoomFactor').change(percentageOnChange);
    $('#txtPicturesOpacity').change(percentageOnChange);
    $('#rngVideoVolume').on('input change', updateTxtVideoVolume);
    $('#txtVideoVolume').change(updateRngVideoVolume);
    $('#rngAudioVolume').on('input change', updateTxtAudioVolume);
    $('#txtAudioVolume').change(updateRngAudioVolume);
    $('#rngMouseClickHoldTime').on('input change', updateTxtMouseClickHoldTime);
    $('#txtMouseClickHoldTime').change(updateRngMouseClickHoldTime);
    $('#chkAmbilightEnabled').parent().on('gumby.onChange', updateDivAmbilight);
    $('#rngAmbilightHaloSize').on('input change', updateTxtAmbilightHaloSize);
    $('#txtAmbilightHaloSize').change(updateRngAmbilightHaloSize);
    $('#rngAmbilightBackgroundOpacity').on('input change', updateTxtAmbilightBackgroundOpacity);
    $('#txtAmbilightBackgroundOpacity').change(updateRngAmbilightBackgroundOpacity);
    $('#rngFrameThickness').on('input change', updateTxtFrameThickness);
    $('#txtFrameThickness').change(updateRngFrameThickness);
    $('#rngFontSize').on('input change', updateTxtFontSize);
    $('#txtFontSize').change(updateRngFontSize);
    $('#rngImagePaddingSize').on('input change', updateTxtImagePaddingSize);
    $('#txtImagePaddingSize').change(updateTxtImagePaddingSize);
    $('#txtBelowPositionOffset').change(updateTxtBelowPositionOffset);
    $('#txtAbovePositionOffset').change(updateTxtAbovePositionOffset);
    $('#txtCaptionOpacity').change(updateTxtCaptionOpacity);
    $('#txtDetailsOpacity').change(updateTxtDetailsOpacity);
    $('#txtVideoPositionStep').change(percentageOnChange);
    $('.actionKey').change(selKeyOnChange);
    $('#btnAddExcludedSite').click(btnAddExcludedSiteOnClick);
    $('#btnRemoveExcludedSite').click(btnRemoveExcludedSiteOnClick);
    $('#txtDownloadFolder').change(downloadFolderOnChange);
    $('#chkDownloadReplaceOriginalFilename').parent().on('gumby.onChange', updateDownloadReplaceOriginalFilename);
    $('#txtDownloadReplaceOriginalFilename').change(replaceOriginalFilenameOnChange);
    $('#btnResetAllBannedImages').click(btnResetAllBannedImagesOnClick);
    $('#chkUseSeparateTabOrWindowForUnloadableUrlsEnabled').parent().on('gumby.onChange', updateUseSeparateTabOrWindowForUnloadableUrls);
    $('#chkHideMouseCursor').parent().on('gumby.onChange', updateDivHideMouseCursor);
    $('#chkDarkMode').parent().on('gumby.onChange', updateDarkMode);

    await restoreOptions();
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

//Checks if string is JSON. 
//If yes, imports settings and clears textarea.
async function importSettings() {
    let jsonImport;
    try {
        jsonImport = JSON.parse($('#txtBoxImportExportSettings')[0].value);
        // Checks if a few HZ+ settings are defined to test if it's a valid HZ+ JSON
        const jsonTest = [jsonImport.centerImages, jsonImport.fullZoomKey, jsonImport.hideMouseCursor];
        jsonTest.forEach((variable) => {
            if (typeof variable === 'undefined') {
                throw new Error('Not a valid HZ+ import JSON');
            }
        });
    } catch (e) {
        displayMsg(ImportFail);
        return false;
    }
    displayMsg(Imported);
    await restoreOptions({jsonImport});
    $('#txtBoxImportExportSettings').val('');
}

async function exportSettings() {
    await saveOptions(true);
}

async function migrateOldSettings() {
    //Migrates old storage settings into options
    const options = localStorage && localStorage.options ? JSON.parse(localStorage.options) : factorySettings;
    await restoreOptions(options);
    displayMsg(Imported);
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


