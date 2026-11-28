'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const {
  app,
  BrowserWindow,
  WebContentsView,
  ipcMain,
  Menu,
  protocol,
  session,
  shell
} = require('electron');

const { ChoogleStore } = require('./store.cjs');
const { ChoogleAdblock } = require('./adblock.cjs');
const { registerChoogleProtocol } = require('./protocol.cjs');

const CHOOGLE_ROOT = path.resolve(__dirname, '..');
const IS_SMOKE_TEST = process.argv.includes('--smoke-test');

if (IS_SMOKE_TEST) {
  const smokeUserData = path.join(os.tmpdir(), `choogle-smoke-${Date.now()}`);
  app.setPath('userData', smokeUserData);
}

app.setAppUserModelId('dev.choogle.browser');

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'choogle',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true
    }
  }
]);

const SEARCH_ENGINES = {
  google: 'https://www.google.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  bing: 'https://www.bing.com/search?q=',
  brave: 'https://search.brave.com/search?q=',
  perplexity: 'https://www.perplexity.ai/search?q=',
  choogle: 'choogle://home?q='
};

let store = null;
let adblock = null;
let mainWindow = null;
let omniboxPopupView = null;
let chromeWebContentsId = -1;
let popupWebContentsId = -1;
let omniboxPopupBounds = null;
let omniboxPopupVisible = false;

let currentOffsets = {
  topOffset: 112,
  leftOffset: 56,
  rightOffset: 0
};

let tabs = [];
let activeTabId = null;
let mountedTabId = null;
let closedTabsStack = [];
let tabCounter = 1;
const webContentsToTab = new Map();

function loadProjectsRegistry() {
  const regPath = path.join(CHOOGLE_ROOT, 'projects-registry.json');
  try {
    const raw = fs.readFileSync(regPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { version: '2.0.0', count: 0, suiteApps: [], projects: [] };
  }
}

function getTabById(tabId) {
  return tabs.find((t) => t.id === tabId) || null;
}

function getActiveTab() {
  return getTabById(activeTabId) || null;
}

function resolveNavigationInput(rawInput, engineKey) {
  const input = String(rawInput || '').trim();
  if (!input) return 'choogle://home';

  if (/^(choogle|https?|file|about|devtools):\/\//i.test(input) || /^about:/i.test(input)) {
    return input;
  }

  if (/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/.*)?$/i.test(input)) {
    return 'http://' + input;
  }

  if (/^\d{1,3}(\.\d{1,3}){3}(:\d+)?(\/.*)?$/.test(input)) {
    return 'http://' + input;
  }

  if (!/\s/.test(input) && /^[a-z0-9-]+(\.[a-z0-9-]+)+([:/?#].*)?$/i.test(input)) {
    return 'https://' + input;
  }

  const base = SEARCH_ENGINES[engineKey] || SEARCH_ENGINES.google;
  return base + encodeURIComponent(input);
}

function getHostFromUrl(url) {
  try {
    const u = new URL(url);
    if (u.protocol === 'http:' || u.protocol === 'https:') {
      return u.hostname.toLowerCase();
    }
    return '';
  } catch {
    return '';
  }
}

function serializeTab(tab) {
  const wc = tab.view && !tab.view.webContents.isDestroyed() ? tab.view.webContents : null;
  const shield = wc ? adblock.getTabSummary(wc.id) : { count: 0, recent: [] };
  return {
    id: tab.id,
    workspaceId: tab.workspaceId,
    title: tab.title || 'New Tab',
    url: tab.url || 'choogle://home',
    favicon: tab.favicon || '',
    isLoading: Boolean(tab.isLoading),
    canGoBack: wc ? wc.navigationHistory.canGoBack() : false,
    canGoForward: wc ? wc.navigationHistory.canGoForward() : false,
    pinned: Boolean(tab.pinned),
    muted: Boolean(tab.muted),
    isAudible: Boolean(tab.isAudible),
    zoomFactor: tab.zoomFactor || 1,
    blockedCount: shield.count
  };
}

function buildStateSnapshot() {
  const activeTab = getActiveTab();
  const activeWc = activeTab && activeTab.view && !activeTab.view.webContents.isDestroyed()
    ? activeTab.view.webContents
    : null;
  const activeHost = activeTab ? getHostFromUrl(activeTab.url) : '';
  const shieldSummary = activeWc ? adblock.getTabSummary(activeWc.id) : { count: 0, recent: [] };

  return {
    tabs: tabs.map(serializeTab),
    activeTabId,
    workspaces: store.getWorkspaces(),
    activeWorkspaceId: store.getActiveWorkspaceId(),
    settings: store.getSettings(),
    bookmarks: store.getBookmarks(),
    pinnedApps: store.getPinnedApps(),
    stats: store.getStats(),
    shieldTabSummary: {
      ...shieldSummary,
      host: activeHost,
      allowlisted: activeHost
        ? (store.getSettings().adblockAllowlist || []).includes(activeHost)
        : false
    },
    windowState: {
      isMaximized: mainWindow && !mainWindow.isDestroyed() ? mainWindow.isMaximized() : false
    }
  };
}

function broadcastState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('chrome:state-update', buildStateSnapshot());
}

function broadcastDownloads() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('chrome:downloads-update', {
    downloads: store.getDownloads()
  });
}

function sendChromeCommand(cmd) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('chrome:command', cmd);
}

function layoutViewport() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const contentBounds = mainWindow.getContentBounds();
  const left = Math.max(0, Math.round(currentOffsets.leftOffset || 0));
  const top = Math.max(0, Math.round(currentOffsets.topOffset || 0));
  const right = Math.max(0, Math.round(currentOffsets.rightOffset || 0));

  const viewBounds = {
    x: left,
    y: top,
    width: Math.max(200, contentBounds.width - left - right),
    height: Math.max(160, contentBounds.height - top)
  };

  const active = getActiveTab();
  if (active && active.view && !active.view.webContents.isDestroyed()) {
    active.view.setBounds(viewBounds);
  }

  if (omniboxPopupVisible && omniboxPopupView && omniboxPopupBounds) {
    omniboxPopupView.setBounds({
      x: Math.round(omniboxPopupBounds.x),
      y: Math.round(omniboxPopupBounds.y),
      width: Math.max(240, Math.round(omniboxPopupBounds.width)),
      height: Math.max(60, Math.round(omniboxPopupBounds.height))
    });
  }
}

