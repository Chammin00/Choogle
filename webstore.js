/**
 * Choogle Web Store - Extensions & Plugins Controller
 * Author: Antigravity AI
 */

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    theme: "light",
    isAudioOn: true,
    activeCategory: "all",
    searchQuery: "",
    installedPlugins: JSON.parse(localStorage.getItem("choogle-installed-plugins") || "[]")
  };

  const PLUGINS = [
    {
      id: "adblock",
      title: "AdBlock Choogle",
      desc: "Removes simulated banner ads from search results and blocks tracking tags.",
      icon: "🛡️",
      category: "utility"
    },
    {
      id: "chaifloat",
      title: "chAI Floating Assistant",
      desc: "Adds a floating chat bubble in the bottom right corner to quickly talk to chAI from any page.",
      icon: "🤖",
      category: "productivity"
    },
    {
      id: "telemetry",
      title: "System Telemetry Bar",
      desc: "Embeds a hardware statistics ticker (FPS, Ping, RAM usage) inside the Choogle search header.",
      icon: "📈",
      category: "utility"
    },
    {
      id: "cyber-cursor",
      title: "Cyber Neon Cursor",
      desc: "Swaps out the standard mouse pointer for a retro neon green block cursor with trailing scanline blocks.",
      icon: "⚡",
      category: "fun"
    }
  ];

  // ==================== DOM ELEMENTS ====================
  const htmlEl = document.documentElement;
  const sfxToggleBtn = document.getElementById("sfx-toggle-btn");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");

  const pluginsContainer = document.getElementById("plugins-container");
  const categoryBtns = document.querySelectorAll(".category-btn");

  const searchInput = document.getElementById("choogle-search-input");
  const searchBtn = document.getElementById("choogle-search-btn");

  // ==================== AUDIO SYNTH ====================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playSynthSound(type) {
    if (!state.isAudioOn) return;
    initAudio();
    if (!audioCtx || audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    
    try {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      const now = audioCtx.currentTime;
      
      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
        gainNode.gain.setValueAtTime(0.04, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.08);
        gainNode.gain.setValueAtTime(0.03, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      console.warn("Audio failure", e);
    }
  }

  // ==================== INITIALIZATION ====================
  function init() {
    initTheme();
    renderPlugins();
    setupEventListeners();
  }

  function initTheme() {
    const savedTheme = localStorage.getItem("choogle-theme") || "light";
    htmlEl.setAttribute("data-theme", savedTheme);
    state.theme = savedTheme;
  }

  function toggleTheme() {
    const newTheme = state.theme === "dark" ? "light" : "dark";
    htmlEl.setAttribute("data-theme", newTheme);
    state.theme = newTheme;
    localStorage.setItem("choogle-theme", newTheme);
    playSynthSound("click");
  }

  // ==================== RENDERING CARDS ====================
  function renderPlugins() {
    pluginsContainer.innerHTML = "";

    const filtered = PLUGINS.filter(p => {
      // Category filter
      if (state.activeCategory !== "all" && p.category !== state.activeCategory) return false;
      // Search query filter
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        return p.title.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query);
      }
      return true;
    });

    if (filtered.length === 0) {
      pluginsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          No extensions found matching the criteria.
        </div>
      `;
      return;
    }

    filtered.forEach(p => {
      const isInstalled = state.installedPlugins.includes(p.id);
      const card = document.createElement("div");
      card.className = "plugin-card glass cyber-border";
      
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
          <div class="plugin-icon">${p.icon}</div>
          <span class="plugin-category">${p.category}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px; flex: 1;">
          <div class="plugin-title font-mono">${escapeHtml(p.title)}</div>
          <p class="plugin-description font-mono">${escapeHtml(p.desc)}</p>
        </div>
        <div class="plugin-meta">
          <button class="pulse-btn font-mono install-btn ${isInstalled ? 'secondary' : 'primary'}" data-id="${p.id}" style="width: 100%; font-size: 11px; height: 32px; padding: 0 10px;">
            ${isInstalled ? "REMOVE_EXTENSION" : "ADD_TO_CHOOGLE"}
          </button>
        </div>
      `;

      card.querySelector(".install-btn").addEventListener("click", (e) => {
        const btn = e.target;
        const id = btn.getAttribute("data-id");
        togglePluginInstall(id, btn);
      });

      pluginsContainer.appendChild(card);
    });
  }

  function togglePluginInstall(id, btn) {
    playSynthSound("success");
    let isInstalled = state.installedPlugins.includes(id);

    if (isInstalled) {
      state.installedPlugins = state.installedPlugins.filter(p => p !== id);
      btn.textContent = "ADD_TO_CHOOGLE";
      btn.className = "pulse-btn font-mono install-btn primary";
    } else {
      state.installedPlugins.push(id);
      btn.textContent = "REMOVE_EXTENSION";
      btn.className = "pulse-btn font-mono install-btn secondary";
    }

    localStorage.setItem("choogle-installed-plugins", JSON.stringify(state.installedPlugins));
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ==================== EVENT BINDINGS ====================
  function setupEventListeners() {
    themeToggleBtn.addEventListener("click", toggleTheme);

    sfxToggleBtn.addEventListener("click", () => {
      state.isAudioOn = !state.isAudioOn;
      sfxToggleBtn.textContent = state.isAudioOn ? "🔊" : "🔇";
      playSynthSound("click");
    });

    // Category button filter trigger
    categoryBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        playSynthSound("click");
        categoryBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.activeCategory = btn.getAttribute("data-category");
        renderPlugins();
      });
    });

    // Search action bindings
    searchBtn.addEventListener("click", () => {
      state.searchQuery = searchInput.value;
      renderPlugins();
    });
    searchInput.addEventListener("input", () => {
      state.searchQuery = searchInput.value;
      renderPlugins();
    });
  }

  init();
});
