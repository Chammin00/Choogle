/**
 * VMware vSphere Studio Practice Lab Controller
 * Author: Antigravity AI
 */

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    theme: "light",
    isAudioOn: true,
    activeTreeNode: "host1", // "host1" | "host2" | "all"
    chartData: [35, 42, 38, 45, 50, 48, 42, 38, 35, 32, 30, 28],
    vms: [
      { id: "vm-web", name: "VM-Webserver-01", host: "esxi-01", cpu: 22, ram: "4 GB", status: "Online" },
      { id: "vm-db", name: "VM-Database-01", host: "esxi-01", cpu: 65, ram: "16 GB", status: "Online" },
      { id: "vm-k8s", name: "VM-K8s-Worker-01", host: "esxi-01", cpu: 12, ram: "8 GB", status: "Online" }
    ]
  };

  // ==================== DOM ELEMENTS ====================
  const htmlEl = document.documentElement;
  const sfxToggleBtn = document.getElementById("sfx-toggle-btn");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const vmSelect = document.getElementById("vm-select");
  const hostDestination = document.getElementById("host-destination");
  const vmotionBtn = document.getElementById("vmotion-btn");
  const logFeed = document.getElementById("vmotion-log-feed");
  const vmInventoryList = document.getElementById("vm-inventory-list");
  
  const treeHost1 = document.getElementById("tree-host1");
  const treeHost2 = document.getElementById("tree-host2");
  const chartCanvas = document.getElementById("vm-utilization-chart");

  const choogleSearchInput = document.getElementById("choogle-search-input");
  const choogleSearchBtn = document.getElementById("choogle-search-btn");

  // ==================== AUDIO SYNTH SYSTEM ====================
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
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        gainNode.gain.setValueAtTime(0.015, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === "click") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gainNode.gain.setValueAtTime(0.06, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "vmotion") {
        // vMotion continuous sweep hum
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(330, now + 1.5);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        osc.start(now);
        osc.stop(now + 1.5);
      }
    } catch (e) {
      console.warn("Audio failure", e);
    }
  }

  // ==================== INITIALIZATION ====================
  function init() {
    initTheme();
    renderInventory();
    renderChart();
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
    renderChart();
    playSynthSound("click");
  }

  // ==================== RENDER VM INVENTORY TABLE ====================
  function renderInventory() {
    vmInventoryList.innerHTML = "";
    
    const filtered = state.vms.filter(vm => {
      if (state.activeTreeNode === "host1" && vm.host !== "esxi-01") return false;
      if (state.activeTreeNode === "host2" && vm.host !== "esxi-02") return false;
      return true;
    });

    if (filtered.length > 0) {
      filtered.forEach(vm => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td style="padding: 8px 4px; font-weight: bold; color: #005691;">🖥️ ${vm.name}</td>
          <td style="padding: 8px 4px;">${vm.host.toUpperCase()}</td>
          <td style="padding: 8px 4px;">${vm.cpu}%</td>
          <td style="padding: 8px 4px;">${vm.ram}</td>
          <td style="padding: 8px 4px; color: var(--color-green); font-weight: bold;">[${vm.status.toUpperCase()}]</td>
        `;
        vmInventoryList.appendChild(row);
      });
    } else {
      vmInventoryList.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 20px 0; color: var(--text-muted);">
            // NO ACTIVE VIRTUAL MACHINES RUNNING ON THIS ESXI HOST //
          </td>
        </tr>
      `;
    }
  }

  // ==================== VMOTION MIGRATOR SIMULATOR ====================
  function executeVMotion() {
    const vmId = vmSelect.value;
    const destHost = hostDestination.value;
    
    const vm = state.vms.find(v => v.id === vmId);
    if (!vm) return;

    const currentHost = vm.host;
    const destHostName = destHost === "esxi-01" ? "esxi-01" : "esxi-02";

    if (currentHost === destHostName) {
      logFeed.innerHTML = `<span style="color: var(--color-red); font-weight: bold;">[ERROR] Target VM is already running on destination host.</span>`;
      playSynthSound("click");
      return;
    }

    vmotionBtn.disabled = true;
    vmotionBtn.textContent = "MIGRATING VM...";
    playSynthSound("vmotion");

    logFeed.innerHTML = `[vMotion] Validating destination host '${destHostName.toUpperCase()}' resources...`;
    
    setTimeout(() => {
      logFeed.innerHTML += `<br>[vMotion] Resources validated. Memory pre-copy sweeps initiating...`;
    }, 400);

    setTimeout(() => {
      logFeed.innerHTML += `<br>[vMotion] Transferring active RAM checkpoints (Dirty Page Tracking)...`;
    }, 850);

    setTimeout(() => {
      logFeed.innerHTML += `<br>[vMotion] Establishing trunk mappings on vSwitch0 network ports...`;
    }, 1300);

    setTimeout(() => {
      // Complete state migration
      vm.host = destHostName;
      renderInventory();
      
      logFeed.innerHTML += `<br><span style="color: var(--color-green); font-weight: bold;">[vMotion] VMOTION COMPLETED. VM now active on ${destHostName.toUpperCase()}!</span>`;
      vmotionBtn.disabled = false;
      vmotionBtn.textContent = "INITIATE VMOTION MIGRATION";
      playSynthSound("success");
      
      // Update chart load
      state.chartData.shift();
      state.chartData.push(35 + Math.floor(Math.random() * 20));
      renderChart();
    }, 1800);
  }

  // ==================== DYNAMIC PERFORMANCE GRAPH ====================
  function renderChart() {
    const ctx = chartCanvas.getContext("2d");
    const width = chartCanvas.width;
    const height = chartCanvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const isDark = htmlEl.getAttribute("data-theme") === "dark";
    ctx.strokeStyle = isDark ? "rgba(59, 158, 255, 0.06)" : "rgba(0, 86, 145, 0.06)";
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
    
    const maxVal = 100;
    
    const getX = (idx) => paddingLeft + (idx * chartWidth) / (dataPoints.length - 1);
    const getY = (val) => height - paddingBottom - (val * chartHeight) / maxVal;
    
    const gradientFill = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
    gradientFill.addColorStop(0, isDark ? "rgba(59, 158, 255, 0.15)" : "rgba(0, 86, 145, 0.15)");
    gradientFill.addColorStop(1, "rgba(0, 86, 145, 0)");
    
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
    ctx.strokeStyle = isDark ? "var(--text-primary)" : "#005691";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = isDark ? "var(--text-primary)" : "#005691";
    dataPoints.forEach((val, idx) => {
      ctx.beginPath();
      ctx.arc(getX(idx), getY(val), 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "var(--text-muted)";
    ctx.font = "8px 'Share Tech Mono'";
    for (let val = 0; val <= maxVal; val += 20) {
      ctx.fillText(`${val}%`, 10, getY(val) + 3);
    }
  }

  // ==================== EVENT BINDINGS ====================
  function setupEventListeners() {
    themeToggleBtn.addEventListener("click", toggleTheme);

    sfxToggleBtn.addEventListener("click", () => {
      state.isAudioOn = !state.isAudioOn;
      sfxToggleBtn.textContent = state.isAudioOn ? "🔊" : "🔇";
      playSynthSound("click");
    });

    treeHost1.addEventListener("click", () => {
      playSynthSound("hover");
      treeHost1.classList.add("active");
      treeHost2.classList.remove("active");
      state.activeTreeNode = "host1";
      renderInventory();
    });

    treeHost2.addEventListener("click", () => {
      playSynthSound("hover");
      treeHost2.classList.add("active");
      treeHost1.classList.remove("active");
      state.activeTreeNode = "host2";
      renderInventory();
    });

    vmotionBtn.addEventListener("click", () => {
      playSynthSound("click");
      executeVMotion();
    });

    choogleSearchBtn.addEventListener("click", () => {
      const q = choogleSearchInput.value.trim();
      if (q) {
        window.location.href = `index.html?q=${encodeURIComponent(q)}`;
      }
    });
    choogleSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const q = choogleSearchInput.value.trim();
        if (q) window.location.href = `index.html?q=${encodeURIComponent(q)}`;
      }
    });
  }

  // Kickstart system
  init();
});