function mountActiveTabView() {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  if (mountedTabId && mountedTabId !== activeTabId) {
    const oldTab = getTabById(mountedTabId);
    if (oldTab && oldTab.view) {
      try {
        mainWindow.contentView.removeChildView(oldTab.view);
      } catch {
        // Ignore if already removed
      }
    }
    mountedTabId = null;
  }

  const nextTab = getActiveTab();
  if (nextTab && nextTab.view) {
    if (mountedTabId !== nextTab.id) {
      mainWindow.contentView.addChildView(nextTab.view);
      mountedTabId = nextTab.id;
    }
    if (omniboxPopupVisible && omniboxPopupView) {
      try {
        mainWindow.contentView.removeChildView(omniboxPopupView);
        mainWindow.contentView.addChildView(omniboxPopupView);
      } catch {
        // Ignore layering error
      }
    }
    layoutViewport();
  }
}

function hideOmniboxPopup() {
  if (!omniboxPopupVisible) return;
  omniboxPopupVisible = false;
  if (mainWindow && !mainWindow.isDestroyed() && omniboxPopupView) {
    try {
      mainWindow.contentView.removeChildView(omniboxPopupView);
    } catch {
      // Ignore
    }
  }
}

function showOmniboxPopup(payload) {
  if (!mainWindow || mainWindow.isDestroyed() || !omniboxPopupView) return;
  if (payload && payload.bounds) {
    omniboxPopupBounds = payload.bounds;
  }
  if (!omniboxPopupVisible) {
    mainWindow.contentView.addChildView(omniboxPopupView);
    omniboxPopupVisible = true;
  }
  layoutViewport();
  omniboxPopupView.webContents.send('chrome:popup-data', {
    items: (payload && payload.items) || [],
    selectedIndex: typeof (payload && payload.selectedIndex) === 'number' ? payload.selectedIndex : -1,
    query: (payload && payload.query) || ''
  });
}

function handleKeyboardShortcut(event, input, source) {
  if (input.type !== 'keyDown') return false;
  const ctrl = input.control || input.meta;
  const shift = input.shift;
  const alt = input.alt;
  const key = (input.key || '').toLowerCase();

  if (alt && key === 'arrowleft') {
    event.preventDefault();
    const t = getActiveTab();
    if (t && t.view.webContents.navigationHistory.canGoBack()) t.view.webContents.navigationHistory.goBack();
    return true;
  }
  if (alt && key === 'arrowright') {
    event.preventDefault();
    const t = getActiveTab();
    if (t && t.view.webContents.navigationHistory.canGoForward()) t.view.webContents.navigationHistory.goForward();
    return true;
  }

  if (key === 'f5') {
    event.preventDefault();
    const t = getActiveTab();
    if (t) {
      if (ctrl || shift) t.view.webContents.reloadIgnoringCache();
      else t.view.webContents.reload();
    }
    return true;
  }

  if (key === 'f12' || (ctrl && shift && key === 'i')) {
    event.preventDefault();
    const t = getActiveTab();
    if (t) t.view.webContents.openDevTools({ mode: 'detach' });
    return true;
  }

  if (key === 'escape') {
    if (omniboxPopupVisible) {
      hideOmniboxPopup();
      sendChromeCommand({ type: 'escape-pressed' });
      return true;
    }
    if (source === 'tab') {
      sendChromeCommand({ type: 'escape-pressed' });
    }
    return false;
  }

  if (!ctrl) return false;

  if (key === 't' && !shift) {
    event.preventDefault();
    createTab({ url: 'choogle://home', activate: true });
    sendChromeCommand({ type: 'focus-omnibox' });
    return true;
  }
  if (key === 't' && shift) {
    event.preventDefault();
    reopenLastClosedTab();
    return true;
  }
  if (key === 'w' && !shift) {
    event.preventDefault();
    if (activeTabId) closeTab(activeTabId);
    return true;
  }
  if (key === 'l' && !shift) {
    event.preventDefault();
    sendChromeCommand({ type: 'focus-omnibox' });
    return true;
  }
  if (key === 'r') {
    event.preventDefault();
    const t = getActiveTab();
    if (t) {
      if (shift) t.view.webContents.reloadIgnoringCache();
      else t.view.webContents.reload();
    }
    return true;
  }
  if (key === 'f' && !shift) {
    event.preventDefault();
    sendChromeCommand({ type: 'toggle-find' });
    return true;
  }
  if (key === 'd' && !shift) {
    event.preventDefault();
    const t = getActiveTab();
    if (t) {
      store.toggleBookmark({ title: t.title, url: t.url });
      broadcastState();
    }
    return true;
  }
  if (key === 'h' && !shift) {
    event.preventDefault();
    createTab({ url: 'choogle://history', activate: true });
    return true;
  }
  if (key === 'j' && !shift) {
    event.preventDefault();
    createTab({ url: 'choogle://downloads', activate: true });
    return true;
  }
  if (key === 'b' && shift) {
    event.preventDefault();
    const s = store.getSettings();
    store.updateSettings({ showBookmarksBar: !s.showBookmarksBar });
    broadcastState();
    return true;
  }
  if (key === 's' && shift) {
    event.preventDefault();
    const s = store.getSettings();
    store.updateSettings({ sidebarExpanded: !s.sidebarExpanded });
    broadcastState();
    return true;
  }
  if (key === 'tab') {
    event.preventDefault();
    const wsTabs = tabs.filter((t) => t.workspaceId === store.getActiveWorkspaceId());
    if (wsTabs.length > 1) {
      const idx = wsTabs.findIndex((t) => t.id === activeTabId);
      const nextIdx = shift
        ? (idx - 1 + wsTabs.length) % wsTabs.length
        : (idx + 1) % wsTabs.length;
      activateTab(wsTabs[nextIdx].id);
    }
    return true;
  }
  if (/^[1-9]$/.test(key) && !shift) {
    event.preventDefault();
    const wsTabs = tabs.filter((t) => t.workspaceId === store.getActiveWorkspaceId());
    if (wsTabs.length > 0) {
      const idx = key === '9' ? wsTabs.length - 1 : Math.min(Number(key) - 1, wsTabs.length - 1);
      activateTab(wsTabs[idx].id);
    }
    return true;
  }
  if (key === '=' || key === '+') {
    event.preventDefault();
    zoomTab(activeTabId, 'in');
    return true;
  }
  if (key === '-') {
    event.preventDefault();
    zoomTab(activeTabId, 'out');
    return true;
  }
  if (key === '0') {
    event.preventDefault();
    zoomTab(activeTabId, 'reset');
    return true;
  }

  return false;
}

