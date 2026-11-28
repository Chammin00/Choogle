'use strict';

const { contextBridge, ipcRenderer } = require('electron');

function subscribe(channel, callback) {
  if (typeof callback !== 'function') return () => {};
  const handler = (_event, data) => callback(data);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}

contextBridge.exposeInMainWorld('choogleBrowser', {
  getInitialState: () => ipcRenderer.invoke('chrome:get-initial-state'),
  createTab: (opts) => ipcRenderer.invoke('chrome:create-tab', opts || {}),
  closeTab: (tabId) => ipcRenderer.invoke('chrome:close-tab', tabId),
  activateTab: (tabId) => ipcRenderer.invoke('chrome:activate-tab', tabId),
  togglePinTab: (tabId) => ipcRenderer.invoke('chrome:toggle-pin-tab', tabId),
  toggleMuteTab: (tabId) => ipcRenderer.invoke('chrome:toggle-mute-tab', tabId),
  reopenClosedTab: () => ipcRenderer.invoke('chrome:reopen-closed-tab'),

  navigate: (tabId, input) => ipcRenderer.invoke('chrome:navigate', { tabId, input }),
  goBack: (tabId) => ipcRenderer.invoke('chrome:go-back', tabId),
  goForward: (tabId) => ipcRenderer.invoke('chrome:go-forward', tabId),
  reload: (tabId, ignoreCache) => ipcRenderer.invoke('chrome:reload', { tabId, ignoreCache: Boolean(ignoreCache) }),
  stop: (tabId) => ipcRenderer.invoke('chrome:stop', tabId),
  zoom: (tabId, action) => ipcRenderer.invoke('chrome:zoom', { tabId, action }),
  findInPage: (tabId, text, options) => ipcRenderer.invoke('chrome:find-in-page', { tabId, text, options }),
  stopFindInPage: (tabId) => ipcRenderer.invoke('chrome:stop-find-in-page', tabId),
  openDevTools: (tabId) => ipcRenderer.invoke('chrome:open-devtools', tabId),

  setViewportBounds: (bounds) => ipcRenderer.invoke('chrome:set-viewport-bounds', bounds),

  openOmniboxPopup: (payload) => ipcRenderer.invoke('chrome:open-omnibox-popup', payload),
  updateOmniboxPopup: (payload) => ipcRenderer.invoke('chrome:update-omnibox-popup', payload),
  closeOmniboxPopup: () => ipcRenderer.invoke('chrome:close-omnibox-popup'),
  selectOmniboxItem: (item) => ipcRenderer.invoke('chrome:select-omnibox-item', item),

  setWorkspace: (workspaceId) => ipcRenderer.invoke('chrome:set-workspace', workspaceId),
  addWorkspace: (payload) => ipcRenderer.invoke('chrome:add-workspace', payload),
  removeWorkspace: (workspaceId) => ipcRenderer.invoke('chrome:remove-workspace', workspaceId),

  updateSettings: (patch) => ipcRenderer.invoke('chrome:update-settings', patch),
  toggleBookmark: (payload) => ipcRenderer.invoke('chrome:toggle-bookmark', payload),
  removeBookmark: (idOrUrl) => ipcRenderer.invoke('chrome:remove-bookmark', idOrUrl),
  clearHistory: () => ipcRenderer.invoke('chrome:clear-history'),
  clearDownloads: () => ipcRenderer.invoke('chrome:clear-downloads'),
  openDownloadItem: (id) => ipcRenderer.invoke('chrome:open-download', id),
  showDownloadInFolder: (id) => ipcRenderer.invoke('chrome:show-download-in-folder', id),
  toggleSiteAllowlist: (host) => ipcRenderer.invoke('chrome:toggle-allowlist', host),

  getProjectsRegistry: () => ipcRenderer.invoke('chrome:get-projects-registry'),
  syncProjects: () => ipcRenderer.invoke('chrome:sync-projects'),
  windowAction: (action) => ipcRenderer.invoke('chrome:window-action', action),

  onStateUpdate: (cb) => subscribe('chrome:state-update', cb),
  onDownloadsUpdate: (cb) => subscribe('chrome:downloads-update', cb),
  onHistoryUpdate: (cb) => subscribe('chrome:history-update', cb),
  onCommand: (cb) => subscribe('chrome:command', cb),
  onPopupData: (cb) => subscribe('chrome:popup-data', cb)
});
