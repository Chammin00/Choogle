'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// Exposed to tab WebContents; main process enforces senderFrame.url.startsWith('choogle://')
// on every handler so external websites cannot invoke privileged internal APIs.
contextBridge.exposeInMainWorld('choogleInternal', {
  isChoogleBrowser: true,
  getContext: () => ipcRenderer.invoke('internal:get-context'),
  navigate: (url) => ipcRenderer.invoke('internal:navigate', url),
  openNewTab: (url) => ipcRenderer.invoke('internal:open-new-tab', url),
  getBookmarks: () => ipcRenderer.invoke('internal:get-bookmarks'),
  addBookmark: (item) => ipcRenderer.invoke('internal:add-bookmark', item),
  removeBookmark: (idOrUrl) => ipcRenderer.invoke('internal:remove-bookmark', idOrUrl),
  getHistory: (query, limit) => ipcRenderer.invoke('internal:get-history', { query, limit }),
  removeHistoryEntry: (id) => ipcRenderer.invoke('internal:remove-history-entry', id),
  clearHistory: () => ipcRenderer.invoke('internal:clear-history'),
  getDownloads: () => ipcRenderer.invoke('internal:get-downloads'),
  clearDownloads: () => ipcRenderer.invoke('internal:clear-downloads'),
  openDownload: (id) => ipcRenderer.invoke('internal:open-download', id),
  showDownloadInFolder: (id) => ipcRenderer.invoke('internal:show-download-in-folder', id),
  getSettings: () => ipcRenderer.invoke('internal:get-settings'),
  updateSettings: (patch) => ipcRenderer.invoke('internal:update-settings', patch),
  toggleAllowlistHost: (host) => ipcRenderer.invoke('internal:toggle-allowlist', host),
  addWorkspace: (payload) => ipcRenderer.invoke('internal:add-workspace', payload),
  removeWorkspace: (id) => ipcRenderer.invoke('internal:remove-workspace', id),
  setActiveWorkspace: (id) => ipcRenderer.invoke('internal:set-active-workspace', id),
  getProjectsRegistry: () => ipcRenderer.invoke('internal:get-projects-registry'),
  syncProjects: () => ipcRenderer.invoke('internal:sync-projects'),
  installShortcut: () => ipcRenderer.invoke('internal:install-shortcut')
});