function attachTabEvents(tab) {
  const wc = tab.view.webContents;

  wc.setWindowOpenHandler(({ url }) => {
    if (url && /^(https?|choogle):\/\//i.test(url)) {
      createTab({ url, workspaceId: tab.workspaceId, activate: true });
    }
    return { action: 'deny' };
  });

  wc.on('before-input-event', (event, input) => {
    handleKeyboardShortcut(event, input, 'tab');
  });

  wc.on('did-start-loading', () => {
    tab.isLoading = true;
    broadcastState();
  });

  wc.on('did-stop-loading', () => {
    tab.isLoading = false;
    tab.url = wc.getURL() || tab.url;
    tab.title = wc.getTitle() || tab.title || tab.url;
    broadcastState();
  });

  wc.on('did-start-navigation', (_event, url, _isInPlace, isMainFrame) => {
    if (isMainFrame) {
      adblock.resetTab(wc.id);
      tab.url = url;
      broadcastState();
    }
  });

  wc.on('did-navigate', (_event, url) => {
    tab.url = url;
    tab.title = wc.getTitle() || url;
    store.addHistory({ url, title: tab.title, favicon: tab.favicon });
    broadcastState();
    saveSessionSnapshot();
  });

  wc.on('did-navigate-in-page', (_event, url, isMainFrame) => {
    if (isMainFrame) {
      tab.url = url;
      broadcastState();
    }
  });

  wc.on('page-title-updated', (_event, title) => {
    tab.title = title || tab.url;
    broadcastState();
  });

  wc.on('page-favicon-updated', (_event, favicons) => {
    if (Array.isArray(favicons) && favicons.length > 0) {
      tab.favicon = favicons[0];
      broadcastState();
    }
  });

  wc.on('audio-state-changed', (event) => {
    tab.isAudible = Boolean(event.audible);
    broadcastState();
  });

  wc.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (!isMainFrame || errorCode === -3) return;
    tab.isLoading = false;
    tab.title = 'Load Error';
    broadcastState();
    const safeUrl = String(validatedURL || '').replace(/[<>"]/g, '');
    const safeDesc = String(errorDescription || 'Connection failed').replace(/[<>"]/g, '');
    wc.loadURL(
      'data:text/html;charset=utf-8,' +
        encodeURIComponent(`<!DOCTYPE html><html><head><style>
        body{margin:0;background:#070B14;color:#F0F6FC;font-family:Segoe UI,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}
        .card{max-width:520px;background:#0D1322;border:1px solid #243047;border-radius:12px;padding:28px}
        h1{margin:0 0 10px;font-size:20px;color:#DFBA73}
        p{color:#94A3B8;font-size:14px;line-height:1.6}
        code{display:block;margin:12px 0;padding:10px;background:#050811;border:1px solid #243047;border-radius:8px;color:#E2E8F0;word-break:break-all}
        button{background:#1B2A4A;border:1px solid #C8A96E;color:#F8FAFC;padding:8px 16px;border-radius:8px;cursor:pointer;margin-right:8px}
        </style></head><body><div class="card"><h1>Unable to load page</h1>
        <p>${safeDesc} (code ${errorCode})</p><code>${safeUrl}</code>
        <button onclick="location.reload()">Retry</button>
        <button onclick="location.href='choogle://home'">Choogle Home</button>
        </div></body></html>`)
    );
  });

  wc.on('context-menu', (_event, params) => {
    const template = [
      {
        label: 'Back',
        enabled: wc.navigationHistory.canGoBack(),
        click: () => wc.navigationHistory.goBack()
      },
      {
        label: 'Forward',
        enabled: wc.navigationHistory.canGoForward(),
        click: () => wc.navigationHistory.goForward()
      },
      {
        label: 'Reload',
        click: () => wc.reload()
      },
      { type: 'separator' }
    ];

    if (params.linkURL) {
      template.push({
        label: 'Open Link in New Tab',
        click: () => createTab({ url: params.linkURL, workspaceId: tab.workspaceId, activate: true })
      });
      template.push({
        label: 'Copy Link Address',
        click: () => {
          const { clipboard } = require('electron');
          clipboard.writeText(params.linkURL);
        }
      });
      template.push({ type: 'separator' });
    }

    if (params.hasImageContents && params.srcURL) {
      template.push({
        label: 'Save Image As...',
        click: () => wc.downloadURL(params.srcURL)
      });
      template.push({ type: 'separator' });
    }

    if (params.isEditable) {
      template.push({ role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' });
    } else if (params.selectionText) {
      template.push({ role: 'copy' });
      template.push({
        label: `Search Choogle for "${params.selectionText.slice(0, 28)}"`,
        click: () => {
          const qUrl = resolveNavigationInput(params.selectionText, store.getSettings().searchEngine);
          createTab({ url: qUrl, workspaceId: tab.workspaceId, activate: true });
        }
      });
    } else {
      template.push({ role: 'selectAll' });
    }

    template.push(
      { type: 'separator' },
      {
        label: 'Inspect Element',
        click: () => wc.inspectElement(params.x, params.y)
      }
    );

    const menu = Menu.buildFromTemplate(template);
    menu.popup({ window: mainWindow });
  });
}

function createTab({ url, workspaceId, activate = true, pinned = false } = {}) {
  const wsId = workspaceId || store.getActiveWorkspaceId();
  const targetUrl = resolveNavigationInput(url || 'choogle://home', store.getSettings().searchEngine);
  const id = `tab_${tabCounter++}`;

  const view = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, 'preload-internal.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true
    }
  });
  view.setBackgroundColor('#070B14');

  const tab = {
    id,
    workspaceId: wsId,
    title: targetUrl.startsWith('choogle://') ? 'Choogle' : targetUrl,
    url: targetUrl,
    favicon: '',
    isLoading: true,
    pinned: Boolean(pinned),
    muted: false,
    isAudible: false,
    zoomFactor: 1,
    view
  };

  webContentsToTab.set(view.webContents.id, tab);
  tabs.push(tab);
  attachTabEvents(tab);

  if (activate) {
    if (wsId !== store.getActiveWorkspaceId()) {
      store.setActiveWorkspaceId(wsId);
    }
    activeTabId = id;
    mountActiveTabView();
  }

  view.webContents.loadURL(targetUrl).catch(() => {});
  broadcastState();
  saveSessionSnapshot();
  return tab;
}

function activateTab(tabId) {
  const tab = getTabById(tabId);
  if (!tab) return false;
  hideOmniboxPopup();
  if (tab.workspaceId !== store.getActiveWorkspaceId()) {
    store.setActiveWorkspaceId(tab.workspaceId);
  }
  activeTabId = tab.id;
  mountActiveTabView();
  broadcastState();
  return true;
}

function closeTab(tabId) {
  const idx = tabs.findIndex((t) => t.id === tabId);
  if (idx < 0) return false;

  const tab = tabs[idx];
  const wsId = tab.workspaceId;

  if (tab.url) {
    closedTabsStack.push({ url: tab.url, workspaceId: wsId, title: tab.title });
    if (closedTabsStack.length > 25) closedTabsStack.shift();
  }

  if (mountedTabId === tab.id && mainWindow && !mainWindow.isDestroyed()) {
    try {
      mainWindow.contentView.removeChildView(tab.view);
    } catch {
      // Ignore
    }
    mountedTabId = null;
  }

  const wcId = tab.view.webContents.id;
  webContentsToTab.delete(wcId);
  adblock.removeTab(wcId);

  try {
    tab.view.webContents.close({ waitForBeforeUnload: false });
  } catch {
    // Ignore
  }

  tabs.splice(idx, 1);

  const wsTabs = tabs.filter((t) => t.workspaceId === wsId);
  if (activeTabId === tabId) {
    if (wsTabs.length > 0) {
      const fallback = wsTabs[Math.min(idx, wsTabs.length - 1)] || wsTabs[0];
      activeTabId = fallback.id;
      mountActiveTabView();
    } else {
      const fresh = createTab({ url: 'choogle://home', workspaceId: wsId, activate: true });
      activeTabId = fresh.id;
      return true;
    }
  } else if (wsTabs.length === 0 && wsId === store.getActiveWorkspaceId()) {
    createTab({ url: 'choogle://home', workspaceId: wsId, activate: true });
    return true;
  }

  broadcastState();
  saveSessionSnapshot();
  return true;
}

function reopenLastClosedTab() {
  const last = closedTabsStack.pop();
  if (!last) return null;
  return createTab({ url: last.url, workspaceId: last.workspaceId, activate: true });
}

function zoomTab(tabId, action) {
  const tab = getTabById(tabId || activeTabId);
  if (!tab || tab.view.webContents.isDestroyed()) return 1;
  let factor = tab.view.webContents.getZoomFactor() || 1;
  if (action === 'in') factor = Math.min(2.5, Number((factor + 0.1).toFixed(2)));
  else if (action === 'out') factor = Math.max(0.5, Number((factor - 0.1).toFixed(2)));
  else factor = 1;
  tab.zoomFactor = factor;
  tab.view.webContents.setZoomFactor(factor);
  broadcastState();
  return factor;
}

function switchWorkspace(workspaceId) {
  const nextWs = store.setActiveWorkspaceId(workspaceId);
  hideOmniboxPopup();
  const wsTabs = tabs.filter((t) => t.workspaceId === nextWs);
  if (wsTabs.length > 0) {
    activeTabId = wsTabs[0].id;
    mountActiveTabView();
    broadcastState();
  } else {
    createTab({ url: 'choogle://home', workspaceId: nextWs, activate: true });
  }
  return nextWs;
}

function saveSessionSnapshot() {
  if (IS_SMOKE_TEST || !store.getSettings().restoreSession) return;
  const grouped = {};
  for (const t of tabs) {
    if (!grouped[t.workspaceId]) grouped[t.workspaceId] = [];
    grouped[t.workspaceId].push({ url: t.url, pinned: t.pinned });
  }
  store.saveSessionTabs(grouped);
}

function restorePreviousSession() {
  const settings = store.getSettings();
  const activeWs = store.getActiveWorkspaceId();
  if (!IS_SMOKE_TEST && settings.restoreSession) {
    const saved = store.getSessionTabs();
    const wsIds = Object.keys(saved);
    if (wsIds.length > 0) {
      let restoredCount = 0;
      for (const wsId of wsIds) {
        if (!store.getWorkspaces().some((w) => w.id === wsId)) continue;
        const list = Array.isArray(saved[wsId]) ? saved[wsId] : [];
        for (const item of list) {
          if (item && item.url) {
            createTab({
              url: item.url,
              workspaceId: wsId,
              activate: false,
              pinned: Boolean(item.pinned)
            });
            restoredCount++;
          }
        }
      }
      if (restoredCount > 0) {
        const wsTabs = tabs.filter((t) => t.workspaceId === activeWs);
        const first = wsTabs[0] || tabs[0];
        if (first) {
          activateTab(first.id);
          return;
        }
      }
    }
  }
  createTab({ url: 'choogle://home', workspaceId: activeWs, activate: true });
}

function runPowerShellScript(scriptName) {
  return new Promise((resolve) => {
    const scriptPath = path.join(CHOOGLE_ROOT, scriptName);
    execFile(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath],
      { cwd: CHOOGLE_ROOT, timeout: 45000 },
      (err, stdout, stderr) => {
        resolve({
          ok: !err,
          stdout: String(stdout || '').trim(),
          stderr: String(stderr || '').trim()
        });
      }
    );
  });
}

