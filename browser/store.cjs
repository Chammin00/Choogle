'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MAX_HISTORY = 2000;
const MAX_DOWNLOADS = 500;

function createId(prefix) {
  if (typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function defaultState() {
  return {
    version: 2,
    settings: {
      layoutMode: 'dual',
      sidebarExpanded: false,
      showBookmarksBar: true,
      searchEngine: 'google',
      adblockEnabled: true,
      adblockAllowlist: [],
      theme: 'navy-gold',
      cosmicBackdrop: true,
      restoreSession: true
    },
    workspaces: [
      { id: 'personal', name: 'Personal', color: '#DFBA73', icon: 'app-choogle' },
      { id: 'dev', name: 'Dev & Projects', color: '#58A6FF', icon: 'cat-code' },
      { id: 'security', name: 'Security & Labs', color: '#3FB950', icon: 'cat-security' },
      { id: 'media', name: 'Media & Games', color: '#BC8CFF', icon: 'cat-game' }
    ],
    activeWorkspaceId: 'personal',
    bookmarks: [
      { id: 'bm_home', title: 'Choogle Home', url: 'choogle://home', iconId: 'app-choogle', folder: 'Choogle Suite', createdAt: Date.now() },
      { id: 'bm_hub', title: 'App Hub', url: 'choogle://hub', iconId: 'app-hub', folder: 'Choogle Suite', createdAt: Date.now() },
      { id: 'bm_icons', title: 'Icon Studio', url: 'choogle://icons', iconId: 'app-icons', folder: 'Choogle Suite', createdAt: Date.now() },
      { id: 'bm_chai', title: 'chAI', url: 'choogle://app/chai.html', iconId: 'app-chai', folder: 'Choogle Suite', createdAt: Date.now() },
      { id: 'bm_tasks', title: 'Tasks', url: 'choogle://app/tasks.html', iconId: 'app-tasks', folder: 'Choogle Suite', createdAt: Date.now() },
      { id: 'bm_notepad', title: 'Notepad', url: 'choogle://app/notepad.html', iconId: 'app-notepad', folder: 'Choogle Suite', createdAt: Date.now() },
      { id: 'bm_github', title: 'GitHub', url: 'https://github.com', iconId: 'cat-code', folder: 'Web', createdAt: Date.now() },
      { id: 'bm_youtube', title: 'YouTube', url: 'https://www.youtube.com', iconId: 'cat-media', folder: 'Web', createdAt: Date.now() }
    ],
    history: [],
    downloads: [],
    pinnedApps: [
      { title: 'Choogle Home', url: 'choogle://home', iconId: 'app-choogle' },
      { title: 'App Hub', url: 'choogle://hub', iconId: 'app-hub' },
      { title: 'chAI Assistant', url: 'choogle://app/chai.html', iconId: 'app-chai' },
      { title: 'Tasks Kanban', url: 'choogle://app/tasks.html', iconId: 'app-tasks' },
      { title: 'Notepad', url: 'choogle://app/notepad.html', iconId: 'app-notepad' },
      { title: 'Web Store', url: 'choogle://app/webstore.html', iconId: 'app-webstore' },
      { title: 'Icon Studio', url: 'choogle://icons', iconId: 'app-icons' }
    ],
    session: {
      tabsByWorkspace: {}
    },
    stats: {
      totalBlocked: 0
    }
  };
}

class ChoogleStore {
  constructor(userDataDir) {
    this.userDataDir = userDataDir;
    this.filePath = path.join(userDataDir, 'choogle-state.json');
    this._saveTimer = null;
    this.state = this._load();
  }

  _load() {
    const base = defaultState();
    try {
      fs.mkdirSync(this.userDataDir, { recursive: true });
      if (!fs.existsSync(this.filePath)) {
        return base;
      }
      const raw = fs.readFileSync(this.filePath, 'utf8');
      const parsed = JSON.parse(raw);
      return {
        ...base,
        ...parsed,
        settings: { ...base.settings, ...(parsed.settings || {}) },
        workspaces: Array.isArray(parsed.workspaces) && parsed.workspaces.length > 0 ? parsed.workspaces : base.workspaces,
        bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : base.bookmarks,
        history: Array.isArray(parsed.history) ? parsed.history.slice(0, MAX_HISTORY) : [],
        downloads: Array.isArray(parsed.downloads) ? parsed.downloads.slice(0, MAX_DOWNLOADS) : [],
        pinnedApps: Array.isArray(parsed.pinnedApps) && parsed.pinnedApps.length > 0 ? parsed.pinnedApps : base.pinnedApps,
        session: {
          tabsByWorkspace: (parsed.session && parsed.session.tabsByWorkspace) || {}
        },
        stats: { ...base.stats, ...(parsed.stats || {}) }
      };
    } catch {
      return base;
    }
  }

  scheduleSave() {
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      this._saveTimer = null;
      this.saveSync();
    }, 250);
  }

  saveSync() {
    try {
      fs.mkdirSync(this.userDataDir, { recursive: true });
      const tmp = this.filePath + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(this.state, null, 2), 'utf8');
      fs.renameSync(tmp, this.filePath);
    } catch {
      try {
        fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2), 'utf8');
      } catch {
        // Ignore non-fatal disk errors
      }
    }
  }

  getSettings() {
    return { ...this.state.settings };
  }

  updateSettings(patch) {
    if (!patch || typeof patch !== 'object') return this.getSettings();
    const allowedLayouts = new Set(['dual', 'sidebar', 'topbar']);
    const allowedEngines = new Set(['google', 'duckduckgo', 'bing', 'brave', 'perplexity', 'choogle']);
    const allowedThemes = new Set(['navy-gold', 'primer-blue', 'stealth-slate']);

    const next = { ...this.state.settings };
    if (patch.layoutMode && allowedLayouts.has(patch.layoutMode)) next.layoutMode = patch.layoutMode;
    if (typeof patch.sidebarExpanded === 'boolean') next.sidebarExpanded = patch.sidebarExpanded;
    if (typeof patch.showBookmarksBar === 'boolean') next.showBookmarksBar = patch.showBookmarksBar;
    if (patch.searchEngine && allowedEngines.has(patch.searchEngine)) next.searchEngine = patch.searchEngine;
    if (typeof patch.adblockEnabled === 'boolean') next.adblockEnabled = patch.adblockEnabled;
    if (Array.isArray(patch.adblockAllowlist)) {
      next.adblockAllowlist = [...new Set(patch.adblockAllowlist.map((h) => String(h).trim().toLowerCase()).filter(Boolean))];
    }
    if (patch.theme && allowedThemes.has(patch.theme)) next.theme = patch.theme;
    if (typeof patch.cosmicBackdrop === 'boolean') next.cosmicBackdrop = patch.cosmicBackdrop;
    if (typeof patch.restoreSession === 'boolean') next.restoreSession = patch.restoreSession;

    this.state.settings = next;
    this.scheduleSave();
    return this.getSettings();
  }

  toggleAllowlistHost(host) {
    const clean = String(host || '').trim().toLowerCase();
    if (!clean) return { allowlisted: false, list: this.state.settings.adblockAllowlist };
    const set = new Set(this.state.settings.adblockAllowlist || []);
    let allowlisted = false;
    if (set.has(clean)) {
      set.delete(clean);
      allowlisted = false;
    } else {
      set.add(clean);
      allowlisted = true;
    }
    this.state.settings.adblockAllowlist = Array.from(set);
    this.scheduleSave();
    return { allowlisted, list: this.state.settings.adblockAllowlist };
  }

  getWorkspaces() {
    return this.state.workspaces.map((w) => ({ ...w }));
  }

  getActiveWorkspaceId() {
    const exists = this.state.workspaces.some((w) => w.id === this.state.activeWorkspaceId);
    return exists ? this.state.activeWorkspaceId : this.state.workspaces[0].id;
  }

  setActiveWorkspaceId(id) {
    if (this.state.workspaces.some((w) => w.id === id)) {
      this.state.activeWorkspaceId = id;
      this.scheduleSave();
    }
    return this.getActiveWorkspaceId();
  }

  addWorkspace({ name, color, icon }) {
    const cleanName = String(name || '').trim().slice(0, 28) || 'Workspace';
    const ws = {
      id: createId('ws'),
      name: cleanName,
      color: color || '#DFBA73',
      icon: icon || 'workspace'
    };
    this.state.workspaces.push(ws);
    this.scheduleSave();
    return ws;
  }

  removeWorkspace(id) {
    if (this.state.workspaces.length <= 1) return false;
    const before = this.state.workspaces.length;
    this.state.workspaces = this.state.workspaces.filter((w) => w.id !== id);
    if (this.state.activeWorkspaceId === id) {
      this.state.activeWorkspaceId = this.state.workspaces[0].id;
    }
    delete this.state.session.tabsByWorkspace[id];
    this.scheduleSave();
    return this.state.workspaces.length !== before;
  }

  getBookmarks() {
    return this.state.bookmarks.map((b) => ({ ...b }));
  }

  isBookmarked(url) {
    if (!url) return false;
    const target = String(url).trim();
    return this.state.bookmarks.some((b) => b.url === target);
  }

  addBookmark({ title, url, iconId, folder }) {
    const cleanUrl = String(url || '').trim();
    if (!cleanUrl) return null;
    const existing = this.state.bookmarks.find((b) => b.url === cleanUrl);
    if (existing) {
      if (title) existing.title = String(title).trim();
      if (folder) existing.folder = String(folder).trim();
      if (iconId) existing.iconId = iconId;
      this.scheduleSave();
      return existing;
    }
    const item = {
      id: createId('bm'),
      title: String(title || cleanUrl).trim().slice(0, 120),
      url: cleanUrl,
      iconId: iconId || (cleanUrl.startsWith('choogle://') ? 'app-choogle' : 'bookmark-filled'),
      folder: String(folder || 'Bookmarks').trim() || 'Bookmarks',
      createdAt: Date.now()
    };
    this.state.bookmarks.push(item);
    this.scheduleSave();
    return item;
  }

  removeBookmark(idOrUrl) {
    const key = String(idOrUrl || '').trim();
    const before = this.state.bookmarks.length;
    this.state.bookmarks = this.state.bookmarks.filter((b) => b.id !== key && b.url !== key);
    if (this.state.bookmarks.length !== before) {
      this.scheduleSave();
      return true;
    }
    return false;
  }

  toggleBookmark({ title, url, iconId, folder }) {
    if (this.isBookmarked(url)) {
      this.removeBookmark(url);
      return { bookmarked: false };
    }
    const created = this.addBookmark({ title, url, iconId, folder });
    return { bookmarked: true, bookmark: created };
  }

  addHistory({ url, title, favicon }) {
    const cleanUrl = String(url || '').trim();
    if (!cleanUrl || cleanUrl === 'about:blank') return null;
    const now = Date.now();
    const last = this.state.history[0];
    if (last && last.url === cleanUrl && now - last.visitedAt < 15000) {
      if (title) last.title = String(title).slice(0, 200);
      if (favicon) last.favicon = favicon;
      this.scheduleSave();
      return last;
    }
    const entry = {
      id: createId('hist'),
      url: cleanUrl,
      title: String(title || cleanUrl).slice(0, 200),
      favicon: favicon || '',
      visitedAt: now
    };
    this.state.history.unshift(entry);
    if (this.state.history.length > MAX_HISTORY) {
      this.state.history.length = MAX_HISTORY;
    }
    this.scheduleSave();
    return entry;
  }

  getHistory(query, limit) {
    const q = String(query || '').trim().toLowerCase();
    const cap = Number(limit) > 0 ? Number(limit) : 250;
    const filtered = q
      ? this.state.history.filter(
          (h) => h.title.toLowerCase().includes(q) || h.url.toLowerCase().includes(q)
        )
      : this.state.history;
    return filtered.slice(0, cap).map((h) => ({ ...h }));
  }

  removeHistoryEntry(id) {
    const before = this.state.history.length;
    this.state.history = this.state.history.filter((h) => h.id !== id);
    if (this.state.history.length !== before) {
      this.scheduleSave();
      return true;
    }
    return false;
  }

  clearHistory() {
    this.state.history = [];
    this.scheduleSave();
    return true;
  }

  upsertDownload(record) {
    if (!record || !record.id) return null;
    const idx = this.state.downloads.findIndex((d) => d.id === record.id);
    if (idx >= 0) {
      this.state.downloads[idx] = { ...this.state.downloads[idx], ...record };
    } else {
      this.state.downloads.unshift(record);
      if (this.state.downloads.length > MAX_DOWNLOADS) {
        this.state.downloads.length = MAX_DOWNLOADS;
      }
    }
    this.scheduleSave();
    return this.state.downloads[idx >= 0 ? idx : 0];
  }

  getDownloads() {
    return this.state.downloads.map((d) => ({ ...d }));
  }

  clearDownloads() {
    this.state.downloads = this.state.downloads.filter((d) => d.state === 'progressing');
    this.scheduleSave();
    return this.getDownloads();
  }

  getPinnedApps() {
    return this.state.pinnedApps.map((p) => ({ ...p }));
  }

  saveSessionTabs(tabsByWorkspace) {
    this.state.session.tabsByWorkspace = tabsByWorkspace || {};
    this.scheduleSave();
  }

  getSessionTabs() {
    return this.state.session.tabsByWorkspace || {};
  }

  incrementBlocked(delta = 1) {
    this.state.stats.totalBlocked = (this.state.stats.totalBlocked || 0) + delta;
    this.scheduleSave();
    return this.state.stats.totalBlocked;
  }

  getStats() {
    return { ...this.state.stats };
  }
}

module.exports = { ChoogleStore };
