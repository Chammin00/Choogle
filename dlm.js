/**
 * Data Lifecycle Management (DLM) Practice Lab Controller - Detailed Enterprise Edition
 * Author: Antigravity AI
 */

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    theme: "light",
    isAudioOn: true,
    activeTable: "users", // "users" | "payments" | "marketing"
    keyRotations: 4,
    hotMonths: 12,
    coldYears: 7,
    shredOnExpire: true,
    schemas: {
      users: [
        { field: "user_id", classification: "PUBLIC" },
        { field: "social_security_number", classification: "PHI" },
        { field: "home_address", classification: "CONFIDENTIAL" },
        { field: "medical_records_log", classification: "PHI" }
      ],
      payments: [
        { field: "transaction_id", classification: "PUBLIC" },
        { field: "credit_card_number", classification: "PCI" },
        { field: "billing_zip_code", classification: "CONFIDENTIAL" },
        { field: "payment_total", classification: "CONFIDENTIAL" }
      ],
      marketing: [
        { field: "campaign_id", classification: "PUBLIC" },
        { field: "ad_clicks_count", classification: "PUBLIC" },
        { field: "budget_allocation", classification: "CONFIDENTIAL" },
        { field: "target_demographics", classification: "PUBLIC" }
      ]
    }
  };

  // ==================== DOM ELEMENTS ====================
  const htmlEl = document.documentElement;
  const sfxToggleBtn = document.getElementById("sfx-toggle-btn");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");

  const scanBtn = document.getElementById("scan-btn");
  const scanProgressBox = document.getElementById("scan-progress-box");
  const scanPct = document.getElementById("scan-pct");
  const scanBar = document.getElementById("scan-bar");
  
  const fieldsTitle = document.getElementById("fields-title");
  const fieldsTable = document.getElementById("fields-table");
  
  const activeKeyId = document.getElementById("active-key-id");
  const lastRotatedDate = document.getElementById("last-rotated-date");
  const vaultLogs = document.getElementById("vault-logs");
  const rotateKeyBtn = document.getElementById("rotate-key-btn");
  const shredBtn = document.getElementById("shred-btn");

  const rangeHot = document.getElementById("range-hot");
  const rangeCold = document.getElementById("range-cold");
  const labelRangeHot = document.getElementById("label-range-hot");
  const labelRangeCold = document.getElementById("label-range-cold");
  const shredOnExpireCheckbox = document.getElementById("shred-on-expire");
  const dlmScheduleLog = document.getElementById("dlm-schedule-log");
  const applyPolicyBtn = document.getElementById("apply-policy-btn");

  const footprintPhi = document.getElementById("footprint-phi");
  const footprintPci = document.getElementById("footprint-pci");
  const footprintPublic = document.getElementById("footprint-public");

  const schemaItems = document.querySelectorAll(".schema-item");
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
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        gainNode.gain.setValueAtTime(0.015, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
        gainNode.gain.setValueAtTime(0.04, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(784, now + 0.1);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === "shred") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.5);
        gainNode.gain.setValueAtTime(0.07, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === "tick") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(900, now);
        gainNode.gain.setValueAtTime(0.008, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        osc.start(now);
        osc.stop(now + 0.02);
      }
    } catch (e) {
      console.warn("Audio failure", e);
    }
  }

  // ==================== INITIALIZATION ====================
  function init() {
    initTheme();
    renderFieldsTable();
    updateFootprintChart();
    updateScheduleLog();
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

  // ==================== RENDER FIELDS CONFIG TABLE ====================
  function renderFieldsTable() {
    fieldsTitle.textContent = `// FIELDS_IN_${state.activeTable.toUpperCase()}`;
    fieldsTable.innerHTML = `
      <thead>
        <tr style="text-align: left; color: var(--text-muted);">
          <th style="padding: 6px;">FIELD NAME</th>
          <th style="padding: 6px; width: 130px;">CLASSIFICATION</th>
        </tr>
      </thead>
      <tbody>
    `;

    const fields = state.schemas[state.activeTable];
    fields.forEach((f, idx) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td style="padding: 6px; font-weight: bold;">${f.field}</td>
        <td style="padding: 6px;">
          <select class="custom-select field-class-select" data-index="${idx}" style="font-size: 10px; padding: 2px 4px; width: 100%;">
            <option value="PUBLIC" ${f.classification === "PUBLIC" ? "selected" : ""}>PUBLIC</option>
            <option value="CONFIDENTIAL" ${f.classification === "CONFIDENTIAL" ? "selected" : ""}>CONFIDENTIAL</option>
            <option value="PHI" ${f.classification === "PHI" ? "selected" : ""}>PHI (Yellow)</option>
            <option value="PCI" ${f.classification === "PCI" ? "selected" : ""}>PCI (Red)</option>
          </select>
        </td>
      `;
      fieldsTable.appendChild(row);
    });

    // Bind dropdown change triggers
    fieldsTable.querySelectorAll(".field-class-select").forEach(sel => {
      sel.addEventListener("change", (e) => {
        const idx = parseInt(sel.getAttribute("data-index"), 10);
        const newClass = e.target.value;
        state.schemas[state.activeTable][idx].classification = newClass;
        playSynthSound("click");
        updateFootprintChart();
        appendVaultLog(`[VAULT] Changed field classification: ${state.activeTable}.${state.schemas[state.activeTable][idx].field} ❯ ${newClass}`);
      });
    });
  }

  // ==================== UPDATE FOOTPRINT ALLOCATION CHART ====================
  function updateFootprintChart() {
    let phiCount = 0;
    let pciCount = 0;
    let publicCount = 0;
    let totalCount = 0;

    for (const key in state.schemas) {
      state.schemas[key].forEach(f => {
        totalCount++;
        if (f.classification === "PHI") phiCount++;
        else if (f.classification === "PCI") pciCount++;
        else publicCount++; // PUBLIC and CONFIDENTIAL categorized under general Public footprint
      });
    }

    const phiPct = Math.round((phiCount / totalCount) * 100);
    const pciPct = Math.round((pciCount / totalCount) * 100);
    const publicPct = 100 - phiPct - pciPct;

    footprintPhi.style.width = `${phiPct}%`;
    footprintPci.style.width = `${pciPct}%`;
    footprintPublic.style.width = `${publicPct}%`;
  }

  function appendVaultLog(text) {
    const time = new Date().toISOString().substring(11, 19);
    vaultLogs.innerHTML += `<br>[${time}] ${text}`;
    vaultLogs.scrollTop = vaultLogs.scrollHeight;
  }

  // ==================== ROTATE DECRYPTION KEYS ====================
  function rotateDecryptionKeys() {
    state.keyRotations++;
    const keyId = `key-prod-aes-256-v${state.keyRotations}`;
    activeKeyId.textContent = keyId;
    
    const now = new Date().toISOString();
    lastRotatedDate.textContent = now.substring(0, 16) + "Z";
    
    appendVaultLog(`[VAULT] Rotating active keys...`);
    appendVaultLog(`[VAULT] Generated new key credentials container: ${keyId}`);
    appendVaultLog(`[VAULT] Re-encrypting database block headers... complete`);
    playSynthSound("success");
  }

  // ==================== CRYPTOGRAPHIC SHREDDING ====================
  function cryptographicShred() {
    playSynthSound("shred");
    appendVaultLog(`[VAULT] WARNING: Initializing shred protocols...`);
    
    let blocks = ["production_users_db_cold", "transactions_pci_cold"];
    let idx = 0;

    const shredInterval = setInterval(() => {
      if (idx < blocks.length) {
        appendVaultLog(`[VAULT] Shredding expired block storage: ${blocks[idx]} ... complete`);
        idx++;
      } else {
        clearInterval(shredInterval);
        appendVaultLog(`[VAULT] Cryptographic shred complete. Storage blocks purged.`);
        alert("Shred complete! Expired storage segments purged safely.");
      }
    }, 600);
  }

  // ==================== CLASSIFICATION SCANNER TICKER ====================
  function runScanAnimation() {
    scanBtn.disabled = true;
    scanProgressBox.classList.remove("hidden");
    
    let pct = 0;
    const interval = setInterval(() => {
      pct += 5;
      scanPct.textContent = `${pct}%`;
      scanBar.style.width = `${pct}%`;
      playSynthSound("tick");

      if (pct >= 100) {
        clearInterval(interval);
        scanProgressBox.classList.add("hidden");
        scanBtn.disabled = false;
        playSynthSound("success");
        appendVaultLog(`[SCAN] Security classification scan complete. Footprint updated.`);
      }
    }, 60);
  }

  // ==================== POLICY ENGINE LOGS ====================
  function updateScheduleLog() {
    labelRangeHot.textContent = `${state.hotMonths} Months`;
    labelRangeCold.textContent = `${state.coldYears} Years`;

    dlmScheduleLog.innerHTML = `[POLICY] Hot-Tier limit threshold set to ${state.hotMonths} Months.
[POLICY] Archive migration to AWS Glacier after Hot-Tier expiry.
[POLICY] Cold-Tier archive retention lifespan set to ${state.coldYears} Years.
[POLICY] Force cryptographic shredding on expiry: ${state.shredOnExpire ? "ENABLED" : "DISABLED"}`;
  }

  // ==================== EVENT BINDINGS ====================
  function setupEventListeners() {
    themeToggleBtn.addEventListener("click", toggleTheme);

    sfxToggleBtn.addEventListener("click", () => {
      state.isAudioOn = !state.isAudioOn;
      sfxToggleBtn.textContent = state.isAudioOn ? "🔊" : "🔇";
      playSynthSound("click");
    });

    // Schema click triggers
    schemaItems.forEach(item => {
      item.addEventListener("click", () => {
        const table = item.getAttribute("data-table");
        if (state.activeTable === table) return;

        playSynthSound("click");
        schemaItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");
        
        state.activeTable = table;
        renderFieldsTable();
      });
    });

    rotateKeyBtn.addEventListener("click", rotateDecryptionKeys);
    shredBtn.addEventListener("click", cryptographicShred);
    scanBtn.addEventListener("click", runScanAnimation);

    rangeHot.addEventListener("input", (e) => {
      state.hotMonths = parseInt(e.target.value, 10);
      updateScheduleLog();
    });

    rangeCold.addEventListener("input", (e) => {
      state.coldYears = parseInt(e.target.value, 10);
      updateScheduleLog();
    });

    shredOnExpireCheckbox.addEventListener("change", (e) => {
      state.shredOnExpire = e.target.checked;
      updateScheduleLog();
    });

    applyPolicyBtn.addEventListener("click", () => {
      playSynthSound("success");
      appendVaultLog(`[COMPLIANCE] Retention policies applied globally.`);
      alert("Policy applied! S3 bucket tier schedules and partition parameters updated successfully.");
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