function assertChromeSender(event) {
  const wcId = event && event.sender ? event.sender.id : -1;
  if (wcId <= 0 || (wcId !== chromeWebContentsId && wcId !== popupWebContentsId)) {
    const senderUrl = event && event.sender ? event.sender.getURL() : '';
    throw new Error(`Unauthorized chrome IPC sender (wcId=${wcId}, chromeId=${chromeWebContentsId}, popupId=${popupWebContentsId}, url=${senderUrl})`);
  }
}

function assertInternalOrigin(event) {
  const frameUrl = event && event.senderFrame ? event.senderFrame.url : '';
  if (!frameUrl || !frameUrl.startsWith('choogle://')) {
    throw new Error('Forbidden: internal Choogle API restricted to choogle:// origin');
  }
}

function registerIpcHandlers() {
  ipcMain.handle('chrome:get-initial-state', (e) => {
    assertChromeSender(e);
    return {
      ...buildStateSnapshot(),
      history: store.getHistory('', 120),
      downloads: store.getDownloads(),
      projectsRegistry: loadProjectsRegistry()
    };
  });

  ipcMain.handle('chrome:create-tab', (e, opts) => {
    assertChromeSender(e);
    const t = createTab(opts);
    return serializeTab(t);
  });

  ipcMain.handle('chrome:close-tab', (e, tabId) => {
    assertChromeSender(e);
    return closeTab(tabId);
  });

  ipcMain.handle('chrome:activate-tab', (e, tabId) => {
    assertChromeSender(e);
    return activateTab(tabId);
  });

  ipcMain.handle('chrome:toggle-pin-tab', (e, tabId) => {
    assertChromeSender(e);
    const tab = getTabById(tabId);
    if (!tab) return false;
    tab.pinned = !tab.pinned;
    broadcastState();
    saveSessionSnapshot();
    return tab.pinned;
  });

  ipcMain.handle('chrome:toggle-mute-tab', (e, tabId) => {
    assertChromeSender(e);
    const tab = getTabById(tabId);
    if (!tab || tab.view.webContents.isDestroyed()) return false;
    tab.muted = !tab.muted;
    tab.view.webContents.setAudioMuted(tab.muted);
    broadcastState();
    return tab.muted;
  });

  ipcMain.handle('chrome:reopen-closed-tab', (e) => {
    assertChromeSender(e);
    const t = reopenLastClosedTab();
    return t ? serializeTab(t) : null;
  });

  ipcMain.handle('chrome:navigate', (e, { tabId, input }) => {
    assertChromeSender(e);
    hideOmniboxPopup();
    const tab = getTabById(tabId || activeTabId) || getActiveTab();
    if (!tab) return null;
    const url = resolveNavigationInput(input, store.getSettings().searchEngine);
    tab.url = url;
    tab.view.webContents.loadURL(url).catch(() => {});
    broadcastState();
    return url;
  });

  ipcMain.handle('chrome:go-back', (e, tabId) => {
    assertChromeSender(e);
    const tab = getTabById(tabId || activeTabId);
    if (tab && tab.view.webContents.navigationHistory.canGoBack()) {
      tab.view.webContents.navigationHistory.goBack();
      return true;
    }
    return false;
  });

  ipcMain.handle('chrome:go-forward', (e, tabId) => {
    assertChromeSender(e);
    const tab = getTabById(tabId || activeTabId);
    if (tab && tab.view.webContents.navigationHistory.canGoForward()) {
      tab.view.webContents.navigationHistory.goForward();
      return true;
    }
    return false;
  });

  ipcMain.handle('chrome:reload', (e, { tabId, ignoreCache }) => {
    assertChromeSender(e);
    const tab = getTabById(tabId || activeTabId);
    if (!tab) return false;
    if (ignoreCache) tab.view.webContents.reloadIgnoringCache();
    else tab.view.webContents.reload();
    return true;
  });

  ipcMain.handle('chrome:stop', (e, tabId) => {
    assertChromeSender(e);
    const tab = getTabById(tabId || activeTabId);
    if (!tab) return false;
    tab.view.webContents.stop();
    tab.isLoading = false;
    broadcastState();
    return true;
  });

  ipcMain.handle('chrome:zoom', (e, { tabId, action }) => {
    assertChromeSender(e);
    return zoomTab(tabId, action);
  });

  ipcMain.handle('chrome:find-in-page', (e, { tabId, text, options }) => {
    assertChromeSender(e);
    const tab = getTabById(tabId || activeTabId);
    if (!tab || !text) return null;
    return tab.view.webContents.findInPage(String(text), options || {});
  });

  ipcMain.handle('chrome:stop-find-in-page', (e, tabId) => {
    assertChromeSender(e);
    const tab = getTabById(tabId || activeTabId);
    if (!tab) return false;
    tab.view.webContents.stopFindInPage('clearSelection');
    return true;
  });

  ipcMain.handle('chrome:open-devtools', (e, tabId) => {
    assertChromeSender(e);
    const tab = getTabById(tabId || activeTabId);
    if (!tab) return false;
    tab.view.webContents.openDevTools({ mode: 'detach' });
    return true;
  });

  ipcMain.handle('chrome:set-viewport-bounds', (e, bounds) => {
    assertChromeSender(e);
    if (!mainWindow || mainWindow.isDestroyed()) return false;
    if (bounds && typeof bounds === 'object') {
      currentOffsets = {
        topOffset: Number(bounds.topOffset) || 0,
        leftOffset: Number(bounds.leftOffset) || 0,
        rightOffset: Number(bounds.rightOffset) || 0
      };
      layoutViewport();
    }
    return true;
  });

  ipcMain.handle('chrome:open-omnibox-popup', (e, payload) => {
    assertChromeSender(e);
    showOmniboxPopup(payload);
    return true;
  });

  ipcMain.handle('chrome:update-omnibox-popup', (e, payload) => {
    assertChromeSender(e);
    showOmniboxPopup(payload);
    return true;
  });

  ipcMain.handle('chrome:close-omnibox-popup', (e) => {
    assertChromeSender(e);
    hideOmniboxPopup();
    return true;
  });

  ipcMain.handle('chrome:select-omnibox-item', (e, item) => {
    assertChromeSender(e);
    hideOmniboxPopup();
    if (!item) return false;
    if (item.kind === 'tab' && item.tabId) {
      activateTab(item.tabId);
    } else if (item.url) {
      const tab = getActiveTab();
      if (tab) {
        const url = resolveNavigationInput(item.url, store.getSettings().searchEngine);
        tab.view.webContents.loadURL(url).catch(() => {});
      }
    }
    sendChromeCommand({ type: 'omnibox-selected', item });
    return true;
  });

  ipcMain.handle('chrome:set-workspace', (e, workspaceId) => {
    assertChromeSender(e);
    return switchWorkspace(workspaceId);
  });

  ipcMain.handle('chrome:add-workspace', (e, payload) => {
    assertChromeSender(e);
    const ws = store.addWorkspace(payload || {});
    broadcastState();
    return ws;
  });

  ipcMain.handle('chrome:remove-workspace', (e, workspaceId) => {
    assertChromeSender(e);
    const fallbackWs = store.getWorkspaces().find((w) => w.id !== workspaceId);
    if (!fallbackWs) return false;
    for (const t of tabs) {
      if (t.workspaceId === workspaceId) {
        t.workspaceId = fallbackWs.id;
      }
    }
    const ok = store.removeWorkspace(workspaceId);
    switchWorkspace(store.getActiveWorkspaceId());
    broadcastState();
    return ok;
  });

  ipcMain.handle('chrome:update-settings', (e, patch) => {
    assertChromeSender(e);
    const next = store.updateSettings(patch);
    broadcastState();
    return next;
  });

  ipcMain.handle('chrome:toggle-bookmark', (e, payload) => {
    assertChromeSender(e);
    const res = store.toggleBookmark(payload || {});
    broadcastState();
    return res;
  });

  ipcMain.handle('chrome:remove-bookmark', (e, idOrUrl) => {
    assertChromeSender(e);
    const ok = store.removeBookmark(idOrUrl);
    broadcastState();
    return ok;
  });

  ipcMain.handle('chrome:clear-history', (e) => {
    assertChromeSender(e);
    store.clearHistory();
    mainWindow.webContents.send('chrome:history-update', { history: [] });
    return true;
  });

  ipcMain.handle('chrome:clear-downloads', (e) => {
    assertChromeSender(e);
    const next = store.clearDownloads();
    broadcastDownloads();
    return next;
  });

  ipcMain.handle('chrome:open-download', (e, id) => {
    assertChromeSender(e);
    const item = store.getDownloads().find((d) => d.id === id);
    if (item && item.savePath && fs.existsSync(item.savePath)) {
      shell.openPath(item.savePath);
      return true;
    }
    return false;
  });

  ipcMain.handle('chrome:show-download-in-folder', (e, id) => {
    assertChromeSender(e);
    const item = store.getDownloads().find((d) => d.id === id);
    if (item && item.savePath && fs.existsSync(item.savePath)) {
      shell.showItemInFolder(item.savePath);
      return true;
    }
    return false;
  });

  ipcMain.handle('chrome:toggle-allowlist', (e, host) => {
    assertChromeSender(e);
    const res = store.toggleAllowlistHost(host);
    broadcastState();
    return res;
  });

  ipcMain.handle('chrome:get-projects-registry', (e) => {
    assertChromeSender(e);
    return loadProjectsRegistry();
  });

  ipcMain.handle('chrome:sync-projects', async (e) => {
    assertChromeSender(e);
    const res = await runPowerShellScript('Sync-ChoogleProjects.ps1');
    return { ...res, projectsRegistry: loadProjectsRegistry() };
  });

  ipcMain.handle('chrome:window-action', (e, action) => {
    assertChromeSender(e);
    if (!mainWindow || mainWindow.isDestroyed()) return false;
    if (action === 'minimize') mainWindow.minimize();
    else if (action === 'maximize') {
      if (mainWindow.isMaximized()) mainWindow.unmaximize();
      else mainWindow.maximize();
    } else if (action === 'close') {
      mainWindow.close();
    }
    return true;
  });

  // ── INTERNAL choogle:// PAGE IPC (strict origin gated) ───────────────────
  ipcMain.handle('internal:get-context', (e) => {
    assertInternalOrigin(e);
    return {
      settings: store.getSettings(),
      workspaces: store.getWorkspaces(),
      activeWorkspaceId: store.getActiveWorkspaceId(),
      bookmarks: store.getBookmarks(),
      stats: store.getStats(),
      projectsRegistry: loadProjectsRegistry()
    };
  });

  ipcMain.handle('internal:navigate', (e, url) => {
    assertInternalOrigin(e);
    const resolved = resolveNavigationInput(url, store.getSettings().searchEngine);
    const senderTab = webContentsToTab.get(e.sender.id) || getActiveTab();
    if (senderTab) {
      senderTab.view.webContents.loadURL(resolved).catch(() => {});
      return resolved;
    }
    return null;
  });

  ipcMain.handle('internal:open-new-tab', (e, url) => {
    assertInternalOrigin(e);
    const tab = createTab({ url, activate: true });
    return serializeTab(tab);
  });

  ipcMain.handle('internal:get-bookmarks', (e) => {
    assertInternalOrigin(e);
    return store.getBookmarks();
  });

  ipcMain.handle('internal:add-bookmark', (e, item) => {
    assertInternalOrigin(e);
    const bm = store.addBookmark(item || {});
    broadcastState();
    return bm;
  });

  ipcMain.handle('internal:remove-bookmark', (e, idOrUrl) => {
    assertInternalOrigin(e);
    const ok = store.removeBookmark(idOrUrl);
    broadcastState();
    return ok;
  });

  ipcMain.handle('internal:get-history', (e, opts) => {
    assertInternalOrigin(e);
    const o = opts || {};
    return store.getHistory(o.query, o.limit);
  });

  ipcMain.handle('internal:remove-history-entry', (e, id) => {
    assertInternalOrigin(e);
    const ok = store.removeHistoryEntry(id);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('chrome:history-update', { history: store.getHistory('', 120) });
    }
    return ok;
  });

  ipcMain.handle('internal:clear-history', (e) => {
    assertInternalOrigin(e);
    store.clearHistory();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('chrome:history-update', { history: [] });
    }
    return true;
  });

  ipcMain.handle('internal:get-downloads', (e) => {
    assertInternalOrigin(e);
    return store.getDownloads();
  });

  ipcMain.handle('internal:clear-downloads', (e) => {
    assertInternalOrigin(e);
    const next = store.clearDownloads();
    broadcastDownloads();
    return next;
  });

  ipcMain.handle('internal:open-download', (e, id) => {
    assertInternalOrigin(e);
    const item = store.getDownloads().find((d) => d.id === id);
    if (item && item.savePath && fs.existsSync(item.savePath)) {
      shell.openPath(item.savePath);
      return true;
    }
    return false;
  });

  ipcMain.handle('internal:show-download-in-folder', (e, id) => {
    assertInternalOrigin(e);
    const item = store.getDownloads().find((d) => d.id === id);
    if (item && item.savePath && fs.existsSync(item.savePath)) {
      shell.showItemInFolder(item.savePath);
      return true;
    }
    return false;
  });

  ipcMain.handle('internal:get-settings', (e) => {
    assertInternalOrigin(e);
    return store.getSettings();
  });

  ipcMain.handle('internal:update-settings', (e, patch) => {
    assertInternalOrigin(e);
    const next = store.updateSettings(patch);
    broadcastState();
    return next;
  });

  ipcMain.handle('internal:toggle-allowlist', (e, host) => {
    assertInternalOrigin(e);
    const res = store.toggleAllowlistHost(host);
    broadcastState();
    return res;
  });

  ipcMain.handle('internal:add-workspace', (e, payload) => {
    assertInternalOrigin(e);
    const ws = store.addWorkspace(payload || {});
    broadcastState();
    return ws;
  });

  ipcMain.handle('internal:remove-workspace', (e, id) => {
    assertInternalOrigin(e);
    const fallbackWs = store.getWorkspaces().find((w) => w.id !== id);
    if (!fallbackWs) return false;
    for (const t of tabs) {
      if (t.workspaceId === id) t.workspaceId = fallbackWs.id;
    }
    const ok = store.removeWorkspace(id);
    switchWorkspace(store.getActiveWorkspaceId());
    broadcastState();
    return ok;
  });

  ipcMain.handle('internal:set-active-workspace', (e, id) => {
    assertInternalOrigin(e);
    return switchWorkspace(id);
  });

  ipcMain.handle('internal:get-projects-registry', (e) => {
    assertInternalOrigin(e);
    return loadProjectsRegistry();
  });

  ipcMain.handle('internal:sync-projects', async (e) => {
    assertInternalOrigin(e);
    const res = await runPowerShellScript('Sync-ChoogleProjects.ps1');
    return { ...res, projectsRegistry: loadProjectsRegistry() };
  });

  ipcMain.handle('internal:install-shortcut', async (e) => {
    assertInternalOrigin(e);
    return await runPowerShellScript('Install-ChoogleShortcut.ps1');
  });
}

