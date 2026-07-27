/**
 * Windows PowerShell Practice Lab Controller - Detailed Enterprise Edition
 * Author: Antigravity AI
 */

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    theme: "light",
    isAudioOn: true,
    activeChallenge: "ch1",
    services: {
      wuauserv: { name: "wuauserv", status: "Stopped", displayName: "Windows Update" },
      spooler: { name: "spooler", status: "Running", displayName: "Print Spooler" },
      winrm: { name: "winrm", status: "Stopped", displayName: "Windows Remote Management" },
      winlogon: { name: "winlogon", status: "Running", displayName: "Windows Logon Application" }
    },
    processes: [
      { id: 4512, name: "explorer", pm: 28450 },
      { id: 1204, name: "svchost", pm: 8500 },
      { id: 2840, name: "powershell", pm: 35000 },
      { id: 9110, name: "chrome", pm: 185000 }
    ],
    adTree: {
      "System-Administrators": ["chase", "admin"],
      "Service-Accounts": ["svc-web", "svc-db"],
      "Computers": ["webserver-01", "database-01"]
    }
  };

  const challengeTemplates = {
    ch1: {
      prompt: "TASK: Complete the script. It must check if service 'wuauserv' is Stopped, and start it if it is.",
      template: `# Challenge 1: Auto-start Stopped Service
$svc = Get-Service -Name "wuauserv"
if ($svc.Status -eq "Stopped") {
    # Enter cmdlet to start service:
    Start-Service -Name "wuauserv"
}`
    },
    ch2: {
      prompt: "TASK: Loop and restart all services containing the wildcard string '*win*' inside their Name property.",
      template: `# Challenge 2: Wildcard Service Restarts
Get-Service | Where-Object {$_.Name -like "*win*"} | ForEach-Object {
    # Enter cmdlet to restart each matching service:
    Restart-Service -Name $_.Name
}`
    },
    ch3: {
      prompt: "TASK: Retrieve processes consuming more than 15MB Private Memory (PM) and filter results to show ProcessName and Id properties.",
      template: `# Challenge 3: Filter Process PM Limits
Get-Process | Where-Object {$_.PM -gt 15MB} | Select-Object -Property ProcessName, Id`
    }
  };

  // ==================== DOM ELEMENTS ====================
  const htmlEl = document.documentElement;
  const sfxToggleBtn = document.getElementById("sfx-toggle-btn");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");

  const adTreeView = document.getElementById("ad-tree-view");
  const psConsoleLog = document.getElementById("ps-console-log");
  const cliPromptIndicator = document.getElementById("cli-prompt-indicator");
  const cliInput = document.getElementById("cli-input");

  const challengeSelect = document.getElementById("challenge-select");
  const challengePrompt = document.getElementById("challenge-prompt");
  const challengeEditor = document.getElementById("challenge-editor");
  const challengeResultsLog = document.getElementById("challenge-results-log");
  const compilerRunBtn = document.getElementById("compiler-run-btn");

  const choogleSearchInput = document.getElementById("choogle-search-input");
  const choogleSearchBtn = document.getElementById("choogle-search-btn");

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
      
      if (type === "hover") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gainNode.gain.setValueAtTime(0.015, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === "click") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);
        gainNode.gain.setValueAtTime(0.04, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.08);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "error") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(120, now);
        gainNode.gain.setValueAtTime(0.06, now);
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
    renderADTree();
    loadChallenge();
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

  // ==================== RENDER ACTIVE DIRECTORY TREE ====================
  function renderADTree() {
    adTreeView.innerHTML = "<div>📂 DC=choogle,DC=dev</div>";
    
    for (const ou in state.adTree) {
      const ouDiv = document.createElement("div");
      ouDiv.className = "tree-node-ou";
      ouDiv.style.marginLeft = "12px";
      ouDiv.textContent = `📂 OU=${ou}`;
      adTreeView.appendChild(ouDiv);

      const items = state.adTree[ou];
      items.forEach(node => {
        const leafDiv = document.createElement("div");
        leafDiv.className = "tree-node-leaf";
        leafDiv.style.marginLeft = "28px";
        
        const isComp = node.includes("-01");
        leafDiv.textContent = isComp ? `💻 CN=${node}` : `👤 CN=${node}`;
        adTreeView.appendChild(leafDiv);
      });
    }
  }

  // ==================== LOAD COMPILER CHALLENGE ====================
  function loadChallenge() {
    const ch = challengeSelect.value;
    state.activeChallenge = ch;
    
    challengePrompt.textContent = challengeTemplates[ch].prompt;
    challengeEditor.value = challengeTemplates[ch].template;
    challengeResultsLog.innerHTML = `// Selected challenge: ${ch.toUpperCase()}. Ready to compile...`;
  }

  // ==================== POWERSHELL COMMAND INTERPRETER ====================
  function executeCommand(line) {
    const trimmed = line.trim();
    
    appendLine(`PS C:\\Users\\chase> ${trimmed}`, "terminal-stdin");

    const args = trimmed.split(/\s+/);
    const cmd = args[0].toLowerCase();

    if (!cmd) return;

    switch (cmd) {
      case "help":
        appendLine("Active Training Cmdlets:\n  Get-Service        - View active system services.\n  Start-Service      - Start stopped services.\n  Restart-Service    - Restart running services.\n  Get-Process        - Retrieve process statistics.\n  Get-ADUser         - Query Active Directory users.\n  New-ADUser         - Create new AD users (Updates tree!).\n  clear / cls        - Flush console outputs.", "terminal-stdout");
        break;
      case "clear":
      case "cls":
        psConsoleLog.innerHTML = "";
        break;
      case "get-service":
        let sTable = "Status      Name               DisplayName\n------      ----               -----------\n";
        for (const key in state.services) {
          const s = state.services[key];
          sTable += `${s.status.padEnd(12, " ")}${s.name.padEnd(19, " ")}${s.displayName}\n`;
        }
        appendLine(sTable, "terminal-stdout");
        break;
      case "start-service":
        const stTarget = args[1] ? args[1].replace(/"/g, "").toLowerCase() : "";
        if (state.services[stTarget]) {
          state.services[stTarget].status = "Running";
          appendLine(`Service '${state.services[stTarget].displayName}' started successfully.`, "terminal-success");
          playSynthSound("success");
        } else {
          appendLine(`Start-Service: Cannot find service with name '${args[1] || ""}'.`, "terminal-stderr");
        }
        break;
      case "restart-service":
        const resTarget = args[1] ? args[1].replace(/"/g, "").toLowerCase() : "";
        if (state.services[resTarget]) {
          state.services[resTarget].status = "Running";
          appendLine(`Service '${state.services[resTarget].displayName}' restarted successfully.`, "terminal-success");
          playSynthSound("success");
        } else {
          appendLine(`Restart-Service: Cannot find service with name '${args[1] || ""}'.`, "terminal-stderr");
        }
        break;
      case "get-process":
        let pTable = "Id      ProcessName         PrivateMemory(K)\n--      -----------         ----------------\n";
        state.processes.forEach(p => {
          pTable += `${p.id.toString().padEnd(8, " ")}${p.name.padEnd(20, " ")}${p.pm}\n`;
        });
        appendLine(pTable, "terminal-stdout");
        break;
      case "get-aduser":
        const userId = args[1] ? args[1].replace(/"/g, "").toLowerCase() : "";
        let foundUser = null;
        for (const ou in state.adTree) {
          if (state.adTree[ou].includes(userId)) {
            foundUser = userId;
            break;
          }
        }
        if (foundUser) {
          appendLine(`DistinguishedName : CN=${foundUser},OU=System-Administrators,DC=choogle,DC=dev\nEnabled           : True\nName              : ${foundUser.toUpperCase()}\nUserPrincipalName : ${foundUser}@choogle.dev`, "terminal-stdout");
        } else {
          appendLine(`Get-ADUser: Identity '${args[1] || ""}' not found in Directory database.`, "terminal-stderr");
        }
        break;
      case "new-aduser":
        // Syntax: New-ADUser -Name "name" -Path "OU=System-Administrators"
        const nameIdx = args.indexOf("-Name");
        const pathIdx = args.indexOf("-Path");
        if (nameIdx !== -1 && pathIdx !== -1 && args[nameIdx + 1] && args[pathIdx + 1]) {
          const userName = args[nameIdx + 1].replace(/"/g, "").toLowerCase();
          const rawPath = args[pathIdx + 1].replace(/"/g, "");
          
          let ouName = "System-Administrators";
          if (rawPath.includes("OU=")) {
            ouName = rawPath.split("OU=")[1].split(",")[0];
          }

          if (state.adTree[ouName]) {
            state.adTree[ouName].push(userName);
            renderADTree();
            appendLine(`[AD] User CN=${userName} created successfully inside OU=${ouName}.`, "terminal-success");
            playSynthSound("success");
          } else {
            appendLine(`New-ADUser: Directory path target OU '${ouName}' does not exist.`, "terminal-stderr");
          }
        } else {
          appendLine("% Syntax error. Example:\n  New-ADUser -Name \"jason\" -Path \"OU=System-Administrators\"", "terminal-stderr");
        }
        break;
      default:
        appendLine(`'${cmd}' is not recognized as a cmdlet name, function, or script file.`, "terminal-stderr");
    }

    psConsoleLog.scrollTop = psConsoleLog.scrollHeight;
  }

  function appendLine(text, className) {
    const lineDiv = document.createElement("div");
    lineDiv.className = className;
    lineDiv.style.whiteSpace = "pre-wrap";
    lineDiv.textContent = text;
    psConsoleLog.appendChild(lineDiv);
    psConsoleLog.scrollTop = psConsoleLog.scrollHeight;
  }

  // ==================== COMPILE AND TEST RUN SCRIPTS ====================
  function compileScript() {
    const code = challengeEditor.value;
    challengeResultsLog.innerHTML = `[COMPILER] Initializing execution tests...`;

    setTimeout(() => {
      let isSuccess = false;

      if (state.activeChallenge === "ch1") {
        const hasGet = code.includes("Get-Service");
        const hasStart = code.includes("Start-Service");
        const hasIf = code.includes("if");
        if (hasGet && hasStart && hasIf) {
          state.services.wuauserv.status = "Running";
          isSuccess = true;
        }
      } else if (state.activeChallenge === "ch2") {
        const hasLike = code.includes("like");
        const hasRestart = code.includes("Restart-Service");
        const hasWild = code.includes("*win*");
        if (hasLike && hasRestart && hasWild) {
          state.services.winrm.status = "Running";
          isSuccess = true;
        }
      } else if (state.activeChallenge === "ch3") {
        const hasProc = code.includes("Get-Process");
        const hasSelect = code.includes("Select-Object");
        const hasMemory = code.includes("15MB");
        if (hasProc && hasSelect && hasMemory) {
          isSuccess = true;
        }
      }

      if (isSuccess) {
        challengeResultsLog.innerHTML += `<br><span style="color: var(--color-green); font-weight: bold;">[SUCCESS] ALL TEST CONFIGURATIONS VERIFIED. Script executed successfully.</span>`;
        playSynthSound("success");
        appendLine(`\nPS C:\\Users\\chase> .\\Challenge_${state.activeChallenge.toUpperCase()}.ps1`, "terminal-stdin");
        appendLine("Script executed successfully. Output logs compiled.", "terminal-success");
        alert("Challenge Complete! PowerShell script loop satisfied all test cases.");
      } else {
        challengeResultsLog.innerHTML += `<br><span style="color: var(--color-red); font-weight: bold;">[ERROR] SCRIPT EVALUATION MISMATED. Check cmdlet loop syntax properties.</span>`;
        playSynthSound("error");
      }
    }, 850);
  }

  // ==================== EVENT BINDINGS ====================
  function setupEventListeners() {
    themeToggleBtn.addEventListener("click", toggleTheme);

    sfxToggleBtn.addEventListener("click", () => {
      state.isAudioOn = !state.isAudioOn;
      sfxToggleBtn.textContent = state.isAudioOn ? "🔊" : "🔇";
      playSynthSound("click");
    });

    cliInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const line = cliInput.value;
        cliInput.value = "";
        if (line.trim()) {
          playSynthSound("hover");
          executeCommand(line);
        }
      }
    });

    challengeSelect.addEventListener("change", loadChallenge);
    compilerRunBtn.addEventListener("click", compileScript);

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
