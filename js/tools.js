const isChromiumBased = !!navigator.userAgentData?.brands?.some(item => item.brand === 'Chromium')

function slice(a) {
  return Array.prototype.slice.call(a);
}

function qs(s) {
  return document.querySelector(s);
}

function qsa(s) {
  return document.querySelectorAll(s);
}

function ce(s) {
  return document.createElement(s);
}

function ge(s) {
  return document.getElementById(s);
}

function parentNodeName(e, tag) {
  var p = e.parentNode;
  if (!p) { return null; }
  if (p && p.nodeName == tag.toUpperCase()) {
	return p;
  } else {
    return parentNodeName(p, tag);
  }
}

const optionsStorageGet = async (keys) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(keys, function (result) {
      resolve(result);
    });
  });
};

const optionsStorageSet = async (keys) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(keys, function () {
      resolve();
    });
  });
};

const optionsStorageRemove = async (keys) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.remove(keys, function () {
      resolve();
    });
  });
};

const sessionStorageGet = async (keys) => {
  if (!chrome.storage.session)
    return localStorageGet(keys);
  return new Promise((resolve, reject) => {
    chrome.storage.session.get(keys, function (result) {
      resolve(result);
    });
  });
};

const sessionStorageSet = async (keys) => {
  if (!chrome.storage.session)
    return localStorageSet(keys);
  return new Promise((resolve, reject) => {
    chrome.storage.session.set(keys, function () {
      resolve();
    });
  });
};

const sessionStorageRemove = async (keys) => {
  if (!chrome.storage.session)
    return localStorageRemove(keys);
  return new Promise((resolve, reject) => {
    chrome.storage.session.remove(keys, function () {
      resolve();
    });
  });
};

const localStorageGet = async (keys) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, function (result) {
      resolve(result);
    });
  });
};

const localStorageSet = async (keys) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(keys, function () {
      resolve();
    });
  });
};

const localStorageRemove = async (keys) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(keys, function () {
      resolve();
    });
  });
};