function attachDownloadListener() {
  session.defaultSession.on('will-download', (_event, item) => {
    const id = `dl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const record = {
      id,
      filename: item.getFilename(),
      url: item.getURL(),
      savePath: '',
      totalBytes: item.getTotalBytes(),
      receivedBytes: 0,
      state: 'progressing',
      startedAt: Date.now()
    };
    store.upsertDownload(record);
    broadcastDownloads();

    item.on('updated', (_ev, state) => {
      store.upsertDownload({
        id,
        savePath: item.getSavePath() || '',
        totalBytes: item.getTotalBytes(),
        receivedBytes: item.getReceivedBytes(),
        state: state === 'interrupted' ? 'interrupted' : 'progressing'
      });
      broadcastDownloads();
    });

    item.once('done', (_ev, state) => {
      store.upsertDownload({
        id,
        savePath: item.getSavePath() || '',
        totalBytes: item.getTotalBytes(),
        receivedBytes: item.getReceivedBytes(),
        state,
        completedAt: Date.now()
      });
      broadcastDownloads();
    });
  });
}

function createBrowserWindow() {
  const iconPath = path.join(CHOOGLE_ROOT, 'assets', 'icons', 'choogle.ico');
  mainWindow = new BrowserWindow({
    title: 'Choogle Browser',
    width: 1420,
    height: 900,
    minWidth: 760,
    minHeight: 540,
    frame: false,
    backgroundColor: '#070B14',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload-chrome.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.once('ready-to-show', () => {
    if (!IS_SMOKE_TEST && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  omniboxPopupView = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, 'preload-chrome.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      transparent: true
    }
  });
  chromeWebContentsId = mainWindow.webContents.id;
  popupWebContentsId = omniboxPopupView.webContents.id;
  omniboxPopupView.setBackgroundColor('#00000000');
  omniboxPopupView.webContents.loadFile(path.join(__dirname, 'omnibox-popup.html'));

  mainWindow.webContents.on('before-input-event', (event, input) => {
    handleKeyboardShortcut(event, input, 'chrome');
  });

  mainWindow.on('resize', () => layoutViewport());
  mainWindow.on('maximize', () => {
    layoutViewport();
    broadcastState();
  });
  mainWindow.on('unmaximize', () => {
    layoutViewport();
    broadcastState();
  });

  mainWindow.on('close', () => {
    saveSessionSnapshot();
    store.saveSync();
  });

  mainWindow.loadFile(path.join(__dirname, 'chrome.html'));
  restorePreviousSession();
}

async function waitForTabLoad(tab, url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const wc = tab.view.webContents;
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timeout loading ${url}`));
    }, timeoutMs);

    const onFinish = () => {
      cleanup();
      resolve({ url: wc.getURL(), title: wc.getTitle() });
    };
    const onFail = (_ev, code, desc, _failedUrl, isMain) => {
      if (!isMain || code === -3) return;
      cleanup();
      reject(new Error(`Failed loading ${url}: ${desc} (${code})`));
    };
    const cleanup = () => {
      clearTimeout(timer);
      wc.removeListener('did-finish-load', onFinish);
      wc.removeListener('did-fail-load', onFail);
    };

    wc.on('did-finish-load', onFinish);
    wc.on('did-fail-load', onFail);
    wc.loadURL(url).catch((err) => {
      cleanup();
      reject(err);
    });
  });
}

