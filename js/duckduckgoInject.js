// Injects script "duckduckgoInjected.js" into main frame
const injectedScript = document.createElement('script');
injectedScript.src = chrome.runtime.getURL('js/duckduckgoInjected.js');
(document.head || document.documentElement).appendChild(injectedScript);