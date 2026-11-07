/**
 * Choogle - Core Application Logic
 * Author: Antigravity AI & Chase
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==================== STATE MANAGEMENT ====================
  const state = {
    currentQuery: "",
    theme: "light",
    activeView: "home", // "home" or "results"
    activeTab: "all",
    currentPage: 1,
    tttBoard: Array(9).fill(null),
    tttActive: true,
    tttPlayer: "X", // Player = X, AI = O
    calcCurrentValue: "0",
    calcExpression: "",
    isListening: false,
    recognition: null,
  };

  // ==================== DOM ELEMENTS ====================
  // Theme & Layout
  const htmlEl = document.documentElement;
  const mainHeader = document.getElementById("main-header");
  const homeView = document.getElementById("home-view");
  const resultsView = document.getElementById("results-view");
  const mainFooter = document.getElementById("main-footer");
  
  // Search Inputs & Forms
  const searchFormHome = document.getElementById("search-form-home");
  const searchFormResults = document.getElementById("search-form-results");
  const searchInputHome = document.getElementById("search-input-home");
  const searchInputResults = document.getElementById("search-input-results");
  const clearBtnHome = document.getElementById("clear-btn-home");
  const clearBtnResults = document.getElementById("clear-btn-results");
  const suggestionsHome = document.getElementById("suggestions-home");
  const suggestionsResults = document.getElementById("suggestions-results");
  const resultsLogo = document.getElementById("results-logo");
  const luckyBtn = document.getElementById("lucky-btn");
  
  // Results Display
  const searchStats = document.getElementById("search-stats");
  const widgetContainer = document.getElementById("widget-container");
  const resultsList = document.getElementById("results-list");
  const knowledgePanel = document.getElementById("knowledge-panel");
  const pagination = document.getElementById("pagination");
  const paginationPages = document.getElementById("pagination-pages");
  const paginationHLetters = document.getElementById("pagination-h-letters");
  const tabItems = document.querySelectorAll(".tab-item");
  
  // Dropdowns & Buttons
  const appsBtn = document.getElementById("apps-btn");
  const appsMenu = document.getElementById("apps-menu");
  const profileBtn = document.getElementById("profile-btn");
  const profileMenu = document.getElementById("profile-menu");
  const settingsBtn = document.getElementById("settings-btn");
  const settingsMenu = document.getElementById("settings-menu");
  const themeToggleOption = document.getElementById("theme-toggle-option");
  const themeStatusText = document.getElementById("theme-status-text");

  // Voice Search Overlay
  const voiceOverlay = document.getElementById("voice-overlay");
  const voiceStatusText = document.getElementById("voice-status-text");
  const voiceSpeechOutput = document.getElementById("voice-speech-output");
  const voiceCloseBtns = document.querySelectorAll(".voice-close");
  const voiceBtnTriggers = document.querySelectorAll(".voice-btn");

  // Lens Overlay
  const lensOverlay = document.getElementById("lens-overlay");
  const lensCloseBtns = document.querySelectorAll(".lens-close");
  const lensBtnTriggers = document.querySelectorAll(".lens-btn");
  const lensDropZone = document.getElementById("lens-drop-zone");
  const lensFileInput = document.getElementById("lens-file-input");
  const lensPreviewZone = document.getElementById("lens-preview-zone");
  const lensDropZoneContent = document.querySelector(".lens-drop-zone-content");
  const lensImgPreview = document.getElementById("lens-img-preview");
  const demoThumbBtns = document.querySelectorAll(".demo-thumb-btn");

  // ==================== INITIALIZATION ====================
  function init() {
    initTheme();
    setupEventListeners();
    setupRoutingFromUrl();
    setupSpeechRecognition();
    loadInstalledPlugins();
  }

  // ==================== THEME CONTROLLER ====================
  function initTheme() {
    const savedTheme = localStorage.getItem("choogle-theme");
    const activeTheme = savedTheme || "light";
    
    setTheme(activeTheme);
  }

  function setTheme(theme) {
    state.theme = theme;
    htmlEl.setAttribute("data-theme", theme);
    localStorage.setItem("choogle-theme", theme);
    
    if (theme === "dark") {
      themeStatusText.textContent = "On";
    } else {
      themeStatusText.textContent = "Off";
    }
  }

  function toggleTheme() {
    const newTheme = state.theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  }

  // ==================== ROUTING & SPA VIEW TOGGLING ====================
  function navigateTo(view, query = "") {
    state.activeView = view;
    
    // Clear easter eggs on transition
    document.body.classList.remove("egg-askew", "egg-gravity");
    document.body.style.transform = "";
    
    if (view === "home") {
      homeView.classList.add("view-active");
      homeView.classList.remove("view-hidden");
      resultsView.classList.add("view-hidden");
      resultsView.classList.remove("view-active");
      
      mainHeader.className = "header-home";
      mainFooter.className = "footer-home";
      
      searchInputHome.value = "";
      state.currentQuery = "";
      state.currentPage = 1;
      updateClearBtn("home");
      document.title = "Choogle";
      
      // Focus search input
      setTimeout(() => searchInputHome.focus(), 50);
    } else {
      homeView.classList.add("view-hidden");
      homeView.classList.remove("view-active");
      resultsView.classList.add("view-active");
      resultsView.classList.remove("view-hidden");
      
      mainHeader.className = "header-results";
      mainFooter.className = "footer-results";
      
      state.currentQuery = query;
      searchInputResults.value = query;
      updateClearBtn("results");
      
      document.title = `${query} - Choogle Search`;
      
      // Perform and render results
      performSearch(query);
    }
    
    // Manage browser URL state
    const url = view === "home" ? window.location.pathname : `?q=${encodeURIComponent(query)}`;
    if (window.location.search !== `?q=${encodeURIComponent(query)}` && !(view === "home" && window.location.search === "")) {
      history.pushState({ view, query }, "", url);
    }
  }

  function setupRoutingFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query) {
      navigateTo("results", query);
    } else {
      navigateTo("home");
    }
  }

  window.onpopstate = (event) => {
    if (event.state) {
      navigateTo(event.state.view, event.state.query);
    } else {
      setupRoutingFromUrl();
    }
  };

  // ==================== EVENT LISTENERS SETUP ====================
  function setupEventListeners() {
    // Search Submissions
    searchFormHome.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = searchInputHome.value.trim();
      if (q) navigateTo("results", q);
    });

    searchFormResults.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = searchInputResults.value.trim();
      if (q) navigateTo("results", q);
    });

    // Logo Click returns to Home
    resultsLogo.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("home");
    });

    // Clear Buttons
    searchInputHome.addEventListener("input", () => {
      updateClearBtn("home");
      showSuggestions(searchInputHome.value, suggestionsHome, "home");
    });

    searchInputResults.addEventListener("input", () => {
      updateClearBtn("results");
      showSuggestions(searchInputResults.value, suggestionsResults, "results");
    });

    clearBtnHome.addEventListener("click", () => {
      searchInputHome.value = "";
      updateClearBtn("home");
      suggestionsHome.classList.add("hidden");
      searchInputHome.focus();
    });

    clearBtnResults.addEventListener("click", () => {
      searchInputResults.value = "";
      updateClearBtn("results");
      suggestionsResults.classList.add("hidden");
      searchInputResults.focus();
    });

    // Auto-close Suggestions & Menus when clicking outside
    document.addEventListener("click", (e) => {
      // Autocomplete list home
      if (!searchInputHome.contains(e.target) && !suggestionsHome.contains(e.target)) {
        suggestionsHome.classList.add("hidden");
      }
      // Autocomplete list results
      if (!searchInputResults.contains(e.target) && !suggestionsResults.contains(e.target)) {
        suggestionsResults.classList.add("hidden");
      }
      // Apps menu
      if (!appsBtn.contains(e.target) && !appsMenu.contains(e.target)) {
        appsMenu.classList.add("hidden");
      }
      // Profile menu
      if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.classList.add("hidden");
      }
      // Settings menu
      if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
        settingsMenu.classList.add("hidden");
      }
    });

    // Autocomplete keyboard navigation
    setupAutocompleteKeys(searchInputHome, suggestionsHome, "home");
    setupAutocompleteKeys(searchInputResults, suggestionsResults, "results");

    // Dropdown Toggles
    appsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      appsMenu.classList.toggle("hidden");
      profileMenu.classList.add("hidden");
    });

    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      profileMenu.classList.toggle("hidden");
      appsMenu.classList.add("hidden");
    });

    settingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      settingsMenu.classList.toggle("hidden");
    });

    themeToggleOption.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleTheme();
    });

    // Lucky Button
    luckyBtn.addEventListener("click", () => {
      const luckyQueries = ["tic tac toe", "weather today", "calculator online", "antigravity assistant", "do a barrel roll", "askew", "google gravity"];
      const randQuery = luckyQueries[Math.floor(Math.random() * luckyQueries.length)];
      navigateTo("results", randQuery);
    });

    // Voice Overlay listeners
    voiceBtnTriggers.forEach(btn => {
      btn.addEventListener("click", openVoiceSearch);
    });

    voiceCloseBtns.forEach(btn => {
      btn.addEventListener("click", closeVoiceSearch);
    });

    // Lens Overlay listeners
    lensBtnTriggers.forEach(btn => {
      btn.addEventListener("click", openLensSearch);
    });

    lensCloseBtns.forEach(btn => {
      btn.addEventListener("click", closeLensSearch);
    });

    // Lens Drag & Drop / Upload file
    setupLensDragAndDrop();

    // Tabs Nav clicks
    tabItems.forEach(tab => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        tabItems.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        state.activeTab = tab.getAttribute("data-tab");
        performSearch(state.currentQuery);
      });
    });
  }

  // ==================== UTILITIES ====================
  function updateClearBtn(view) {
    if (view === "home") {
      if (searchInputHome.value) {
        clearBtnHome.classList.remove("hidden");
      } else {
        clearBtnHome.classList.add("hidden");
      }
    } else {
      if (searchInputResults.value) {
        clearBtnResults.classList.remove("hidden");
      } else {
        clearBtnResults.classList.add("hidden");
      }
    }
  }

  // ==================== AUTOCOMPLETE LOGIC ====================
  function showSuggestions(val, listEl, view) {
    const value = val.toLowerCase().trim();
    listEl.innerHTML = "";
    
    if (!value) {
      listEl.classList.add("hidden");
      return;
    }

    // Filter suggestions matching the query
    const filtered = SEARCH_DATA.suggestions.filter(s => s.toLowerCase().includes(value)).slice(0, 6);
    
    if (filtered.length === 0) {
      // Add one default dynamic suggestion
      filtered.push(value);
    }

    filtered.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="suggestion-icon">🔍</span>
        <span class="suggestion-text">${item}</span>
      `;
      li.addEventListener("click", () => {
        navigateTo("results", item);
        listEl.classList.add("hidden");
      });
      listEl.appendChild(li);
    });

    listEl.classList.remove("hidden");
  }

  function setupAutocompleteKeys(inputEl, listEl, view) {
    inputEl.addEventListener("keydown", (e) => {
      const items = listEl.querySelectorAll("li");
      if (listEl.classList.contains("hidden") || items.length === 0) return;

      let selectedIndex = -1;
      items.forEach((item, idx) => {
        if (item.classList.contains("selected")) selectedIndex = idx;
      });

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (selectedIndex !== -1) items[selectedIndex].classList.remove("selected");
        selectedIndex = (selectedIndex + 1) % items.length;
        items[selectedIndex].classList.add("selected");
        inputEl.value = items[selectedIndex].querySelector(".suggestion-text").textContent;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (selectedIndex !== -1) items[selectedIndex].classList.remove("selected");
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        items[selectedIndex].classList.add("selected");
        inputEl.value = items[selectedIndex].querySelector(".suggestion-text").textContent;
      } else if (e.key === "Escape") {
        listEl.classList.add("hidden");
      }
    });
  }

  // ==================== SEARCH EXECUTION ====================
  async function resolveLiveSearch(query) {
    const results = [];
    let source = "local";
    let wikiSummaryTitle = null;

    // 1. Try DuckDuckGo via CORS proxy (First try: allorigins.win)
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`)}`;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3500); // 3.5s timeout
      
      const response = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(id);
      
      if (response.ok) {
        const htmlText = await response.text();
        parseDuckDuckGoHtml(htmlText, results);
      }
    } catch (e) {
      console.warn("DuckDuckGo fetch via allorigins failed, trying backup proxy...", e);
      
      // Try backup proxy: corsproxy.io
      try {
        const backupProxyUrl = `https://corsproxy.io/?${encodeURIComponent(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`)}`;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 3500);
        const response = await fetch(backupProxyUrl, { signal: controller.signal });
        clearTimeout(id);
        if (response.ok) {
          const htmlText = await response.text();
          parseDuckDuckGoHtml(htmlText, results);
        }
      } catch (backupErr) {
        console.warn("DuckDuckGo backup proxy failed as well.", backupErr);
      }
    }

    if (results.length > 0) {
      source = "web";
      // We will also try to fetch a Wikipedia summary for the query to show a knowledge panel!
      wikiSummaryTitle = query;
    } else {
      // 2. Try Wikipedia OpenSearch API (CORS enabled native)
      try {
        const wikiUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=10&namespace=0&format=json&origin=*`;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 3000); // 3s timeout
        
        const response = await fetch(wikiUrl, { signal: controller.signal });
        clearTimeout(id);
        
        if (response.ok) {
          const data = await response.json();
          if (data && data[1] && data[1].length > 0) {
            const titles = data[1];
            const snippets = data[2];
            const urls = data[3];
            
            titles.forEach((title, idx) => {
              results.push({
                title: title,
                url: urls[idx],
                displayedUrl: urls[idx],
                snippet: snippets[idx] || "Read article on Wikipedia, the free encyclopedia."
              });
            });
            wikiSummaryTitle = titles[0]; // Fetch summary for the top match!
            source = "wikipedia";
          }
        }
      } catch (e) {
        console.warn("Wikipedia fetch failed, falling back to local database...", e);
      }
    }

    // Try to get Wikipedia Page Summary for Knowledge Panel if we have a title match
    let knowledgePanel = null;
    if (wikiSummaryTitle) {
      try {
        // Query Wikipedia Summary REST API
        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiSummaryTitle.trim().replace(/\s+/g, "_"))}`;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 2000);
        const response = await fetch(summaryUrl, { signal: controller.signal });
        clearTimeout(id);
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.title && data.extract) {
            knowledgePanel = {
              title: data.title,
              subtitle: data.description || "Wikipedia Article Summary",
              description: data.extract,
              image: data.thumbnail ? data.thumbnail.source : null,
              attributes: {
                "Source": `<a href="${data.content_urls.desktop.page}" target="_blank" style="color: var(--text-link);">Wikipedia Page</a>`,
                "Language": "English",
                "Last Updated": data.timestamp ? new Date(data.timestamp).toLocaleDateString() : "Recently"
              }
            };
          }
        }
      } catch (e) {
        console.warn("Failed to retrieve Wikipedia page summary.", e);
      }
    }

    // 3. Fallback to Local Mock Database if no web results found
    if (results.length === 0) {
      const localData = getSearchResults(query);
      return {
        results: localData.results,
        knowledgePanel: localData.knowledgePanel,
        source: "local"
      };
    }

    return {
      results: results,
      knowledgePanel: knowledgePanel,
      source: source
    };
  }

  // Helper function to parse DuckDuckGo HTML output
  function parseDuckDuckGoHtml(htmlText, resultsArray) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");
    const items = doc.querySelectorAll(".result");
    
    if (items.length > 0) {
      items.forEach(item => {
        const titleEl = item.querySelector(".result__a");
        const snippetEl = item.querySelector(".result__snippet");
        const urlEl = item.querySelector(".result__url");
        
        if (titleEl) {
          const title = titleEl.textContent.trim();
          let url = titleEl.getAttribute("href") || "";
          
          // Clean redirect links
          if (url.includes("uddg=")) {
            const parts = url.split("uddg=");
            if (parts[1]) {
              url = decodeURIComponent(parts[1].split("&")[0]);
            }
          }
          
          const snippet = snippetEl ? snippetEl.textContent.trim() : "";
          const displayedUrl = urlEl ? urlEl.textContent.trim() : url;
          
          resultsArray.push({ title, url, displayedUrl, snippet });
        }
      });
    }
  }

  async function performSearch(query) {
    state.currentQuery = query;
    const normalizedQuery = query.toLowerCase().trim();
    
    // Clear display
    widgetContainer.innerHTML = "";
    widgetContainer.classList.add("hidden");
    resultsList.innerHTML = "";
    knowledgePanel.innerHTML = "";
    knowledgePanel.classList.add("hidden");
    pagination.classList.add("hidden");

    // Check Easter Eggs
    if (normalizedQuery === "askew") {
      document.body.classList.add("egg-askew");
    } else if (normalizedQuery === "google gravity" || normalizedQuery === "gravity") {
      document.body.classList.add("egg-gravity");
    } else if (normalizedQuery === "do a barrel roll") {
      // Trigger temporary rotation
      const content = document.getElementById("results-view");
      content.style.transition = "transform 1s ease";
      content.style.transform = "rotate(360deg)";
      setTimeout(() => {
        content.style.transform = "";
      }, 1000);
    }

    // Render widgets based on query
    let widgetLoaded = false;
    if (normalizedQuery.includes("calc") || isMathExpression(normalizedQuery)) {
      loadCalculatorWidget(normalizedQuery);
      widgetLoaded = true;
    } else if (normalizedQuery.includes("weather")) {
      loadWeatherWidget();
      widgetLoaded = true;
    } else if (normalizedQuery === "tic tac toe" || normalizedQuery === "tictactoe") {
      loadTicTacToeWidget();
      widgetLoaded = true;
    } else if (normalizedQuery.includes("terminal") || normalizedQuery.includes("linux") || normalizedQuery.includes("bash") || normalizedQuery === "cmd") {
      loadTerminalWidget();
      widgetLoaded = true;
    } else if (normalizedQuery.includes("steam")) {
      loadSteamWidget();
      widgetLoaded = true;
    } else if (normalizedQuery.includes("xbox")) {
      loadXboxWidget();
      widgetLoaded = true;
    } else if (normalizedQuery.includes("chess")) {
      loadChessWidget();
      widgetLoaded = true;
    } else if (normalizedQuery.includes("twitch") || normalizedQuery.includes("stream")) {
      loadTwitchWidget();
      widgetLoaded = true;
    } else if (normalizedQuery.includes("youtube") || normalizedQuery.includes("video") || normalizedQuery === "yt") {
      loadYoutubeWidget();
      widgetLoaded = true;
    } else if (normalizedQuery.includes("outage") || normalizedQuery.includes("is down") || normalizedQuery.includes("network status") || normalizedQuery.includes("cloudflare status") || normalizedQuery.includes("at&t") || normalizedQuery === "down") {
      loadOutageWidget(normalizedQuery);
      widgetLoaded = true;
    } else if (normalizedQuery.includes("hack") || normalizedQuery.includes("cyber attack") || normalizedQuery.includes("breach") || normalizedQuery.includes("ransomware") || normalizedQuery.includes("intrusion") || normalizedQuery.includes("compromise")) {
      loadHackedWidget(normalizedQuery);
      widgetLoaded = true;
    } else if (normalizedQuery.includes("rhcsa") || normalizedQuery.includes("linux exam") || normalizedQuery.includes("red hat")) {
      loadRhcsaWidget();
      widgetLoaded = true;
    } else if (normalizedQuery.includes("vmware") || normalizedQuery.includes("vsphere") || normalizedQuery.includes("virtualization")) {
      loadVmwareWidget();
      widgetLoaded = true;
    } else if (normalizedQuery.includes("ccna") || normalizedQuery.includes("network") || normalizedQuery.includes("cisco") || normalizedQuery.includes("subnet")) {
      loadCcnaWidget();
      widgetLoaded = true;
    } else if (normalizedQuery.includes("dlm") || normalizedQuery.includes("storage") || normalizedQuery.includes("retention") || normalizedQuery.includes("classification")) {
      loadDlmWidget();
      widgetLoaded = true;
    } else if (normalizedQuery.includes("powershell") || normalizedQuery.includes("ps ") || normalizedQuery === "ps" || normalizedQuery.includes("cmdlet") || normalizedQuery.includes("scripting")) {
      loadPowershellWidget();
      widgetLoaded = true;
    } else if (normalizedQuery.includes("aac") || normalizedQuery.includes("talker") || normalizedQuery.includes("speech board")) {
      loadAacWidget();
      widgetLoaded = true;
    } else if (normalizedQuery.includes("chai") || normalizedQuery.includes("ai assistant") || normalizedQuery.includes("chatbot") || normalizedQuery === "ai") {
      loadChaiWidget();
      widgetLoaded = true;
    } else if (normalizedQuery.includes("note") || normalizedQuery.includes("workspace") || normalizedQuery === "write" || normalizedQuery.includes("editor")) {
      loadNotepadWidget();
      widgetLoaded = true;
    } else if (normalizedQuery.includes("task") || normalizedQuery.includes("kanban") || normalizedQuery.includes("todo") || normalizedQuery.includes("board")) {
      loadTasksWidget();
      widgetLoaded = true;
    } else if (normalizedQuery.includes("store") || normalizedQuery.includes("plugin") || normalizedQuery.includes("extension") || normalizedQuery === "shop") {
      loadWebstoreWidget();
      widgetLoaded = true;
    }

    // If active tab is "images" or other, adjust layout details
    if (state.activeTab === "images") {
      renderImagesTab(query);
      searchStats.textContent = `About 12 images (0.18 seconds)`;
      return;
    }

    // Show loading skeleton / indicator
    resultsList.innerHTML = `
      <style>
        @keyframes termPulse {
          0% { opacity: 0.4; }
          50% { opacity: 0.8; }
          100% { opacity: 0.4; }
        }
      </style>
      <div style="padding: 10px 0; display: flex; flex-direction: column; gap: 20px;">
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="height: 12px; width: 140px; background-color: var(--border-color); border-radius: 4px; opacity: 0.6; animation: termPulse 1.5s infinite"></div>
          <div style="height: 18px; width: 380px; background-color: var(--border-color); border-radius: 4px; opacity: 0.6; animation: termPulse 1.5s infinite"></div>
          <div style="height: 14px; width: 540px; background-color: var(--border-color); border-radius: 4px; opacity: 0.6; animation: termPulse 1.5s infinite"></div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="height: 12px; width: 110px; background-color: var(--border-color); border-radius: 4px; opacity: 0.6; animation: termPulse 1.5s infinite 0.3s"></div>
          <div style="height: 18px; width: 310px; background-color: var(--border-color); border-radius: 4px; opacity: 0.6; animation: termPulse 1.5s infinite 0.3s"></div>
          <div style="height: 14px; width: 480px; background-color: var(--border-color); border-radius: 4px; opacity: 0.6; animation: termPulse 1.5s infinite 0.3s"></div>
        </div>
      </div>
    `;
    searchStats.textContent = "Connecting to Choogle Live Web Index...";

    // Measure search speed
    const searchStartTime = performance.now();
    
    // Resolve Live Search
    const searchData = await resolveLiveSearch(query);
    
    const searchEndTime = performance.now();
    const searchDuration = ((searchEndTime - searchStartTime) / 1000 + 0.05).toFixed(2);
    
    // Clear skeleton
    resultsList.innerHTML = "";

    // Set Search stats text with source badge
    const totalResults = searchData.results.length + (widgetLoaded ? 1 : 0);
    
    let sourceColor = "var(--text-muted)";
    let sourceText = "Local Sandbox";
    if (searchData.source === "web") {
      sourceColor = "var(--g-green)";
      sourceText = "Live Web";
    } else if (searchData.source === "wikipedia") {
      sourceColor = "var(--g-blue)";
      sourceText = "Wikipedia";
    }
    
    const sourceBadge = `<span style="background-color: ${sourceColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; text-transform: uppercase; margin-left: 8px; vertical-align: middle;">${sourceText}</span>`;
    
    searchStats.innerHTML = `About ${totalResults} results (${searchDuration} seconds) • ${sourceBadge}`;

    // Render main organic search results
    if (searchData.results.length > 0) {
      searchData.results.forEach(res => {
        const card = document.createElement("div");
        card.className = "result-card";
        card.innerHTML = `
          <div class="result-site">
            <span class="result-favicon">🔍</span>
            <span>${res.displayedUrl}</span>
          </div>
          <a href="${res.url}" target="_blank" class="result-title-link">${res.title}</a>
          <p class="result-snippet">${res.snippet}</p>
        `;
        resultsList.appendChild(card);
      });
      
      // Render Pagination
      renderPagination();
    } else {
      resultsList.innerHTML = `
        <div style="padding: 20px 0; color: var(--text-muted)">
          <p>Your search - <strong>${query}</strong> - did not match any documents.</p>
          <p style="margin-top: 12px">Suggestions:</p>
          <ul style="margin-top: 6px; padding-left: 20px">
            <li>Make sure all words are spelled correctly.</li>
            <li>Try different keywords.</li>
            <li>Try more general keywords.</li>
          </ul>
        </div>
      `;
    }

    // Render Knowledge Panel (Right column)
    if (searchData.knowledgePanel) {
      let imageHtml = "";
      if (searchData.knowledgePanel.image) {
        imageHtml = `<img src="${searchData.knowledgePanel.image}" alt="${searchData.knowledgePanel.title}" style="width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px; margin-bottom: 12px; border: 1px solid var(--border-color);">`;
      }
      
      knowledgePanel.innerHTML = `
        <h2 class="knowledge-title">${searchData.knowledgePanel.title}</h2>
        <div class="knowledge-subtitle">${searchData.knowledgePanel.subtitle}</div>
        ${imageHtml}
        <p class="knowledge-desc">${searchData.knowledgePanel.description}</p>
        <div class="knowledge-attr-list">
          ${Object.entries(searchData.knowledgePanel.attributes).map(([key, val]) => `
            <div class="knowledge-attr-item">
              <span class="knowledge-attr-name">${key}:</span>
              <span class="knowledge-attr-value">${val}</span>
            </div>
          `).join("")}
        </div>
      `;
      knowledgePanel.classList.remove("hidden");
    }
  }

  function isMathExpression(str) {
    // Basic regex checks for digits and math operators
    return /^[0-9+\-*/().\s]+$/.test(str) && /[+\-*/()]/.test(str);
  }

  // ==================== IMAGES TAB SIMULATION ====================
  function renderImagesTab(query) {
    const imagesContainer = document.createElement("div");
    imagesContainer.style.display = "grid";
    imagesContainer.style.gridTemplateColumns = "repeat(auto-fill, minmax(180px, 1fr))";
    imagesContainer.style.gap = "16px";
    imagesContainer.style.width = "100%";
    
    // Generate beautiful colored cards using CSS to represent images
    const colors = ["#4285f4", "#ea4335", "#fbbc05", "#34a853", "#9c27b0", "#ff5722", "#00bcd4", "#3f51b5"];
    
    for (let i = 1; i <= 12; i++) {
      const color = colors[(i + query.length) % colors.length];
      const imgCard = document.createElement("div");
      imgCard.style.backgroundColor = color;
      imgCard.style.borderRadius = "8px";
      imgCard.style.height = "140px";
      imgCard.style.display = "flex";
      imgCard.style.flexDirection = "column";
      imgCard.style.justifyContent = "flex-end";
      imgCard.style.padding = "10px";
      imgCard.style.color = "white";
      imgCard.style.boxShadow = "0 2px 4px rgba(0,0,0,0.15)";
      imgCard.style.cursor = "pointer";
      imgCard.innerHTML = `
        <div style="font-size: 11px; opacity: 0.8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">image-${i}.png</div>
        <div style="font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">${query} ${i}</div>
      `;
      imgCard.addEventListener("click", () => {
        alert(`Viewing high-res mockup of image ${i} for query "${query}"`);
      });
      imagesContainer.appendChild(imgCard);
    }
    
    resultsList.appendChild(imagesContainer);
  }

  // ==================== PAGINATION SIMULATION ====================
  function renderPagination() {
    pagination.classList.remove("hidden");
    paginationPages.innerHTML = "";
    
    // Calculate h-letters based on active page
    // "Gooooooogle" style pagination, "Choooooogle" style pagination
    let oCount = 10;
    paginationHLetters.innerHTML = "";
    for (let i = 1; i <= oCount; i++) {
      const oLetter = document.createElement("span");
      oLetter.textContent = "o";
      oLetter.className = i === state.currentPage ? "c-red" : "c-yellow";
      paginationHLetters.appendChild(oLetter);
    }

    for (let page = 1; page <= 6; page++) {
      const pageLink = document.createElement("button");
      pageLink.className = `page-num ${page === state.currentPage ? "active" : ""}`;
      pageLink.textContent = page;
      
      if (page !== state.currentPage) {
        pageLink.addEventListener("click", () => {
          state.currentPage = page;
          performSearch(state.currentQuery);
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      }
      
      paginationPages.appendChild(pageLink);
    }
  }

  // ==================== WEATHER WIDGET LOGIC ====================
  function loadWeatherWidget() {
    widgetContainer.classList.remove("hidden");
    
    const card = document.createElement("div");
    card.className = "widget-card weather-widget";
    card.innerHTML = `
      <div class="weather-header">
        <div class="weather-location">
          <span class="weather-city">Sunnyvale, CA</span>
          <span class="weather-condition">Partly Cloudy • Humidity: 54% • Wind: 8 mph</span>
        </div>
        <div class="weather-current">
          <span class="weather-icon-large">🌤️</span>
          <div class="weather-temp-main">72<span class="weather-unit">°F</span></div>
        </div>
      </div>
      <div class="weather-forecast">
        <div class="forecast-day">
          <span class="forecast-name">Sat</span>
          <span class="forecast-icon">☀️</span>
          <span class="forecast-temp">74° / 58°</span>
        </div>
        <div class="forecast-day">
          <span class="forecast-name">Sun</span>
          <span class="forecast-icon">☀️</span>
          <span class="forecast-temp">76° / 59°</span>
        </div>
        <div class="forecast-day">
          <span class="forecast-name">Mon</span>
          <span class="forecast-icon">⛅</span>
          <span class="forecast-temp">73° / 57°</span>
        </div>
        <div class="forecast-day">
          <span class="forecast-name">Tue</span>
          <span class="forecast-icon">☁️</span>
          <span class="forecast-temp">68° / 55°</span>
        </div>
        <div class="forecast-day">
          <span class="forecast-name">Wed</span>
          <span class="forecast-icon">🌧️</span>
          <span class="forecast-temp">64° / 52°</span>
        </div>
      </div>
    `;
    
    widgetContainer.appendChild(card);
  }

  // ==================== CALCULATOR WIDGET LOGIC ====================
  function loadCalculatorWidget(query) {
    widgetContainer.classList.remove("hidden");
    
    // Parse expression from query if it was numeric
    let initialExpression = "";
    let initialVal = "0";
    if (isMathExpression(query)) {
      initialExpression = query;
      try {
        // Safe evaluation of simple math
        initialVal = evaluateExpression(query);
      } catch (e) {
        initialVal = "Error";
      }
    }
    
    state.calcExpression = initialExpression;
    state.calcCurrentValue = initialVal.toString();

    const card = document.createElement("div");
    card.className = "widget-card calc-widget";
    card.innerHTML = `
      <div class="calc-display">
        <div class="calc-history" id="calc-history-display">${state.calcExpression}</div>
        <div class="calc-current" id="calc-current-display">${state.calcCurrentValue}</div>
      </div>
      <div class="calc-buttons">
        <button class="calc-btn clear-btn-calc" data-val="C">C</button>
        <button class="calc-btn op-btn" data-val="(">(</button>
        <button class="calc-btn op-btn" data-val=")">)</button>
        <button class="calc-btn op-btn" data-val="/">÷</button>
        
        <button class="calc-btn" data-val="7">7</button>
        <button class="calc-btn" data-val="8">8</button>
        <button class="calc-btn" data-val="9">9</button>
        <button class="calc-btn op-btn" data-val="*">×</button>
        
        <button class="calc-btn" data-val="4">4</button>
        <button class="calc-btn" data-val="5">5</button>
        <button class="calc-btn" data-val="6">6</button>
        <button class="calc-btn op-btn" data-val="-">-</button>
        
        <button class="calc-btn" data-val="1">1</button>
        <button class="calc-btn" data-val="2">2</button>
        <button class="calc-btn" data-val="3">3</button>
        <button class="calc-btn op-btn" data-val="+">+</button>
        
        <button class="calc-btn" data-val="0">0</button>
        <button class="calc-btn" data-val=".">.</button>
        <button class="calc-btn eq-btn" data-val="=">=</button>
      </div>
    `;
    
    widgetContainer.appendChild(card);
    
    // Attach Calculator click handlers
    const calcButtons = card.querySelectorAll(".calc-btn");
    const calcHist = card.querySelector("#calc-history-display");
    const calcCurr = card.querySelector("#calc-current-display");
    
    calcButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const val = btn.getAttribute("data-val");
        
        if (val === "C") {
          state.calcExpression = "";
          state.calcCurrentValue = "0";
        } else if (val === "=") {
          if (state.calcExpression) {
            try {
              const res = evaluateExpression(state.calcExpression);
              state.calcCurrentValue = res.toString();
            } catch (e) {
              state.calcCurrentValue = "Error";
            }
          }
        } else {
          // Append operators or values
          if (state.calcCurrentValue === "0" && !isNaN(val)) {
            state.calcExpression = val;
            state.calcCurrentValue = val;
          } else {
            state.calcExpression += val;
            state.calcCurrentValue = state.calcExpression;
          }
        }
        
        calcHist.textContent = state.calcExpression;
        calcCurr.textContent = state.calcCurrentValue;
      });
    });
  }

  function evaluateExpression(expr) {
    // Sanitizes and evaluates simple arithmetic strings safely
    // Replaces ÷ with / and × with *
    let cleanExpr = expr.replace(/÷/g, "/").replace(/×/g, "*").trim();
    
    // Validate characters
    if (!/^[0-9+\-*/().\s]+$/.test(cleanExpr)) {
      throw new Error("Invalid characters");
    }
    
    // Evaluate safely using Function wrapper instead of raw eval
    const result = new Function(`return (${cleanExpr})`)();
    if (result === undefined || isNaN(result)) throw new Error("Evaluation error");
    return result;
  }

  // ==================== TIC TAC TOE WIDGET LOGIC ====================
  function loadTicTacToeWidget() {
    widgetContainer.classList.remove("hidden");
    state.tttBoard = Array(9).fill(null);
    state.tttActive = true;
    state.tttPlayer = "X";

    const card = document.createElement("div");
    card.className = "widget-card ttt-widget";
    card.innerHTML = `
      <div class="ttt-header">
        <span class="ttt-title">Play Tic Tac Toe</span>
        <span class="ttt-status" id="ttt-status-lbl">Your turn (X)</span>
      </div>
      <div class="ttt-board" id="ttt-grid">
        <div class="ttt-cell" data-idx="0"></div>
        <div class="ttt-cell" data-idx="1"></div>
        <div class="ttt-cell" data-idx="2"></div>
        <div class="ttt-cell" data-idx="3"></div>
        <div class="ttt-cell" data-idx="4"></div>
        <div class="ttt-cell" data-idx="5"></div>
        <div class="ttt-cell" data-idx="6"></div>
        <div class="ttt-cell" data-idx="7"></div>
        <div class="ttt-cell" data-idx="8"></div>
      </div>
      <button class="ttt-restart-btn" id="ttt-restart-btn">Restart Game</button>
    `;
    
    widgetContainer.appendChild(card);
    
    const cells = card.querySelectorAll(".ttt-cell");
    const statusLbl = card.getElementById("ttt-status-lbl");
    const restartBtn = card.getElementById("ttt-restart-btn");
    
    cells.forEach(cell => {
      cell.addEventListener("click", () => {
        const idx = parseInt(cell.getAttribute("data-idx"));
        
        if (state.tttBoard[idx] || !state.tttActive || state.tttPlayer !== "X") return;
        
        // Player move
        makeTttMove(idx, "X", cell, statusLbl);
        
        // AI move if game is still active
        if (state.tttActive) {
          state.tttPlayer = "O";
          statusLbl.textContent = "Choogle AI is thinking...";
          
          setTimeout(() => {
            const aiIdx = getTttAiMove();
            if (aiIdx !== -1) {
              const aiCell = card.querySelector(`.ttt-cell[data-idx="${aiIdx}"]`);
              makeTttMove(aiIdx, "O", aiCell, statusLbl);
              state.tttPlayer = "X";
              if (state.tttActive) statusLbl.textContent = "Your turn (X)";
            }
          }, 600);
        }
      });
    });
    
    restartBtn.addEventListener("click", () => {
      loadTicTacToeWidget(); // Re-initialize widget
    });
  }

  function makeTttMove(idx, player, cellEl, statusLbl) {
    state.tttBoard[idx] = player;
    cellEl.textContent = player;
    cellEl.classList.add(player === "X" ? "x-cell" : "o-cell");
    
    const winner = checkTttWinner();
    if (winner) {
      state.tttActive = false;
      if (winner === "Tie") {
        statusLbl.textContent = "It's a draw!";
        statusLbl.style.color = "var(--text-muted)";
      } else {
        statusLbl.textContent = winner === "X" ? "You Win!" : "Choogle AI Wins!";
        statusLbl.style.color = winner === "X" ? "var(--g-green)" : "var(--g-red)";
      }
    }
  }

  function checkTttWinner() {
    const wins = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    
    for (let path of wins) {
      const [a, b, c] = path;
      if (state.tttBoard[a] && state.tttBoard[a] === state.tttBoard[b] && state.tttBoard[a] === state.tttBoard[c]) {
        return state.tttBoard[a];
      }
    }
    
    if (state.tttBoard.every(cell => cell !== null)) {
      return "Tie";
    }
    
    return null;
  }

  function getTttAiMove() {
    // 1. Try to win in this turn
    const winMove = findTttWinningIndex("O");
    if (winMove !== -1) return winMove;
    
    // 2. Block player's winning move
    const blockMove = findTttWinningIndex("X");
    if (blockMove !== -1) return blockMove;
    
    // 3. Take center if available
    if (state.tttBoard[4] === null) return 4;
    
    // 4. Random empty cell
    const empties = [];
    state.tttBoard.forEach((cell, idx) => {
      if (cell === null) empties.push(idx);
    });
    
    if (empties.length > 0) {
      return empties[Math.floor(Math.random() * empties.length)];
    }
    return -1;
  }

  function findTttWinningIndex(player) {
    const wins = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    
    for (let path of wins) {
      const [a, b, c] = path;
      const boardVals = [state.tttBoard[a], state.tttBoard[b], state.tttBoard[c]];
      const playerCount = boardVals.filter(v => v === player).length;
      const nullCount = boardVals.filter(v => v === null).length;
      
      if (playerCount === 2 && nullCount === 1) {
        if (state.tttBoard[a] === null) return a;
        if (state.tttBoard[b] === null) return b;
        if (state.tttBoard[c] === null) return c;
      }
    }
    return -1;
  }

  // ==================== NEW EXPANDED WIDGETS LOGIC ====================

  // 0. Outage Tracker Widget
  function loadOutageWidget(query) {
    widgetContainer.classList.remove("hidden");
    
    const patterns = {
      "steam": { name: "Steam", mttr: "22m", mtbf: "7 days", uptime: "99.90%", cause: "Tuesday maintenance" },
      "aws": { name: "AWS", mttr: "1h 45m", mtbf: "64 days", uptime: "99.98%", cause: "US-East-1 EC2 congestion" },
      "at&t": { name: "AT&T", mttr: "4h 30m", mtbf: "92 days", uptime: "99.92%", cause: "Physical line damage" },
      "cloudflare": { name: "Cloudflare", mttr: "35m", mtbf: "45 days", uptime: "99.99%", cause: "BGP route leaks" },
      "playstation": { name: "PlayStation Network", mttr: "55m", mtbf: "18 days", uptime: "99.85%", cause: "DNS timeouts" },
      "xbox": { name: "Xbox Live", mttr: "40m", mtbf: "22 days", uptime: "99.88%", cause: "Authentication spikes" },
      "power": { name: "Power Grids", mttr: "6h 45m", mtbf: "180 days", uptime: "99.65%", cause: "High load" }
    };

    // Determine specific query parameters to pass
    let searchParam = "";
    if (query.includes("steam")) searchParam = "steam";
    else if (query.includes("at&t") || query.includes("telecom") || query.includes("broadband") || query.includes("isp")) searchParam = "at&t";
    else if (query.includes("cloudflare") || query.includes("network")) searchParam = "cloudflare";
    else if (query.includes("aws") || query.includes("amazon") || query.includes("cloud")) searchParam = "aws";
    else if (query.includes("xbox")) searchParam = "xbox";
    else if (query.includes("playstation") || query.includes("psn") || query.includes("sony")) searchParam = "playstation";
    else if (query.includes("power") || query.includes("grid") || query.includes("electricity") || query.includes("blackout")) searchParam = "power";

    const matchedPattern = searchParam ? patterns[searchParam] : null;
    let patternHtml = "";
    if (matchedPattern) {
      patternHtml = `
        <div style="margin-top: 10px; padding: 10px; background-color: rgba(0, 242, 254, 0.03); border: 1px dashed var(--border-color); border-radius: 6px; font-size: 11px; font-family: monospace; color: var(--text-muted); margin-bottom: 12px;">
          <strong style="color: var(--g-blue); text-transform: uppercase; font-size: 9px; display: block; margin-bottom: 4px;">// ${matchedPattern.name.toUpperCase()}_RELIABILITY_TELEMETRY:</strong>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div>UPTIME UPTIME: <strong style="color: var(--g-green);">${matchedPattern.uptime}</strong></div>
            <div>MTTR (REPAIR): <strong>${matchedPattern.mttr}</strong></div>
            <div>MTBF (FAIL RATE): <strong>${matchedPattern.mtbf}</strong></div>
            <div>COMMON_CAUSE: <strong>${matchedPattern.cause.toUpperCase()}</strong></div>
          </div>
        </div>
      `;
    }

    const card = document.createElement("div");
    card.className = "widget-card";
    card.style.borderLeft = "4px solid var(--g-red)";
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 20px;">📡</span>
            <strong style="font-size: 15px;">OutagePulse Active Reports</strong>
            <span style="background-color: var(--g-red); color: white; font-size: 10px; padding: 2px 8px; border-radius: 12px; font-weight: bold; text-transform: uppercase; animation: termPulse 1.5s infinite">Alert</span>
          </div>
          <p style="font-size: 13px; line-height: 1.5; color: var(--text-muted); margin-bottom: 12px;">
            We detected active service outages matching your search. Live incidents are active for <strong>AWS US-East-1</strong> (Web Services), <strong>PlayStation Network</strong> (Gaming), and <strong>AT&T Fiber</strong> (LA Region).
          </p>
          ${patternHtml}
          <div style="display: flex; gap: 10px;">
            <a href="outages.html${searchParam ? '?q=' + encodeURIComponent(searchParam) : ''}" class="btn-search" style="display: inline-flex; align-items: center; justify-content: center; height: 32px; font-size: 12px; font-weight: 500; text-decoration: none; padding: 0 16px; border: 1px solid var(--border-color); border-radius: 4px; background-color: var(--button-bg); color: var(--text-color);">
              Open OutagePulse Map ${searchParam ? '(' + searchParam.toUpperCase() + ')' : ''}
            </a>
            <a href="outages.html" class="btn-search" style="display: inline-flex; align-items: center; justify-content: center; height: 32px; font-size: 12px; font-weight: 500; text-decoration: none; padding: 0 16px; border: 1px solid transparent; border-radius: 4px; background-color: var(--g-red); color: white;">
              Report Outage
            </a>
          </div>
        </div>
        <div style="width: 80px; height: 80px; border-radius: 8px; background-color: rgba(239, 68, 68, 0.1); border: 1px dashed rgba(239, 68, 68, 0.3); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; flex-shrink: 0;">
          <span style="font-size: 24px; color: var(--g-red); font-weight: bold; line-height: 1;">3</span>
          <span style="font-size: 9px; text-transform: uppercase; font-weight: bold; margin-top: 4px; color: var(--text-muted);">Incidents</span>
        </div>
      </div>
    `;
    
    widgetContainer.appendChild(card);
  }

  function loadHackedWidget(query) {
    widgetContainer.classList.remove("hidden");
    
    const patterns = {
      "jpmorgan": { name: "JPMorgan Chase", severity: "HIGH", group: "LockBit 3.0", vector: "SQL Injection", data: "2.4 TB", cause: "OAuth Token Misconfig" },
      "lockheed": { name: "Lockheed Martin", severity: "HIGH", group: "Lazarus Group", vector: "Spear-phishing", data: "580 GB", cause: "Zero-day proxy login" },
      "ercot": { name: "ERCOT Grid Systems", severity: "MEDIUM", group: "Sandworm", vector: "SCADA Firmware Hijack", data: "45 MB", cause: "Router vulnerability" },
      "bank of america": { name: "Bank of America", severity: "MEDIUM", group: "Fancy Bear", vector: "Credential Stuffing", data: "12M Records", cause: "Third-party vendor API leaks" },
      "microsoft": { name: "Microsoft", severity: "MEDIUM", group: "Lapsus$", vector: "Azure API Leak", data: "250 GB Source", cause: "GitHub access token compromise" },
      "apple": { name: "Apple iCloud", severity: "LOW", group: "REvil", vector: "Brute-force auth bypass", data: "50 GB Photos", cause: "Credential stuffing" },
      "google": { name: "Google OAuth", severity: "HIGH", group: "UNC2452", vector: "SolarWinds Orion vector", data: "5,000 Keys", cause: "Cryptographic signing key leaks" },
      "toyota": { name: "Toyota Motors", severity: "LOW", group: "LockBit 3.0", vector: "Web server exploit", data: "1.2 GB Logs", cause: "Industrial router configurations" }
    };

    let searchParam = "";
    if (query.includes("jpmorgan") || query.includes("chase") || query.includes("bank") || query.includes("finance")) {
      if (query.includes("america")) searchParam = "bank of america";
      else searchParam = "jpmorgan";
    }
    else if (query.includes("lockheed") || query.includes("martin") || query.includes("defense")) searchParam = "lockheed";
    else if (query.includes("ercot") || query.includes("grid") || query.includes("power") || query.includes("infra")) searchParam = "ercot";
    else if (query.includes("microsoft")) searchParam = "microsoft";
    else if (query.includes("apple") || query.includes("icloud")) searchParam = "apple";
    else if (query.includes("google") || query.includes("oauth")) searchParam = "google";
    else if (query.includes("toyota")) searchParam = "toyota";

    const matchedPattern = searchParam ? patterns[searchParam] : null;
    let patternHtml = "";
    if (matchedPattern) {
      patternHtml = `
        <div style="margin-top: 10px; padding: 10px; background-color: rgba(220, 38, 38, 0.03); border: 1px dashed rgba(220, 38, 38, 0.2); border-radius: 6px; font-size: 11px; font-family: monospace; color: var(--text-muted); margin-bottom: 12px;">
          <strong style="color: var(--g-red); text-transform: uppercase; font-size: 9px; display: block; margin-bottom: 4px;">// ${matchedPattern.name.toUpperCase()}_BREACH_TELEMETRY:</strong>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div>SEVERITY: <strong style="color: var(--g-red);">${matchedPattern.severity}</strong></div>
            <div>HACKER GROUP: <strong>${matchedPattern.group}</strong></div>
            <div>ENTRY VECTOR: <strong>${matchedPattern.vector}</strong></div>
            <div>VOLUME LEAKED: <strong>${matchedPattern.data}</strong></div>
          </div>
          <div style="margin-top: 6px;">MITIGATION: <em style="color: var(--text-color);">${matchedPattern.cause}</em></div>
        </div>
      `;
    }

    const card = document.createElement("div");
    card.className = "widget-card";
    card.style.borderLeft = "4px solid var(--g-red)";
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 20px;">👾</span>
            <strong style="font-size: 15px;">HackedOut Security Breach Alert</strong>
            <span style="background-color: var(--g-red); color: white; font-size: 10px; padding: 2px 8px; border-radius: 12px; font-weight: bold; text-transform: uppercase; animation: termPulse 1.5s infinite">ACTIVE_THREAT</span>
          </div>
          <p style="font-size: 13px; line-height: 1.5; color: var(--text-muted); margin-bottom: 12px;">
            HackedOut honeypots detected active cybersecurity compromise signals matching your query. Security protocols activated for the affected subnets.
          </p>
          ${patternHtml}
          <div style="display: flex; gap: 10px;">
            <a href="hacked.html${searchParam ? '?q=' + encodeURIComponent(searchParam) : ''}" class="btn-search" style="display: inline-flex; align-items: center; justify-content: center; height: 32px; font-size: 12px; font-weight: 500; text-decoration: none; padding: 0 16px; border: 1px solid var(--border-color); border-radius: 4px; background-color: var(--button-bg); color: var(--text-color);">
              Open HackedOut Threat Map ${searchParam ? '(' + searchParam.toUpperCase() + ')' : ''}
            </a>
            <a href="hacked.html" class="btn-search" style="display: inline-flex; align-items: center; justify-content: center; height: 32px; font-size: 12px; font-weight: 500; text-decoration: none; padding: 0 16px; border: 1px solid transparent; border-radius: 4px; background-color: var(--g-red); color: white;">
              Report Breach
            </a>
          </div>
        </div>
        <div style="width: 80px; height: 80px; border-radius: 8px; background-color: rgba(239, 68, 68, 0.1); border: 1px dashed rgba(239, 68, 68, 0.3); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; flex-shrink: 0;">
          <span style="font-size: 24px; color: var(--g-red); font-weight: bold; line-height: 1;">3</span>
          <span style="font-size: 9px; text-transform: uppercase; font-weight: bold; margin-top: 4px; color: var(--text-muted);">Intrusions</span>
        </div>
      </div>
    `;
    
    widgetContainer.appendChild(card);
  }

  // 0a. RHCSA Exam Prep Widget
  function loadRhcsaWidget() {
    widgetContainer.classList.remove("hidden");
    const card = document.createElement("div");
    card.className = "widget-card rhcsa-widget";
    card.style.borderLeft = "4px solid #cc0000";
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 20px;">🐧</span>
            <strong style="font-size: 15px;">RHCSA Exam Quest Prep Engine</strong>
            <span style="background-color: #cc0000; color: white; font-size: 9px; padding: 2px 8px; border-radius: 12px; font-weight: bold; text-transform: uppercase;">RHEL 9</span>
          </div>
          <p style="font-size: 13px; line-height: 1.5; color: var(--text-muted); margin-bottom: 12px;">
            Chase's interactive RHCSA EX200 training engine. Practice mock terminal commands and configuration quests.
          </p>
          
          <div id="rhcsa-challenge-box" style="padding: 12px; background-color: rgba(204, 0, 0, 0.03); border: 1px solid rgba(204, 0, 0, 0.15); border-radius: 6px; margin-bottom: 12px;">
            <strong style="font-size: 11px; color: #cc0000; display: block; margin-bottom: 6px;">EXAM CHALLENGE // PERMISSIONS:</strong>
            <p style="font-size: 12px; margin-bottom: 8px; font-family: monospace;">TASK: Set owner to 'chase' and group to 'admin' on '/opt/secure_log'.</p>
            
            <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; font-family: monospace;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="rhcsa-opt" value="wrong1"> chmod 755 /opt/secure_log
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="rhcsa-opt" value="correct"> chown chase:admin /opt/secure_log
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="rhcsa-opt" value="wrong2"> chown admin:chase /opt/secure_log
              </label>
            </div>
            <button id="verify-rhcsa-btn" class="btn-search" style="margin-top: 10px; height: 28px; font-size: 11px; padding: 0 12px; background-color: #cc0000; color: white; border: none; border-radius: 4px; cursor: pointer; font-family: inherit;">Verify Answer</button>
            <span id="rhcsa-feedback" style="font-size: 11px; margin-left: 10px; font-weight: bold;"></span>
          </div>

          <div style="display: flex; gap: 10px;">
            <a href="https://rhel-9-rhcsa-exam-quest-511593565817.us-east1.run.app" target="_blank" class="btn-search" style="display: inline-flex; align-items: center; justify-content: center; height: 32px; font-size: 12px; font-weight: 500; text-decoration: none; padding: 0 16px; border: 1px solid var(--border-color); border-radius: 4px; background-color: var(--button-bg); color: var(--text-color);">
              Launch Exam Prep Engine
            </a>
          </div>
        </div>
      </div>
    `;

    widgetContainer.appendChild(card);

    const verifyBtn = card.querySelector("#verify-rhcsa-btn");
    const feedback = card.querySelector("#rhcsa-feedback");
    verifyBtn.addEventListener("click", () => {
      const selected = card.querySelector("input[name='rhcsa-opt']:checked");
      if (!selected) {
        feedback.textContent = "Please select an answer!";
        feedback.style.color = "var(--g-yellow)";
        return;
      }
      if (selected.value === "correct") {
        feedback.textContent = "CORRECT! chown owner:group sets owner permissions.";
        feedback.style.color = "var(--g-green)";
      } else {
        feedback.textContent = "INCORRECT! Try again.";
        feedback.style.color = "var(--g-red)";
      }
    });
  }

  // 0b. VMware Prep Widget
  function loadVmwareWidget() {
    widgetContainer.classList.remove("hidden");
    const card = document.createElement("div");
    card.className = "widget-card vmware-widget";
    card.style.borderLeft = "4px solid #005691";
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 20px;">🖥️</span>
            <strong style="font-size: 15px;">VMware Infrastructure Prep Studio</strong>
            <span style="background-color: #005691; color: white; font-size: 9px; padding: 2px 8px; border-radius: 12px; font-weight: bold; text-transform: uppercase;">vSphere 8</span>
          </div>
          <p style="font-size: 13px; line-height: 1.5; color: var(--text-muted); margin-bottom: 12px;">
            Chase's VMware laboratory prep simulation. Practice setting up distributed switches and datastores.
          </p>
          
          <div style="padding: 12px; background-color: rgba(0, 86, 145, 0.03); border: 1px solid rgba(0, 86, 145, 0.15); border-radius: 6px; margin-bottom: 12px; font-family: monospace; font-size: 11px;">
            <strong style="color: #005691; display: block; margin-bottom: 6px;">CLUSTER STATUS DIRECTORY:</strong>
            <div id="vm-host1" style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>ESXi Host 1 (IP: 10.0.1.10)</span> <span style="color: var(--g-green); font-weight: bold;">[ONLINE]</span>
            </div>
            <div id="vm-host2" style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span>ESXi Host 2 (IP: 10.0.1.11)</span> <span style="color: var(--text-muted);">[STANDBY]</span>
            </div>
            <div id="vMotion-console" style="color: var(--text-muted); border-top: 1px dashed rgba(0, 0, 0, 0.1); padding-top: 6px; font-size: 10px; min-height: 20px;">
              // Click trigger to run migration simulation
            </div>
            <button id="trigger-failover-btn" class="btn-search" style="margin-top: 10px; height: 28px; font-size: 11px; padding: 0 12px; background-color: #005691; color: white; border: none; border-radius: 4px; cursor: pointer; font-family: inherit;">Trigger vMotion Failover</button>
          </div>

          <div style="display: flex; gap: 10px;">
            <a href="https://cham-vmware-infrastructure-prep-engine.ai.studio" target="_blank" class="btn-search" style="display: inline-flex; align-items: center; justify-content: center; height: 32px; font-size: 12px; font-weight: 500; text-decoration: none; padding: 0 16px; border: 1px solid var(--border-color); border-radius: 4px; background-color: var(--button-bg); color: var(--text-color);">
              Launch VMware Prep Studio
            </a>
          </div>
        </div>
      </div>
    `;

    widgetContainer.appendChild(card);

    const triggerBtn = card.querySelector("#trigger-failover-btn");
    const consoleEl = card.querySelector("#vMotion-console");
    const host1 = card.querySelector("#vm-host1");
    const host2 = card.querySelector("#vm-host2");

    triggerBtn.addEventListener("click", () => {
      triggerBtn.disabled = true;
      triggerBtn.textContent = "Running HA...";
      consoleEl.innerHTML = "<span style='color: var(--g-red);'>[FAIL] ESXi Host 1 power loss detected!</span>";
      host1.innerHTML = "<span>ESXi Host 1 (IP: 10.0.1.10)</span> <span style='color: var(--g-red); font-weight: bold;'>[OFFLINE]</span>";
      
      setTimeout(() => {
        consoleEl.innerHTML += "<br><span style='color: var(--g-yellow);'>[vMotion] Migrating VM cluster to Host 2...</span>";
      }, 1000);

      setTimeout(() => {
        host2.innerHTML = "<span>ESXi Host 2 (IP: 10.0.1.11)</span> <span style='color: var(--g-green); font-weight: bold;'>[ONLINE]</span>";
        consoleEl.innerHTML += "<br><span style='color: var(--g-green);'>[vMotion] Failover complete. VMs active on Host 2!</span>";
        triggerBtn.textContent = "Failover Complete";
      }, 2500);
    });
  }

  // 0c. Chance's AAC Talker Widget
  function loadAacWidget() {
    widgetContainer.classList.remove("hidden");
    const card = document.createElement("div");
    card.className = "widget-card aac-widget";
    card.style.borderLeft = "4px solid #7c3aed";
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 20px;">🗣️</span>
            <strong style="font-size: 15px;">Chance's AAC Talker</strong>
            <span style="background-color: #7c3aed; color: white; font-size: 9px; padding: 2px 8px; border-radius: 12px; font-weight: bold; text-transform: uppercase;">Assistive Speech</span>
          </div>
          <p style="font-size: 13px; line-height: 1.5; color: var(--text-muted); margin-bottom: 12px;">
            An interactive speech board simulator. Click buttons to construct sentences and speak them aloud using native speech synthesis.
          </p>
          
          <div style="padding: 12px; background-color: rgba(124, 58, 237, 0.03); border: 1px solid rgba(124, 58, 237, 0.15); border-radius: 6px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; background-color: var(--bg-card-solid); border: 1px solid var(--border-color); border-radius: 4px; padding: 6px 10px; margin-bottom: 10px;">
              <span style="font-size: 11px; font-weight: bold; color: #7c3aed; margin-right: 6px; font-family: monospace;">SPEECH_OUTPUT:</span>
              <span id="aac-output-bar" style="font-size: 13px; font-weight: bold; color: var(--text-color);">...</span>
              <button id="clear-aac-output" style="margin-left: auto; background: none; border: none; font-size: 10px; cursor: pointer; color: var(--text-muted);">CLEAR</button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
              <button class="aac-speech-btn" data-word="Hello" style="height: 36px; font-size: 12px; font-weight: bold; cursor: pointer; border-radius: 4px; border: 1px solid rgba(124,58,237,0.2); background: white;">👋 Hello</button>
              <button class="aac-speech-btn" data-word="Yes" style="height: 36px; font-size: 12px; font-weight: bold; cursor: pointer; border-radius: 4px; border: 1px solid rgba(124,58,237,0.2); background: white;">✔️ Yes</button>
              <button class="aac-speech-btn" data-word="No" style="height: 36px; font-size: 12px; font-weight: bold; cursor: pointer; border-radius: 4px; border: 1px solid rgba(124,58,237,0.2); background: white;">❌ No</button>
              <button class="aac-speech-btn" data-word="Help" style="height: 36px; font-size: 12px; font-weight: bold; cursor: pointer; border-radius: 4px; border: 1px solid rgba(124,58,237,0.2); background: white;">🚨 Help</button>
              <button class="aac-speech-btn" data-word="More" style="height: 36px; font-size: 12px; font-weight: bold; cursor: pointer; border-radius: 4px; border: 1px solid rgba(124,58,237,0.2); background: white;">➕ More</button>
              <button class="aac-speech-btn" data-word="Thank You" style="height: 36px; font-size: 12px; font-weight: bold; cursor: pointer; border-radius: 4px; border: 1px solid rgba(124,58,237,0.2); background: white;">💖 Thanks</button>
            </div>
            
            <button id="speak-aac-btn" class="btn-search" style="margin-top: 10px; width: 100%; height: 32px; font-size: 12px; background-color: #7c3aed; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">🗣️ Speak Sentence</button>
          </div>

          <div style="display: flex; gap: 10px;">
            <a href="https://chance-s-aac-talker-295027341949.us-east1.run.app" target="_blank" class="btn-search" style="display: inline-flex; align-items: center; justify-content: center; height: 32px; font-size: 12px; font-weight: 500; text-decoration: none; padding: 0 16px; border: 1px solid var(--border-color); border-radius: 4px; background-color: var(--button-bg); color: var(--text-color);">
              Launch AAC Talker Webapp
            </a>
          </div>
        </div>
      </div>
    `;

    widgetContainer.appendChild(card);

    const outputBar = card.querySelector("#aac-output-bar");
    const clearBtn = card.querySelector("#clear-aac-output");
    const speakBtn = card.querySelector("#speak-aac-btn");
    const speechBtns = card.querySelectorAll(".aac-speech-btn");
    
    let phrase = [];

    speechBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const word = btn.getAttribute("data-word");
        phrase.push(word);
        outputBar.textContent = phrase.join(" ");
        
        // Speak single word on click
        speakWordNative(word);
      });
    });

    clearBtn.addEventListener("click", () => {
      phrase = [];
      outputBar.textContent = "...";
    });

    speakBtn.addEventListener("click", () => {
      const sentence = phrase.join(" ");
      if (sentence) {
        speakWordNative(sentence);
      } else {
        speakWordNative("AAC speech board is empty.");
      }
    });

    function speakWordNative(text) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } else {
        console.warn("Speech Synthesis not supported in this browser.");
      }
    }
  }

  // 0c-2. chAI - Personal AI Assistant Widget
  function loadChaiWidget() {
    widgetContainer.classList.remove("hidden");
    const card = document.createElement("div");
    card.className = "widget-card chai-widget";
    card.style.borderLeft = "4px solid #1B2A4A";
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 20px;">🤖</span>
            <strong style="font-size: 15px;">chAI — Personal AI Assistant</strong>
            <span style="background: linear-gradient(135deg, #1B2A4A, #C8A96E); color: white; font-size: 9px; padding: 2px 8px; border-radius: 12px; font-weight: bold; text-transform: uppercase;">Gemini Powered</span>
          </div>
          <p style="font-size: 13px; line-height: 1.5; color: var(--text-muted); margin-bottom: 12px;">
            Your personal AI chatbot built into the Choogle ecosystem. Ask questions, get coding help, study for certifications, and more — powered by Google Gemini.
          </p>
          
          <div style="padding: 14px; background: linear-gradient(135deg, rgba(27,42,74,0.03), rgba(200,169,110,0.05)); border: 1px solid rgba(27,42,74,0.12); border-radius: 8px; margin-bottom: 12px;">
            <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px;">
              <span style="font-size: 16px;">🤖</span>
              <div style="background-color: var(--widget-bg); border: 1px solid var(--widget-border); padding: 10px 14px; border-radius: 12px; border-bottom-left-radius: 4px; font-size: 13px; color: var(--text-color); line-height: 1.5;">
                Hello! I'm <strong>chAI</strong>, your personal AI assistant. I can help with <strong>networking</strong>, <strong>Linux admin</strong>, <strong>PowerShell scripts</strong>, <strong>VMware</strong>, and much more. What would you like to work on?
              </div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              <span style="padding: 4px 10px; border: 1px solid rgba(200,169,110,0.3); border-radius: 14px; font-size: 11px; color: var(--text-muted);">📡 Explain OSPF routing</span>
              <span style="padding: 4px 10px; border: 1px solid rgba(200,169,110,0.3); border-radius: 14px; font-size: 11px; color: var(--text-muted);">🐧 RHCSA exam tips</span>
              <span style="padding: 4px 10px; border: 1px solid rgba(200,169,110,0.3); border-radius: 14px; font-size: 11px; color: var(--text-muted);">💻 Debug my code</span>
            </div>
          </div>

          <div style="display: flex; gap: 10px;">
            <a href="chai.html" class="btn-search" style="display: inline-flex; align-items: center; justify-content: center; height: 34px; font-size: 12px; font-weight: 600; text-decoration: none; padding: 0 20px; border: none; border-radius: 6px; background: linear-gradient(135deg, #1B2A4A, #2d4a7a); color: white; cursor: pointer;">
              🤖 Open chAI Assistant
            </a>
          </div>
        </div>
      </div>
    `;

    widgetContainer.appendChild(card);
  }

  // 0c-3. Choogle Notepad Widget
  function loadNotepadWidget() {
    widgetContainer.classList.remove("hidden");
    const card = document.createElement("div");
    card.className = "widget-card notepad-widget";
    card.style.borderLeft = "4px solid var(--g-tan)";
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 20px;">📝</span>
            <strong style="font-size: 15px;">Choogle Notepad — Personal Notebook</strong>
            <span style="background-color: var(--g-tan); color: black; font-size: 9px; padding: 2px 8px; border-radius: 12px; font-weight: bold; text-transform: uppercase;">Workspace</span>
          </div>
          <p style="font-size: 13px; line-height: 1.5; color: var(--text-muted); margin-bottom: 12px;">
            Write persistent notes, format using markdown, auto-save to browser storage, and back up files locally.
          </p>
          <div style="display: flex; gap: 10px;">
            <a href="notepad.html" class="btn-search" style="display: inline-flex; align-items: center; justify-content: center; height: 34px; font-size: 12px; font-weight: 600; text-decoration: none; padding: 0 20px; border: none; border-radius: 6px; background-color: var(--g-navy); color: white; cursor: pointer;">
              📝 Open Notepad Editor
            </a>
          </div>
        </div>
      </div>
    `;
    widgetContainer.appendChild(card);
  }

  // 0c-4. Choogle Tasks Widget
  function loadTasksWidget() {
    widgetContainer.classList.remove("hidden");
    const card = document.createElement("div");
    card.className = "widget-card tasks-widget";
    card.style.borderLeft = "4px solid var(--g-navy)";
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 20px;">✅</span>
            <strong style="font-size: 15px;">Choogle Tasks — Kanban Board</strong>
            <span style="background-color: var(--g-navy); color: white; font-size: 9px; padding: 2px 8px; border-radius: 12px; font-weight: bold; text-transform: uppercase;">Kanban</span>
          </div>
          <p style="font-size: 13px; line-height: 1.5; color: var(--text-muted); margin-bottom: 12px;">
            Manage and prioritize tasks, organize study objectives, and track projects using an interactive kanban board workspace.
          </p>
          <div style="display: flex; gap: 10px;">
            <a href="tasks.html" class="btn-search" style="display: inline-flex; align-items: center; justify-content: center; height: 34px; font-size: 12px; font-weight: 600; text-decoration: none; padding: 0 20px; border: none; border-radius: 6px; background-color: var(--g-navy); color: white; cursor: pointer;">
              ✅ Open Tasks Board
            </a>
          </div>
        </div>
      </div>
    `;
    widgetContainer.appendChild(card);
  }

  // 0c-5. Choogle Web Store Widget
  function loadWebstoreWidget() {
    widgetContainer.classList.remove("hidden");
    const card = document.createElement("div");
    card.className = "widget-card webstore-widget";
    card.style.borderLeft = "4px solid var(--g-tan)";
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 20px;">🛍️</span>
            <strong style="font-size: 15px;">Choogle Web Store — Extensions & Plugins</strong>
            <span style="background-color: var(--g-tan); color: black; font-size: 9px; padding: 2px 8px; border-radius: 12px; font-weight: bold; text-transform: uppercase;">Store</span>
          </div>
          <p style="font-size: 13px; line-height: 1.5; color: var(--text-muted); margin-bottom: 12px;">
            Customize your search experience. Browse, install, or disable extensions like AdBlock Choogle, chAI floating assistant, and system telemetry bars.
          </p>
          <div style="display: flex; gap: 10px;">
            <a href="webstore.html" class="btn-search" style="display: inline-flex; align-items: center; justify-content: center; height: 34px; font-size: 12px; font-weight: 600; text-decoration: none; padding: 0 20px; border: none; border-radius: 6px; background-color: var(--g-navy); color: white; cursor: pointer;">
              🛍️ Open Web Store
            </a>
          </div>
        </div>
      </div>
    `;
    widgetContainer.appendChild(card);
  }

  // 0d. Cisco CCNA Lab Widget
  function loadCcnaWidget() {
    widgetContainer.classList.remove("hidden");
    const card = document.createElement("div");
    card.className = "widget-card ccna-widget";
    card.style.borderLeft = "4px solid #0d6efd";
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 20px;">📡</span>
            <strong style="font-size: 15px;">Cisco CCNA Networking Lab</strong>
            <span style="background-color: #0d6efd; color: white; font-size: 9px; padding: 2px 8px; border-radius: 12px; font-weight: bold; text-transform: uppercase;">IOS CLI</span>
          </div>
          <p style="font-size: 13px; line-height: 1.5; color: var(--text-muted); margin-bottom: 12px;">
            Chase's interactive Cisco CCNA networking lab. Practice Cisco IOS command scripts and IP subnetting.
          </p>
          
          <div style="padding: 12px; background-color: rgba(13, 110, 253, 0.03); border: 1px solid rgba(13, 110, 253, 0.15); border-radius: 6px; margin-bottom: 12px;">
            <strong style="font-size: 11px; color: #0d6efd; display: block; margin-bottom: 6px;">SUBNETTING DRILL:</strong>
            <p style="font-size: 12px; margin-bottom: 8px; font-family: monospace;">What netmask sub-octet corresponds to a /26 network prefix?</p>
            
            <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; font-family: monospace;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="ccna-opt" value="wrong1"> 255.255.255.128
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="ccna-opt" value="correct"> 255.255.255.192
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="ccna-opt" value="wrong2"> 255.255.255.224
              </label>
            </div>
            <button id="verify-ccna-btn" class="btn-search" style="margin-top: 10px; height: 28px; font-size: 11px; padding: 0 12px; background-color: #0d6efd; color: white; border: none; border-radius: 4px; cursor: pointer; font-family: inherit;">Verify</button>
            <span id="ccna-feedback" style="font-size: 11px; margin-left: 10px; font-weight: bold;"></span>
          </div>

          <div style="display: flex; gap: 10px;">
            <a href="ccna.html" class="btn-search" style="display: inline-flex; align-items: center; justify-content: center; height: 32px; font-size: 12px; font-weight: 500; text-decoration: none; padding: 0 16px; border: 1px solid var(--border-color); border-radius: 4px; background-color: var(--button-bg); color: var(--text-color);">
              Launch CCNA Network Lab
            </a>
          </div>
        </div>
      </div>
    `;

    widgetContainer.appendChild(card);

    const verifyBtn = card.querySelector("#verify-ccna-btn");
    const feedback = card.querySelector("#ccna-feedback");
    verifyBtn.addEventListener("click", () => {
      const selected = card.querySelector("input[name='ccna-opt']:checked");
      if (!selected) {
        feedback.textContent = "Select an answer!";
        feedback.style.color = "var(--g-yellow)";
        return;
      }
      if (selected.value === "correct") {
        feedback.textContent = "Correct! /26 leaves 6 bits for hosts, giving 64 addresses.";
        feedback.style.color = "var(--g-green)";
      } else {
        feedback.textContent = "Incorrect. Try again!";
        feedback.style.color = "var(--g-red)";
      }
    });
  }

  // 0e. DLM Storage Widget
  function loadDlmWidget() {
    widgetContainer.classList.remove("hidden");
    const card = document.createElement("div");
    card.className = "widget-card dlm-widget";
    card.style.borderLeft = "4px solid #7c3aed";
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 20px;">📦</span>
            <strong style="font-size: 15px;">Data Lifecycle Management (DLM) Console</strong>
            <span style="background-color: #7c3aed; color: white; font-size: 9px; padding: 2px 8px; border-radius: 12px; font-weight: bold; text-transform: uppercase;">Storage Ops</span>
          </div>
          <p style="font-size: 13px; line-height: 1.5; color: var(--text-muted); margin-bottom: 12px;">
            Chase's data retention management console. Set storage retention tiers, scan database records, and rotate encryption keys.
          </p>
          
          <div style="padding: 12px; background-color: rgba(124, 58, 237, 0.03); border: 1px solid rgba(124, 58, 237, 0.15); border-radius: 6px; margin-bottom: 12px; font-family: monospace; font-size: 11px;">
            <strong style="color: #7c3aed; display: block; margin-bottom: 4px;">ACTIVE COLD ENVELOPE RETENTION:</strong>
            • PHI Schemas (production_users_db) ❯ Retention: 7 Years<br>
            • PCI Schemas (payment_transactions) ❯ Retention: 7 Years
          </div>

          <div style="display: flex; gap: 10px;">
            <a href="dlm.html" class="btn-search" style="display: inline-flex; align-items: center; justify-content: center; height: 32px; font-size: 12px; font-weight: 500; text-decoration: none; padding: 0 16px; border: 1px solid var(--border-color); border-radius: 4px; background-color: var(--button-bg); color: var(--text-color);">
              Open DLM Storage Console
            </a>
          </div>
        </div>
      </div>
    `;

    widgetContainer.appendChild(card);
  }

  // 0f. Windows PowerShell Widget
  function loadPowershellWidget() {
    widgetContainer.classList.remove("hidden");
    const card = document.createElement("div");
    card.className = "widget-card ps-widget";
    card.style.borderLeft = "4px solid #002451";
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 20px;">🟦</span>
            <strong style="font-size: 15px;">Windows PowerShell Training Console</strong>
            <span style="background-color: #002451; color: white; font-size: 9px; padding: 2px 8px; border-radius: 12px; font-weight: bold; text-transform: uppercase;">Cmdlet Lab</span>
          </div>
          <p style="font-size: 13px; line-height: 1.5; color: var(--text-muted); margin-bottom: 12px;">
            Chase's interactive PowerShell shell. Execute administrative cmdlets and complete scripting challenge validation modules.
          </p>
          
          <div style="padding: 12px; background-color: rgba(0, 36, 81, 0.03); border: 1px solid rgba(0, 36, 81, 0.15); border-radius: 6px; margin-bottom: 12px; font-family: monospace; font-size: 11px;">
            <strong style="color: #002451; display: block; margin-bottom: 4px;">CMDLET DRILL:</strong>
            Task: Start the stopped Windows Update service (name: wuauserv).<br>
            Code: <input type="text" id="widget-ps-code" value="Start-Service -Name &quot;wuauserv&quot;" style="width: 180px; font-size: 11px; font-family: monospace; border: 1px solid var(--border-color); border-radius: 2px; padding: 2px 4px; outline: none; margin-top: 4px; background: white; color: black;">
            <button id="verify-ps-btn" class="btn-search" style="height: 22px; font-size: 10px; padding: 0 8px; background-color: #002451; color: white; border: none; border-radius: 3px; cursor: pointer; margin-left: 6px;">Test</button>
            <div id="widget-ps-feedback" style="margin-top: 4px; font-weight: bold; font-size: 10px;"></div>
          </div>

          <div style="display: flex; gap: 10px;">
            <a href="powershell.html" class="btn-search" style="display: inline-flex; align-items: center; justify-content: center; height: 32px; font-size: 12px; font-weight: 500; text-decoration: none; padding: 0 16px; border: 1px solid var(--border-color); border-radius: 4px; background-color: var(--button-bg); color: var(--text-color);">
              Launch PowerShell Console
            </a>
          </div>
        </div>
      </div>
    `;

    widgetContainer.appendChild(card);

    const codeInput = card.querySelector("#widget-ps-code");
    const verifyBtn = card.querySelector("#verify-ps-btn");
    const feedback = card.querySelector("#widget-ps-feedback");

    verifyBtn.addEventListener("click", () => {
      const codeVal = codeInput.value.trim().toLowerCase();
      if (codeVal.includes("start-service") && codeVal.includes("wuauserv")) {
        feedback.textContent = "SUCCESS! Service wuauserv initiated.";
        feedback.style.color = "var(--g-green)";
      } else {
        feedback.textContent = "ERROR: Incorrect cmdlet parameters.";
        feedback.style.color = "var(--g-red)";
      }
    });
  }

  // ==================== NEW EXPANDED WIDGETS LOGIC ====================

  // 1. Linux Terminal Widget
  function loadTerminalWidget() {
    widgetContainer.classList.remove("hidden");
    
    const card = document.createElement("div");
    card.className = "widget-card term-widget";
    card.innerHTML = `
      <div class="term-box">
        <div class="term-log" id="term-log-el">
          <div class="term-line info-line">Choogle Bash Shell v1.0.0 (simulated)</div>
          <div class="term-line info-line">Type 'help' to see list of available commands.</div>
        </div>
        <div class="term-input-row">
          <span class="term-prompt">guest@choogle:~$</span>
          <input type="text" id="term-input-el" class="term-input" autocomplete="off" autofocus>
        </div>
      </div>
    `;
    
    widgetContainer.appendChild(card);
    
    const termLog = card.querySelector("#term-log-el");
    const termInput = card.querySelector("#term-input-el");
    
    let hackerInterval = null;

    // Focus terminal input
    setTimeout(() => termInput.focus(), 50);

    termInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const cmdText = termInput.value.trim();
        termInput.value = "";
        
        if (hackerInterval) {
          clearInterval(hackerInterval);
          hackerInterval = null;
        }

        if (!cmdText) return;

        // Print echoed command
        appendTermLine(`guest@choogle:~$ ${cmdText}`, "cmd-echo");
        
        // Parse command
        const args = cmdText.split(" ");
        const command = args[0].toLowerCase();
        
        switch (command) {
          case "help":
            appendTermLine("Available commands:\n  help      - display list of commands\n  ls        - list directory contents\n  cat <file>- view file contents\n  whoami    - print current user\n  date      - show current date and time\n  clear     - clear terminal output\n  hack      - launch simulated cyber security protocol");
            break;
          case "ls":
            appendTermLine("choogle_secrets.txt    tic_tac_toe.exe    calculator.app    chase_profile.json");
            break;
          case "cat":
            const filename = args[1] ? args[1].toLowerCase() : "";
            if (!filename) {
              appendTermLine("Usage: cat <filename>", "err-line");
            } else if (filename === "choogle_secrets.txt") {
              appendTermLine("CHOOGLE SECRET:\nChoogle is built with Google's Antigravity AI coding assistant.\nOur mission is to replace boring search engines with widgets-only interactive playgrounds!");
            } else if (filename === "chase_profile.json") {
              appendTermLine("{\n  \"name\": \"Chase\",\n  \"role\": \"Lead Creator\",\n  \"status\": \"Collaborating with Antigravity AI\",\n  \"projects\": [\"Choogle Search\", \"Advanced Widgets\"]\n}");
            } else {
              appendTermLine(`cat: ${args[1]}: No such file or directory`, "err-line");
            }
            break;
          case "whoami":
            appendTermLine("guest_choogler");
            break;
          case "date":
            appendTermLine(new Date().toString());
            break;
          case "clear":
            termLog.innerHTML = "";
            break;
          case "hack":
            appendTermLine("Initializing Hack protocol...", "info-line");
            let lines = [
              "CONNECT 127.0.0.1:8080 ... SUCCESS",
              "BYPASSING FIREWALL ... [████████████████] 100%",
              "DECRYPTING CHOOGLE DATABASE KEY ... SUCCESS",
              "EXTRACTING CREDENTIALS ...",
              "guest_hash = '5d41402abc4b2a76b9719d911017c592'",
              "INJECTING SHELLCODE ... SUCCESS",
              "SYSTEM HACKED! WELCOME CHASE!"
            ];
            let lineIdx = 0;
            hackerInterval = setInterval(() => {
              if (lineIdx < lines.length) {
                appendTermLine(lines[lineIdx], "hacker-line");
                lineIdx++;
              } else {
                clearInterval(hackerInterval);
                hackerInterval = null;
              }
            }, 400);
            break;
          default:
            appendTermLine(`bash: ${command}: command not found. Type 'help' for options.`, "err-line");
        }
      }
    });

    function appendTermLine(text, className = "") {
      const line = document.createElement("div");
      line.className = `term-line ${className}`;
      line.textContent = text;
      termLog.appendChild(line);
      termLog.scrollTop = termLog.scrollHeight;
    }
  }

  // 2. Steam Store Widget
  function loadSteamWidget(voiceCommand = null) {
    widgetContainer.classList.remove("hidden");
    
    const card = document.createElement("div");
    card.className = "widget-card steam-widget";
    card.innerHTML = `
      <div class="steam-header-bar">
        <div class="steam-logo">
          <span class="steam-logo-icon">🎮</span>
          <span>STEAM® STORE</span>
        </div>
        <div class="steam-header-nav">
          <span>Store</span>
          <span>Library</span>
          <span>Community</span>
          <span>Chat</span>
        </div>
      </div>
      <div class="steam-featured">
        <h4>Featured & Recommended</h4>
        <div class="steam-game-item" data-game="cyberchoogle">
          <div class="steam-game-thumb" style="background-color: #fbbc05;">🤖</div>
          <div class="steam-game-details">
            <div class="steam-game-name">Cyberchoogle 2077</div>
            <div class="steam-game-tags">Sci-Fi, RPG, Cyberpunk</div>
          </div>
          <div class="steam-game-actions">
            <span class="steam-price">$59.99</span>
            <button class="steam-btn" id="steam-btn-cyber">Install</button>
          </div>
        </div>
        <div class="steam-game-item" data-game="halflife">
          <div class="steam-game-thumb" style="background-color: #ea4335;">λ</div>
          <div class="steam-game-details">
            <div class="steam-game-name">Half-Life: Choogle</div>
            <div class="steam-game-tags">Classic, Sci-Fi, FPS</div>
          </div>
          <div class="steam-game-actions">
            <span class="steam-price">$9.99</span>
            <button class="steam-btn" id="steam-btn-hl">Play</button>
          </div>
        </div>
        <div class="steam-game-item" data-game="chooglevalley">
          <div class="steam-game-thumb" style="background-color: #34a853;">🌾</div>
          <div class="steam-game-details">
            <div class="steam-game-name">Choogle Valley</div>
            <div class="steam-game-tags">Simulation, Relaxing, Farming</div>
          </div>
          <div class="steam-game-actions">
            <span class="steam-price">Free</span>
            <button class="steam-btn" id="steam-btn-cv">Install</button>
          </div>
        </div>
      </div>

      <!-- Steam Game DVR Panel -->
      <div class="xbox-dvr-panel">
        <div class="dvr-header">
          <div class="dvr-title">
            <span class="dvr-rec-dot" id="dvr-rec-dot"></span>
            <span>STEAM GAME DVR & CAPTURE</span>
          </div>
          <div class="dvr-voice-status" id="dvr-voice-status">
            <span>🎙️ Voice Commands: Enabled</span>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div class="dvr-controls">
            <button class="dvr-btn" id="dvr-btn-rec">🔴 Start Recording</button>
            <button class="dvr-btn" id="dvr-btn-30s">⏳ Clip Last 30s</button>
            <button class="dvr-btn" id="dvr-btn-1m">⏳ Clip Last 1m</button>
            <button class="dvr-btn" id="dvr-btn-3m">⏳ Clip Last 3m</button>
          </div>
          <div style="font-size: 12px; color: #ff3344; font-weight: bold; font-family: monospace;" id="dvr-timer">
            00:00:00
          </div>
        </div>
        <div class="dvr-clips-list" id="dvr-clips-list">
          <div class="dvr-clip-item" style="color: #666; justify-content: center; font-style: italic;" id="dvr-empty-log">
            No clips captured yet. Say "record that" or click buttons to capture clips.
          </div>
        </div>
      </div>
    `;
    
    widgetContainer.appendChild(card);
    
    setupSteamHandlers(card);
    setupXboxDvr(card, voiceCommand);
  }

  function setupSteamHandlers(card) {
    const installBtnCyber = card.querySelector("#steam-btn-cyber");
    const playBtnHl = card.querySelector("#steam-btn-hl");
    const installBtnCv = card.querySelector("#steam-btn-cv");

    playBtnHl.addEventListener("click", () => {
      alert("Launching Half-Life: Choogle... Good luck, Freeman!");
    });

    const triggerInstall = (btn, gameName) => {
      btn.className = "steam-btn btn-downloading";
      btn.disabled = true;
      let progress = 0;
      
      const interval = setInterval(() => {
        progress += 10;
        btn.textContent = `Downloading ${progress}%`;
        
        if (progress >= 100) {
          clearInterval(interval);
          btn.className = "steam-btn btn-play";
          btn.disabled = false;
          btn.textContent = "Play";
          
          // Re-attach play listener
          btn.onclick = () => {
            alert(`Launching ${gameName}... Enjoy your gaming session!`);
          };
        }
      }, 200);
    };

    installBtnCyber.addEventListener("click", () => {
      triggerInstall(installBtnCyber, "Cyberchoogle 2077");
    });

    installBtnCv.addEventListener("click", () => {
      triggerInstall(installBtnCv, "Choogle Valley");
    });
  }

  // 3. Xbox Game Pass Widget
  function loadXboxWidget(voiceCommand = null) {
    widgetContainer.classList.remove("hidden");
    
    const card = document.createElement("div");
    card.className = "widget-card xbox-widget";
    card.innerHTML = `
      <div class="xbox-header-bar">
        <div class="xbox-logo-img"></div>
        <span class="xbox-title">Xbox Game Pass</span>
      </div>
      <div class="xbox-dashboard">
        <div class="xbox-games-list">
          <h4>Cloud Gaming Library</h4>
          <div class="xbox-games-grid">
            <div class="xbox-game-card">
              <div class="xbox-game-icon">🪐</div>
              <div class="xbox-game-info">
                <div class="xbox-game-title">Halo Infinite</div>
                <div class="xbox-game-stat">FPS • 343 Industries</div>
              </div>
              <button class="xbox-btn launch-xbox-btn" data-game="Halo Infinite">Launch</button>
            </div>
            <div class="xbox-game-card">
              <div class="xbox-game-icon">🏎️</div>
              <div class="xbox-game-info">
                <div class="xbox-game-title">Forza Horizon 5</div>
                <div class="xbox-game-stat">Racing • Playground Games</div>
              </div>
              <button class="xbox-btn launch-xbox-btn" data-game="Forza Horizon 5">Launch</button>
            </div>
            <div class="xbox-game-card">
              <div class="xbox-game-icon">✈️</div>
              <div class="xbox-game-info">
                <div class="xbox-game-title">Microsoft Flight Simulator</div>
                <div class="xbox-game-stat">Simulation • Asobo Studio</div>
              </div>
              <button class="xbox-btn launch-xbox-btn" data-game="Flight Simulator">Launch</button>
            </div>
          </div>
        </div>
        <div class="xbox-social">
          <h4>Friends Online</h4>
          <div class="xbox-social-list">
            <div class="xbox-friend-item">
              <div class="xbox-friend-avatar">MC<span class="xbox-status-dot online"></span></div>
              <div class="xbox-friend-details">
                <div class="xbox-friend-name">MasterChief</div>
                <div class="xbox-friend-presence">Playing Halo</div>
              </div>
            </div>
            <div class="xbox-friend-item">
              <div class="xbox-friend-avatar">CT<span class="xbox-status-dot online"></span></div>
              <div class="xbox-friend-details">
                <div class="xbox-friend-name">Cortana</div>
                <div class="xbox-friend-presence">Online</div>
              </div>
            </div>
            <div class="xbox-friend-item">
              <div class="xbox-friend-avatar">CS<span class="xbox-status-dot online"></span></div>
              <div class="xbox-friend-details">
                <div class="xbox-friend-name">Chase</div>
                <div class="xbox-friend-presence">Playing Chess</div>
              </div>
            </div>
            <div class="xbox-friend-item">
              <div class="xbox-friend-avatar">AG<span class="xbox-status-dot offline"></span></div>
              <div class="xbox-friend-details">
                <div class="xbox-friend-name">Antigravity</div>
                <div class="xbox-friend-presence">Offline</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Xbox Game DVR Panel -->
        <div class="xbox-dvr-panel">
          <div class="dvr-header">
            <div class="dvr-title">
              <span class="dvr-rec-dot" id="dvr-rec-dot"></span>
              <span>XBOX GAME DVR & CAPTURE</span>
            </div>
            <div class="dvr-voice-status" id="dvr-voice-status">
              <span>🎙️ Voice Commands: Enabled</span>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div class="dvr-controls">
              <button class="dvr-btn" id="dvr-btn-rec">🔴 Start Recording</button>
              <button class="dvr-btn" id="dvr-btn-30s">⏳ Clip Last 30s</button>
              <button class="dvr-btn" id="dvr-btn-1m">⏳ Clip Last 1m</button>
              <button class="dvr-btn" id="dvr-btn-3m">⏳ Clip Last 3m</button>
            </div>
            <div style="font-size: 12px; color: #ff3344; font-weight: bold; font-family: monospace;" id="dvr-timer">
              00:00:00
            </div>
          </div>
          <div class="dvr-clips-list" id="dvr-clips-list">
            <div class="dvr-clip-item" style="color: #666; justify-content: center; font-style: italic;" id="dvr-empty-log">
              No clips captured yet. Say "record that" or click buttons to capture clips.
            </div>
          </div>
        </div>
      </div>
    `;
    
    widgetContainer.appendChild(card);
    
    // Attach launch listeners
    const launchBtns = card.querySelectorAll(".launch-xbox-btn");
    launchBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const game = btn.getAttribute("data-game");
        btn.textContent = "Connecting...";
        btn.disabled = true;
        
        setTimeout(() => {
          btn.textContent = "Streaming...";
          alert(`Initializing Cloud Session for ${game}... Connection secure. Have fun playing!`);
          btn.textContent = "Launch";
          btn.disabled = false;
        }, 1200);
      });
    });

    setupXboxDvr(card, voiceCommand);
  }

  // 4. Chess.com Mate-in-1 Puzzle Widget
  function loadChessWidget() {
    widgetContainer.classList.remove("hidden");
    
    // Board State representation for a Mate-in-1 puzzle
    // White Queen on D3, Black King on H8.
    // We will place a few extra blocks to make it realistic.
    // board[row][col] -> null, or { type, color }
    // pieces: 'p' (pawn), 'r' (rook), 'n' (knight), 'b' (bishop), 'q' (queen), 'k' (king)
    // colors: 'w' (white), 'b' (black)
    const boardState = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Set pieces
    boardState[0][7] = { type: 'k', color: 'b', symbol: '♚' }; // Black King H8
    boardState[1][7] = { type: 'p', color: 'b', symbol: '♟' }; // Black Pawn H7 (blocked, or is H7 empty? Wait, if we mate on H7, H7 must be empty or contain a capture! Let's make H7 empty so we can land Queen there. Let's block Black King with a Pawn on G8 (row 0, col 6) and H8 has King. Queen on D3 can checkmate on H7 if there is no defender!)
    boardState[0][6] = { type: 'p', color: 'b', symbol: '♟' }; // Black Pawn G8
    boardState[1][6] = { type: 'p', color: 'b', symbol: '♟' }; // Black Pawn G7
    boardState[5][3] = { type: 'q', color: 'w', symbol: '♕' }; // White Queen D3 (target piece!)
    boardState[7][6] = { type: 'k', color: 'w', symbol: '♔' }; // White King G1
    boardState[6][6] = { type: 'p', color: 'w', symbol: '♙' }; // White Pawn G2
    boardState[6][7] = { type: 'p', color: 'w', symbol: '♙' }; // White Pawn H2

    let selectedSquare = null;
    let puzzleSolved = false;

    const card = document.createElement("div");
    card.className = "widget-card chess-widget";
    card.innerHTML = `
      <div class="chess-header-bar">
        <span class="chess-logo">
          <span class="chess-logo-icon">♟️</span>
          <span>Chess.com</span>
        </span>
        <span class="chess-header-title">Daily Puzzle</span>
      </div>
      <div class="chess-container">
        <div class="chess-board-wrapper">
          <div class="chess-board" id="chess-board-el"></div>
          <div class="chess-board-labels-rank">
            <span class="chess-label-light">8</span>
            <span class="chess-label-dark">7</span>
            <span class="chess-label-light">6</span>
            <span class="chess-label-dark">5</span>
            <span class="chess-label-light">4</span>
            <span class="chess-label-dark">3</span>
            <span class="chess-label-light">2</span>
            <span class="chess-label-dark">1</span>
          </div>
          <div class="chess-board-labels-file">
            <span class="chess-label-dark">a</span>
            <span class="chess-label-light">b</span>
            <span class="chess-label-dark">c</span>
            <span class="chess-label-light">d</span>
            <span class="chess-label-dark">e</span>
            <span class="chess-label-light">f</span>
            <span class="chess-label-dark">g</span>
            <span class="chess-label-light">h</span>
          </div>
        </div>
        <div class="chess-sidebar">
          <div class="chess-puzzle-info">
            <div class="chess-puzzle-title">White to Move</div>
            <div id="chess-puzzle-prompt-el" class="chess-puzzle-prompt">Find the winning move! Move White's Queen (♕) to deliver Checkmate in 1.</div>
          </div>
          <button class="chess-puzzle-btn" id="chess-reset-btn">Reset Puzzle</button>
        </div>
      </div>
    `;
    
    widgetContainer.appendChild(card);
    
    const boardEl = card.querySelector("#chess-board-el");
    const promptEl = card.querySelector("#chess-puzzle-prompt-el");
    const resetBtn = card.querySelector("#chess-reset-btn");
    
    renderBoard();

    function renderBoard() {
      boardEl.innerHTML = "";
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const cell = document.createElement("div");
          const isLight = (r + c) % 2 === 0;
          cell.className = `chess-cell ${isLight ? "light-square" : "dark-square"}`;
          cell.setAttribute("data-row", r);
          cell.setAttribute("data-col", c);
          
          // Selection highlight
          if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
            cell.classList.add("selected-square");
          }
          
          // Target checkmate highlight dot helper
          if (selectedSquare && selectedSquare.r === 5 && selectedSquare.c === 3 && r === 1 && c === 7) {
            cell.classList.add("highlight-square");
          }

          const piece = boardState[r][c];
          if (piece) {
            const pieceEl = document.createElement("span");
            pieceEl.className = `chess-piece ${piece.color === 'w' ? "white-piece" : "black-piece"}`;
            pieceEl.textContent = piece.symbol;
            cell.appendChild(pieceEl);
          }
          
          cell.addEventListener("click", () => handleCellClick(r, c));
          boardEl.appendChild(cell);
        }
      }
    }

    function handleCellClick(r, c) {
      if (puzzleSolved) return;

      const piece = boardState[r][c];

      if (selectedSquare) {
        // We have an active selection, attempting to move
        const fromR = selectedSquare.r;
        const fromC = selectedSquare.c;
        
        // Target mate is moving Queen from (5,3) to (1,7) i.e. H7
        if (fromR === 5 && fromC === 3 && r === 1 && c === 7) {
          // Correct Mate-in-1 move!
          boardState[r][c] = boardState[fromR][fromC];
          boardState[fromR][fromC] = null;
          selectedSquare = null;
          puzzleSolved = true;
          
          renderBoard();
          triggerPuzzleSuccess();
        } else {
          // Deselect or select another white piece
          if (piece && piece.color === 'w') {
            selectedSquare = { r, c };
            renderBoard();
          } else {
            selectedSquare = null;
            renderBoard();
            promptEl.innerHTML = `<span style="color: var(--g-red)">Incorrect move. Try again! Find a checkmate for White.</span>`;
          }
        }
      } else {
        // Select a white piece
        if (piece && piece.color === 'w') {
          selectedSquare = { r, c };
          renderBoard();
        }
      }
    }

    function triggerPuzzleSuccess() {
      promptEl.innerHTML = `
        <div class="chess-puzzle-success">🎉 Puzzle Solved!</div>
        <div style="font-size: 12px; margin-top: 4px; color: #bababa">Qh7# delivers checkmate. The Black King is trapped. Excellent job!</div>
      `;
    }

    resetBtn.addEventListener("click", () => {
      loadChessWidget();
    });
  }

  // 5. Twitch Live Stream Widget
  function loadTwitchWidget() {
    widgetContainer.classList.remove("hidden");
    
    const card = document.createElement("div");
    card.className = "widget-card twitch-widget";
    card.innerHTML = `
      <div class="twitch-header-bar">
        <div class="twitch-logo">
          <span class="twitch-logo-icon">🎦</span>
          <span>Twitch Live</span>
        </div>
        <span class="twitch-status-info">Live</span>
      </div>
      <div class="twitch-container">
        <div class="twitch-player">
          <canvas id="twitch-canvas" class="twitch-stream-canvas" width="400" height="225"></canvas>
          <div class="twitch-player-overlay">
            <div class="twitch-channel-name">ShroudChoogle</div>
            <div class="twitch-game-name">Cyberchoogle 2077 • 45.2K viewers</div>
          </div>
        </div>
        <div class="twitch-chat-panel">
          <div class="twitch-chat-header">Stream Chat</div>
          <div class="twitch-chat-messages" id="twitch-chat-logs">
            <div class="twitch-chat-line"><span class="twitch-chat-user" style="color: #ff4500;">NinjaGamer:</span>POGGERS! What a stream!</div>
            <div class="twitch-chat-line"><span class="twitch-chat-user" style="color: #9acd32;">L33tCode:</span>Is this game running in 120 FPS?</div>
          </div>
        </div>
      </div>
    `;
    
    widgetContainer.appendChild(card);
    
    setupTwitchSimulation(card);
  }

  function setupTwitchSimulation(card) {
    const canvas = card.querySelector("#twitch-canvas");
    const ctx = canvas.getContext("2d");
    const chatLogs = card.querySelector("#twitch-chat-logs");
    
    // 1. Draw Simulated Video Canvas Game Loop
    let animationId;
    let particleX = 50;
    let particleY = 100;
    let dx = 3;
    let dy = 2;
    
    // Generate simple simulated game graphics
    function drawStreamFrame() {
      // Clear screen with dark space background
      ctx.fillStyle = "#141416";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw gridlines representing a game environment
      ctx.strokeStyle = "#25262b";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 30) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Draw players spaceship
      ctx.fillStyle = "#a970ff";
      ctx.beginPath();
      ctx.moveTo(particleX, particleY);
      ctx.lineTo(particleX - 15, particleY + 10);
      ctx.lineTo(particleX - 15, particleY - 10);
      ctx.closePath();
      ctx.fill();

      // Draw bouncing ball (enemy or item)
      ctx.fillStyle = "#34a853";
      ctx.beginPath();
      ctx.arc(particleX + 100, 110, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw flashing UI healthbar
      ctx.fillStyle = "#333";
      ctx.fillRect(10, 10, 100, 8);
      ctx.fillStyle = "#eb0400";
      ctx.fillRect(10, 10, 75, 8);

      // Bounce/movement logic
      particleX += dx;
      if (particleX > canvas.width || particleX < 30) {
        dx = -dx;
      }
      
      animationId = requestAnimationFrame(drawStreamFrame);
    }
    
    drawStreamFrame();

    // 2. Chat Simulator
    const usernames = ["GamerPro99", "ChoogleKing", "AntigravityGamer", "ChaseBuilds", "Speedrunner", "LurkMaster", "KappaGuy"];
    const messages = [
      "OMG HE ALMOST DIED THERE",
      "Hype Train incoming!!",
      "Is that model the 3.5 Flash?",
      "AG is carrying this lobby lol",
      "What weapon is that?",
      "Can we play next round?",
      "This is awesome vanilla code!",
      "POG!!",
      "Lulzzzz"
    ];
    const colors = ["#ff4500", "#1e90ff", "#32cd32", "#ff8c00", "#ba55d3", "#ff1493", "#00ffff"];

    const chatInterval = setInterval(() => {
      if (!document.getElementById("twitch-canvas")) {
        // Widget got cleaned up/cleared
        clearInterval(chatInterval);
        cancelAnimationFrame(animationId);
        return;
      }
      
      const randUser = usernames[Math.floor(Math.random() * usernames.length)];
      const randMsg = messages[Math.floor(Math.random() * messages.length)];
      const randCol = colors[Math.floor(Math.random() * colors.length)];
      
      const chatLine = document.createElement("div");
      chatLine.className = "twitch-chat-line";
      chatLine.innerHTML = `<span class="twitch-chat-user" style="color: ${randCol};">${randUser}:</span>${randMsg}`;
      
      chatLogs.appendChild(chatLine);
      chatLogs.scrollTop = chatLogs.scrollHeight;
      
      // Cap chat history at 30 messages
      if (chatLogs.children.length > 30) {
        chatLogs.removeChild(chatLogs.firstChild);
      }
    }, 1800);
  }

  // 6. YouTube Expanded Player Widget
  function loadYoutubeWidget() {
    widgetContainer.classList.remove("hidden");
    
    // Initial display: Video cards grid list
    renderYoutubeList();
  }

  function renderYoutubeList() {
    widgetContainer.innerHTML = "";
    const card = document.createElement("div");
    card.className = "widget-card yt-widget";
    card.innerHTML = `
      <div class="yt-header-bar">
        <div class="yt-logo">
          <span class="yt-logo-icon">📺</span>
          <span>YouTube Replica</span>
        </div>
      </div>
      <div class="yt-video-grid">
        <div class="yt-video-card" data-video="0">
          <div class="yt-video-thumb" style="background-color: #4285f4; color: white;">🚀
            <span class="yt-video-duration">4:12</span>
          </div>
          <div class="yt-video-meta">
            <div class="yt-channel-avatar">CD</div>
            <div class="yt-video-info">
              <div class="yt-video-title">Building Choogle: The Ultimate Google Replica Website</div>
              <div class="yt-video-author">Choogle Devs</div>
              <div class="yt-video-views">1.2M views • 1 day ago</div>
            </div>
          </div>
        </div>
        <div class="yt-video-card" data-video="1">
          <div class="yt-video-thumb" style="background-color: #ea4335; color: white;">🐱
            <span class="yt-video-duration">2:45</span>
          </div>
          <div class="yt-video-meta">
            <div class="yt-channel-avatar">CP</div>
            <div class="yt-video-info">
              <div class="yt-video-title">Cute Cat Videos Compilation 2026 (Try Not To Laugh)</div>
              <div class="yt-video-author">Cute Pets</div>
              <div class="yt-video-views">842K views • 2 weeks ago</div>
            </div>
          </div>
        </div>
        <div class="yt-video-card" data-video="2">
          <div class="yt-video-thumb" style="background-color: #34a853; color: white;">♟️
            <span class="yt-video-duration">10:50</span>
          </div>
          <div class="yt-video-meta">
            <div class="yt-channel-avatar">CM</div>
            <div class="yt-video-info">
              <div class="yt-video-title">Solving Daily Chess Puzzles Live against AI Engine</div>
              <div class="yt-video-author">Chess Masters</div>
              <div class="yt-video-views">310K views • 3 days ago</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    widgetContainer.appendChild(card);
    
    // Attach click events to load expanded player
    const cards = card.querySelectorAll(".yt-video-card");
    cards.forEach(c => {
      c.addEventListener("click", () => {
        const index = parseInt(c.getAttribute("data-video"));
        renderExpandedYoutubePlayer(index);
      });
    });
  }

  function renderExpandedYoutubePlayer(videoIndex) {
    widgetContainer.innerHTML = "";
    
    const videosData = [
      {
        title: "Building Choogle: The Ultimate Google Replica Website",
        duration: 252, // 4:12
        color: "#4285f4",
        symbol: "🚀"
      },
      {
        title: "Cute Cat Videos Compilation 2026 (Try Not To Laugh)",
        duration: 165, // 2:45
        color: "#ea4335",
        symbol: "🐱"
      },
      {
        title: "Solving Daily Chess Puzzles Live against AI Engine",
        duration: 650, // 10:50
        color: "#34a853",
        symbol: "♟️"
      }
    ];

    const video = videosData[videoIndex];
    let isPlaying = true;
    let currentTime = 0;
    
    const card = document.createElement("div");
    card.className = "widget-card yt-widget";
    card.innerHTML = `
      <div class="yt-header-bar">
        <div class="yt-logo">
          <span class="yt-logo-icon">📺</span>
          <span>YouTube Player</span>
        </div>
      </div>
      <div class="yt-player-expanded">
        <div class="yt-player-window" id="yt-window">
          <canvas id="yt-canvas" class="yt-player-canvas" width="480" height="270"></canvas>
          <div class="yt-play-center-btn" id="yt-center-btn">▶</div>
          
          <div class="yt-player-controls">
            <div class="yt-seekbar-container" id="yt-seekbar">
              <div class="yt-seekbar-progress" id="yt-progress"></div>
            </div>
            <div class="yt-controls-row">
              <div class="yt-controls-left">
                <button class="yt-control-btn" id="yt-play-btn">⏸</button>
                <div class="yt-time-display" id="yt-time">0:00 / 0:00</div>
              </div>
              <div class="yt-controls-right">
                <div class="yt-volume-wrapper">
                  <span style="font-size: 12px;">🔊</span>
                  <div class="yt-volume-slider" id="yt-volume">
                    <div class="yt-volume-progress" id="yt-volume-progress"></div>
                  </div>
                </div>
                <button class="yt-control-btn">⚙️</button>
                <button class="yt-control-btn">⛶</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="yt-player-details">
          <div class="yt-player-title">${video.title}</div>
          <button class="yt-player-back-btn" id="yt-back-btn">Back to Videos</button>
        </div>
      </div>
    `;
    
    widgetContainer.appendChild(card);
    
    const canvas = card.querySelector("#yt-canvas");
    const ctx = canvas.getContext("2d");
    const playBtn = card.querySelector("#yt-play-btn");
    const timeDisplay = card.querySelector("#yt-time");
    const seekbar = card.querySelector("#yt-seekbar");
    const seekbarProgress = card.querySelector("#yt-progress");
    const volumeSlider = card.querySelector("#yt-volume");
    const volumeProgress = card.querySelector("#yt-volume-progress");
    const backBtn = card.querySelector("#yt-back-btn");
    const centerBtn = card.querySelector("#yt-center-btn");
    const playerWindow = card.querySelector("#yt-window");

    let videoInterval;
    
    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function drawVideoFrame() {
      if (!isPlaying) return;
      
      // Draw nice gradient representing video playback
      ctx.fillStyle = video.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw pulsating circular emblem
      const sizeMultiplier = 1 + Math.sin(currentTime * 2) * 0.05;
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 45 * sizeMultiplier, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw video emblem symbol
      ctx.fillStyle = video.color;
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(video.symbol, canvas.width / 2, canvas.height / 2);

      // Draw decorative audio waves at bottom
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      for (let i = 0; i < canvas.width; i += 12) {
        const height = Math.abs(Math.sin((i + currentTime * 40) * 0.05)) * 30;
        ctx.fillRect(i, canvas.height - height, 6, height);
      }
    }

    function togglePlayback() {
      isPlaying = !isPlaying;
      if (isPlaying) {
        playBtn.textContent = "⏸";
        playerWindow.classList.remove("paused");
        startPlayback();
      } else {
        playBtn.textContent = "▶";
        playerWindow.classList.add("paused");
        // Draw static frame
        ctx.fillStyle = "#1e1e1e";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "bold 32px Arial";
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
      }
    }

    function startPlayback() {
      if (videoInterval) clearInterval(videoInterval);
      
      videoInterval = setInterval(() => {
        if (!document.getElementById("yt-canvas")) {
          clearInterval(videoInterval);
          return;
        }
        
        if (isPlaying) {
          currentTime += 1;
          if (currentTime >= video.duration) {
            currentTime = 0; // Loop video
          }
          
          // Update time label
          timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(video.duration)}`;
          
          // Update seekbar percentage
          const pct = (currentTime / video.duration) * 100;
          seekbarProgress.style.width = `${pct}%`;
          
          drawVideoFrame();
        }
      }, 1000);
    }

    // Play/pause events
    playBtn.addEventListener("click", togglePlayback);
    playerWindow.addEventListener("click", togglePlayback);

    // Seek events
    seekbar.addEventListener("click", (e) => {
      e.stopPropagation();
      const rect = seekbar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = clickX / rect.width;
      currentTime = Math.floor(pct * video.duration);
      seekbarProgress.style.width = `${pct * 100}%`;
      timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(video.duration)}`;
      if (!isPlaying) togglePlayback();
      drawVideoFrame();
    });

    // Volume events
    volumeSlider.addEventListener("click", (e) => {
      e.stopPropagation();
      const rect = volumeSlider.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      let pct = clickX / rect.width;
      if (pct < 0) pct = 0;
      if (pct > 1) pct = 1;
      volumeProgress.style.width = `${pct * 100}%`;
    });

    backBtn.addEventListener("click", () => {
      clearInterval(videoInterval);
      renderYoutubeList();
    });

    // Initial setup
    timeDisplay.textContent = `0:00 / ${formatTime(video.duration)}`;
    drawVideoFrame();
    startPlayback();
  }

  // ==================== VOICE SEARCH LOGIC ====================
  function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      state.recognition = new SpeechRecognition();
      state.recognition.continuous = false;
      state.recognition.lang = 'en-US';
      state.recognition.interimResults = false;
      state.recognition.maxAlternatives = 1;

      state.recognition.onstart = () => {
        voiceStatusText.textContent = "Listening...";
        voiceSpeechOutput.textContent = "";
      };

      state.recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        voiceStatusText.textContent = "Could not hear, please try again";
      };

      state.recognition.onend = () => {
        state.isListening = false;
        const overlayMic = voiceOverlay.querySelector(".voice-mic-button");
        overlayMic.classList.remove("active");
      };

      state.recognition.onresult = (event) => {
        const resultText = event.results[0][0].transcript;
        voiceSpeechOutput.textContent = `"${resultText}"`;
        
        const lowerResult = resultText.toLowerCase();
        if (lowerResult.includes("record")) {
          voiceStatusText.textContent = "Executing DVR command...";
          
          let dvrAction = "start";
          if (lowerResult.includes("30 second") || lowerResult.includes("30s")) dvrAction = "30s";
          else if (lowerResult.includes("1 minute") || lowerResult.includes("one minute") || lowerResult.includes("1m")) dvrAction = "1m";
          else if (lowerResult.includes("3 minute") || lowerResult.includes("three minute") || lowerResult.includes("3m")) dvrAction = "3m";

          const targetApp = lowerResult.includes("steam") ? "steam" : "xbox";

          setTimeout(() => {
            closeVoiceSearch();
            navigateTo("results", targetApp);
            if (targetApp === "steam") {
              loadSteamWidget(dvrAction);
            } else {
              loadXboxWidget(dvrAction);
            }
          }, 1200);
          return;
        }

        voiceStatusText.textContent = "Searching...";
        setTimeout(() => {
          closeVoiceSearch();
          navigateTo("results", resultText);
        }, 1200);
      };
    }
  }

  function openVoiceSearch() {
    voiceOverlay.classList.remove("hidden");
    state.isListening = true;
    
    const overlayMic = voiceOverlay.querySelector(".voice-mic-button");
    overlayMic.classList.add("active");

    if (state.recognition) {
      state.recognition.start();
    } else {
      // Simulation fallback for unsupported browsers
      voiceStatusText.textContent = "Listening (Simulation)...";
      voiceSpeechOutput.textContent = "";
      
      const simulatedKeywords = [
        "weather today",
        "calculator online",
        "tic tac toe",
        "choogle",
        "xbox record last 30 seconds",
        "start recording gameplay",
        "steam record 1 minute",
        "steam start recording"
      ];
      const randSpeech = simulatedKeywords[Math.floor(Math.random() * simulatedKeywords.length)];
      
      setTimeout(() => {
        voiceSpeechOutput.textContent = `"${randSpeech}"`;
        voiceStatusText.textContent = "Transcribing...";
      }, 1500);

      setTimeout(() => {
        closeVoiceSearch();
        const lowerResult = randSpeech.toLowerCase();
        if (lowerResult.includes("record")) {
          let dvrAction = "start";
          if (lowerResult.includes("30 second") || lowerResult.includes("30s")) dvrAction = "30s";
          else if (lowerResult.includes("1 minute") || lowerResult.includes("one minute") || lowerResult.includes("1m")) dvrAction = "1m";
          else if (lowerResult.includes("3 minute") || lowerResult.includes("three minute") || lowerResult.includes("3m")) dvrAction = "3m";

          const targetApp = lowerResult.includes("steam") ? "steam" : "xbox";

          navigateTo("results", targetApp);
          if (targetApp === "steam") {
            loadSteamWidget(dvrAction);
          } else {
            loadXboxWidget(dvrAction);
          }
        } else {
          navigateTo("results", randSpeech);
        }
      }, 3000);
    }
  }

  function closeVoiceSearch() {
    voiceOverlay.classList.add("hidden");
    state.isListening = false;
    if (state.recognition) {
      try {
        state.recognition.stop();
      } catch(e) {}
    }
  }

  // ==================== LENS IMAGE SEARCH LOGIC ====================
  function openLensSearch() {
    lensOverlay.classList.remove("hidden");
    resetLensUpload();
  }

  function closeLensSearch() {
    lensOverlay.classList.add("hidden");
  }

  function resetLensUpload() {
    lensPreviewZone.classList.add("hidden");
    lensDropZoneContent.classList.remove("hidden");
    lensFileInput.value = "";
    lensImgPreview.src = "";
  }

  function setupLensDragAndDrop() {
    // Clicking drop zone opens input
    lensDropZone.addEventListener("click", () => {
      if (lensPreviewZone.classList.contains("hidden")) {
        lensFileInput.click();
      }
    });

    lensFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) handleLensFile(file);
    });

    // Drag-and-drop mechanics
    lensDropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      lensDropZone.classList.add("dragover");
    });

    lensDropZone.addEventListener("dragleave", () => {
      lensDropZone.classList.remove("dragover");
    });

    lensDropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      lensDropZone.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        handleLensFile(file);
      }
    });

    // Demo images clicks
    demoThumbBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const query = btn.getAttribute("data-query");
        
        // Show mock upload and immediate transition
        lensDropZoneContent.classList.add("hidden");
        lensPreviewZone.classList.remove("hidden");
        
        // Set a cute dummy color/symbol representation
        lensImgPreview.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%234285f4"/><text x="50" y="55" font-size="30" fill="white" text-anchor="middle">🔍</text></svg>`;
        
        setTimeout(() => {
          closeLensSearch();
          navigateTo("results", query);
        }, 1800);
      });
    });
  }

  // ==================== GAME CAPTURE DVR MANAGER ====================
  function setupXboxDvr(card, voiceCommand = null) {
    const recBtn = card.querySelector("#dvr-btn-rec");
    const clip30sBtn = card.querySelector("#dvr-btn-30s");
    const clip1mBtn = card.querySelector("#dvr-btn-1m");
    const clip3mBtn = card.querySelector("#dvr-btn-3m");
    const recDot = card.querySelector("#dvr-rec-dot");
    const timerVal = card.querySelector("#dvr-timer");
    const clipsList = card.querySelector("#dvr-clips-list");
    const emptyLog = card.querySelector("#dvr-empty-log");
    const voiceStatus = card.querySelector("#dvr-voice-status");

    let recInterval = null;
    let secondsElapsed = 0;
    let isRecording = false;

    // Helper to format duration timer
    function formatTime(totalSecs) {
      const hrs = String(Math.floor(totalSecs / 3600)).padStart(2, '0');
      const mins = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
      const secs = String(totalSecs % 60).padStart(2, '0');
      return `${hrs}:${mins}:${secs}`;
    }

    // Toggle Recording function
    function toggleRecording() {
      if (isRecording) {
        // Stop recording
        isRecording = false;
        clearInterval(recInterval);
        recBtn.textContent = "🔴 Start Recording";
        recBtn.classList.remove("rec-active");
        recDot.classList.remove("active");
        
        // Add final clip to list
        const duration = formatTime(secondsElapsed);
        addClipToGallery(`Gameplay_Recording_${new Date().toISOString().substring(11,19)}.mp4`, duration);
        
        secondsElapsed = 0;
        timerVal.textContent = "00:00:00";
      } else {
        // Start recording
        isRecording = true;
        recBtn.textContent = "⏹️ Stop Recording";
        recBtn.classList.add("rec-active");
        recDot.classList.add("active");
        
        recInterval = setInterval(() => {
          secondsElapsed++;
          timerVal.textContent = formatTime(secondsElapsed);
        }, 1000);
      }
    }

    // Add clip item to the scrolling DVR list
    function addClipToGallery(name, duration) {
      if (emptyLog) {
        emptyLog.classList.add("hidden");
      }
      
      const item = document.createElement("div");
      item.className = "dvr-clip-item";
      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px;">
          <span>🎬</span>
          <span>${name}</span>
          <span style="color: #999; font-size: 10px;">(${duration})</span>
        </div>
        <div class="dvr-clip-actions">
          <button class="dvr-clip-btn play-clip-btn">Play</button>
          <button class="dvr-clip-btn delete-clip-btn" style="color: #ff3344;">Delete</button>
        </div>
      `;
      
      clipsList.appendChild(item);
      clipsList.scrollTop = clipsList.scrollHeight;

      // Bind actions
      item.querySelector(".play-clip-btn").addEventListener("click", () => {
        alert(`Playing captured gameplay clip: ${name}... Rendering MP4 container.`);
      });

      item.querySelector(".delete-clip-btn").addEventListener("click", () => {
        item.remove();
        if (clipsList.children.length === 1 && clipsList.firstElementChild.id === "dvr-empty-log") {
          emptyLog.classList.remove("hidden");
        }
      });
    }

    function triggerCustomClip(durationStr, durationSecs) {
      addClipToGallery(`Game_DVR_Clip_${new Date().toISOString().substring(11,19)}.mp4`, durationStr);
      
      // Temporary flash indicators
      timerVal.style.color = "#107c10";
      timerVal.textContent = `CLIPPED ${durationStr}!`;
      setTimeout(() => {
        timerVal.style.color = "";
        timerVal.textContent = "00:00:00";
      }, 1500);
    }

    // Event bounds
    recBtn.addEventListener("click", toggleRecording);
    clip30sBtn.addEventListener("click", () => triggerCustomClip("00:00:30", 30));
    clip1mBtn.addEventListener("click", () => triggerCustomClip("00:01:00", 60));
    clip3mBtn.addEventListener("click", () => triggerCustomClip("00:03:00", 180));

    // Handle voiceCommand parameter
    if (voiceCommand) {
      voiceStatus.innerHTML = `<span style="background-color: #107c10; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;">🎙️ Voice command: "${voiceCommand}"</span>`;
      
      setTimeout(() => {
        if (voiceCommand === "start") {
          toggleRecording();
        } else if (voiceCommand === "30s") {
          triggerCustomClip("00:00:30", 30);
        } else if (voiceCommand === "1m") {
          triggerCustomClip("00:01:00", 60);
        } else if (voiceCommand === "3m") {
          triggerCustomClip("00:03:00", 180);
        }
      }, 1000);
    }
  }

  // ==================== PLUGINS MANAGER ====================
  function loadInstalledPlugins() {
    const installed = JSON.parse(localStorage.getItem("choogle-installed-plugins") || "[]");

    installed.forEach(id => {
      // 1. AdBlock Choogle
      if (id === "adblock") {
        const headerRight = document.querySelector(".header-right");
        if (headerRight && !document.getElementById("adblock-badge")) {
          const badge = document.createElement("span");
          badge.id = "adblock-badge";
          badge.innerHTML = "🛡️";
          badge.title = "AdBlock: Active";
          badge.style.cssText = "font-size: 16px; margin-right: 12px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;";
          badge.onclick = () => alert("AdBlock Choogle: 0 ads blocked on this session. Sandbox safe.");
          headerRight.insertBefore(badge, headerRight.firstChild);
        }
      }

      // 2. chAI Floating Assistant
      if (id === "chaifloat") {
        if (!document.getElementById("chaifloat-btn")) {
          const floatBtn = document.createElement("button");
          floatBtn.id = "chaifloat-btn";
          floatBtn.innerHTML = "🤖";
          floatBtn.title = "Chat with chAI";
          floatBtn.style.cssText = "position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #1B2A4A, #2d4a7a); border: 2px solid #C8A96E; color: white; font-size: 24px; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.3); z-index: 9999; display: flex; align-items: center; justify-content: center; transition: transform 0.2s;";
          floatBtn.addEventListener("mouseover", () => floatBtn.style.transform = "scale(1.1)");
          floatBtn.addEventListener("mouseout", () => floatBtn.style.transform = "scale(1)");
          
          // Floating chat window iframe wrapper
          const chatWin = document.createElement("div");
          chatWin.id = "chaifloat-win";
          chatWin.classList.add("view-hidden");
          chatWin.style.cssText = "position: fixed; bottom: 82px; right: 20px; width: 380px; height: 500px; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--dropdown-shadow); z-index: 9999; overflow: hidden; background-color: var(--bg-color); transition: opacity 0.2s;";
          chatWin.innerHTML = `<iframe src="chai.html" style="width: 100%; height: 100%; border: none;"></iframe>`;
          
          floatBtn.addEventListener("click", () => {
            if (chatWin.classList.contains("view-hidden")) {
              chatWin.classList.remove("view-hidden");
              chatWin.style.opacity = "1";
            } else {
              chatWin.classList.add("view-hidden");
            }
          });
          
          document.body.appendChild(floatBtn);
          document.body.appendChild(chatWin);
        }
      }

      // 3. System Telemetry Bar
      if (id === "telemetry") {
        const header = document.querySelector("header");
        if (header && !document.getElementById("telemetry-bar")) {
          const bar = document.createElement("div");
          bar.id = "telemetry-bar";
          bar.style.cssText = "font-size: 11px; font-family: monospace; color: var(--text-muted); display: flex; gap: 8px; margin-left: 14px; align-items: center;";
          bar.innerHTML = `<span>FPS: <span id="tel-fps" style="color: var(--g-green); font-weight: bold;">60</span></span> | <span>Ping: <span id="tel-ping" style="color: var(--g-green); font-weight: bold;">12ms</span></span> | <span>RAM: <span id="tel-ram" style="color: var(--g-green); font-weight: bold;">240MB</span></span>`;
          
          const logoWrapper = header.querySelector(".header-left");
          if (logoWrapper) {
            logoWrapper.appendChild(bar);
          }
          
          // Update telemetry loops
          setInterval(() => {
            const fpsVal = document.getElementById("tel-fps");
            const pingVal = document.getElementById("tel-ping");
            const ramVal = document.getElementById("tel-ram");
            if (fpsVal) fpsVal.textContent = Math.floor(58 + Math.random() * 5);
            if (pingVal) pingVal.textContent = `${Math.floor(8 + Math.random() * 12)}ms`;
            if (ramVal) ramVal.textContent = `${Math.floor(220 + Math.random() * 40)}MB`;
          }, 1500);
        }
      }

      // 4. Cyber Neon Cursor
      if (id === "cyber-cursor") {
        if (!document.getElementById("cyber-cursor-style")) {
          const style = document.createElement("style");
          style.id = "cyber-cursor-style";
          style.innerHTML = `
            * {
              cursor: crosshair !important;
            }
          `;
          document.head.appendChild(style);
        }
      }
    });
  }

  function handleLensFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      lensDropZoneContent.classList.add("hidden");
      lensPreviewZone.classList.remove("hidden");
      lensImgPreview.src = event.target.result;
      
      // Determine a likely query based on image filename
      let query = "cute cat pictures";
      const name = file.name.toLowerCase();
      if (name.includes("dog") || name.includes("puppy") || name.includes("pet")) {
        query = "funny dog videos";
      } else if (name.includes("grav") || name.includes("physics") || name.includes("apple")) {
        query = "how does gravity work";
      } else if (name.includes("calc") || name.includes("math")) {
        query = "calculator online";
      }
      
      // Wait for simulated visual matching scan line
      setTimeout(() => {
        closeLensSearch();
        navigateTo("results", query);
      }, 2500);
    };
    reader.readAsDataURL(file);
  }

  // Kickstart application!
  init();
});
