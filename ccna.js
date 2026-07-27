/**
 * Cisco CCNA Practice Lab Controller - Detailed Enterprise Edition
 * Author: Antigravity AI
 */

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    theme: "light",
    isAudioOn: true,
    activeConsoleNode: "R1", // "R1" | "R2"
    nodes: {
      R1: {
        hostname: "Router-R1",
        mode: "user", // "user" | "enable" | "config" | "interface"
        activeInterface: null, // null | "FastEthernet0/0"
        interfaces: {
          "FastEthernet0/0": { ip: null, mask: null, status: "down" }
        },
        routes: []
      },
      R2: {
        hostname: "Router-R2",
        mode: "user",
        activeInterface: null,
        interfaces: {
          "FastEthernet0/0": { ip: null, mask: null, status: "down" }
        },
        routes: []
      }
    },
    quests: {
      q1: false, // R1 configured
      q2: false, // R2 configured
      q3: false  // Ping complete
    }
  };

  // ==================== DOM ELEMENTS ====================
  const htmlEl = document.documentElement;
  const sfxToggleBtn = document.getElementById("sfx-toggle-btn");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");

  const nodeActiveTitle = document.getElementById("node-active-title");
  const cliLogs = document.getElementById("ps-console-log");
  const cliPromptIndicator = document.getElementById("cli-prompt-indicator");
  const cliInput = document.getElementById("cli-input");

  const calcIpInput = document.getElementById("calc-ip-input");
  const calcCidrSelect = document.getElementById("calc-cidr-select");
  const triggerCalcBtn = document.getElementById("trigger-calc-btn");
  const subnetCalcResults = document.getElementById("subnet-calc-results");

  const qCcna1 = document.getElementById("q-ccna1");
  const qCcna1Badge = document.getElementById("q-ccna1-badge");
  const qCcna2 = document.getElementById("q-ccna2");
  const qCcna2Badge = document.getElementById("q-ccna2-badge");
  const qCcna3 = document.getElementById("q-ccna3");
  const qCcna3Badge = document.getElementById("q-ccna3-badge");
  const resetCcnaBtn = document.getElementById("reset-ccna-btn");

  const topoR1 = document.getElementById("topo-r1");
  const topoR2 = document.getElementById("topo-r2");
  const linkR1R2 = document.getElementById("topo-link-r1-r2");
  const labelR1Ip = document.getElementById("label-r1-ip");
  const labelR2Ip = document.getElementById("label-r2-ip");

  const pingPacketDot = document.getElementById("ping-packet-dot");
  const packetAnim = document.getElementById("packet-anim");

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
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        gainNode.gain.setValueAtTime(0.015, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
        gainNode.gain.setValueAtTime(0.04, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "ping") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554, now + 0.1);
        gainNode.gain.setValueAtTime(0.04, now);
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
    setupEventListeners();
    updateCLI();
    calculateSubnets();
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

  // ==================== CISCO IOS INTERPRETER ====================
  function updateCLI() {
    const node = state.nodes[state.activeConsoleNode];
    nodeActiveTitle.textContent = `${state.activeConsoleNode}_IOS_CLI`;

    let prompt = `${node.hostname}>`;
    if (node.mode === "enable") prompt = `${node.hostname}#`;
    else if (node.mode === "config") prompt = `${node.hostname}(config)#`;
    else if (node.mode === "interface") prompt = `${node.hostname}(config-if)#`;

    cliPromptIndicator.textContent = prompt;
  }

  function executeCommand(line) {
    const trimmed = line.trim();
    const node = state.nodes[state.activeConsoleNode];
    
    appendLine(`${cliPromptIndicator.textContent} ${trimmed}`, "terminal-stdin");

    const args = trimmed.split(/\s+/);
    const cmd = args[0].toLowerCase();

    if (!cmd) return;

    if (cmd === "exit") {
      if (node.mode === "interface") {
        node.mode = "config";
        node.activeInterface = null;
      } else if (node.mode === "config") {
        node.mode = "enable";
      } else if (node.mode === "enable") {
        node.mode = "user";
      }
      updateCLI();
      return;
    }

    // User EXEC Mode
    if (node.mode === "user") {
      if (cmd === "enable" || cmd === "en") {
        node.mode = "enable";
        appendLine("Privilege access level enabled.", "terminal-stdout");
      } else {
        appendLine("% Invalid input detected at '^' marker. Type 'enable' to enter admin console.", "terminal-stderr");
      }
    }
    // Privileged EXEC Mode
    else if (node.mode === "enable") {
      if ((cmd === "configure" && args[1] === "terminal") || cmd === "conf" || cmd === "config") {
        node.mode = "config";
        appendLine("Enter configuration commands, one per line. End with CNTL/Z.", "terminal-stdout");
      } else if (cmd === "show" && args[1] === "ip" && args[2] === "interface" && args[3] === "brief") {
        showIpInterfaceBrief();
      } else if (cmd === "show" && args[1] === "ip" && args[2] === "route") {
        showIpRoute();
      } else if (cmd === "ping") {
        const dest = args[1];
        runPingTest(dest);
      } else {
        appendLine(`% Invalid command: '${cmd}'. (Type 'conf t', 'show ip interface brief', 'show ip route', or 'ping')`, "terminal-stderr");
      }
    }
    // Global Config Mode
    else if (node.mode === "config") {
      if (cmd === "interface" || cmd === "int") {
        const intName = args[1] ? args[1].toLowerCase() : "";
        if (intName.includes("fa0/0") || intName.includes("fastethernet0/0")) {
          node.mode = "interface";
          node.activeInterface = "FastEthernet0/0";
          appendLine("Entering interface FastEthernet0/0 configuration context.", "terminal-stdout");
        } else {
          appendLine("% Invalid interface name. FastEthernet0/0 connects this subnet.", "terminal-stderr");
        }
      } else {
        appendLine("% Command not accepted in global config. Type 'interface fa0/0' to access ports.", "terminal-stderr");
      }
    }
    // Interface Config Mode
    else if (node.mode === "interface") {
      if (cmd === "ip" && args[1] === "address") {
        const ip = args[2];
        const mask = args[3];
        if (ip && mask) {
          node.interfaces[node.activeInterface].ip = ip;
          node.interfaces[node.activeInterface].mask = mask;
          appendLine(`IP Address ${ip} assigned to ${node.activeInterface} subnet successfully.`, "terminal-success");
          updateNodeLabels();
          evaluateQuests();
        } else {
          appendLine("% Incomplete command syntax: ip address <ip> <netmask>", "terminal-stderr");
        }
      } else if (cmd === "no" && args[1] === "shutdown") {
        node.interfaces[node.activeInterface].status = "up";
        appendLine(`%LINK-5-CHANGED: Interface ${node.activeInterface}, changed state to UP`, "terminal-success");
        appendLine(`%LINEPROTO-5-UPDOWN: Line protocol on Interface ${node.activeInterface}, changed state to UP`, "terminal-success");
        playSynthSound("success");
        updateNodeLabels();
        updateTrunksVisuals();
        evaluateQuests();
      } else {
        appendLine("% Invalid command options inside interface port setup context.", "terminal-stderr");
      }
    }

    updateCLI();
  }

  function appendLine(text, className) {
    const lineDiv = document.createElement("div");
    lineDiv.className = className;
    lineDiv.style.whiteSpace = "pre-wrap";
    lineDiv.textContent = text;
    cliLogs.appendChild(lineDiv);
    cliLogs.scrollTop = cliLogs.scrollHeight;
  }

  function showIpInterfaceBrief() {
    const node = state.nodes[state.activeConsoleNode];
    const fa = node.interfaces["FastEthernet0/0"];
    const out = `Interface              IP-Address      OK? Method Status                Protocol
FastEthernet0/0        ${fa.ip || "unassigned"}  YES manual ${fa.status.toUpperCase().padEnd(21, " ")}${fa.status.toUpperCase()}`;
    appendLine(out, "terminal-stdout");
  }

  function showIpRoute() {
    const node = state.nodes[state.activeConsoleNode];
    const fa = node.interfaces["FastEthernet0/0"];
    if (fa.status !== "up" || !fa.ip) {
      appendLine("Gateway of last resort is not set\n\nRouting table is empty. Interface link status down.", "terminal-stdout");
      return;
    }

    const out = `Codes: C - connected, S - static, R - RIP, M - mobile, B - BGP
Gateway of last resort is not set

      192.168.1.0/26 is subnetted, 1 subnets
C        192.168.1.0 is directly connected, FastEthernet0/0`;
    appendLine(out, "terminal-stdout");
  }

  function updateNodeLabels() {
    const r1 = state.nodes.R1.interfaces["FastEthernet0/0"];
    const r2 = state.nodes.R2.interfaces["FastEthernet0/0"];

    if (r1.ip && r1.status === "up") {
      labelR1Ip.textContent = `Fa0/0: ${r1.ip}`;
      labelR1Ip.style.fill = "var(--color-green)";
    } else {
      labelR1Ip.textContent = "Fa0/0: Down";
      labelR1Ip.style.fill = "var(--text-muted)";
    }

    if (r2.ip && r2.status === "up") {
      labelR2Ip.textContent = `Fa0/0: ${r2.ip}`;
      labelR2Ip.style.fill = "var(--color-green)";
    } else {
      labelR2Ip.textContent = "Fa0/0: Down";
      labelR2Ip.style.fill = "var(--text-muted)";
    }
  }

  function updateTrunksVisuals() {
    const r1 = state.nodes.R1.interfaces["FastEthernet0/0"];
    const r2 = state.nodes.R2.interfaces["FastEthernet0/0"];

    if (r1.status === "up" && r2.status === "up") {
      linkR1R2.style.stroke = "var(--color-green)";
    } else {
      linkR1R2.style.stroke = "var(--text-muted)";
    }
  }

  // ==================== PING TELEMETRY SIMULATION ====================
  function runPingTest(dest) {
    if (!dest) {
      appendLine("% Command error: ping <destination-ip>", "terminal-stderr");
      return;
    }

    const r1 = state.nodes.R1.interfaces["FastEthernet0/0"];
    const r2 = state.nodes.R2.interfaces["FastEthernet0/0"];

    if (r1.status !== "up" || r2.status !== "up" || !r1.ip || !r2.ip) {
      appendLine("Sending 5, 100-byte ICMP Echos, timeout is 2 seconds:\n.....\nSuccess rate is 0 percent (0/5)", "terminal-stderr");
      return;
    }

    const isValidDest = (dest === "192.168.1.1" && state.activeConsoleNode === "R2") ||
                        (dest === "192.168.1.2" && state.activeConsoleNode === "R1");

    if (isValidDest) {
      // Trigger SVG loop animation
      pingPacketDot.classList.remove("hidden");
      playSynthSound("ping");
      
      let count = 0;
      appendLine(`Sending 5, 100-byte ICMP Echos to ${dest}, timeout is 2 seconds:`, "terminal-stdout");
      
      const pingInterval = setInterval(() => {
        appendLine("!", "terminal-success");
        count++;
        if (count >= 5) {
          clearInterval(pingInterval);
          appendLine("Success rate is 100 percent (5/5), round-trip min/avg/max = 1/3/8 ms", "terminal-success");
          pingPacketDot.classList.add("hidden");
          state.quests.q3 = true;
          evaluateQuests();
        }
      }, 300);
    } else {
      appendLine(`Sending 5, 100-byte ICMP Echos to ${dest}, timeout is 2 seconds:\n.....\nSuccess rate is 0 percent (0/5)`, "terminal-stderr");
    }
  }

  // ==================== QUEST EVALUATOR ====================
  function evaluateQuests() {
    const r1 = state.nodes.R1.interfaces["FastEthernet0/0"];
    const r2 = state.nodes.R2.interfaces["FastEthernet0/0"];

    // Task 1: R1 Fa0/0 setup
    if (r1.ip === "192.168.1.1" && r1.mask === "255.255.255.192" && r1.status === "up") {
      state.quests.q1 = true;
      qCcna1.classList.add("completed");
      qCcna1Badge.textContent = "PASSED";
      qCcna1Badge.style.backgroundColor = "var(--color-green)";
    }

    // Task 2: R2 Fa0/0 setup
    if (r2.ip === "192.168.1.2" && r2.mask === "255.255.255.192" && r2.status === "up") {
      state.quests.q2 = true;
      qCcna2.classList.add("completed");
      qCcna2Badge.textContent = "PASSED";
      qCcna2Badge.style.backgroundColor = "var(--color-green)";
    }

    // Task 3: Ping connection
    if (state.quests.q3) {
      qCcna3.classList.add("completed");
      qCcna3Badge.textContent = "PASSED";
      qCcna3Badge.style.backgroundColor = "var(--color-green)";
      
      // All clear!
      setTimeout(() => {
        alert("Congratulations! All Cisco CCNA static link configuration parameters passed successfully!");
      }, 500);
    }
  }

  // ==================== IP SUBNET CALCULATOR ====================
  function calculateSubnets() {
    const ip = calcIpInput.value.trim();
    const cidr = parseInt(calcCidrSelect.value, 10);

    const parts = ip.split(".");
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
      subnetCalcResults.innerHTML = `<span style="color: var(--color-red);">Invalid IP Octet.</span>`;
      return;
    }

    const hostBits = 32 - cidr;
    const hostsPerSubnet = Math.max(0, Math.pow(2, hostBits) - 2);
    const subnetsCount = Math.pow(2, cidr % 8);
    
    let mask = "";
    let step = 256 / subnetsCount;
    if (cidr === 24) { mask = "255.255.255.0"; step = 256; }
    else if (cidr === 25) { mask = "255.255.255.128"; step = 128; }
    else if (cidr === 26) { mask = "255.255.255.192"; step = 64; }
    else if (cidr === 27) { mask = "255.255.255.224"; step = 32; }
    else if (cidr === 28) { mask = "255.255.255.240"; step = 16; }
    else if (cidr === 30) { mask = "255.255.255.252"; step = 4; }

    const baseOctets = parts.slice(0, 3).join(".");
    
    let resultsHtml = `
      <div>NETMASK OCTET: <strong>${mask}</strong></div>
      <div>USABLE HOSTS/SUBNET: <strong>${hostsPerSubnet}</strong></div>
      <table style="width:100%; border-top: 1px solid var(--border-color); margin-top: 4px; border-collapse: collapse; font-size: 9px;">
        <thead>
          <tr style="color: var(--text-muted); text-align: left;">
            <th>SUBNET ID</th>
            <th>USABLE RANGE</th>
            <th>BROADCAST IP</th>
          </tr>
        </thead>
        <tbody>
    `;

    const maxSubnetsShow = Math.min(subnetsCount, 4);
    for (let i = 0; i < maxSubnetsShow; i++) {
      const netId = i * step;
      const startHost = netId + 1;
      const endHost = netId + hostsPerSubnet;
      const broadcast = netId + step - 1;
      resultsHtml += `
        <tr style="border-bottom: 1px solid rgba(0,0,0,0.02);">
          <td>${baseOctets}.${netId}</td>
          <td>${baseOctets}.${startHost} - ${baseOctets}.${endHost}</td>
          <td>${baseOctets}.${broadcast}</td>
        </tr>
      `;
    }

    if (subnetsCount > 4) {
      resultsHtml += `<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">... (${subnetsCount - 4} more subnets cataloged)</td></tr>`;
    }

    resultsHtml += `</tbody></table>`;
    subnetCalcResults.innerHTML = resultsHtml;
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
        const val = cliInput.value;
        cliInput.value = "";
        if (val.trim()) {
          playSynthSound("hover");
          executeCommand(val);
        }
      }
    });

    triggerCalcBtn.addEventListener("click", () => {
      playSynthSound("click");
      calculateSubnets();
    });

    // Console node switch clicks
    topoR1.addEventListener("click", () => {
      if (state.activeConsoleNode === "R1") return;
      playSynthSound("click");
      topoR1.classList.add("active");
      topoR2.classList.remove("active");
      state.activeConsoleNode = "R1";
      updateCLI();
      appendLine("\n*** Switched console input line to Router-R1 ***", "terminal-stdout");
    });

    topoR2.addEventListener("click", () => {
      if (state.activeConsoleNode === "R2") return;
      playSynthSound("click");
      topoR2.classList.add("active");
      topoR1.classList.remove("active");
      state.activeConsoleNode = "R2";
      updateCLI();
      appendLine("\n*** Switched console input line to Router-R2 ***", "terminal-stdout");
    });

    resetCcnaBtn.addEventListener("click", () => {
      playSynthSound("click");
      state.nodes.R1.interfaces["FastEthernet0/0"] = { ip: null, mask: null, status: "down" };
      state.nodes.R2.interfaces["FastEthernet0/0"] = { ip: null, mask: null, status: "down" };
      state.nodes.R1.mode = "user";
      state.nodes.R2.mode = "user";
      state.quests.q1 = false;
      state.quests.q2 = false;
      state.quests.q3 = false;

      cliLogs.innerHTML = `<div>Environment reset. Console configuration metrics cleared.</div>`;
      
      [qCcna1, qCcna2, qCcna3].forEach(b => b.classList.remove("completed"));
      [qCcna1Badge, qCcna2Badge, qCcna3Badge].forEach(b => {
        b.textContent = "PENDING";
        b.style.backgroundColor = "var(--text-muted)";
      });

      updateNodeLabels();
      updateTrunksVisuals();
      updateCLI();
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
