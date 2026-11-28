'use strict';

(function () {
  const Icons = window.ChoogleIcons;
  const internal = window.choogleInternal;

  const customState = {
    selectedId: 'app-choogle',
    category: 'all',
    search: '',
    strokeColor: '#dfba73',
    bgColor: '#0d1322',
    shape: 'squircle',
    strokeWidth: '1.75',
    svgBody: ''
  };

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function resolveUrl(url) {
    if (internal && internal.isChoogleBrowser) return url;
    if (url === 'choogle://home') return 'home.html';
    if (url === 'choogle://hub') return 'hub.html';
    if (url === 'choogle://icons') return 'icons.html';
    if (url === 'choogle://settings') return 'settings.html';
    return url;
  }

  function initHeader() {
    const navItems = [
      { label: 'Home', url: 'choogle://home', icon: 'nav-home' },
      { label: 'App Hub', url: 'choogle://hub', icon: 'app-hub' },
      { label: 'Icon Studio', url: 'choogle://icons', icon: 'app-icons', active: true },
      { label: 'Settings', url: 'choogle://settings', icon: 'settings' }
    ];
    document.getElementById('icons-topbar-nav').innerHTML = navItems
      .map(
        (n) => `<a class="nav-pill${n.active ? ' active' : ''}" href="${esc(resolveUrl(n.url))}">${Icons.svg(n.icon, { size: 14 })}<span>${esc(n.label)}</span></a>`
      )
      .join('');
    document.getElementById('studio-title-icon').innerHTML = Icons.svg('app-icons', { size: 18 });
  }

  function buildComposedSvg(size) {
    const sw = customState.strokeWidth;
    const stroke = customState.strokeColor;
    const bg = customState.bgColor;
    const body = customState.svgBody;

    let backdrop = '';
    if (customState.shape === 'squircle') {
      backdrop = `<rect x="1" y="1" width="34" height="34" rx="9" fill="${bg}" stroke="${stroke}" stroke-opacity="0.45" stroke-width="1.5"/>`;
    } else if (customState.shape === 'circle') {
      backdrop = `<circle cx="18" cy="18" r="17" fill="${bg}" stroke="${stroke}" stroke-opacity="0.45" stroke-width="1.5"/>`;
    } else if (customState.shape === 'hex') {
      backdrop = `<polygon points="18,1.5 32.5,9.75 32.5,26.25 18,34.5 3.5,26.25 3.5,9.75" fill="${bg}" stroke="${stroke}" stroke-opacity="0.45" stroke-width="1.5"/>`;
    }

    if (customState.shape === 'bare') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" color="${stroke}">${body}</svg>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="${size}" height="${size}">${backdrop}<g transform="translate(6 6)" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" color="${stroke}">${body}</g></svg>`;
  }

  function renderPreviewStage() {
    const sizes = [16, 24, 48, 84];
    document.getElementById('preview-stage').innerHTML = sizes
      .map(
        (s) => `
        <div class="preview-size-item">
          ${buildComposedSvg(s)}
          <span>${s}px</span>
        </div>
      `
      )
      .join('');
  }

  function selectIcon(id) {
    const def = Icons.get(id);
    if (!def) return;
    customState.selectedId = id;
    customState.svgBody = def.body;
    document.getElementById('sel-icon-label').textContent = def.label;
    document.getElementById('sel-icon-id').textContent = id;
    document.getElementById('ctl-svg-body').value = def.body;
    renderGrid();
    renderPreviewStage();
  }

  function renderGrid() {
    const list = Icons.list();
    document.getElementById('studio-count-badge').textContent = `${list.length} Vector Icons`;
    const q = customState.search.trim().toLowerCase();

    const filtered = list.filter((item) => {
      if (customState.category !== 'all' && item.category !== customState.category) return false;
      if (!q) return true;
      return (
        item.id.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        (item.keywords || '').toLowerCase().includes(q)
      );
    });

    document.getElementById('icons-grid').innerHTML = filtered
      .map(
        (item) => `
        <button class="icon-cell${item.id === customState.selectedId ? ' selected' : ''}" data-icon-id="${esc(item.id)}">
          ${Icons.svg(item.id, { size: 26 })}
          <span class="icon-cell-label">${esc(item.label)}</span>
        </button>
      `
      )
      .join('');
  }

  function setStatus(msg) {
    const el = document.getElementById('studio-status');
    el.textContent = msg;
    setTimeout(() => {
      if (el.textContent === msg) el.textContent = '';
    }, 2600);
  }

  function bindEvents() {
    document.getElementById('icon-search-input').addEventListener('input', (ev) => {
      customState.search = ev.target.value;
      renderGrid();
    });

    document.querySelectorAll('.icon-toolbar [data-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        customState.category = btn.dataset.cat;
        document.querySelectorAll('.icon-toolbar [data-cat]').forEach((b) => {
          b.classList.toggle('btn-primary', b.dataset.cat === customState.category);
        });
        renderGrid();
      });
    });

    document.getElementById('icons-grid').addEventListener('click', (ev) => {
      const cell = ev.target.closest('[data-icon-id]');
      if (cell) selectIcon(cell.dataset.iconId);
    });

    document.getElementById('ctl-stroke-color').addEventListener('input', (ev) => {
      customState.strokeColor = ev.target.value;
      document.getElementById('val-stroke-color').textContent = ev.target.value;
      renderPreviewStage();
    });

    document.getElementById('ctl-bg-color').addEventListener('input', (ev) => {
      customState.bgColor = ev.target.value;
      document.getElementById('val-bg-color').textContent = ev.target.value;
      renderPreviewStage();
    });

    document.getElementById('ctl-shape').addEventListener('change', (ev) => {
      customState.shape = ev.target.value;
      renderPreviewStage();
    });

    document.getElementById('ctl-stroke-width').addEventListener('input', (ev) => {
      customState.strokeWidth = ev.target.value;
      document.getElementById('val-stroke-width').textContent = ev.target.value;
      renderPreviewStage();
    });

    document.getElementById('ctl-svg-body').addEventListener('input', (ev) => {
      customState.svgBody = ev.target.value;
      renderPreviewStage();
    });

    document.getElementById('reset-custom-btn').addEventListener('click', () => {
      customState.strokeColor = '#dfba73';
      customState.bgColor = '#0d1322';
      customState.shape = 'squircle';
      customState.strokeWidth = '1.75';
      document.getElementById('ctl-stroke-color').value = '#dfba73';
      document.getElementById('val-stroke-color').textContent = '#dfba73';
      document.getElementById('ctl-bg-color').value = '#0d1322';
      document.getElementById('val-bg-color').textContent = '#0d1322';
      document.getElementById('ctl-shape').value = 'squircle';
      document.getElementById('ctl-stroke-width').value = '1.75';
      document.getElementById('val-stroke-width').textContent = '1.75';
      selectIcon(customState.selectedId);
    });

    document.getElementById('copy-svg-btn').addEventListener('click', async () => {
      const code = buildComposedSvg(256);
      try {
        await navigator.clipboard.writeText(code);
        setStatus('SVG markup copied to clipboard.');
      } catch {
        setStatus('Clipboard unavailable.');
      }
    });

    document.getElementById('download-svg-btn').addEventListener('click', () => {
      const code = buildComposedSvg(256);
      const blob = new Blob([code], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${customState.selectedId}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus(`Exported ${customState.selectedId}.svg`);
    });

    document.getElementById('download-png-btn').addEventListener('click', () => {
      const code = buildComposedSvg(256);
      const img = new Image();
      const svgBlob = new Blob([code], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 256, 256);
        URL.revokeObjectURL(svgUrl);
        canvas.toBlob((pngBlob) => {
          if (!pngBlob) return;
          const pngUrl = URL.createObjectURL(pngBlob);
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = `${customState.selectedId}-256.png`;
          a.click();
          URL.revokeObjectURL(pngUrl);
          setStatus(`Exported ${customState.selectedId}-256.png`);
        }, 'image/png');
      };
      img.src = svgUrl;
    });
  }

  initHeader();
  bindEvents();
  selectIcon('app-choogle');
})();
