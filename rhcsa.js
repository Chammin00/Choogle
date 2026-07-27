/**
 * Red Hat RHCSA Practice Lab Controller
 * Author: Antigravity AI
 */

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    theme: "light",
    isAudioOn: true,
    commandHistory: [],
    quests: {
      q1: { completed: false, description: "Systemd User Service logger-agent configured & enabled" },
      q2: { completed: false, description: "AutoFS auto-mount entries configured in shares.autofs / auto.shares" },
      q3: { completed: false, description: "Podman container http-server deployed on host port 80" }
    }
  };

  // ==================== DOM ELEMENTS ====================
  const htmlEl = document.documentElement;
  const terminalInput = document.getElementById("terminal-input");
  const terminalLogs = document.getElementById("terminal-logs");
  const sfxToggleBtn = document.getElementById("sfx-toggle-btn");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const evalBtn = document.getElementById("eval-btn");
  const resetQuestBtn = document.getElementById("reset-quest-btn");
  
  const q1Box = document.getElementById("q1-box");
  const q1Badge = document.getElementById("q1-badge");
  const q2Box = document.getElementById("q2-box");
  const q2Badge = document.getElementById("q2-badge");
  const q3Box = document.getElementById("q3-box");
  const q3Badge = document.getElementById("q3-badge");

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
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gainNode.gain.setValueAtTime(0.015, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === "click") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === "success") {
        // Double ding
        osc.type = "sine";
        osc.frequency.setValueAtTime(523, now); // C5
        osc.frequency.setValueAtTime(659, now + 0.1); // E5
        gainNode.gain.setValueAtTime(0.06, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === "fail") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.25);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.warn("Audio failure", e);
    }
  }

  // ==================== INITIALIZATION ====================
  function init() {
    initTheme();
    setupEventListeners();
    setTimeout(() => terminalInput.focus(), 100);
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

  // ==================== BASH COMMAND INTERPRETER ====================
  function executeCommand(line) {
    const trimmed = line.trim();
    state.commandHistory.push(trimmed);

    // Echo command
    appendLine(`[root@rhel9 ~]# ${trimmed}`, "terminal-stdin");

    const args = trimmed.split(/\s+/);
    const cmd = args[0].toLowerCase();

    if (!cmd) return;

    switch (cmd) {
      case "help":
        appendLine("Available shell utilities:\n  help        - display command list\n  clear       - clear console logs\n  mkdir       - create directories\n  touch       - create files\n  echo        - print or append file lines\n  systemctl   - control system services\n  podman      - deploy containers\n  ls          - list directories\n  cat         - read files\n  whoami      - display current user", "terminal-stdout");
        break;
      case "clear":
        terminalLogs.innerHTML = "";
        break;
      case "whoami":
        appendLine("root", "terminal-stdout");
        break;
      case "ls":
        appendLine("anaconda-ks.cfg    etc/    usr/    var/    .config/", "terminal-stdout");
        break;
      case "cat":
        if (args[1]) {
          appendLine(`cat: ${args[1]}: Permission Denied (simulated log locked)`, "terminal-stderr");
        } else {
          appendLine("Usage: cat <filename>", "terminal-stderr");
        }
        break;
      case "mkdir":
        if (args.includes("-p") && args.some(a => a.includes(".config/systemd/user"))) {
          appendLine("Directory created: ~/.config/systemd/user/", "terminal-success");
        } else {
          appendLine(`Created directory: ${args.slice(1).join(" ")}`, "terminal-stdout");
        }
        break;
      case "touch":
        if (args[1]) {
          appendLine(`Created file: ${args[1]}`, "terminal-success");
        } else {
          appendLine("Usage: touch <filename>", "terminal-stderr");
        }
        break;
      case "echo":
        // Handle echo commands mapping parameters
        const lineStr = trimmed.toLowerCase();
        if (lineStr.includes(">>") && lineStr.includes("auto.master")) {
          appendLine("Appended mount mapping link to /etc/auto.master.d/shares.autofs", "terminal-success");
        } else if (lineStr.includes(">>") && lineStr.includes("auto.shares")) {
          appendLine("Appended mount records to /etc/auto.shares", "terminal-success");
        } else {
          const echoArgs = args.slice(1).join(" ");
          appendLine(echoArgs.replace(/"/g, ""), "terminal-stdout");
        }
        break;
      case "systemctl":
        const action = args[1] ? args[1].toLowerCase() : "";
        const svc = args[2] ? args[2].toLowerCase() : "";
        if (action === "--user" || args.includes("--user")) {
          if (trimmed.includes("enable") && trimmed.includes("logger-agent")) {
            appendLine("Created symlink /root/.config/systemd/user/default.target.wants/logger-agent.service.", "terminal-success");
            appendLine("Service enabled in user space context.", "terminal-stdout");
          } else {
            appendLine(`systemctl: action on user service parsed: ${svc}`, "terminal-stdout");
          }
        } else {
          appendLine(`systemctl: executing global daemon action '${action}' on '${svc}'`, "terminal-stdout");
        }
        break;
      case "podman":
        if (args[1] === "run") {
          if (trimmed.includes("nginx:alpine") && trimmed.includes("http-server") && trimmed.includes("-p 80:80")) {
            appendLine("Trying to pull registry.access.redhat.com/nginx:alpine... success", "terminal-stdout");
            appendLine("c765ef9a823b120c9f8742b89d716503c14a2b9a71023d8c11e2f3d4c5148f32", "terminal-success");
            appendLine("Container http-server running in background on port 80.", "terminal-stdout");
          } else {
            appendLine("Error: podman execution parameters incorrect. Host port 80 must map to container port 80.", "terminal-stderr");
          }
        } else if (args[1] === "ps") {
          if (state.commandHistory.some(c => c.includes("podman run") && c.includes("http-server") && c.includes("80:80"))) {
            appendLine("CONTAINER ID    IMAGE           COMMAND                 CREATED         STATUS          PORTS               NAMES\nc765ef9a823b    nginx:alpine    \"nginx -g 'daemon o…\"   5 seconds ago   Up 4 seconds    0.0.0.0:80->80/tcp  http-server", "terminal-stdout");
          } else {
            appendLine("CONTAINER ID    IMAGE           COMMAND                 CREATED         STATUS          PORTS               NAMES", "terminal-stdout");
          }
        } else {
          appendLine(`podman: command action '${args[1]}' parsed.`, "terminal-stdout");
        }
        break;
      default:
        appendLine(`bash: ${cmd}: command not found. Type 'help' to review training commands.`, "terminal-stderr");
    }
  }

  function appendLine(text, className) {
    const lineDiv = document.createElement("div");
    lineDiv.className = className;
    lineDiv.style.whiteSpace = "pre-wrap";
    lineDiv.textContent = text;
    terminalLogs.appendChild(lineDiv);
    terminalLogs.scrollTop = terminalLogs.scrollHeight;
  }

  // ==================== EVALUATION QUEST ENGINE ====================
  function runEvaluation() {
    let q1Pass = false;
    let q2Pass = false;
    let q3Pass = false;

    // Check systemd user quest
    const historyText = state.commandHistory.join(" ");
    
    // Quest 1 checks: must mkdir config path and enable logger-agent
    if (historyText.includes(".config/systemd/user") && historyText.includes("systemctl") && historyText.includes("enable") && historyText.includes("logger-agent")) {
      q1Pass = true;
    }

    // Quest 2 checks: must append to auto.master or auto.master.d and write mount mapping
    if (historyText.includes("auto.master") && historyText.includes("auto.shares") && historyText.includes("remote") && historyText.includes("10.0.5.50")) {
      q2Pass = true;
    }

    // Quest 3 checks: podman run, nginx:alpine, name http-server, mapping 80:80
    if (historyText.includes("podman") && historyText.includes("run") && historyText.includes("http-server") && historyText.includes("80:80") && historyText.includes("nginx")) {
      q3Pass = true;
    }

    // Update UI states
    updateQuestState("q1", q1Pass, q1Box, q1Badge);
    updateQuestState("q2", q2Pass, q2Box, q2Badge);
    updateQuestState("q3", q3Pass, q3Box, q3Badge);

    // Print evaluation status to terminal
    appendLine("\n--- COMPLIANCE SCANS RUNNING ---", "terminal-stdin");
    
    if (q1Pass && q2Pass && q3Pass) {
      appendLine("QUEST 1: logger-agent.service configuration ... PASSED", "terminal-success");
      appendLine("QUEST 2: AutoFS mount exports configuration ... PASSED", "terminal-success");
      appendLine("QUEST 3: Podman nginx port 80 mapping ...... PASSED", "terminal-success");
      appendLine("OVERALL EVALUATION: SUCCESS. ALL LAB TARGETS SATISFIED!", "terminal-success");
      playSynthSound("success");
      alert("Quest Complete! All RHEL 9 compliance tasks verified successfully!");
    } else {
      if (!q1Pass) appendLine("QUEST 1: logger-agent.service configuration ... FAILED\n  -> Hint: Verify you enabled the logger-agent service in user systemctl context.", "terminal-stderr");
      else appendLine("QUEST 1: logger-agent.service configuration ... PASSED", "terminal-success");

      if (!q2Pass) appendLine("QUEST 2: AutoFS mount exports configuration ... FAILED\n  -> Hint: Add AutoFS shares map to master file and mount the remote NFS share.", "terminal-stderr");
      else appendLine("QUEST 2: AutoFS mount exports configuration ... PASSED", "terminal-success");

      if (!q3Pass) appendLine("QUEST 3: Podman nginx port 80 mapping ...... FAILED\n  -> Hint: Deployed podman container must match container name 'http-server' and map port 80:80.", "terminal-stderr");
      else appendLine("QUEST 3: Podman nginx port 80 mapping ...... PASSED", "terminal-success");

      appendLine("OVERALL EVALUATION: FAILURE. Review quest requirements and configure target files.", "terminal-stderr");
      playSynthSound("fail");
    }
  }

  function updateQuestState(questId, pass, boxEl, badgeEl) {
    state.quests[questId].completed = pass;
    boxEl.classList.remove("completed", "failed");
    if (pass) {
      boxEl.classList.add("completed");
      badgeEl.textContent = "PASSED";
      badgeEl.style.backgroundColor = "var(--color-green)";
    } else {
      boxEl.classList.add("failed");
      badgeEl.textContent = "FAILED";
      badgeEl.style.backgroundColor = "var(--color-red)";
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

    terminalInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const line = terminalInput.value;
        terminalInput.value = "";
        if (line.trim()) {
          playSynthSound("hover");
          executeCommand(line);
        }
      }
    });

    // Run Evaluator click
    evalBtn.addEventListener("click", () => {
      playSynthSound("click");
      runEvaluation();
    });

    // Reset environment
    resetQuestBtn.addEventListener("click", () => {
      playSynthSound("click");
      state.commandHistory = [];
      terminalLogs.innerHTML = `
        <div>Practice Sandbox environment reset.</div>
        <div>All variables cleared. Quest status set to pending.</div>
      `;
      ["q1", "q2", "q3"].forEach(q => {
        state.quests[q].completed = false;
      });
      [q1Box, q2Box, q3Box].forEach(b => b.classList.remove("completed", "failed"));
      [q1Badge, q2Badge, q3Badge].forEach(b => {
        b.textContent = "PENDING";
        b.style.backgroundColor = "var(--text-muted)";
      });
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
