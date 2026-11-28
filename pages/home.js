'use strict';

(function () {
  const Icons = window.ChoogleIcons;
  const internal = window.choogleInternal;

  const ENGINE_URLS = {
    google: 'https://www.google.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    bing: 'https://www.bing.com/search?q=',
    brave: 'https://search.brave.com/search?q=',
    perplexity: 'https://www.perplexity.ai/search?q='
  };

  let searchMode = 'all';
  let registry = { count: 0, suiteApps: [], projects: [] };
  let bookmarks = [];

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function resolveUrl(url) {
    if (internal && internal.isChoogleBrowser) return url;
    if (url.startsWith('choogle://app/')) return '../' + url.slice('choogle://app/'.length);
    if (url.startsWith('choogle://projects/')) return '../../' + decodeURIComponent(url.slice('choogle://projects/'.length));
    if (url === 'choogle://hub') return 'hub.html';
    if (url === 'choogle://icons') return 'icons.html';
    if (url === 'choogle://bookmarks') return 'bookmarks.html';
    if (url === 'choogle://history') return 'history.html';
    if (url === 'choogle://downloads') return 'downloads.html';
    if (url === 'choogle://settings') return 'settings.html';
    return url;
  }

  function navigateTo(url) {
    const dest = resolveUrl(url);
    if (internal && internal.isChoogleBrowser) {
      internal.navigate(dest);
    } else {
      window.location.href = dest;
    }
  }

  function initChromeLinks() {
    const navItems = [
      { label: 'App Hub', url: 'choogle://hub', icon: 'app-hub' },
      { label: 'Icon Studio', url: 'choogle://icons', icon: 'app-icons' },
      { label: 'Bookmarks', url: 'choogle://bookmarks', icon: 'bookmark-filled' },
      { label: 'History', url: 'choogle://history', icon: 'history' },
      { label: 'Downloads', url: 'choogle://downloads', icon: 'downloads' },
      { label: 'Settings', url: 'choogle://settings', icon: 'settings' }
    ];
    document.getElementById('home-topbar-nav').innerHTML = navItems
      .map(
        (n) => `<a class="nav-pill" href="${esc(resolveUrl(n.url))}">${Icons.svg(n.icon, { size: 14 })}<span>${esc(n.label)}</span></a>`
      )
      .join('');

    document.getElementById('home-search-icon').innerHTML = Icons.svg('search', { size: 18 });
    document.getElementById('tel-proj-icon').innerHTML = Icons.svg('app-hub', { size: 18 });
    document.getElementById('tel-shield-icon').innerHTML = Icons.svg('shield-on', { size: 18 });
    document.getElementById('tel-suite-icon').innerHTML = Icons.svg('app-choogle', { size: 18 });
  }

  function renderSuiteGrid() {
    const apps = (registry.suiteApps || []).slice(0, 8);
    document.getElementById('suite-grid').innerHTML = apps
      .map(
        (app) => `
        <a class="suite-tile" href="${esc(resolveUrl(app.url))}" data-nav-url="${esc(app.url)}">
          <span class="icon-badge">${Icons.svg(app.iconId, { size: 18 })}</span>
          <div class="suite-tile-meta">
            <div class="suite-tile-title">${esc(app.name)}</div>
            <div class="suite-tile-sub">${esc(app.title)}</div>
          </div>
        </a>
      `
      )
      .join('');
  }

  function renderBookmarks() {
    document.getElementById('bookmarks-strip').innerHTML = bookmarks
      .slice(0, 8)
      .map(
        (bm) => `
        <a class="suite-tile" href="${esc(resolveUrl(bm.url))}" data-nav-url="${esc(bm.url)}">
          <span class="icon-badge">${Icons.svg(bm.iconId || 'bookmark-filled', { size: 16 })}</span>
          <div class="suite-tile-meta">
            <div class="suite-tile-title">${esc(bm.title)}</div>
            <div class="suite-tile-sub">${esc(bm.url)}</div>
          </div>
        </a>
      `
      )
      .join('');
  }

  function updateLocalSuggestions(query) {
    const box = document.getElementById('local-suggestions');
    const q = query.trim().toLowerCase();
    if (!q || searchMode === 'web') {
      box.classList.add('hidden');
      box.innerHTML = '';
      return;
    }

    const matches = [];
    for (const a of registry.suiteApps || []) {
      if (a.name.toLowerCase().includes(q) || a.title.toLowerCase().includes(q)) {
        matches.push({ title: a.name, sub: a.url, url: a.url, icon: a.iconId });
      }
    }
    for (const p of registry.projects || []) {
      if (p.name.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) || p.folder.toLowerCase().includes(q)) {
        matches.push({ title: p.title, sub: p.categoryLabel, url: p.choogleUrl, icon: p.iconId });
      }
      if (matches.length >= 7) break;
    }

    if (matches.length === 0) {
      box.classList.add('hidden');
      box.innerHTML = '';
      return;
    }

    box.innerHTML = matches
      .slice(0, 7)
      .map(
        (m) => `
        <button type="button" class="sug-item" data-nav-url="${esc(m.url)}">
          <span class="icon-badge" style="width:28px;height:28px;">${Icons.svg(m.icon, { size: 15 })}</span>
          <div style="min-width:0;flex:1;">
            <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(m.title)}</div>
            <div style="font-size:11.5px;color:var(--text-muted);">${esc(m.sub)}</div>
          </div>
        </button>
      `
      )
      .join('');
    box.classList.remove('hidden');
  }

  function bindEvents() {
    document.getElementById('search-mode-group').addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-mode]');
      if (!btn) return;
      searchMode = btn.dataset.mode;
      document.querySelectorAll('.mode-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === searchMode));
      updateLocalSuggestions(document.getElementById('home-search-input').value);
    });

    const input = document.getElementById('home-search-input');
    input.addEventListener('input', () => updateLocalSuggestions(input.value));

    document.getElementById('home-engine-select').addEventListener('change', (ev) => {
      if (internal && internal.isChoogleBrowser) {
        internal.updateSettings({ searchEngine: ev.target.value });
      }
    });

    document.getElementById('home-search-form').addEventListener('submit', (ev) => {
      ev.preventDefault();
      const raw = input.value.trim();
      if (!raw) return;

      if (searchMode === 'projects') {
        const q = raw.toLowerCase();
        const hit = (registry.projects || []).find(
          (p) => p.name.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) || p.folder.toLowerCase().includes(q)
        );
        if (hit) {
          navigateTo(hit.choogleUrl);
          return;
        }
        navigateTo(`choogle://hub?q=${encodeURIComponent(raw)}`);
        return;
      }

      if (/^(choogle|https?):\/\//i.test(raw)) {
        navigateTo(raw);
        return;
      }
      if (!/\s/.test(raw) && /\.[a-z]{2,}/i.test(raw)) {
        navigateTo('https://' + raw);
        return;
      }

      const engine = document.getElementById('home-engine-select').value || 'google';
      const base = ENGINE_URLS[engine] || ENGINE_URLS.google;
      navigateTo(base + encodeURIComponent(raw));
    });

    document.addEventListener('click', (ev) => {
      const navTarget = ev.target.closest('[data-nav-url]');
      if (navTarget) {
        ev.preventDefault();
        navigateTo(navTarget.dataset.navUrl);
      }
    });
  }

  async function init() {
    initChromeLinks();
    bindEvents();

    if (internal && internal.isChoogleBrowser) {
      try {
        const ctx = await internal.getContext();
        registry = ctx.projectsRegistry || registry;
        bookmarks = ctx.bookmarks || [];
        const settings = ctx.settings || {};
        if (!settings.cosmicBackdrop) document.body.classList.remove('with-cosmic');
        if (settings.searchEngine && ENGINE_URLS[settings.searchEngine]) {
          document.getElementById('home-engine-select').value = settings.searchEngine;
        }
        const activeWs = (ctx.workspaces || []).find((w) => w.id === ctx.activeWorkspaceId);
        if (activeWs) {
          document.getElementById('workspace-pill').textContent = `Workspace: ${activeWs.name}`;
        }
        document.getElementById('tel-shield-count').textContent = String((ctx.stats && ctx.stats.totalBlocked) || 0);
      } catch {
        // Fallback below
      }
    }

    if (!registry.projects || registry.projects.length === 0) {
      try {
        const resp = await fetch('../projects-registry.json');
        if (resp.ok) registry = await resp.json();
      } catch {
        // Ignore
      }
    }

    document.getElementById('tel-proj-count').textContent = String(registry.count || (registry.projects || []).length);
    document.getElementById('tel-suite-count').textContent = String((registry.suiteApps || []).length || 14);

    renderSuiteGrid();
    renderBookmarks();

    const params = new URLSearchParams(window.location.search);
    const qParam = params.get('q');
    if (qParam) {
      const inp = document.getElementById('home-search-input');
      inp.value = qParam;
      updateLocalSuggestions(qParam);
    }
  }

  init();
})();
