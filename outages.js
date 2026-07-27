/**
 * OutagePulse - Tactical Operations Controller
 * Author: Antigravity AI
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==================== STATE MANAGEMENT ====================
  const state = {
    theme: "light",
    isAudioOn: true,
    mapLevel: "world",        // "world" (1), "us" (2), "city" (3)
    mapMode: "flat",          // "flat" | "globe"
    activeScope: "world",     // "world", "region", "us", "city"
    activeCategory: "all",    // "all", "gaming", "telecom", "web", "power"
    activeHistoryDays: 1,     // 1, 3, 7, 30, 90, 180, 365
    searchQuery: "",
    selectedState: "ALL",     // CA, TX, NY, FL, IL, WA
    selectedRegion: null,     // na, sa, eu, as, af, au
    isSimulating: true,
    chartData: [1, 2, 4, 3, 2, 3, 4, 5, 3, 4, 3, 2],
    incidents: [
      {
        id: "inc-1",
        service: "AWS US-East-1",
        category: "web",
        scope: "region",
        location: "New York City, NY",
        stateCode: "NY",
        regionCode: "na",
        severity: "high",
        time: "1h 12m ago",
        timestamp: Date.now() - 72 * 60000,
        desc: "Elevated EC2 error rates and DNS lookup timeouts in NYC edge network routers."
      },
      {
        id: "inc-2",
        service: "PlayStation Network",
        category: "gaming",
        scope: "world",
        location: "Los Angeles, CA",
        stateCode: "CA",
        regionCode: "na",
        severity: "medium",
        time: "45m ago",
        timestamp: Date.now() - 45 * 60000,
        desc: "Matchmaking lobbies disconnected; players experiencing DNS 80710102 timeouts."
      },
      {
        id: "inc-3",
        service: "AT&T Fiber",
        category: "telecom",
        scope: "city",
        location: "Houston, TX",
        stateCode: "TX",
        regionCode: "na",
        severity: "medium",
        time: "18m ago",
        timestamp: Date.now() - 18 * 60000,
        desc: "Fiber backbone severed near central trunk route causing high voice latency."
      }
    ],
    historyLogs: [
      { service: "Steam", category: "gaming", location: "Global", severity: "low", downtime: "22m", timestamp: Date.now() - 2 * 24 * 60 * 60000, date: "2 days ago" },
      { service: "GitHub", category: "web", location: "Global", severity: "medium", downtime: "15m", timestamp: Date.now() - 2 * 24 * 60 * 60000, date: "2 days ago" },
      { service: "Verizon", category: "telecom", location: "Miami, FL", severity: "high", downtime: "2h 10m", timestamp: Date.now() - 5 * 24 * 60 * 60000, date: "5 days ago" },
      { service: "ERCOT", category: "power", location: "Houston, TX", severity: "high", downtime: "5h 12m", timestamp: Date.now() - 5 * 24 * 60 * 60000, date: "5 days ago" },
      { service: "Comcast", category: "telecom", location: "New York, NY", severity: "medium", downtime: "3h 15m", timestamp: Date.now() - 12 * 24 * 60 * 60000, date: "12 days ago" },
      { service: "AWS", category: "web", location: "Virginia, US", severity: "high", downtime: "1h 45m", timestamp: Date.now() - 25 * 24 * 60 * 60000, date: "25 days ago" },
      { service: "Steam", category: "gaming", location: "Global", severity: "low", downtime: "10m", timestamp: Date.now() - 25 * 24 * 60 * 60000, date: "25 days ago" },
      { service: "Cloudflare", category: "web", location: "London, Europe", severity: "medium", downtime: "35m", timestamp: Date.now() - 45 * 24 * 60 * 60000, date: "45 days ago" },
      { service: "Discord", category: "web", location: "Global", severity: "medium", downtime: "25m", timestamp: Date.now() - 60 * 24 * 60 * 60000, date: "60 days ago" },
      { service: "Xbox Live", category: "gaming", location: "Chicago, IL", severity: "high", downtime: "1h 12m", timestamp: Date.now() - 95 * 24 * 60 * 60000, date: "95 days ago" },
      { service: "PG&E", category: "power", location: "California, US", severity: "medium", downtime: "12h 0m", timestamp: Date.now() - 95 * 24 * 60 * 60000, date: "95 days ago" },
      { service: "T-Mobile", category: "telecom", location: "Los Angeles, CA", severity: "medium", downtime: "1h 30m", timestamp: Date.now() - 150 * 24 * 60 * 60000, date: "150 days ago" },
      { service: "ERCOT", category: "power", location: "Dallas, TX", severity: "high", downtime: "8h 15m", timestamp: Date.now() - 280 * 24 * 60 * 60000, date: "280 days ago" },
      { service: "AWS", category: "web", location: "Global", severity: "high", downtime: "3h 0m", timestamp: Date.now() - 280 * 24 * 60 * 60000, date: "280 days ago" },
      { service: "PlayStation Network", category: "gaming", location: "Global", severity: "high", downtime: "3h 45m", timestamp: Date.now() - 340 * 24 * 60 * 60000, date: "340 days ago" }
    ]
  };

  // Predefined service database
  const servicePatterns = {
    "aws": { mtbf: "64 days", mttr: "1h 45m", frequency: "Low (5-6/yr)", uptime: "99.98%", commonCause: "API congestion" },
    "playstation network": { mtbf: "18 days", mttr: "55m", frequency: "Moderate", uptime: "99.85%", commonCause: "DNS timeout" },
    "at&t fiber": { mtbf: "92 days", mttr: "4h 30m", frequency: "Low", uptime: "99.92%", commonCause: "Cable trunk damages" },
    "steam": { mtbf: "7 days", mttr: "22m", frequency: "High (weekly updates)", uptime: "99.90%", commonCause: "Tuesday patch release" },
    "cloudflare": { mtbf: "45 days", mttr: "35m", frequency: "Moderate", uptime: "99.99%", commonCause: "BGP route leaks" },
    "xbox live": { mtbf: "22 days", mttr: "40m", frequency: "Moderate", uptime: "99.88%", commonCause: "Auth queue overflows" },
    "comcast": { mtbf: "38 days", mttr: "3h 15m", frequency: "Moderate", uptime: "99.82%", commonCause: "Overheating grid components" },
    "github": { mtbf: "12 days", mttr: "18m", frequency: "High", uptime: "99.91%", commonCause: "Webhook queue backlog" },
    "verizon": { mtbf: "52 days", mttr: "2h 10m", frequency: "Low", uptime: "99.94%", commonCause: "Cell tower upgrades" },
    "ercot": { mtbf: "180 days", mttr: "6h 45m", frequency: "Very Low", uptime: "99.65%", commonCause: "High temperature loads" }
  };

  // Predefined city coordinates mapped by US states
  const cityData = {
    "CA": [
      { name: "Los Angeles", cx: 200, cy: 380 },
      { name: "San Francisco", cx: 100, cy: 220 },
      { name: "San Jose", cx: 130, cy: 260 },
      { name: "San Diego", cx: 250, cy: 430 }
    ],
    "TX": [
      { name: "Houston", cx: 620, cy: 380 },
      { name: "Dallas", cx: 550, cy: 240 },
      { name: "Austin", cx: 500, cy: 340 },
      { name: "San Antonio", cx: 440, cy: 380 }
    ],
    "NY": [
      { name: "New York City", cx: 800, cy: 260 },
      { name: "Buffalo", cx: 450, cy: 160 },
      { name: "Rochester", cx: 540, cy: 150 },
      { name: "Albany", cx: 760, cy: 190 }
    ],
    "FL": [
      { name: "Miami", cx: 800, cy: 440 },
      { name: "Orlando", cx: 740, cy: 340 },
      { name: "Tampa", cx: 680, cy: 360 },
      { name: "Jacksonville", cx: 720, cy: 220 }
    ],
    "IL": [
      { name: "Chicago", cx: 580, cy: 140 },
      { name: "Springfield", cx: 500, cy: 260 },
      { name: "Peoria", cx: 480, cy: 200 },
      { name: "Rockford", cx: 520, cy: 100 }
    ],
    "WA": [
      { name: "Seattle", cx: 300, cy: 140 },
      { name: "Spokane", cx: 700, cy: 180 },
      { name: "Tacoma", cx: 280, cy: 200 },
      { name: "Olympia", cx: 220, cy: 240 }
    ]
  };

  // ==================== DOM ELEMENTS ====================
  const htmlEl = document.documentElement;
  const scopeBtns = document.querySelectorAll("#scope-filters .tab-btn");
  const catBtns = document.querySelectorAll("#category-filters .tag-btn");
  const stateSelectGroup = document.getElementById("state-select-group");
  const stateSelect = document.getElementById("state-select");
  const serviceSearch = document.getElementById("service-search");
  const clearSearchBtn = document.getElementById("clear-search-btn");
  
  const choogleSearchInput = document.getElementById("choogle-search-input");
  const choogleSearchBtn = document.getElementById("choogle-search-btn");
  
  const countActiveEl = document.getElementById("count-active");
  const countMajorEl = document.getElementById("count-major");
  const trendStatusEl = document.getElementById("trend-status");
  const mapStatusSummary = document.getElementById("map-status-summary");
  
  // Maps & Breadcrumbs
  const mapBreadcrumbs = document.getElementById("map-breadcrumbs");
  const crumbWorld = document.getElementById("crumb-world");
  const crumbUs = document.getElementById("crumb-us");
  const crumbCity = document.getElementById("crumb-city");
  const sepUs = document.getElementById("sep-us");
  const sepCity = document.getElementById("sep-city");

  const worldMapView = document.getElementById("world-map-view");
  const usMapView = document.getElementById("us-map-view");
  const cityMapView = document.getElementById("city-map-view");
  
  const worldMapNode = document.getElementById("world-map");
  const usMapNode = document.getElementById("us-map");
  const cityNodesGroup = document.getElementById("city-nodes-group");

  const continentPaths = document.querySelectorAll(".continent-path");
  const markerNodes = document.querySelectorAll(".world-svg .map-marker-group");

  const feedListEl = document.getElementById("incidents-feed-list");
  
  const simulationToggle = document.getElementById("simulation-toggle");
  const clearAllSimBtn = document.getElementById("clear-all-sim-btn");
  const reportOutageBtn = document.getElementById("report-outage-btn");
  const subscribeAlertsBtn = document.getElementById("subscribe-alerts-btn");
  
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const sfxToggleBtn = document.getElementById("sfx-toggle-btn");
  
  // Modals
  const reportModal = document.getElementById("report-modal");
  const closeReportBtn = document.getElementById("close-report-btn");
  const cancelReportBtn = document.getElementById("cancel-report-btn");
  const reportOutageForm = document.getElementById("report-outage-form");
  
  const subscribeModal = document.getElementById("subscribe-modal");
  const closeSubBtn = document.getElementById("close-sub-btn");
  const cancelSubBtn = document.getElementById("cancel-sub-btn");
  const subscribeForm = document.getElementById("subscribe-form");

  const lineChartCanvas = document.getElementById("outage-line-chart");
  const mapModeToggleBtn = document.getElementById("map-mode-toggle-btn");
  const globeMapView = document.getElementById("globe-map-view");
  const globeCanvas = document.getElementById("globe-canvas");
  const historyLogsFeed = document.getElementById("history-logs-feed");
  const historyTimeFilters = document.getElementById("history-time-filters");
  
  // Tooltip selectors
  const mapViewportContainer = document.getElementById("map-viewport-container");
  const mapTooltip = document.getElementById("map-tooltip");
  const tooltipTitle = document.getElementById("tooltip-title");
  const tooltipLoc = document.getElementById("tooltip-loc");
  const tooltipStatus = document.getElementById("tooltip-status");
  const tooltipDesc = document.getElementById("tooltip-desc");

  // ==================== WEB AUDIO SYSTEM ====================
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
      
      if (type === "hover") {
        // Soft synth blip
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);
        gainNode.gain.setValueAtTime(0.04, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "click") {
        // High tech sweep up
        osc.type = "triangle";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "alert") {
        // Double warning chime
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        gainNode.gain.setValueAtTime(0.06, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      console.warn("Audio Context failure", e);
    }
  }

  // ==================== INITIALIZATION ====================
  function init() {
    initTheme();
    generateGridMesh();
    
    // Prefill filter if query param exists
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      serviceSearch.value = q;
      state.searchQuery = q.toLowerCase().trim();
      clearSearchBtn.classList.remove("hidden");
    }

    renderFeed();
    renderHistory();
    updateMetrics();
    updateMapLevels();
    renderTrendChart();
    setupEventListeners();
    startSimulationLoop();
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
    renderTrendChart();
    playSynthSound("click");
  }

  // ==================== DECORATIVE GRID GENERATOR ====================
  function generateGridMesh() {
    // Inject tactical gridlines inside SVGs for high tech sci-fi look
    const grids = document.querySelectorAll(".grid-mesh-lines");
    grids.forEach(g => {
      let gridHTML = "";
      // Vertical lines
      for (let x = 50; x < 1000; x += 50) {
        gridHTML += `<line x1="${x}" y1="0" x2="${x}" y2="500" stroke="rgba(0, 242, 254, 0.02)" stroke-width="1" />`;
      }
      // Horizontal lines
      for (let y = 50; y < 500; y += 50) {
        gridHTML += `<line x1="0" y1="${y}" x2="1000" y2="${y}" stroke="rgba(0, 242, 254, 0.02)" stroke-width="1" />`;
      }
      g.innerHTML = gridHTML;
    });
  }

  // ==================== HIERARCHICAL MAP LEVELS SWITCHER ====================
  function updateMapLevels() {
    // Hide all
    worldMapView.classList.remove("active");
    usMapView.classList.remove("active");
    cityMapView.classList.remove("active");

    // Hide breadcrumb components based on level
    if (state.mapLevel === "world") {
      worldMapView.classList.add("active");
      crumbUs.classList.add("hidden");
      crumbCity.classList.add("hidden");
      sepUs.classList.add("hidden");
      sepCity.classList.add("hidden");
    } else if (state.mapLevel === "us") {
      usMapView.classList.add("active");
      crumbUs.classList.remove("hidden");
      crumbCity.classList.add("hidden");
      sepUs.classList.remove("hidden");
      sepCity.classList.add("hidden");
      crumbUs.textContent = "UNITED_STATES";
    } else if (state.mapLevel === "city") {
      cityMapView.classList.add("active");
      crumbUs.classList.remove("hidden");
      crumbCity.classList.remove("hidden");
      sepUs.classList.remove("hidden");
      sepCity.classList.remove("hidden");
      crumbUs.textContent = "UNITED_STATES";
      crumbCity.textContent = `${state.selectedState}_NODES`;
      renderCityNodes();
    }

    updateMapVisuals();
  }

  function drillDownToUS() {
    state.mapLevel = "us";
    state.activeScope = "us";
    scopeBtns.forEach(btn => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-scope") === "us") btn.classList.add("active");
    });
    updateMapLevels();
    renderFeed();
  }

  function drillDownToCity(stateCode) {
    state.mapLevel = "city";
    state.selectedState = stateCode;
    stateSelectGroup.classList.remove("hidden");
    stateSelect.value = stateCode;
    state.activeScope = "city";
    scopeBtns.forEach(btn => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-scope") === "city") btn.classList.add("active");
    });
    updateMapLevels();
    renderFeed();
  }

  // ==================== RENDERS CITY LAYER NODES ====================
  function renderCityNodes() {
    cityNodesGroup.innerHTML = "";
    const cities = cityData[state.selectedState] || [];
    
    cities.forEach(city => {
      const isOutage = state.incidents.some(i => i.location.toLowerCase().includes(city.name.toLowerCase()));
      const isMajor = state.incidents.some(i => i.location.toLowerCase().includes(city.name.toLowerCase()) && i.severity === "high");
      
      let statusClass = "";
      if (isMajor) statusClass = "outage";
      else if (isOutage) statusClass = "warning";

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", `map-marker-group ${statusClass}`);
      g.setAttribute("data-city", city.name);
      g.style.cursor = "pointer";

      g.innerHTML = `
        <circle cx="${city.cx}" cy="${city.cy}" r="22" class="marker-pulse-ring"></circle>
        <circle cx="${city.cx}" cy="${city.cy}" r="8" class="marker-core"></circle>
        <text x="${city.cx}" y="${city.cy - 16}" class="marker-label">${city.name.toUpperCase()}</text>
      `;

      // Hover event shows details banner
      g.addEventListener("mouseenter", (e) => {
        playSynthSound("hover");
        showNodeTooltip(e, city.name, `${city.name}, ${state.selectedState}`, false, false);
      });
      g.addEventListener("mousemove", positionTooltip);
      g.addEventListener("mouseleave", hideNodeTooltip);

      // Click city node filters feed specifically
      g.addEventListener("click", () => {
        playSynthSound("click");
        hideNodeTooltip();
        serviceSearch.value = city.name;
        state.searchQuery = city.name.toLowerCase();
        clearSearchBtn.classList.remove("hidden");
        renderFeed();
      });

      cityNodesGroup.appendChild(g);
    });
  }

  // ==================== EVENT LISTENERS ====================
  function setupEventListeners() {
    themeToggleBtn.addEventListener("click", toggleTheme);

    sfxToggleBtn.addEventListener("click", () => {
      state.isAudioOn = !state.isAudioOn;
      sfxToggleBtn.textContent = state.isAudioOn ? "🔊" : "🔇";
      playSynthSound("click");
    });

    // Scope button tab triggers
    scopeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        playSynthSound("click");
        scopeBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.activeScope = btn.getAttribute("data-scope");
        
        if (state.activeScope === "us") {
          stateSelectGroup.classList.remove("hidden");
          state.mapLevel = "us";
        } else if (state.activeScope === "city") {
          stateSelectGroup.classList.remove("hidden");
          if (state.selectedState === "ALL") state.selectedState = "CA";
          state.mapLevel = "city";
        } else {
          stateSelectGroup.classList.add("hidden");
          state.selectedState = "ALL";
          stateSelect.value = "ALL";
          state.mapLevel = "world";
        }
        
        state.selectedRegion = null;
        updateMapLevels();
        renderFeed();
      });
    });

    stateSelect.addEventListener("change", (e) => {
      playSynthSound("click");
      state.selectedState = e.target.value;
      if (state.selectedState !== "ALL") {
        drillDownToCity(state.selectedState);
      } else {
        drillDownToUS();
      }
    });

    catBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        playSynthSound("click");
        catBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.activeCategory = btn.getAttribute("data-cat");
        renderFeed();
      });
    });

    // Search bar filters
    serviceSearch.addEventListener("input", () => {
      state.searchQuery = serviceSearch.value.trim().toLowerCase();
      if (state.searchQuery) {
        clearSearchBtn.classList.remove("hidden");
      } else {
        clearSearchBtn.classList.add("hidden");
      }
      renderFeed();
    });

    clearSearchBtn.addEventListener("click", () => {
      playSynthSound("click");
      serviceSearch.value = "";
      state.searchQuery = "";
      clearSearchBtn.classList.add("hidden");
      renderFeed();
    });

    // Map Breadcrumbs click
    crumbWorld.addEventListener("click", () => {
      playSynthSound("click");
      state.mapLevel = "world";
      state.activeScope = "world";
      stateSelectGroup.classList.add("hidden");
      state.selectedState = "ALL";
      stateSelect.value = "ALL";
      state.selectedRegion = null;
      continentPaths.forEach(p => p.classList.remove("active"));
      scopeBtns.forEach(b => {
        b.classList.remove("active");
        if (b.getAttribute("data-scope") === "world") b.classList.add("active");
      });
      updateMapLevels();
      renderFeed();
    });

    crumbUs.addEventListener("click", () => {
      playSynthSound("click");
      drillDownToUS();
    });

    // Continent SVG click triggers drilldown to US
    continentPaths.forEach(path => {
      path.addEventListener("mouseenter", (e) => {
        playSynthSound("hover");
        const cId = path.getAttribute("id");
        const regCode = cId.replace("map-", "");
        const regNames = { na: "North America", sa: "South America", eu: "Europe", af: "Africa", as: "Asia", au: "Australia" };
        showNodeTooltip(e, regNames[regCode] || regCode, regCode, false, true);
      });
      path.addEventListener("mousemove", positionTooltip);
      path.addEventListener("mouseleave", hideNodeTooltip);
      
      path.addEventListener("click", () => {
        playSynthSound("click");
        const cId = path.getAttribute("id");
        if (cId === "map-na") {
          drillDownToUS();
        } else {
          let regName = cId.replace("map-", "");
          state.selectedRegion = regName;
          state.mapLevel = "world";
          state.activeScope = "region";
          scopeBtns.forEach(b => {
            b.classList.remove("active");
            if (b.getAttribute("data-scope") === "region") b.classList.add("active");
          });
          continentPaths.forEach(p => p.classList.remove("active"));
          path.classList.add("active");
          renderFeed();
        }
      });
    });

    // Marker Nodes click
    markerNodes.forEach(node => {
      node.addEventListener("mouseenter", (e) => {
        playSynthSound("hover");
        const regCode = node.getAttribute("data-region");
        const regNames = { na: "North America", sa: "South America", eu: "Europe", af: "Africa", as: "Asia", au: "Australia" };
        showNodeTooltip(e, regNames[regCode] || regCode, regCode, false, true);
      });
      node.addEventListener("mousemove", positionTooltip);
      node.addEventListener("mouseleave", hideNodeTooltip);
      node.addEventListener("click", () => {
        const region = node.getAttribute("data-region");
        const path = document.getElementById(`map-${region}`);
        if (path) path.click();
      });
    });

    // US Map state wireframe click
    const statePaths = document.querySelectorAll("#us-map .continent-path");
    statePaths.forEach(path => {
      path.addEventListener("mouseenter", (e) => {
        playSynthSound("hover");
        const stateCode = path.getAttribute("data-state");
        const stateNames = { CA: "California", TX: "Texas", NY: "New York", FL: "Florida", IL: "Illinois", WA: "Washington" };
        showNodeTooltip(e, stateNames[stateCode] || stateCode, stateCode, true, false);
      });
      path.addEventListener("mousemove", positionTooltip);
      path.addEventListener("mouseleave", hideNodeTooltip);
      path.addEventListener("click", () => {
        playSynthSound("click");
        const stateCode = path.getAttribute("data-state");
        drillDownToCity(stateCode);
      });
    });

    const stateMarkerNodes = document.querySelectorAll("#us-map .map-marker-group");
    stateMarkerNodes.forEach(node => {
      node.addEventListener("mouseenter", (e) => {
        playSynthSound("hover");
        const stateCode = node.getAttribute("data-state");
        const stateNames = { CA: "California", TX: "Texas", NY: "New York", FL: "Florida", IL: "Illinois", WA: "Washington" };
        showNodeTooltip(e, stateNames[stateCode] || stateCode, stateCode, true, false);
      });
      node.addEventListener("mousemove", positionTooltip);
      node.addEventListener("mouseleave", hideNodeTooltip);
      node.addEventListener("click", () => {
        const stateCode = node.getAttribute("data-state");
        drillDownToCity(stateCode);
      });
    });

    simulationToggle.addEventListener("change", (e) => {
      state.isSimulating = e.target.checked;
    });

    clearAllSimBtn.addEventListener("click", () => {
      playSynthSound("click");
      state.incidents.forEach(inc => {
        state.historyLogs.unshift({
          service: inc.service,
          category: inc.category,
          location: inc.location,
          severity: inc.severity,
          downtime: getDowntimeDurationString(inc.timestamp),
          timestamp: inc.timestamp,
          date: "Today"
        });
      });
      state.incidents = [];
      updateMetrics();
      updateMapVisuals();
      renderFeed();
      renderHistory();
      appendAlertTicker("All tactical router networks fully restored.");
      updateChartActivity(0);
    });

    choogleSearchBtn.addEventListener("click", executeChoogleSearch);
    choogleSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") executeChoogleSearch();
    });

    reportOutageBtn.addEventListener("click", () => {
      playSynthSound("click");
      reportModal.classList.remove("hidden");
    });
    closeReportBtn.addEventListener("click", () => reportModal.classList.add("hidden"));
    cancelReportBtn.addEventListener("click", () => reportModal.classList.add("hidden"));

    subscribeAlertsBtn.addEventListener("click", () => {
      playSynthSound("click");
      subscribeModal.classList.remove("hidden");
    });
    closeSubBtn.addEventListener("click", () => subscribeModal.classList.add("hidden"));
    cancelSubBtn.addEventListener("click", () => subscribeModal.classList.add("hidden"));

    // Modal Submissions
    reportOutageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      playSynthSound("alert");
      
      const newInc = {
        id: "inc-" + Date.now(),
        service: document.getElementById("form-service-name").value.trim(),
        category: document.getElementById("form-category").value,
        scope: document.getElementById("form-scope-select").value,
        location: document.getElementById("form-location").value.trim(),
        severity: document.getElementById("form-severity").value,
        time: "Just now",
        timestamp: Date.now(),
        desc: document.getElementById("form-desc").value.trim()
      };

      // Set state mapping codes for map highlighting
      const locLower = newInc.location.toLowerCase();
      if (locLower.includes("california") || locLower.includes("la") || locLower.includes("los angeles") || locLower.includes("san francisco")) {
        newInc.stateCode = "CA";
      } else if (locLower.includes("texas") || locLower.includes("houston") || locLower.includes("dallas")) {
        newInc.stateCode = "TX";
      } else if (locLower.includes("new york") || locLower.includes("nyc")) {
        newInc.stateCode = "NY";
      } else if (locLower.includes("florida") || locLower.includes("miami")) {
        newInc.stateCode = "FL";
      } else if (locLower.includes("illinois") || locLower.includes("chicago")) {
        newInc.stateCode = "IL";
      } else if (locLower.includes("washington") || locLower.includes("seattle")) {
        newInc.stateCode = "WA";
      }

      state.incidents.unshift(newInc);
      
      updateMetrics();
      updateMapVisuals();
      renderFeed();
      updateChartActivity(state.incidents.length);
      
      appendAlertTicker(`[${newInc.category.toUpperCase()}] Severe ${newInc.severity} anomaly reported on ${newInc.service} at ${newInc.location}.`);

      reportOutageForm.reset();
      reportModal.classList.add("hidden");
      
      alert(`Report logged in telemetry command base.`);
    });

    subscribeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      playSynthSound("click");
      const email = document.getElementById("sub-email").value;
      subscribeModal.classList.add("hidden");
      subscribeForm.reset();
      alert(`Webhook notification registered to endpoint: ${email}`);
    });

    // Map Mode Toggle
    mapModeToggleBtn.addEventListener("click", () => {
      playSynthSound("click");
      if (state.mapMode === "flat") {
        state.mapMode = "globe";
        mapModeToggleBtn.textContent = "MAP_MODE: GLOBE";
        worldMapView.classList.remove("active");
        usMapView.classList.remove("active");
        cityMapView.classList.remove("active");
        globeMapView.classList.add("active");
        startGlobeAnimation();
      } else {
        state.mapMode = "flat";
        mapModeToggleBtn.textContent = "MAP_MODE: FLAT";
        globeMapView.classList.remove("active");
        stopGlobeAnimation();
        updateMapLevels();
      }
    });

    // History Log Time Range Filters
    const histFilters = historyTimeFilters.querySelectorAll(".tag-btn");
    histFilters.forEach(btn => {
      btn.addEventListener("click", () => {
        playSynthSound("click");
        histFilters.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.activeHistoryDays = parseInt(btn.getAttribute("data-days"), 10);
        renderHistory();
      });
    });
  }

  function executeChoogleSearch() {
    const q = choogleSearchInput.value.trim();
    if (q) {
      window.location.href = `index.html?q=${encodeURIComponent(q)}`;
    }
  }

  // ==================== RENDERS CONSOLE INCIDENTS LOGS ====================
  function renderFeed() {
    feedListEl.innerHTML = "";
    
    const filtered = state.incidents.filter(inc => {
      if (state.activeCategory !== "all" && inc.category !== state.activeCategory) return false;
      
      if (state.activeScope === "us") {
        if (inc.scope !== "us" && inc.scope !== "city") return false;
        if (state.selectedState !== "ALL" && inc.stateCode !== state.selectedState) return false;
      } else if (state.activeScope === "city") {
        if (inc.scope !== "city") return false;
        if (state.selectedState !== "ALL" && inc.stateCode !== state.selectedState) return false;
      } else if (state.activeScope !== "world") {
        if (inc.scope !== state.activeScope) return false;
      }

      if (state.selectedRegion) {
        if (inc.regionCode !== state.selectedRegion && inc.location.toLowerCase().includes("global")) {
          // Keep global outages visible
        } else if (inc.regionCode !== state.selectedRegion) {
          return false;
        }
      }

      if (state.searchQuery) {
        const matchService = inc.service.toLowerCase().includes(state.searchQuery);
        const matchDesc = inc.desc.toLowerCase().includes(state.searchQuery);
        const matchLoc = inc.location.toLowerCase().includes(state.searchQuery);
        if (!matchService && !matchDesc && !matchLoc) return false;
      }

      return true;
    });

    if (filtered.length > 0) {
      filtered.forEach(inc => {
        const item = document.createElement("div");
        item.className = "feed-item";
        item.style.cursor = "pointer";
        
        let catIcon = "🎮";
        if (inc.category === "telecom") catIcon = "📞";
        if (inc.category === "web") catIcon = "🌐";
        if (inc.category === "power") catIcon = "⚡";

        const pattern = getServicePattern(inc.service);

        item.innerHTML = `
          <div class="feed-item-header">
            <div class="feed-service-info">
              <span class="feed-category-icon">${catIcon}</span>
              <span class="feed-service-name">[ ${inc.service.toUpperCase()} ]</span>
            </div>
            <div class="feed-badges">
              <span class="badge ${inc.severity}">${inc.severity.toUpperCase()}</span>
              <span class="badge scope">${inc.scope.toUpperCase()}</span>
              <span class="feed-time font-mono">${inc.time}</span>
            </div>
          </div>
          <p class="feed-item-desc">> ${inc.desc}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-muted); margin-top: 4px; flex-wrap: wrap; gap: 8px;">
            <span>NODE_LOC: <strong>${inc.location.toUpperCase()}</strong></span>
            <span>DOWNTIME: <strong style="color: var(--color-red);">${getDowntimeDurationString(inc.timestamp)}</strong></span>
          </div>
          
          <div class="pattern-details hidden" style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--border-color); font-size: 11px; display: flex; flex-direction: column; gap: 8px; color: var(--text-primary);">
            <div style="font-weight: bold; color: var(--color-blue); text-transform: uppercase; font-size: 10px;">// RELIABILITY_METRIC_TELEMETRY</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <div>HISTORICAL_UPTIME: <strong style="color: var(--color-green);">${pattern.uptime}</strong></div>
              <div>MTBF (FAIL INTERVAL): <strong>${pattern.mtbf}</strong></div>
              <div>MTTR (REPAIR TIME): <strong>${pattern.mttr}</strong></div>
              <div>INCIDENT_FREQUENCY: <strong>${pattern.frequency}</strong></div>
            </div>
            <div style="color: var(--text-muted); font-size: 11px;">ROOT_CAUSE: <em>${pattern.commonCause}</em></div>
          </div>
          <div style="text-align: center; margin-top: 8px; font-size: 10px; color: var(--text-muted); border-top: 1px solid rgba(0, 242, 254, 0.05); padding-top: 6px;" class="expand-tip">
            ▼ EXPAND RELIABILITY DATA
          </div>
        `;

        item.addEventListener("mouseenter", () => playSynthSound("hover"));

        item.addEventListener("click", (e) => {
          if (e.target.tagName === "A" || e.target.tagName === "BUTTON") return;
          playSynthSound("click");
          const details = item.querySelector(".pattern-details");
          const tip = item.querySelector(".expand-tip");
          if (details.classList.contains("hidden")) {
            details.classList.remove("hidden");
            tip.textContent = "▲ COLLAPSE RELIABILITY DATA";
          } else {
            details.classList.add("hidden");
            tip.textContent = "▼ EXPAND RELIABILITY DATA";
          }
        });

        feedListEl.appendChild(item);
      });
    } else {
      feedListEl.innerHTML = `
        <div style="text-align: center; padding: 40px 0; color: var(--text-muted); font-size: 12px;" class="font-mono">
          // SEC_OPS: NO ACTIVE ANOMALIES DETECTED IN SCOPE // ALL NODES REPORT NOMINAL
        </div>
      `;
    }
  }

  // ==================== SERVICE PATTERN SOLVER ====================
  function getServicePattern(serviceName) {
    const name = serviceName.toLowerCase();
    if (name.includes("aws") || name.includes("amazon")) return servicePatterns["aws"];
    if (name.includes("playstation") || name.includes("psn")) return servicePatterns["playstation network"];
    if (name.includes("at&t") || name.includes("att")) return servicePatterns["at&t fiber"];
    if (name.includes("pg&e") || name.includes("pge")) return servicePatterns["pg&e grid"];
    if (name.includes("steam")) return servicePatterns["steam"];
    if (name.includes("cloudflare")) return servicePatterns["cloudflare"];
    if (name.includes("xbox")) return servicePatterns["xbox live"];
    if (name.includes("comcast") || name.includes("xfinity")) return servicePatterns["comcast"];
    if (name.includes("github")) return servicePatterns["github"];
    if (name.includes("verizon")) return servicePatterns["verizon"];
    if (name.includes("ercot")) return servicePatterns["ercot"];
    
    return {
      mtbf: "30 days",
      mttr: "2h 15m",
      frequency: "Low",
      uptime: "99.90%",
      commonCause: "Temporary configuration error"
    };
  }

  function getDowntimeDurationString(timestamp) {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "00m 00s (Just started)";
    if (diffMins < 60) return `${diffMins}m elapsed`;
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m elapsed`;
  }

  // ==================== UPDATE METRICS & HEALTH DIALS ====================
  function updateMetrics() {
    const activeCount = state.incidents.length;
    const majorCount = state.incidents.filter(inc => inc.severity === "high").length;
    
    countActiveEl.textContent = activeCount;
    countMajorEl.textContent = majorCount;

    // Calculate dynamic lists of failing services
    const activeServices = state.incidents.map(inc => inc.service.toUpperCase());
    const uniqueActive = [...new Set(activeServices)];
    const activeNames = uniqueActive.join(", ") || "NO CURRENT FAILURES";
    document.getElementById("active-services-list").textContent = activeNames;

    const majorServices = state.incidents.filter(inc => inc.severity === "high").map(inc => inc.service.toUpperCase());
    const uniqueMajor = [...new Set(majorServices)];
    const majorNames = uniqueMajor.join(", ") || "NO CRITICAL ALERTS";
    document.getElementById("major-services-list").textContent = majorNames;
    
    if (activeCount === 0) {
      mapStatusSummary.textContent = "SYS_STATUS // NOMINAL";
      mapStatusSummary.className = "status-indicator-tag operational";
      trendStatusEl.textContent = "NOMINAL";
      trendStatusEl.className = "metric-trend text-green";
    } else if (majorCount > 0) {
      mapStatusSummary.textContent = `SYS_STATUS // ${majorCount} CRITICAL`;
      mapStatusSummary.className = "status-indicator-tag outage";
      trendStatusEl.textContent = "CRITICAL";
      trendStatusEl.className = "metric-trend text-red";
    } else {
      mapStatusSummary.textContent = `SYS_STATUS // ${activeCount} WARNING`;
      mapStatusSummary.className = "status-indicator-tag";
      trendStatusEl.textContent = "WARNING";
      trendStatusEl.className = "metric-trend text-yellow";
    }

    // SVG Radial Dial Health offsets (circumference of r=34 circle is 2 * PI * 34 = 213.6)
    const strokeDash = 213;
    
    const gamingCount = state.incidents.filter(i => i.category === "gaming").length;
    const telecomCount = state.incidents.filter(i => i.category === "telecom").length;
    const webCount = state.incidents.filter(i => i.category === "web").length;
    const powerCount = state.incidents.filter(i => i.category === "power").length;

    const healthVals = {
      gaming: Math.max(0, 100 - gamingCount * 4),
      telecom: Math.max(0, 100 - telecomCount * 6),
      web: Math.max(0, 100 - webCount * 8),
      power: Math.max(0, 100 - powerCount * 12)
    };

    // Update Gaming Ring & Label
    const gamingRing = document.getElementById("gauge-gaming-ring");
    const gamingLbl = document.getElementById("gauge-gaming-lbl");
    gamingRing.style.strokeDashoffset = strokeDash - (strokeDash * healthVals.gaming) / 100;
    gamingLbl.textContent = `${healthVals.gaming}%`;
    setGaugeColor(gamingRing, healthVals.gaming);

    // Update Telecom Ring
    const telecomRing = document.getElementById("gauge-telecom-ring");
    const telecomLbl = document.getElementById("gauge-telecom-lbl");
    telecomRing.style.strokeDashoffset = strokeDash - (strokeDash * healthVals.telecom) / 100;
    telecomLbl.textContent = `${healthVals.telecom}%`;
    setGaugeColor(telecomRing, healthVals.telecom);

    // Update Web Ring
    const webRing = document.getElementById("gauge-web-ring");
    const webLbl = document.getElementById("gauge-web-lbl");
    webRing.style.strokeDashoffset = strokeDash - (strokeDash * healthVals.web) / 100;
    webLbl.textContent = `${healthVals.web}%`;
    setGaugeColor(webRing, healthVals.web);

    // Update Power Ring
    const powerRing = document.getElementById("gauge-power-ring");
    const powerLbl = document.getElementById("gauge-power-lbl");
    powerRing.style.strokeDashoffset = strokeDash - (strokeDash * healthVals.power) / 100;
    powerLbl.textContent = `${healthVals.power}%`;
    setGaugeColor(powerRing, healthVals.power);
  }

  function setGaugeColor(ringEl, value) {
    if (value > 95) {
      ringEl.setAttribute("stroke", "var(--color-green)");
    } else if (value > 85) {
      ringEl.setAttribute("stroke", "var(--color-yellow)");
    } else {
      ringEl.setAttribute("stroke", "var(--color-red)");
    }
  }

  // ==================== HIGHLIGHT ACTIVE OUTAGE REGIONS ON MAP ====================
  function updateMapVisuals() {
    // Reset World nodes
    markerNodes.forEach(node => node.classList.remove("warning", "outage"));
    // Reset US State nodes
    const usNodes = document.querySelectorAll("#us-map .map-marker-group");
    usNodes.forEach(node => node.classList.remove("warning", "outage"));

    // Reset State paths
    const statePaths = document.querySelectorAll("#us-map .continent-path");
    statePaths.forEach(path => path.classList.remove("active"));

    // Highlight nodes depending on active incidents
    state.incidents.forEach(inc => {
      // 1. World level mapping
      if (inc.regionCode) {
        const wNode = document.getElementById(`node-${inc.regionCode}`);
        if (wNode) {
          if (inc.severity === "high") wNode.classList.add("outage");
          else if (!wNode.classList.contains("outage")) wNode.classList.add("warning");
        }
      }

      // 2. US State level mapping
      if (inc.stateCode) {
        const uNode = document.getElementById(`node-state-${inc.stateCode}`);
        const uPath = document.getElementById(`state-${inc.stateCode}`);
        if (uNode) {
          if (inc.severity === "high") {
            uNode.classList.add("outage");
            if (uPath) uPath.classList.add("active");
          } else if (!uNode.classList.contains("outage")) {
            uNode.classList.add("warning");
            if (uPath) uPath.classList.add("active");
          }
        }
      }
    });

    if (state.mapLevel === "city") {
      renderCityNodes();
    }
  }

  function appendAlertTicker(text) {
    const ticker = document.getElementById("ticker-alerts");
    ticker.textContent = `[UPDATE] ${text} • ${ticker.textContent}`;
  }

  // ==================== DYNAMIC CANVAS GRAPH ====================
  function renderTrendChart() {
    const ctx = lineChartCanvas.getContext("2d");
    const width = lineChartCanvas.width;
    const height = lineChartCanvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const isDark = htmlEl.getAttribute("data-theme") !== "light";
    
    ctx.strokeStyle = isDark ? "rgba(0, 242, 254, 0.05)" : "rgba(15, 23, 42, 0.06)";
    ctx.lineWidth = 1;
    
    const gridRows = 3;
    for (let i = 0; i <= gridRows; i++) {
      const y = 20 + (i * (height - 40)) / gridRows;
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(width - 15, y);
      ctx.stroke();
    }
    
    const dataPoints = state.chartData;
    const paddingLeft = 35;
    const paddingRight = 15;
    const paddingTop = 20;
    const paddingBottom = 20;
    
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    
    const maxVal = 6;
    
    const getX = (idx) => paddingLeft + (idx * chartWidth) / (dataPoints.length - 1);
    const getY = (val) => height - paddingBottom - (val * chartHeight) / maxVal;
    
    const gradientFill = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
    gradientFill.addColorStop(0, "rgba(0, 242, 254, 0.15)");
    gradientFill.addColorStop(1, "rgba(0, 242, 254, 0)");
    
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(dataPoints[0]));
    for (let i = 1; i < dataPoints.length; i++) {
      ctx.lineTo(getX(i), getY(dataPoints[i]));
    }
    ctx.lineTo(getX(dataPoints.length - 1), height - paddingBottom);
    ctx.lineTo(getX(0), height - paddingBottom);
    ctx.closePath();
    ctx.fillStyle = gradientFill;
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(dataPoints[0]));
    for (let i = 1; i < dataPoints.length; i++) {
      ctx.lineTo(getX(i), getY(dataPoints[i]));
    }
    ctx.strokeStyle = "var(--color-blue)";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = "var(--color-blue)";
    dataPoints.forEach((val, idx) => {
      ctx.beginPath();
      ctx.arc(getX(idx), getY(val), 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "var(--text-muted)";
    ctx.font = "8px 'Share Tech Mono'";
    for (let val = 0; val <= maxVal; val += 2) {
      ctx.fillText(val, 10, getY(val) + 3);
    }
  }

  function updateChartActivity(currActive) {
    state.chartData.shift();
    state.chartData.push(currActive);
    renderTrendChart();
  }

  // ==================== SIMULATED AUTOMATED EVENTS ====================
  function startSimulationLoop() {
    const simServices = [
      { name: "Steam", category: "gaming", scope: "city", location: "Seattle, WA", stateCode: "WA", regionCode: "na", desc: "Auth nodes timed out in Seattle regional server cluster." },
      { name: "Cloudflare", category: "web", scope: "city", location: "New York City, NY", stateCode: "NY", regionCode: "na", desc: "Route advertisement error detected on NYC POP router." },
      { name: "Spectrum", category: "telecom", scope: "city", location: "Dallas, TX", stateCode: "TX", regionCode: "na", desc: "Localized node power failure resulting in line drops." },
      { name: "ERCOT", category: "power", scope: "city", location: "Houston, TX", stateCode: "TX", regionCode: "na", desc: "Substation transformer overload causing voltage drops." },
      { name: "GitHub", category: "web", scope: "city", location: "San Francisco, CA", stateCode: "CA", regionCode: "na", desc: "API payload processing latency spikes on SF data nodes." },
      { name: "Verizon", category: "telecom", scope: "city", location: "Miami, FL", stateCode: "FL", regionCode: "na", desc: "Backhaul cellular route cut causing partial call drops." },
      { name: "Xbox Live", category: "gaming", scope: "city", location: "Chicago, IL", stateCode: "IL", regionCode: "na", desc: "Chicago authentication server nodes overloaded." }
    ];

    setInterval(() => {
      if (!state.isSimulating) return;

      const coinFlip = Math.random() > 0.45; // 55% trigger, 45% resolve
      
      if (coinFlip || state.incidents.length === 0) {
        // Trigger a new outage!
        const randSvc = simServices[Math.floor(Math.random() * simServices.length)];
        
        if (state.incidents.some(i => i.service === randSvc.name)) return;

        const severities = ["low", "medium", "high"];
        const randSeverity = severities[Math.floor(Math.random() * severities.length)];
        
        const newInc = {
          id: "inc-" + Date.now(),
          service: randSvc.name,
          category: randSvc.category,
          scope: randSvc.scope,
          location: randSvc.location,
          stateCode: randSvc.stateCode,
          regionCode: randSvc.regionCode,
          severity: randSeverity,
          time: "Just now",
          timestamp: Date.now(),
          desc: randSvc.desc
        };

        state.incidents.unshift(newInc);
        appendAlertTicker(`[SEC_OPS] Alert logged: ${newInc.service.toUpperCase()} inside ${newInc.location.toUpperCase()}.`);
        playSynthSound("alert");
      } else {
        // Resolve oldest
        const resolvedInc = state.incidents.pop();
        if (resolvedInc) {
          appendAlertTicker(`[RESOLVED] Anomaly resolved: ${resolvedInc.service.toUpperCase()} in ${resolvedInc.location.toUpperCase()}.`);
          state.historyLogs.unshift({
            service: resolvedInc.service,
            category: resolvedInc.category,
            location: resolvedInc.location,
            severity: resolvedInc.severity,
            downtime: getDowntimeDurationString(resolvedInc.timestamp),
            timestamp: resolvedInc.timestamp,
            date: "Today"
          });
          renderHistory();
        }
      }

      updateMetrics();
      updateMapVisuals();
      renderFeed();
      updateChartActivity(state.incidents.length);

    }, 15000);
  }

  // ==================== 3D ROTATING VECTOR GLOBE ====================
  let globeAngleY = 0;
  let globeAnimId = null;

  // Simplified geographic outlines of major landmasses for clear visual mapping
  const globeContinents = [
    // North America
    [ {lat: 60, lon: -160}, {lat: 70, lon: -120}, {lat: 72, lon: -80}, {lat: 65, lon: -60}, {lat: 50, lon: -50}, {lat: 45, lon: -60}, {lat: 25, lon: -80}, {lat: 9, lon: -80}, {lat: 16, lon: -95}, {lat: 20, lon: -105}, {lat: 32, lon: -115}, {lat: 48, lon: -125}, {lat: 58, lon: -140} ],
    // South America
    [ {lat: 12, lon: -72}, {lat: 5, lon: -50}, {lat: -6, lon: -35}, {lat: -23, lon: -43}, {lat: -40, lon: -62}, {lat: -55, lon: -68}, {lat: -50, lon: -75}, {lat: -33, lon: -72}, {lat: -18, lon: -70}, {lat: -5, lon: -81}, {lat: 5, lon: -78} ],
    // Africa
    [ {lat: 36, lon: 10}, {lat: 32, lon: 32}, {lat: 12, lon: 44}, {lat: 12, lon: 51}, {lat: -22, lon: 35}, {lat: -34, lon: 20}, {lat: -10, lon: 12}, {lat: 5, lon: 10}, {lat: 5, lon: -10}, {lat: 15, lon: -18}, {lat: 20, lon: -18}, {lat: 32, lon: -5} ],
    // Europe
    [ {lat: 70, lon: -10}, {lat: 70, lon: 20}, {lat: 60, lon: 30}, {lat: 50, lon: 15}, {lat: 44, lon: 25}, {lat: 36, lon: 22}, {lat: 36, lon: -5}, {lat: 44, lon: -10}, {lat: 48, lon: -5}, {lat: 55, lon: 5} ],
    // Asia-Siberia
    [ {lat: 75, lon: 60}, {lat: 75, lon: 100}, {lat: 70, lon: 140}, {lat: 60, lon: 170}, {lat: 55, lon: 160}, {lat: 40, lon: 140}, {lat: 35, lon: 120}, {lat: 22, lon: 115}, {lat: 10, lon: 105}, {lat: 15, lon: 95}, {lat: 10, lon: 80}, {lat: 25, lon: 65}, {lat: 30, lon: 50}, {lat: 55, lon: 45} ],
    // Australia
    [ {lat: -11, lon: 130}, {lat: -10, lon: 142}, {lat: -22, lon: 150}, {lat: -38, lon: 146}, {lat: -35, lon: 115}, {lat: -22, lon: 113} ]
  ];

  function renderGlobe() {
    if (state.mapMode !== "globe") return;
    const ctx = globeCanvas.getContext("2d");
    const width = globeCanvas.width;
    const height = globeCanvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const r = 180; // sphere radius

    // Rotation rate
    globeAngleY += 0.007;

    ctx.clearRect(0, 0, width, height);

    // Draw background tactical grid
    ctx.strokeStyle = "rgba(0, 242, 254, 0.02)";
    ctx.lineWidth = 1;
    for (let x = 100; x < width; x += 100) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 100; y < height; y += 100) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Globe outline bounds and back surface
    ctx.fillStyle = "rgba(6, 10, 18, 0.35)";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Draw Grid Lines (Latitudes & Longitudes)
    ctx.strokeStyle = "rgba(0, 242, 254, 0.06)";
    ctx.lineWidth = 0.8;
    
    // Latitudes
    for (let lat = -60; lat <= 60; lat += 20) {
      ctx.beginPath();
      let first = true;
      for (let lon = 0; lon <= 360; lon += 10) {
        const radLat = (lat * Math.PI) / 180;
        const radLon = ((lon + globeAngleY * 180 / Math.PI) * Math.PI) / 180;

        const x3d = r * Math.cos(radLat) * Math.sin(radLon);
        const y3d = r * Math.sin(radLat);
        const z3d = r * Math.cos(radLat) * Math.cos(radLon);

        if (z3d >= 0) { // Only draw visible coordinates
          const scale = 250 / (250 - z3d);
          const px = cx + x3d * scale;
          const py = cy - y3d * scale;
          if (first) { ctx.moveTo(px, py); first = false; }
          else { ctx.lineTo(px, py); }
        } else {
          first = true;
        }
      }
      ctx.stroke();
    }

    // Longitudes
    for (let lon = 0; lon < 360; lon += 30) {
      ctx.beginPath();
      let first = true;
      for (let lat = -80; lat <= 80; lat += 5) {
        const radLat = (lat * Math.PI) / 180;
        const radLon = ((lon + globeAngleY * 180 / Math.PI) * Math.PI) / 180;

        const x3d = r * Math.cos(radLat) * Math.sin(radLon);
        const y3d = r * Math.sin(radLat);
        const z3d = r * Math.cos(radLat) * Math.cos(radLon);

        if (z3d >= 0) {
          const scale = 250 / (250 - z3d);
          const px = cx + x3d * scale;
          const py = cy - y3d * scale;
          if (first) { ctx.moveTo(px, py); first = false; }
          else { ctx.lineTo(px, py); }
        } else {
          first = true;
        }
      }
      ctx.stroke();
    }

    // Draw Continent Vectors Projected on 3D Sphere
    ctx.fillStyle = "rgba(0, 242, 254, 0.06)";
    ctx.strokeStyle = "rgba(0, 242, 254, 0.25)";
    ctx.lineWidth = 1.2;

    globeContinents.forEach(polygon => {
      ctx.beginPath();
      let first = true;
      let visiblePointsCount = 0;

      polygon.forEach(pt => {
        const radLat = (pt.lat * Math.PI) / 180;
        const radLon = ((pt.lon + globeAngleY * 180 / Math.PI) * Math.PI) / 180;

        const x3d = r * Math.cos(radLat) * Math.sin(radLon);
        const y3d = r * Math.sin(radLat);
        const z3d = r * Math.cos(radLat) * Math.cos(radLon);

        if (z3d >= 0) {
          visiblePointsCount++;
          const scale = 250 / (250 - z3d);
          const px = cx + x3d * scale;
          const py = cy - y3d * scale;
          if (first) { ctx.moveTo(px, py); first = false; }
          else { ctx.lineTo(px, py); }
        } else {
          first = true;
        }
      });

      // Draw outline if at least some points are visible on the front facing side
      if (visiblePointsCount > 1) {
        ctx.stroke();
        ctx.fill();
      }
    });

    // Outer Tactical Glow Boundary Ring
    ctx.strokeStyle = "rgba(0, 242, 254, 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 1, 0, Math.PI * 2);
    ctx.stroke();

    // Map geographic coordinates of active threat centers
    const coords = {
      "na": { lat: 38, lon: -97, name: "NORTH AMERICA" },
      "sa": { lat: -15, lon: -58, name: "SOUTH AMERICA" },
      "eu": { lat: 48, lon: 16, name: "EUROPE" },
      "af": { lat: 2, lon: 20, name: "AFRICA" },
      "as": { lat: 34, lon: 100, name: "ASIA" },
      "au": { lat: -25, lon: 133, name: "AUSTRALIA" }
    };

    // Draw active incident indicators rotating on sphere
    state.incidents.forEach(inc => {
      let region = inc.regionCode;
      if (!region && inc.stateCode) region = "na";
      if (!region) region = "na";

      const c = coords[region];
      if (c) {
        const radLat = (c.lat * Math.PI) / 180;
        const radLon = ((c.lon + globeAngleY * 180 / Math.PI) * Math.PI) / 180;

        const x3d = r * Math.cos(radLat) * Math.sin(radLon);
        const y3d = r * Math.sin(radLat);
        const z3d = r * Math.cos(radLat) * Math.cos(radLon);

        if (z3d >= 0) { // Facing the front camera
          const scale = 250 / (250 - z3d);
          const px = cx + x3d * scale;
          const py = cy - y3d * scale;

          const isHigh = inc.severity === "high";
          const color = isHigh ? "var(--color-red)" : "var(--color-yellow)";
          
          // Glowing Core
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fill();

          // Pulse waves
          const pulseR = 6 + ((Date.now() % 1200) / 1200) * 16;
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(px, py, pulseR, 0, Math.PI * 2);
          ctx.stroke();

          // Text label tag
          ctx.fillStyle = "var(--text-primary)";
          ctx.font = "bold 9px 'Share Tech Mono'";
          ctx.shadowBlur = 4;
          ctx.shadowColor = color;
          ctx.fillText(`[ ${inc.service.toUpperCase()} ]`, px + 12, py + 3);
          ctx.shadowBlur = 0; // reset
        }
      }
    });

    if (state.mapMode === "globe") {
      globeAnimId = requestAnimationFrame(renderGlobe);
    }
  }

  function startGlobeAnimation() {
    if (globeAnimId) cancelAnimationFrame(globeAnimId);
    globeAnimId = requestAnimationFrame(renderGlobe);
  }

  function stopGlobeAnimation() {
    if (globeAnimId) {
      cancelAnimationFrame(globeAnimId);
      globeAnimId = null;
    }
  }

  // ==================== RENDERS HISTORICAL LOGS ARCHIVE ====================
  function renderHistory() {
    if (!historyLogsFeed) return;
    historyLogsFeed.innerHTML = "";

    const now = Date.now();
    const cutoffTime = now - state.activeHistoryDays * 24 * 60 * 60 * 1000;

    const filtered = state.historyLogs.filter(log => log.timestamp >= cutoffTime);

    // Update stats counters
    document.getElementById("hist-stat-count").textContent = filtered.length;

    let totalMins = 0;
    filtered.forEach(log => {
      let mins = 0;
      if (log.downtime.includes("h")) {
        const parts = log.downtime.split("h");
        mins += parseInt(parts[0], 10) * 60;
        if (parts[1] && parts[1].includes("m")) {
          mins += parseInt(parts[1].replace("m", ""), 10);
        }
      } else {
        mins += parseInt(log.downtime.replace("m", ""), 10) || 15;
      }
      totalMins += mins;
    });

    const avgMins = filtered.length > 0 ? Math.round(totalMins / filtered.length) : 0;
    const avgStr = avgMins >= 60 ? `${Math.floor(avgMins / 60)}h ${avgMins % 60}m` : `${avgMins}m`;
    document.getElementById("hist-stat-mttr").textContent = avgStr;

    // Reliability computation
    const reliabilityVal = Math.max(99.0, 100 - (filtered.length * 0.008)).toFixed(3);
    const reliabilityEl = document.getElementById("hist-stat-reliability");
    if (reliabilityEl) {
      reliabilityEl.textContent = `${reliabilityVal}%`;
      if (reliabilityVal < 99.8) {
        reliabilityEl.style.color = "var(--color-yellow)";
      } else {
        reliabilityEl.style.color = "var(--color-green)";
      }
    }

    // Most unstable node solver
    const nodeCounts = {};
    filtered.forEach(log => {
      nodeCounts[log.service] = (nodeCounts[log.service] || 0) + 1;
    });
    let mostUnstable = "NOMINAL";
    let maxCount = 0;
    for (const svc in nodeCounts) {
      if (nodeCounts[svc] > maxCount) {
        maxCount = nodeCounts[svc];
        mostUnstable = svc.toUpperCase();
      }
    }
    const unstableEl = document.getElementById("hist-stat-unstable");
    if (unstableEl) {
      unstableEl.textContent = mostUnstable;
      if (mostUnstable === "NOMINAL") {
        unstableEl.style.color = "var(--color-green)";
      } else {
        unstableEl.style.color = "var(--color-red)";
      }
    }

    // Render list
    if (filtered.length > 0) {
      filtered.forEach(log => {
        const item = document.createElement("div");
        item.style.padding = "10px 14px";
        item.style.borderBottom = "1px solid rgba(0, 242, 254, 0.04)";
        item.style.display = "flex";
        item.style.justifyContent = "space-between";
        item.style.alignItems = "center";
        item.style.flexWrap = "wrap";
        item.style.gap = "8px";

        let severityColor = "var(--color-green)";
        if (log.severity === "medium") severityColor = "var(--color-yellow)";
        if (log.severity === "high") severityColor = "var(--color-red)";

        item.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="color: var(--text-muted);">[LOG // ${log.date.toUpperCase()}]</span>
            <span style="font-weight: bold; color: var(--color-blue);">${log.service.toUpperCase()}</span>
            <span style="color: var(--text-muted); font-size: 11px;">LOC: ${log.location.toUpperCase()}</span>
            <span style="font-size: 11px;">(DOWNTIME: <span style="color: ${severityColor};">${log.downtime}</span>)</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <span style="font-size: 9px; padding: 1px 6px; background-color: rgba(0, 255, 102, 0.1); border: 1px solid var(--color-green); color: var(--color-green); border-radius: 2px; font-weight: bold; text-transform: uppercase;">RESOLVED</span>
          </div>
        `;
        historyLogsFeed.appendChild(item);
      });
    } else {
      historyLogsFeed.innerHTML = `
        <div style="text-align: center; padding: 30px 0; color: var(--text-muted);" class="font-mono">
          // ARCHIVE_OPS: NO ARCHIVED TELEMETRY RECORDED FOR THIS TIME_INTERVAL //
        </div>
      `;
    }
  }

  // ==================== DYNAMIC TOOLTIP Readout ====================
  function showNodeTooltip(e, name, locationCode, isState = false, isRegion = false) {
    let displayName = name.toUpperCase();
    let displayLoc = locationCode.toUpperCase();
    let statusText = "STATUS: NOMINAL";
    let statusColor = "var(--color-green)";
    let descText = "No active anomalies detected. Telemetry connection secure.";

    // Find any matching incident
    let match = null;
    if (isRegion) {
      match = state.incidents.find(i => i.regionCode === locationCode);
    } else if (isState) {
      match = state.incidents.find(i => i.stateCode === locationCode);
    } else {
      // City name comparison
      match = state.incidents.find(i => i.location.toLowerCase().includes(name.toLowerCase()));
    }

    if (match) {
      statusText = `STATUS: ${match.severity.toUpperCase()}_ANOMALY`;
      statusColor = match.severity === "high" ? "var(--color-red)" : "var(--color-yellow)";
      descText = `Alert on [${match.service.toUpperCase()}]. ${match.desc}`;
    }

    tooltipTitle.textContent = `// NODE_${displayName}_READOUT`;
    tooltipLoc.textContent = `LOC: ${displayLoc}`;
    tooltipStatus.textContent = statusText;
    tooltipStatus.style.color = statusColor;
    tooltipDesc.textContent = descText;

    mapTooltip.classList.remove("hidden");
    positionTooltip(e);
  }

  function positionTooltip(e) {
    const rect = mapViewportContainer.getBoundingClientRect();
    const x = e.clientX - rect.left + 15;
    const y = e.clientY - rect.top + 15;

    // Prevent floating outside map container boundaries
    const tooltipRect = mapTooltip.getBoundingClientRect();
    let leftPos = x;
    let topPos = y;

    if (x + tooltipRect.width > rect.width) {
      leftPos = x - tooltipRect.width - 25;
    }
    if (y + tooltipRect.height > rect.height) {
      topPos = y - tooltipRect.height - 25;
    }

    mapTooltip.style.left = `${Math.max(10, leftPos)}px`;
    mapTooltip.style.top = `${Math.max(10, topPos)}px`;
  }

  function hideNodeTooltip() {
    mapTooltip.classList.add("hidden");
  }

  // Kickstart system!
  init();
});
