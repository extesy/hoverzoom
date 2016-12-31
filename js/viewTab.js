if (typeof msBrowser !== 'undefined') {
 chrome = msBrowser;
}
else if (typeof browser != 'undefined')
{
 chrome = browser;
}
chrome.runtime.sendMessage({action:'getOptions'}, function (options) {
    window.addEventListener('keydown', function (event) {
        if (event.which == options.openImageInTabKey) {
            window.close();
        }
    });
});