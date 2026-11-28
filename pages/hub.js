'use strict';

(function () {
  const Icons = window.ChoogleIcons;
  const internal = window.choogleInternal;
  const STAR_KEY = 'choogle-hub-stars-v2';

  let allItems = [];
  let activeCategory = 'all';
  let searchQuery = '';
  let sortMode = 'name-asc';

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getStars() {
    try {
      return new Set(JSON.parse(localStorage.getItem(STAR_KEY) || '[]'));
    } catch {
      return new Set();
    }
  }

  function saveStars(set) {
    localStorage.setItem(STAR_KEY, JSON.stringify(Array.from(set)));
  }

  function resolveUrl(url) {
    if (internal && internal.isChoogleBrowser) return url;
    if (url.startsWith('choogle://app/')) return '../' + url.slice('choogle://app/'.length);
    if (url.startsWith('choogle://projects/')) return '../../' + decodeURIComponent(url.slice('choogle://projects/'.length));
    if (url === 'choogle://hub') return 'hub.html';
    if (url === 'choogle://icons') return 'icons.html';
    if (url === 'choogle://home') return 'home.html';
    if (url === 'choogle://bookmarks') return 'bookmarks.html';
    if (url === 'choogle://history') return 'history.html';
    if (url === 'choogle://downloads') return 'downloads.html';
    if (url === 'choogle://settings') return 'settings.html';
    return url;
  }

  function openItem(url, newTab) {
    const dest = resolveUrl(url);
    if (internal && internal.isChoogleBrowser) {
      if (newTab) internal.openNewTab(dest);
      else internal.navigate(dest);
    } else {
      if (newTab) window.open(dest, '_blank');
      else window.location.href = dest;
    }
  }

  function initHeader() {
    const navItems = [
      { label: 'Home', url: 'choogle://home', icon: 'nav-home' },
      { label: 'App Hub', url: 'choogle://hub', icon: 'app-hub', active: true },
      { label: 'Icon Studio', url: 'choogle://icons', icon: 'app-icons' },
      { label: 'Settings', url: 'choogle://settings', icon: 'settings' }
    ];
    document.getElementById('hub-topbar-nav').innerHTML = navItems
      .map(
        (n) => `<a class="nav-pill${n.active ? ' active' : ''}" href="${esc(resolveUrl(n.url))}">${Icons.svg(n.icon, { size: 14 })}<span>${esc(n.label)}</span></a>`
      )
      .join('');
    document.getElementById('hub-title-icon').innerHTML = Icons.svg('app-hub', { size: 18 });
    document.getElementById('hub-search-icon').innerHTML = Icons.svg('search', { size: 16 });
  }

  function renderPills() {
    const stars = getStars();
    const counts = {
      all: allItems.length,
      starred: allItems.filter((i) => stars.has(i.id)).length,
      suite: allItems.filter((i) => i.category === 'suite' || i.category === 'labs').length,
      games: allItems.filter((i) => i.category === 'games').length,
      security: allItems.filter((i) => i.category === 'security').length,
      ai: allItems.filter((i) => i.category === 'ai').length,
      systems: allItems.filter((i) => i.category === 'systems').length,
      media: allItems.filter((i) => i.category === 'media').length,
      docs: allItems.filter((i) => i.category === 'docs').length,
      utilities: allItems.filter((i) => i.category === 'utilities').length
    };

    const defs = [
      { id: 'all', label: 'All' },
      { id: 'starred', label: 'Starred' },
      { id: 'suite', label: 'Choogle Suite' },
      { id: 'games', label: 'Games & 3D' },
      { id: 'security', label: 'Security' },
      { id: 'ai', label: 'AI & Agents' },
      { id: 'systems', label: 'Systems & Dev' },
      { id: 'media', label: 'Media' },
      { id: 'docs', label: 'Learning & Docs' },
      { id: 'utilities', label: 'Utilities' }
    ];

    document.getElementById('hub-filter-pills').innerHTML = defs
      .map(
        (d) => `<button class="cat-pill${activeCategory === d.id ? ' active' : ''}" data-cat="${d.id}">${esc(d.label)} <span style="opacity:0.7">(${counts[d.id] || 0})</span></button>`
      )
      .join('');
  }

  function renderGrid() {
    const stars = getStars();
    const q = searchQuery.trim().toLowerCase();

    let filtered = allItems.filter((item) => {
      if (activeCategory === 'starred' && !stars.has(item.id)) return false;
      else if (activeCategory === 'suite' && item.category !== 'suite' && item.category !== 'labs') return false;
      else if (activeCategory !== 'all' && activeCategory !== 'starred' && activeCategory !== 'suite' && item.category !== activeCategory) {
        return false;
      }

      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        (item.folder || '').toLowerCase().includes(q) ||
        (item.categoryLabel || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q)
      );
    });

    filtered.sort((a, b) => {
      if (sortMode === 'name-desc') return b.title.localeCompare(a.title);
      if (sortMode === 'category') return (a.categoryLabel || '').localeCompare(b.categoryLabel || '') || a.title.localeCompare(b.title);
      return a.title.localeCompare(b.title);
    });

    const grid = document.getElementById('hub-apps-grid');
    if (filtered.length === 0) {
      grid.innerHTML = `<div class="surface-card" style="grid-column:1/-1;text-align:center;color:var(--text-muted);">No matching applications found.</div>`;
      return;
    }

    grid.innerHTML = filtered
      .map((item) => {
        const isStarred = stars.has(item.id);
        return `
          <article class="project-card">
            <div class="project-card-top">
              <div class="project-title-row">
                <span class="icon-badge">${Icons.svg(item.iconId, { size: 18 })}</span>
                <div class="project-title-text">
                  <h3 title="${esc(item.title)}">${esc(item.title)}</h3>
                  <span>${esc(item.categoryLabel)}</span>
                </div>
              </div>
              <button class="star-btn${isStarred ? ' starred' : ''}" data-star-id="${esc(item.id)}" title="Star application">
                ${Icons.svg(isStarred ? 'bookmark-filled' : 'bookmark', { size: 14 })}
              </button>
            </div>
            <p class="project-desc">${esc(item.description)}</p>
            <div class="project-footer">
              <span class="project-path" title="${esc(item.pathLabel)}">${esc(item.pathLabel)}</span>
              <div style="display:flex;gap:6px;flex-shrink:0;">
                <button class="btn" style="height:28px;padding:0 9px;font-size:12px;" data-launch-tab="${esc(item.url)}" title="Open in new tab">Tab</button>
                <button class="btn btn-primary" style="height:28px;padding:0 11px;font-size:12px;" data-launch-url="${esc(item.url)}">Launch</button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  function hydrateFromRegistry(reg) {
    const suite = (reg.suiteApps || []).map((a) => ({
      id: a.id,
      name: a.name,
      title: a.title,
      category: a.category || 'suite',
      categoryLabel: a.category === 'labs' ? 'IT & Certification Labs' : 'Choogle Suite',
      iconId: a.iconId,
      url: a.url,
      pathLabel: a.url,
      description: a.description
    }));
    const projects = (reg.projects || []).map((p) => ({
      id: p.id,
      name: p.name,
      title: p.title,
      folder: p.folder,
      category: p.category || 'utilities',
      categoryLabel: p.categoryLabel || 'Project',
      iconId: p.iconId,
      url: p.choogleUrl,
      pathLabel: `projects/${p.folder}`,
      description: p.snippet
    }));
    allItems = [...suite, ...projects];
    document.getElementById('hub-total-badge').textContent = `${projects.length} Projects + ${suite.length} Suite`;
    renderPills();
    renderGrid();
  }

  function bindEvents() {
    document.getElementById('hub-search-input').addEventListener('input', (ev) => {
      searchQuery = ev.target.value;
      renderGrid();
    });

    document.getElementById('hub-sort-select').addEventListener('change', (ev) => {
      sortMode = ev.target.value;
      renderGrid();
    });

    document.getElementById('hub-filter-pills').addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-cat]');
      if (!btn) return;
      activeCategory = btn.dataset.cat;
      renderPills();
      renderGrid();
    });

    document.getElementById('hub-apps-grid').addEventListener('click', (ev) => {
      const starBtn = ev.target.closest('[data-star-id]');
      if (starBtn) {
        const stars = getStars();
        const id = starBtn.dataset.starId;
        if (stars.has(id)) stars.delete(id);
        else stars.add(id);
        saveStars(stars);
        renderPills();
        renderGrid();
        return;
      }
      const launchTab = ev.target.closest('[data-launch-tab]');
      if (launchTab) {
        openItem(launchTab.dataset.launchTab, true);
        return;
      }
      const launchBtn = ev.target.closest('[data-launch-url]');
      if (launchBtn) {
        openItem(launchBtn.dataset.launchUrl, false);
      }
    });

    document.getElementById('hub-sync-btn').addEventListener('click', async () => {
      const btn = document.getElementById('hub-sync-btn');
      if (!(internal && internal.isChoogleBrowser)) {
        btn.textContent = 'Run Sync-ChoogleProjects.ps1';
        return;
      }
      btn.disabled = true;
      btn.textContent = 'Syncing...';
      try {
        const res = await internal.syncProjects();
        if (res && res.projectsRegistry) hydrateFromRegistry(res.projectsRegistry);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Resync Projects';
      }
    });
  }

  async function init() {
    initHeader();
    bindEvents();

    const params = new URLSearchParams(window.location.search);
    if (params.get('q')) {
      searchQuery = params.get('q');
      document.getElementById('hub-search-input').value = searchQuery;
    }

    let reg = null;
    if (internal && internal.isChoogleBrowser) {
      try {
        reg = await internal.getProjectsRegistry();
      } catch {
        reg = null;
      }
    }
    if (!reg || !reg.projects) {
      const resp = await fetch('../projects-registry.json');
      reg = await resp.json();
    }
    hydrateFromRegistry(reg);
  }

  init();
})();
