'use strict';

(function () {
  const api = window.choogleBrowser;
  const Icons = window.ChoogleIcons;

  const state = {
    tabs: [],
    activeTabId: null,
    workspaces: [],
    activeWorkspaceId: 'personal',
    settings: {
      layoutMode: 'dual',
      sidebarExpanded: false,
      showBookmarksBar: true,
      searchEngine: 'google',
      adblockEnabled: true,
      theme: 'navy-gold'
    },
    bookmarks: [],
    pinnedApps: [],
    history: [],
    downloads: [],
    stats: { totalBlocked: 0 },
    shieldTabSummary: { count: 0, recent: [], host: '', allowlisted: false },
    windowState: { isMaximized: false },
    projectsRegistry: { suiteApps: [], projects: [] },
    sidePanelOpen: false,
    activePanel: 'apps',
    findBarOpen: false,
    omniboxItems: [],
    omniboxSelected: -1,
    omniboxOpen: false,
    panelSearch: ''
  };

  const els = {
    topChrome: document.getElementById('top-chrome'),
    leftSidebar: document.getElementById('left-sidebar'),
    sidePanel: document.getElementById('side-panel'),
    topTabsStrip: document.getElementById('top-tabs-strip'),
    verticalTabsList: document.getElementById('vertical-tabs-list'),
    workspacesList: document.getElementById('workspaces-list'),
    topbarWorkspaceChip: document.getElementById('topbar-workspace-chip'),
    pinnedAppsList: document.getElementById('pinned-apps-list'),
    bookmarksBar: document.getElementById('bookmarks-bar'),
    findBar: document.getElementById('find-bar'),
    findInput: document.getElementById('find-input'),
    omniboxWrap: document.getElementById('omnibox-wrap'),
    omniboxInput: document.getElementById('omnibox-input'),
    securityPill: document.getElementById('security-pill'),
    zoomPill: document.getElementById('zoom-pill'),
    bookmarkStarBtn: document.getElementById('bookmark-star-btn'),
    shieldBtn: document.getElementById('shield-btn'),
    shieldIcon: document.getElementById('shield-icon'),
    shieldCount: document.getElementById('shield-count'),
    backBtn: document.getElementById('back-btn'),
    forwardBtn: document.getElementById('forward-btn'),
    reloadBtn: document.getElementById('reload-btn'),
    homeBtn: document.getElementById('home-btn'),
    sidebarExpandBtn: document.getElementById('sidebar-expand-btn'),
    appsDrawerBtn: document.getElementById('apps-drawer-btn'),
    bookmarksBarToggleBtn: document.getElementById('bookmarks-bar-toggle-btn'),
    downloadsPanelBtn: document.getElementById('downloads-panel-btn'),
    historyPanelBtn: document.getElementById('history-panel-btn'),
    devtoolsBtn: document.getElementById('devtools-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    topNewTabBtn: document.getElementById('top-new-tab-btn'),
    sidebarNewTabBtn: document.getElementById('sidebar-new-tab-btn'),
    addWorkspaceBtn: document.getElementById('add-workspace-btn'),
    newWorkspaceForm: document.getElementById('new-workspace-form'),
    newWorkspaceName: document.getElementById('new-workspace-name'),
    saveWorkspaceBtn: document.getElementById('save-workspace-btn'),
    sidePanelCloseBtn: document.getElementById('side-panel-close-btn'),
    sidePanelBody: document.getElementById('side-panel-body'),
    winMinBtn: document.getElementById('win-min-btn'),
    winMaxBtn: document.getElementById('win-max-btn'),
    winCloseBtn: document.getElementById('win-close-btn')
  };

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getActiveTab() {
    return state.tabs.find((t) => t.id === state.activeTabId) || null;
  }

  function initStaticIcons() {
    els.topNewTabBtn.innerHTML = Icons.svg('plus', { size: 15 });
    els.sidebarNewTabBtn.innerHTML = Icons.svg('plus', { size: 14 });
    els.addWorkspaceBtn.innerHTML = Icons.svg('plus', { size: 14 });
    els.sidebarExpandBtn.innerHTML = Icons.svg('panel-close', { size: 15 });
    els.backBtn.innerHTML = Icons.svg('nav-back', { size: 16 });
    els.forwardBtn.innerHTML = Icons.svg('nav-forward', { size: 16 });
    els.reloadBtn.innerHTML = Icons.svg('nav-reload', { size: 15 });
    els.homeBtn.innerHTML = Icons.svg('nav-home', { size: 15 });
    els.appsDrawerBtn.innerHTML = Icons.svg('apps-grid', { size: 15 });
    els.bookmarksBarToggleBtn.innerHTML = Icons.svg('bookmark', { size: 15 });
    els.downloadsPanelBtn.innerHTML = Icons.svg('downloads', { size: 15 });
    els.historyPanelBtn.innerHTML = Icons.svg('history', { size: 15 });
    els.devtoolsBtn.innerHTML = Icons.svg('devtools', { size: 15 });
    els.settingsBtn.innerHTML = Icons.svg('settings', { size: 15 });
    els.sidePanelCloseBtn.innerHTML = Icons.svg('tab-close', { size: 14 });
    els.winMinBtn.innerHTML = Icons.svg('win-min', { size: 14 });
    els.winMaxBtn.innerHTML = Icons.svg('win-max', { size: 13 });
    els.winCloseBtn.innerHTML = Icons.svg('win-close', { size: 14 });
    document.getElementById('find-bar-icon').innerHTML = Icons.svg('find', { size: 15 });
    document.getElementById('find-close-btn').innerHTML = Icons.svg('tab-close', { size: 14 });
    document.getElementById('rail-icons-svg').innerHTML = Icons.svg('app-icons', { size: 16 });
    document.getElementById('rail-hub-svg').innerHTML = Icons.svg('app-hub', { size: 16 });
    document.getElementById('rail-settings-svg').innerHTML = Icons.svg('settings', { size: 16 });

    document.querySelectorAll('.layout-pill').forEach((btn) => {
      const m = btn.dataset.layout;
      const iconName = m === 'dual' ? 'layout-dual' : m === 'sidebar' ? 'layout-sidebar' : 'layout-topbar';
      btn.innerHTML = Icons.svg(iconName, { size: 14 });
    });
  }

  function computeAndSyncBounds() {
    const topRect = els.topChrome.getBoundingClientRect();
    const layoutMode = state.settings.layoutMode || 'dual';
    const leftRect = layoutMode === 'topbar' ? { right: 0 } : els.leftSidebar.getBoundingClientRect();
    const rightWidth = state.sidePanelOpen ? els.sidePanel.getBoundingClientRect().width : 0;

    api.setViewportBounds({
      topOffset: Math.ceil(topRect.bottom),
      leftOffset: Math.ceil(leftRect.right),
      rightOffset: Math.ceil(rightWidth)
    });
  }

  function applyLayoutClasses() {
    const mode = state.settings.layoutMode || 'dual';
    const theme = state.settings.theme || 'navy-gold';
    document.body.className = `layout-${mode} theme-${theme}` + (state.settings.sidebarExpanded ? ' sidebar-expanded' : '');

    document.querySelectorAll('.layout-pill').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.layout === mode);
    });

    els.bookmarksBar.classList.toggle('hidden', !state.settings.showBookmarksBar);
    els.bookmarksBarToggleBtn.classList.toggle('active', Boolean(state.settings.showBookmarksBar));
    els.winMaxBtn.innerHTML = Icons.svg(state.windowState.isMaximized ? 'win-restore' : 'win-max', { size: 13 });
  }

  function getTabIconHtml(tab) {
    if (tab.isLoading) {
      return '<span class="tab-loading-dot"></span>';
    }
    if (tab.url && tab.url.startsWith('choogle://')) {
      const u = tab.url.toLowerCase();
      if (u.includes('hub')) return Icons.svg('app-hub', { size: 14 });
      if (u.includes('icons')) return Icons.svg('app-icons', { size: 14 });
      if (u.includes('chai')) return Icons.svg('app-chai', { size: 14 });
      if (u.includes('tasks')) return Icons.svg('app-tasks', { size: 14 });
      if (u.includes('notepad')) return Icons.svg('app-notepad', { size: 14 });
      if (u.includes('webstore')) return Icons.svg('app-webstore', { size: 14 });
      if (u.includes('bookmarks')) return Icons.svg('bookmark-filled', { size: 14 });
      if (u.includes('history')) return Icons.svg('history', { size: 14 });
      if (u.includes('downloads')) return Icons.svg('downloads', { size: 14 });
      if (u.includes('settings')) return Icons.svg('settings', { size: 14 });
      return Icons.svg('app-choogle', { size: 14 });
    }
    if (tab.favicon) {
      return `<img src="${escapeHtml(tab.favicon)}" alt="" onerror="this.style.display='none'">`;
    }
    return Icons.svg('app-choogle', { size: 14 });
  }

  function renderTabList(container, itemClass) {
    const wsTabs = state.tabs.filter((t) => t.workspaceId === state.activeWorkspaceId);
    const ordered = [
      ...wsTabs.filter((t) => t.pinned),
      ...wsTabs.filter((t) => !t.pinned)
    ];

    container.innerHTML = ordered
      .map((tab) => {
        const active = tab.id === state.activeTabId ? ' active' : '';
        const pinned = tab.pinned ? ' pinned' : '';
        const audioBtn =
          tab.isAudible || tab.muted
            ? `<button class="tab-audio-btn" data-action="mute" title="${tab.muted ? 'Unmute' : 'Mute'}">${Icons.svg(
                tab.muted ? 'volume-mute' : 'volume-on',
                { size: 12 }
              )}</button>`
            : '';
        return `
          <div class="${itemClass}${active}${pinned}" data-tab-id="${escapeHtml(tab.id)}" title="${escapeHtml(tab.title)}" role="tab" aria-selected="${tab.id === state.activeTabId}">
            <span class="tab-favicon">${getTabIconHtml(tab)}</span>
            <span class="tab-title">${escapeHtml(tab.title || 'New Tab')}</span>
            ${audioBtn}
            <button class="tab-close-btn" data-action="close" title="Close Tab">${Icons.svg('tab-close', { size: 11 })}</button>
          </div>
        `;
      })
      .join('');
  }

  function renderWorkspaces() {
    const activeWs = state.workspaces.find((w) => w.id === state.activeWorkspaceId) || state.workspaces[0];
    if (activeWs) {
      els.topbarWorkspaceChip.innerHTML = `<span class="ws-dot" style="background:${escapeHtml(activeWs.color)}"></span><span>${escapeHtml(activeWs.name)}</span>`;
    }

    els.workspacesList.innerHTML = state.workspaces
      .map((ws) => {
        const count = state.tabs.filter((t) => t.workspaceId === ws.id).length;
        const active = ws.id === state.activeWorkspaceId ? ' active' : '';
        return `
          <button class="ws-btn${active}" data-ws-id="${escapeHtml(ws.id)}" title="${escapeHtml(ws.name)} (${count} tabs)">
            <span class="ws-dot" style="background:${escapeHtml(ws.color)}"></span>
            <span class="ws-name">${escapeHtml(ws.name)}</span>
            <span class="ws-count">${count}</span>
          </button>
        `;
      })
      .join('');
  }

  function renderPinnedApps() {
    const activeTab = getActiveTab();
    const curUrl = activeTab ? activeTab.url : '';
    els.pinnedAppsList.innerHTML = state.pinnedApps
      .map((app) => {
        const active = curUrl && curUrl.startsWith(app.url) ? ' active' : '';
        return `
          <button class="pinned-app-btn${active}" data-url="${escapeHtml(app.url)}" title="${escapeHtml(app.title)}">
            <span class="pinned-icon">${Icons.svg(app.iconId || 'app-choogle', { size: 16 })}</span>
            <span class="pinned-name">${escapeHtml(app.title)}</span>
          </button>
        `;
      })
      .join('');
  }

  function renderBookmarksBar() {
    els.bookmarksBar.innerHTML = state.bookmarks
      .slice(0, 24)
      .map(
        (bm) => `
        <button class="bm-bar-item" data-url="${escapeHtml(bm.url)}" title="${escapeHtml(bm.url)}">
          <span class="bm-icon">${Icons.svg(bm.iconId || 'bookmark-filled', { size: 13 })}</span>
          <span>${escapeHtml(bm.title)}</span>
        </button>
      `
      )
      .join('');
  }

  function renderToolbar() {
    const tab = getActiveTab();
    els.backBtn.disabled = !tab || !tab.canGoBack;
    els.forwardBtn.disabled = !tab || !tab.canGoForward;
    els.reloadBtn.innerHTML = Icons.svg(tab && tab.isLoading ? 'nav-stop' : 'nav-reload', { size: 15 });
    els.reloadBtn.title = tab && tab.isLoading ? 'Stop Loading' : 'Reload (Ctrl+R)';

    if (tab && document.activeElement !== els.omniboxInput) {
      els.omniboxInput.value = tab.url || '';
    }

    const url = tab ? tab.url || '' : '';
    els.securityPill.className = 'security-pill';
    if (url.startsWith('choogle://')) {
      els.securityPill.innerHTML = `${Icons.svg('app-choogle', { size: 13 })}<span>Choogle</span>`;
    } else if (url.startsWith('https://')) {
      els.securityPill.classList.add('https');
      els.securityPill.innerHTML = `${Icons.svg('lock-secure', { size: 13 })}<span>HTTPS</span>`;
    } else if (url.startsWith('http://')) {
      els.securityPill.classList.add('insecure');
      els.securityPill.innerHTML = `${Icons.svg('lock-insecure', { size: 13 })}<span>HTTP</span>`;
    } else {
      els.securityPill.innerHTML = `${Icons.svg('search', { size: 13 })}`;
    }

    const zoomPct = tab ? Math.round((tab.zoomFactor || 1) * 100) : 100;
    if (zoomPct !== 100) {
      els.zoomPill.textContent = `${zoomPct}%`;
      els.zoomPill.classList.remove('hidden');
    } else {
      els.zoomPill.classList.add('hidden');
    }

    const isBookmarked = state.bookmarks.some((b) => b.url === url);
    els.bookmarkStarBtn.classList.toggle('bookmarked', isBookmarked);
    els.bookmarkStarBtn.innerHTML = Icons.svg(isBookmarked ? 'bookmark-filled' : 'bookmark', { size: 15 });

    const shieldActive = Boolean(state.settings.adblockEnabled) && !state.shieldTabSummary.allowlisted;
    els.shieldBtn.className = 'chrome-btn shield-btn ' + (shieldActive ? 'shield-active' : 'shield-paused');
    els.shieldIcon.innerHTML = Icons.svg(shieldActive ? 'shield-on' : 'shield-off', { size: 15 });
    els.shieldCount.textContent = String(state.shieldTabSummary.count || 0);
  }

  function renderSidePanel() {
    els.sidePanel.classList.toggle('hidden', !state.sidePanelOpen);
    document.querySelectorAll('.panel-tab').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.panel === state.activePanel);
    });
    els.appsDrawerBtn.classList.toggle('active', state.sidePanelOpen && state.activePanel === 'apps');
    els.shieldBtn.classList.toggle('active', state.sidePanelOpen && state.activePanel === 'shield');
    els.downloadsPanelBtn.classList.toggle('active', state.sidePanelOpen && state.activePanel === 'downloads');
    els.historyPanelBtn.classList.toggle('active', state.sidePanelOpen && state.activePanel === 'history');

    if (!state.sidePanelOpen) return;

    const q = state.panelSearch.trim().toLowerCase();

    if (state.activePanel === 'apps') {
      const suite = (state.projectsRegistry.suiteApps || []).filter(
        (a) => !q || a.name.toLowerCase().includes(q) || a.title.toLowerCase().includes(q)
      );
      const projs = (state.projectsRegistry.projects || []).filter(
        (p) => !q || p.name.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) || (p.categoryLabel || '').toLowerCase().includes(q)
      );
      els.sidePanelBody.innerHTML = `
        <input id="panel-search-input" class="panel-search" type="text" placeholder="Filter Choogle apps & ${state.projectsRegistry.count || 0} projects..." value="${escapeHtml(state.panelSearch)}">
        <div class="panel-section-title">Choogle Suite (${suite.length})</div>
        <div class="panel-list">
          ${suite
            .map(
              (a) => `
            <button class="panel-card" data-open-url="${escapeHtml(a.url)}">
              <span class="panel-card-icon">${Icons.svg(a.iconId, { size: 16 })}</span>
              <div class="panel-card-meta">
                <div class="panel-card-title">${escapeHtml(a.name)}</div>
                <div class="panel-card-sub">${escapeHtml(a.title)}</div>
              </div>
            </button>
          `
            )
            .join('')}
        </div>
        <div class="panel-section-title">Antigravity Projects (${projs.length})</div>
        <div class="panel-list">
          ${projs
            .map(
              (p) => `
            <button class="panel-card" data-open-url="${escapeHtml(p.choogleUrl)}">
              <span class="panel-card-icon">${Icons.svg(p.iconId, { size: 16 })}</span>
              <div class="panel-card-meta">
                <div class="panel-card-title">${escapeHtml(p.name)}</div>
                <div class="panel-card-sub">${escapeHtml(p.categoryLabel || p.folder)}</div>
              </div>
            </button>
          `
            )
            .join('')}
        </div>
      `;
    } else if (state.activePanel === 'shield') {
      const sum = state.shieldTabSummary || { count: 0, recent: [], host: '', allowlisted: false };
      const host = sum.host || 'Internal / Local Page';
      els.sidePanelBody.innerHTML = `
        <div class="panel-stat-grid">
          <div class="panel-stat-box">
            <div class="panel-stat-val">${sum.count || 0}</div>
            <div class="panel-stat-lbl">Blocked on Tab</div>
          </div>
          <div class="panel-stat-box">
            <div class="panel-stat-val">${state.stats.totalBlocked || 0}</div>
            <div class="panel-stat-lbl">Lifetime Blocked</div>
          </div>
        </div>
        <div class="panel-card" style="cursor:default">
          <div class="panel-card-meta">
            <div class="panel-card-title">${escapeHtml(host)}</div>
            <div class="panel-card-sub">${state.settings.adblockEnabled ? (sum.allowlisted ? 'Paused for this site' : 'Shield protecting this tab') : 'Global Shield disabled'}</div>
          </div>
        </div>
        <div class="panel-action-row">
          <button id="panel-toggle-global-shield" class="panel-btn">${state.settings.adblockEnabled ? 'Disable Global Shield' : 'Enable Global Shield'}</button>
          ${sum.host ? `<button id="panel-toggle-site-shield" class="panel-btn">${sum.allowlisted ? 'Resume Site' : 'Pause Site'}</button>` : ''}
        </div>
        <div class="panel-section-title">Recent Blocked Requests</div>
        <div class="panel-list">
          ${(sum.recent || []).length === 0 ? '<div class="panel-card-sub">No trackers intercepted on this page yet.</div>' : ''}
          ${(sum.recent || [])
            .map(
              (r) => `
            <div class="panel-card" style="cursor:default">
              <span class="panel-card-icon">${Icons.svg('shield-on', { size: 15 })}</span>
              <div class="panel-card-meta">
                <div class="panel-card-title">${escapeHtml(r.host)}</div>
                <div class="panel-card-sub">${escapeHtml(r.resourceType)} • rule: ${escapeHtml(r.rule)}</div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    } else if (state.activePanel === 'bookmarks') {
      const bms = state.bookmarks.filter(
        (b) => !q || b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q)
      );
      els.sidePanelBody.innerHTML = `
        <div class="panel-action-row">
          <input id="panel-search-input" class="panel-search" type="text" placeholder="Filter bookmarks..." value="${escapeHtml(state.panelSearch)}">
          <button class="panel-btn" data-open-url="choogle://bookmarks">Manager</button>
        </div>
        <div class="panel-list">
          ${bms
            .map(
              (bm) => `
            <div class="panel-card" data-open-url="${escapeHtml(bm.url)}">
              <span class="panel-card-icon">${Icons.svg(bm.iconId || 'bookmark-filled', { size: 15 })}</span>
              <div class="panel-card-meta">
                <div class="panel-card-title">${escapeHtml(bm.title)}</div>
                <div class="panel-card-sub">${escapeHtml(bm.url)}</div>
              </div>
              <button class="mini-icon-btn" data-remove-bm="${escapeHtml(bm.id)}" title="Remove">${Icons.svg('trash', { size: 13 })}</button>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    } else if (state.activePanel === 'history') {
      const items = state.history.filter(
        (h) => !q || h.title.toLowerCase().includes(q) || h.url.toLowerCase().includes(q)
      );
      els.sidePanelBody.innerHTML = `
        <div class="panel-action-row">
          <input id="panel-search-input" class="panel-search" type="text" placeholder="Filter history..." value="${escapeHtml(state.panelSearch)}">
          <button id="panel-clear-history" class="panel-btn">Clear</button>
        </div>
        <div class="panel-list">
          ${items.length === 0 ? '<div class="panel-card-sub">No recent history.</div>' : ''}
          ${items
            .slice(0, 60)
            .map(
              (h) => `
            <button class="panel-card" data-open-url="${escapeHtml(h.url)}">
              <span class="panel-card-icon">${Icons.svg('history', { size: 15 })}</span>
              <div class="panel-card-meta">
                <div class="panel-card-title">${escapeHtml(h.title || h.url)}</div>
                <div class="panel-card-sub">${escapeHtml(h.url)}</div>
              </div>
            </button>
          `
            )
            .join('')}
        </div>
      `;
    } else if (state.activePanel === 'downloads') {
      els.sidePanelBody.innerHTML = `
        <div class="panel-action-row">
          <button class="panel-btn" data-open-url="choogle://downloads">Full Downloads Page</button>
          <button id="panel-clear-downloads" class="panel-btn">Clear Done</button>
        </div>
        <div class="panel-list">
          ${state.downloads.length === 0 ? '<div class="panel-card-sub">No downloads yet.</div>' : ''}
          ${state.downloads
            .map(
              (d) => `
            <div class="panel-card" data-open-dl="${escapeHtml(d.id)}">
              <span class="panel-card-icon">${Icons.svg('download-file', { size: 15 })}</span>
              <div class="panel-card-meta">
                <div class="panel-card-title">${escapeHtml(d.filename)}</div>
                <div class="panel-card-sub">${escapeHtml(d.state)} • ${Math.round((d.receivedBytes || 0) / 1024)} KB</div>
              </div>
              <button class="mini-icon-btn" data-show-dl="${escapeHtml(d.id)}" title="Show in folder">${Icons.svg('folder', { size: 13 })}</button>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    }

    const searchInput = document.getElementById('panel-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (ev) => {
        const pos = ev.target.selectionStart;
        state.panelSearch = ev.target.value;
        renderSidePanel();
        const nextInput = document.getElementById('panel-search-input');
        if (nextInput) {
          nextInput.focus();
          nextInput.setSelectionRange(pos, pos);
        }
      });
    }
  }

  function renderAll() {
    applyLayoutClasses();
    renderWorkspaces();
    renderPinnedApps();
    renderTabList(els.topTabsStrip, 'tab-chip');
    renderTabList(els.verticalTabsList, 'vtab-item');
    renderBookmarksBar();
    renderToolbar();
    renderSidePanel();
    computeAndSyncBounds();
  }

  function openPanel(panelName) {
    if (state.sidePanelOpen && state.activePanel === panelName) {
      state.sidePanelOpen = false;
    } else {
      state.sidePanelOpen = true;
      state.activePanel = panelName;
    }
    renderSidePanel();
    computeAndSyncBounds();
  }

  function buildOmniboxItems(query) {
    const q = String(query || '').trim().toLowerCase();
    const items = [];

    if (!q) {
      for (const a of (state.projectsRegistry.suiteApps || []).slice(0, 6)) {
        items.push({ kind: 'suite', title: a.name, subtitle: a.url, url: a.url, iconId: a.iconId });
      }
      for (const bm of state.bookmarks.slice(0, 4)) {
        items.push({ kind: 'bookmark', title: bm.title, subtitle: bm.url, url: bm.url, iconId: bm.iconId || 'bookmark-filled' });
      }
      return items.slice(0, 8);
    }

    // Matching open tabs
    for (const t of state.tabs) {
      if ((t.title || '').toLowerCase().includes(q) || (t.url || '').toLowerCase().includes(q)) {
        items.push({ kind: 'tab', tabId: t.id, title: `Switch to tab: ${t.title}`, subtitle: t.url, url: t.url, iconId: 'tab-new' });
      }
    }

    // Matching suite apps
    for (const a of state.projectsRegistry.suiteApps || []) {
      if (a.name.toLowerCase().includes(q) || a.title.toLowerCase().includes(q) || a.url.toLowerCase().includes(q)) {
        items.push({ kind: 'suite', title: a.name, subtitle: a.url, url: a.url, iconId: a.iconId });
      }
    }

    // Matching bookmarks
    for (const bm of state.bookmarks) {
      if (bm.title.toLowerCase().includes(q) || bm.url.toLowerCase().includes(q)) {
        items.push({ kind: 'bookmark', title: bm.title, subtitle: bm.url, url: bm.url, iconId: bm.iconId || 'bookmark-filled' });
      }
    }

    // Matching Antigravity projects
    for (const p of state.projectsRegistry.projects || []) {
      if (p.name.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) || p.folder.toLowerCase().includes(q)) {
        items.push({ kind: 'project', title: p.title, subtitle: p.choogleUrl, url: p.choogleUrl, iconId: p.iconId });
      }
    }

    // Matching history
    for (const h of state.history) {
      if ((h.title || '').toLowerCase().includes(q) || (h.url || '').toLowerCase().includes(q)) {
        if (!items.some((x) => x.url === h.url)) {
          items.push({ kind: 'history', title: h.title || h.url, subtitle: h.url, url: h.url, iconId: 'history' });
        }
      }
      if (items.length >= 9) break;
    }

    const looksLikeUrl = /^(choogle|https?):\/\//i.test(query.trim()) || (!/\s/.test(query.trim()) && /\.[a-z]{2,}/i.test(query.trim()));
    items.unshift({
      kind: looksLikeUrl ? 'url' : 'search',
      title: looksLikeUrl ? `Go to ${query.trim()}` : `Search ${state.settings.searchEngine} for "${query.trim()}"`,
      subtitle: looksLikeUrl ? query.trim() : 'Press Enter to search',
      url: query.trim(),
      iconId: looksLikeUrl ? 'external-link' : 'search'
    });

    return items.slice(0, 9);
  }

  function showOmniboxSuggestions() {
    const query = els.omniboxInput.value;
    const items = buildOmniboxItems(query);
    state.omniboxItems = items;
    state.omniboxSelected = items.length > 0 ? 0 : -1;
    if (items.length === 0) {
      hideOmniboxSuggestions();
      return;
    }
    const rect = els.omniboxWrap.getBoundingClientRect();
    const height = Math.min(410, items.length * 46 + 16);
    state.omniboxOpen = true;
    api.openOmniboxPopup({
      bounds: {
        x: Math.round(rect.left),
        y: Math.round(rect.bottom + 4),
        width: Math.max(420, Math.round(rect.width)),
        height
      },
      items,
      selectedIndex: state.omniboxSelected,
      query
    });
  }

  function hideOmniboxSuggestions() {
    if (!state.omniboxOpen) return;
    state.omniboxOpen = false;
    state.omniboxItems = [];
    state.omniboxSelected = -1;
    api.closeOmniboxPopup();
  }

  function bindEvents() {
    // Tab click & close/mute in both top & vertical lists
    const handleTabContainerClick = (ev) => {
      const closeBtn = ev.target.closest('[data-action="close"]');
      const muteBtn = ev.target.closest('[data-action="mute"]');
      const item = ev.target.closest('[data-tab-id]');
      if (!item) return;
      const tabId = item.dataset.tabId;
      if (closeBtn) {
        ev.stopPropagation();
        api.closeTab(tabId);
      } else if (muteBtn) {
        ev.stopPropagation();
        api.toggleMuteTab(tabId);
      } else {
        api.activateTab(tabId);
      }
    };

    const handleTabContext = (ev) => {
      const item = ev.target.closest('[data-tab-id]');
      if (!item) return;
      ev.preventDefault();
      api.togglePinTab(item.dataset.tabId);
    };

    els.topTabsStrip.addEventListener('click', handleTabContainerClick);
    els.topTabsStrip.addEventListener('contextmenu', handleTabContext);
    els.verticalTabsList.addEventListener('click', handleTabContainerClick);
    els.verticalTabsList.addEventListener('contextmenu', handleTabContext);

    els.topNewTabBtn.addEventListener('click', () => api.createTab({ url: 'choogle://home', activate: true }));
    els.sidebarNewTabBtn.addEventListener('click', () => api.createTab({ url: 'choogle://home', activate: true }));

    document.querySelectorAll('.layout-pill').forEach((btn) => {
      btn.addEventListener('click', () => api.updateSettings({ layoutMode: btn.dataset.layout }));
    });

    els.sidebarExpandBtn.addEventListener('click', () => {
      api.updateSettings({ sidebarExpanded: !state.settings.sidebarExpanded });
    });

    els.workspacesList.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-ws-id]');
      if (btn) api.setWorkspace(btn.dataset.wsId);
    });

    els.topbarWorkspaceChip.addEventListener('click', () => {
      if (state.workspaces.length < 2) return;
      const idx = state.workspaces.findIndex((w) => w.id === state.activeWorkspaceId);
      const next = state.workspaces[(idx + 1) % state.workspaces.length];
      api.setWorkspace(next.id);
    });

    els.addWorkspaceBtn.addEventListener('click', () => {
      els.newWorkspaceForm.classList.toggle('hidden');
      if (!els.newWorkspaceForm.classList.contains('hidden')) els.newWorkspaceName.focus();
    });

    els.saveWorkspaceBtn.addEventListener('click', async () => {
      const name = els.newWorkspaceName.value.trim();
      if (!name) return;
      const palette = ['#DFBA73', '#58A6FF', '#3FB950', '#BC8CFF', '#F0883E'];
      const color = palette[state.workspaces.length % palette.length];
      const ws = await api.addWorkspace({ name, color });
      els.newWorkspaceName.value = '';
      els.newWorkspaceForm.classList.add('hidden');
      if (ws && ws.id) api.setWorkspace(ws.id);
    });

    els.pinnedAppsList.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-url]');
      if (!btn) return;
      const url = btn.dataset.url;
      if (ev.ctrlKey || ev.metaKey) api.createTab({ url, activate: true });
      else api.navigate(state.activeTabId, url);
    });

    els.bookmarksBar.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-url]');
      if (!btn) return;
      const url = btn.dataset.url;
      if (ev.ctrlKey || ev.metaKey) api.createTab({ url, activate: true });
      else api.navigate(state.activeTabId, url);
    });

    els.backBtn.addEventListener('click', () => api.goBack(state.activeTabId));
    els.forwardBtn.addEventListener('click', () => api.goForward(state.activeTabId));
    els.reloadBtn.addEventListener('click', () => {
      const tab = getActiveTab();
      if (tab && tab.isLoading) api.stop(state.activeTabId);
      else api.reload(state.activeTabId, false);
    });
    els.homeBtn.addEventListener('click', () => api.navigate(state.activeTabId, 'choogle://home'));
    els.zoomPill.addEventListener('click', () => api.zoom(state.activeTabId, 'reset'));

    els.bookmarkStarBtn.addEventListener('click', () => {
      const tab = getActiveTab();
      if (!tab) return;
      api.toggleBookmark({ title: tab.title, url: tab.url });
    });

    els.shieldBtn.addEventListener('click', () => openPanel('shield'));
    els.appsDrawerBtn.addEventListener('click', () => openPanel('apps'));
    els.downloadsPanelBtn.addEventListener('click', () => openPanel('downloads'));
    els.historyPanelBtn.addEventListener('click', () => openPanel('history'));
    els.bookmarksBarToggleBtn.addEventListener('click', () => {
      api.updateSettings({ showBookmarksBar: !state.settings.showBookmarksBar });
    });
    els.devtoolsBtn.addEventListener('click', () => api.openDevTools(state.activeTabId));
    els.settingsBtn.addEventListener('click', () => api.createTab({ url: 'choogle://settings', activate: true }));

    document.getElementById('rail-icons-studio-btn').addEventListener('click', () => api.navigate(state.activeTabId, 'choogle://icons'));
    document.getElementById('rail-hub-btn').addEventListener('click', () => api.navigate(state.activeTabId, 'choogle://hub'));
    document.getElementById('rail-settings-btn').addEventListener('click', () => api.navigate(state.activeTabId, 'choogle://settings'));

    // Side panel controls
    els.sidePanelCloseBtn.addEventListener('click', () => {
      state.sidePanelOpen = false;
      renderSidePanel();
      computeAndSyncBounds();
    });

    document.querySelectorAll('.panel-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activePanel = btn.dataset.panel;
        state.panelSearch = '';
        renderSidePanel();
      });
    });

    els.sidePanelBody.addEventListener('click', async (ev) => {
      const removeBm = ev.target.closest('[data-remove-bm]');
      if (removeBm) {
        ev.stopPropagation();
        await api.removeBookmark(removeBm.dataset.removeBm);
        return;
      }
      const showDl = ev.target.closest('[data-show-dl]');
      if (showDl) {
        ev.stopPropagation();
        await api.showDownloadInFolder(showDl.dataset.showDl);
        return;
      }
      const openDl = ev.target.closest('[data-open-dl]');
      if (openDl) {
        await api.openDownloadItem(openDl.dataset.openDl);
        return;
      }
      const openUrl = ev.target.closest('[data-open-url]');
      if (openUrl) {
        const u = openUrl.dataset.openUrl;
        if (ev.ctrlKey || ev.metaKey) api.createTab({ url: u, activate: true });
        else api.navigate(state.activeTabId, u);
        return;
      }
      if (ev.target.id === 'panel-toggle-global-shield') {
        api.updateSettings({ adblockEnabled: !state.settings.adblockEnabled });
      } else if (ev.target.id === 'panel-toggle-site-shield') {
        if (state.shieldTabSummary && state.shieldTabSummary.host) {
          api.toggleSiteAllowlist(state.shieldTabSummary.host);
        }
      } else if (ev.target.id === 'panel-clear-history') {
        await api.clearHistory();
      } else if (ev.target.id === 'panel-clear-downloads') {
        await api.clearDownloads();
      }
    });

    // Omnibox behavior
    els.omniboxInput.addEventListener('focus', () => {
      els.omniboxInput.select();
      showOmniboxSuggestions();
    });

    els.omniboxInput.addEventListener('input', () => {
      showOmniboxSuggestions();
    });

    els.omniboxInput.addEventListener('blur', () => {
      setTimeout(() => hideOmniboxSuggestions(), 160);
    });

    els.omniboxInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        if (state.omniboxItems.length > 0) {
          state.omniboxSelected = (state.omniboxSelected + 1) % state.omniboxItems.length;
          api.updateOmniboxPopup({ items: state.omniboxItems, selectedIndex: state.omniboxSelected, query: els.omniboxInput.value });
        }
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        if (state.omniboxItems.length > 0) {
          state.omniboxSelected = (state.omniboxSelected - 1 + state.omniboxItems.length) % state.omniboxItems.length;
          api.updateOmniboxPopup({ items: state.omniboxItems, selectedIndex: state.omniboxSelected, query: els.omniboxInput.value });
        }
      } else if (ev.key === 'Enter') {
        ev.preventDefault();
        const chosen = state.omniboxItems[state.omniboxSelected];
        hideOmniboxSuggestions();
        if (chosen && chosen.kind === 'tab' && chosen.tabId) {
          api.activateTab(chosen.tabId);
        } else {
          const target = chosen && chosen.url ? chosen.url : els.omniboxInput.value;
          api.navigate(state.activeTabId, target);
        }
        els.omniboxInput.blur();
      } else if (ev.key === 'Escape') {
        hideOmniboxSuggestions();
        const tab = getActiveTab();
        if (tab) els.omniboxInput.value = tab.url;
        els.omniboxInput.blur();
      }
    });

    // Find bar
    els.findInput.addEventListener('input', () => {
      const q = els.findInput.value.trim();
      if (q) api.findInPage(state.activeTabId, q, { findNext: false });
      else api.stopFindInPage(state.activeTabId);
    });
    els.findInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        const q = els.findInput.value.trim();
        if (q) api.findInPage(state.activeTabId, q, { forward: !ev.shiftKey, findNext: true });
      } else if (ev.key === 'Escape') {
        closeFindBar();
      }
    });
    document.getElementById('find-next-btn').addEventListener('click', () => {
      const q = els.findInput.value.trim();
      if (q) api.findInPage(state.activeTabId, q, { forward: true, findNext: true });
    });
    document.getElementById('find-prev-btn').addEventListener('click', () => {
      const q = els.findInput.value.trim();
      if (q) api.findInPage(state.activeTabId, q, { forward: false, findNext: true });
    });
    document.getElementById('find-close-btn').addEventListener('click', closeFindBar);

    // Window buttons
    els.winMinBtn.addEventListener('click', () => api.windowAction('minimize'));
    els.winMaxBtn.addEventListener('click', () => api.windowAction('maximize'));
    els.winCloseBtn.addEventListener('click', () => api.windowAction('close'));
  }

  function closeFindBar() {
    state.findBarOpen = false;
    els.findBar.classList.add('hidden');
    api.stopFindInPage(state.activeTabId);
    computeAndSyncBounds();
  }

  async function init() {
    initStaticIcons();
    bindEvents();

    const initial = await api.getInitialState();
    Object.assign(state, initial);
    renderAll();

    api.onStateUpdate((snapshot) => {
      Object.assign(state, snapshot);
      renderAll();
    });

    api.onDownloadsUpdate(({ downloads }) => {
      state.downloads = downloads || [];
      if (state.sidePanelOpen && state.activePanel === 'downloads') {
        renderSidePanel();
      }
    });

    api.onHistoryUpdate(({ history }) => {
      state.history = history || [];
      if (state.sidePanelOpen && state.activePanel === 'history') {
        renderSidePanel();
      }
    });

    api.onCommand((cmd) => {
      if (!cmd) return;
      if (cmd.type === 'focus-omnibox') {
        els.omniboxInput.focus();
        els.omniboxInput.select();
      } else if (cmd.type === 'toggle-find') {
        state.findBarOpen = !state.findBarOpen;
        els.findBar.classList.toggle('hidden', !state.findBarOpen);
        computeAndSyncBounds();
        if (state.findBarOpen) {
          els.findInput.focus();
          els.findInput.select();
        } else {
          api.stopFindInPage(state.activeTabId);
        }
      } else if (cmd.type === 'escape-pressed') {
        hideOmniboxSuggestions();
        if (state.findBarOpen) closeFindBar();
      }
    });

    const ro = new ResizeObserver(() => computeAndSyncBounds());
    ro.observe(els.topChrome);
    ro.observe(els.leftSidebar);
    ro.observe(els.sidePanel);
    window.addEventListener('resize', () => computeAndSyncBounds());
  }

  init();
})();