async function runSmokeTest() {
  const consoleErrors = [];
  mainWindow.webContents.on('console-message', (event) => {
    const level = event && event.level;
    const msg = event && event.message ? event.message : '';
    if (level === 'error' || Number(level) >= 3) {
      consoleErrors.push(`[chrome] ${msg}`);
    }
  });

  await new Promise((r) => setTimeout(r, 900));

  const active = getActiveTab();
  let allowAdblockConsoleError = false;
  active.view.webContents.on('console-message', (event) => {
    const level = event && event.level;
    const msg = event && event.message ? event.message : '';
    if (level === 'error' || Number(level) >= 3) {
      if (allowAdblockConsoleError && (msg.includes('ERR_FAILED') || msg.includes('ERR_BLOCKED_BY_CLIENT') || msg.includes('doubleclick'))) {
        return;
      }
      consoleErrors.push(`[tab:${active.url}] ${msg}`);
    }
  });

  const routes = [
    'choogle://home',
    'choogle://hub',
    'choogle://icons',
    'choogle://bookmarks',
    'choogle://history',
    'choogle://downloads',
    'choogle://settings',
    'choogle://app/chai.html',
    'choogle://projects/chess/index.html'
  ];

  for (const route of routes) {
    await waitForTabLoad(active, route, 15000);
    await new Promise((r) => setTimeout(r, 250));
    const bodyLen = await active.view.webContents.executeJavaScript('document.body ? document.body.innerText.trim().length : 0');
    if (bodyLen <= 0) {
      throw new Error(`Empty document rendered for ${route}`);
    }

    if (route === 'choogle://home') {
      const homeOk = await active.view.webContents.executeJavaScript(`({
        hasIcons: typeof window.ChoogleIcons === 'object',
        suiteCount: document.querySelectorAll('#suite-grid .suite-tile').length,
        projCount: Number((document.getElementById('tel-proj-count') || {}).textContent || 0)
      })`);
      if (!homeOk.hasIcons || homeOk.suiteCount < 6 || homeOk.projCount <= 30) {
        throw new Error('choogle://home hydration failed: ' + JSON.stringify(homeOk));
      }
    } else if (route === 'choogle://hub') {
      const hubCount = await active.view.webContents.executeJavaScript(`document.querySelectorAll('#hub-apps-grid .project-card').length`);
      if (hubCount <= 50) {
        throw new Error(`choogle://hub hydration failed: project-card count=${hubCount}`);
      }
    } else if (route === 'choogle://icons') {
      const iconStats = await active.view.webContents.executeJavaScript(`({
        cells: document.querySelectorAll('#icons-grid .icon-cell').length,
        previews: document.querySelectorAll('#preview-stage svg').length
      })`);
      if (iconStats.cells !== 70 || iconStats.previews !== 4) {
        throw new Error('choogle://icons hydration failed: ' + JSON.stringify(iconStats));
      }
    } else if (route === 'choogle://bookmarks') {
      const bmCount = await active.view.webContents.executeJavaScript(`document.querySelectorAll('#bm-list .bm-row').length`);
      if (bmCount < 6) {
        throw new Error(`choogle://bookmarks hydration failed: bm-row count=${bmCount}`);
      }
    } else if (route === 'choogle://settings') {
      const wsCount = await active.view.webContents.executeJavaScript(`document.querySelectorAll('#ws-list .ws-chip').length`);
      if (wsCount < 4) {
        throw new Error(`choogle://settings hydration failed: ws-chip count=${wsCount}`);
      }
    }

    console.log(`[SMOKE OK] ${route} (textLen=${bodyLen})`);
  }

  // Test tab creation + switching
  const t2 = createTab({ url: 'choogle://icons', activate: true });
  await new Promise((r) => setTimeout(r, 400));
  if (activeTabId !== t2.id) throw new Error('Tab activation failed');
  activateTab(active.id);

  // Test layout switching
  for (const mode of ['dual', 'sidebar', 'topbar', 'dual']) {
    const updated = store.updateSettings({ layoutMode: mode });
    if (updated.layoutMode !== mode) throw new Error(`Layout switch failed: ${mode}`);
  }

  // Test bookmark add/remove
  const bm = store.addBookmark({ title: 'Smoke BM', url: 'https://example.org', iconId: 'cat-code' });
  if (!bm || !store.isBookmarked('https://example.org')) throw new Error('Bookmark add failed');
  store.removeBookmark('https://example.org');
  if (store.isBookmarked('https://example.org')) throw new Error('Bookmark remove failed');

  // Test adblock decision engine
  const blockedVerdict = adblock.testRequest('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', 'example.com', 'script');
  if (!blockedVerdict.blocked) throw new Error('Adblock engine did not block ad script');
  const cleanVerdict = adblock.testRequest('https://example.com/app.js', 'example.com', 'script');
  if (cleanVerdict.blocked) throw new Error('Adblock false positive on example.com');

  // Test real HTTPS navigation
  await waitForTabLoad(active, 'https://example.com', 15000);
  const extTitle = await active.view.webContents.executeJavaScript('document.title');
  if (!extTitle || !extTitle.toLowerCase().includes('example')) {
    throw new Error(`Unexpected title from https://example.com: ${extTitle}`);
  }
  console.log(`[SMOKE OK] https://example.com (title=${extTitle})`);

  // Verify external origin cannot access internal Choogle IPC
  const ipcIsolated = await active.view.webContents.executeJavaScript(`
    window.choogleInternal.getContext().then(() => false).catch(() => true)
  `);
  if (!ipcIsolated) throw new Error('Security failure: external website accessed choogleInternal.getContext()');
  console.log('[SMOKE OK] External origin IPC isolation verified');

  // Test live WebRequest interception inside a tab
  allowAdblockConsoleError = true;
  const liveFetchBlocked = await active.view.webContents.executeJavaScript(`
    fetch('https://doubleclick.net/ad_status.js').then(() => false).catch(() => true)
  `);
  allowAdblockConsoleError = false;
  if (!liveFetchBlocked) throw new Error('Live webRequest adblock interception did not block doubleclick.net');
  console.log('[SMOKE OK] Live webRequest adblock verified');

  if (consoleErrors.length > 0) {
    throw new Error('Console errors encountered: ' + consoleErrors.join('; '));
  }

  console.log('[SMOKE PASS] All Choogle Browser 2.0 checks passed');
}

app.whenReady().then(async () => {
  const cleanUa = session.defaultSession.getUserAgent().replace(/\sElectron\/[^\s]+/g, '');
  session.defaultSession.setUserAgent(cleanUa);

  store = new ChoogleStore(app.getPath('userData'));
  adblock = new ChoogleAdblock(store);

  registerChoogleProtocol(protocol, CHOOGLE_ROOT);

  adblock.attach(
    session.defaultSession,
    (wcId) => {
      const t = webContentsToTab.get(wcId);
      return t ? getHostFromUrl(t.url) : '';
    },
    () => {
      broadcastState();
    }
  );

  attachDownloadListener();
  registerIpcHandlers();
  createBrowserWindow();

  if (IS_SMOKE_TEST) {
    try {
      await runSmokeTest();
      app.exit(0);
    } catch (err) {
      console.error('[SMOKE FAIL]', err && err.stack ? err.stack : err);
      app.exit(1);
    }
  }
});

app.on('before-quit', () => {
  saveSessionSnapshot();
  if (store) store.saveSync();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
