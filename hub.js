/**
 * Choogle Application Hub — Core Logic (hub.js)
 * Live Search, Category Filtering, Favorites, Modals & Launcher
 */

'use strict';

const APPLICATIONS = [
  // ── GAMES & SIMULATIONS ──────────────────────────────────────
  {
    id: "chess",
    title: "ChessVault — Play & Review",
    name: "Chess",
    icon: "♟️",
    category: "games",
    categoryLabel: "Games & Sims",
    status: "Interactive Web App",
    statusType: "live",
    entry: "../chess/index.html",
    path: "projects/chess",
    badges: ["AI Minimax", "250+ Book Openings", "Move Review", "Accuracy Eval"],
    tags: ["chess", "grandmaster", "openings", "minimax", "board game", "eval bar"],
    description: "Play against Minimax AI from Beginner (800) to Grandmaster (2500 Elo). Includes live opening book theory detector and post-game accuracy review with centipawn loss graphs.",
    author: "Chase & Antigravity"
  },
  {
    id: "monopoly",
    title: "Monopoly — 3D Browser Board Game",
    name: "Monopoly",
    icon: "🎲",
    category: "games",
    categoryLabel: "Games & Sims",
    status: "Interactive Game",
    statusType: "interactive",
    entry: "../monopoly/index.html",
    path: "projects/monopoly",
    badges: ["3D Animated Dice", "Property Deeds", "Bank Ledger", "Multiplayer"],
    tags: ["monopoly", "board game", "dice", "finance", "real estate", "bank"],
    description: "Full-featured browser Monopoly board game featuring realistic physics 3D dice rolls, property deeds, mortgage system, bank ledger, player tokens, and real estate trading mechanics.",
    author: "Chase & Antigravity"
  },
  {
    id: "1stgrade",
    title: "1st Grade Learning & Typing Trainer",
    name: "1st Grade",
    icon: "🎒",
    category: "games",
    categoryLabel: "Games & Sims",
    status: "Educational Suite",
    statusType: "interactive",
    entry: "../1st grade learning/index.html",
    path: "projects/1st grade learning",
    badges: ["Typing Trainer", "Phonics Drills", "Audio SFX", "Keyboard Coach"],
    tags: ["typing", "phonics", "reading", "education", "elementary", "drills"],
    description: "Interactive educational exercises for young learners including elementary phonics drills, keyboard typing trainer, sound effects, and rewarding progress milestones.",
    author: "Chase & Antigravity"
  },
  {
    id: "screensaver",
    title: "Cosmic Cityscape Living Screensaver",
    name: "Screensaver",
    icon: "🌌",
    category: "games",
    categoryLabel: "Games & Sims",
    status: "Living Canvas",
    statusType: "live",
    entry: "../desktopscreensaver/Cosmic_Cityscape.html",
    path: "projects/desktopscreensaver",
    badges: ["Seasonal Modes", "Ken Burns Parallax", "Twinkling Stars", "Atmosphere"],
    tags: ["screensaver", "canvas", "cosmic", "ambient", "living background", "relax"],
    description: "Atmospheric cosmic cityscape living canvas screensavers rendered dynamically across seasons (Spring, Summer, Autumn, Winter, Rain) with interactive parallax tilt.",
    author: "Chase & Antigravity"
  },
  {
    id: "gamemods",
    title: "Game Modding Studio & Decompilation",
    name: "Game Mods",
    icon: "🎮",
    category: "games",
    categoryLabel: "Games & Sims",
    status: "Mod Suite",
    statusType: "utility",
    entry: "../game mods/n64 mods/tools/snowboardkids-decomp-main/tools/decompilation_summary/template.html",
    path: "projects/game mods",
    badges: ["N64 Decomp", "Snowboard Kids", "Sonic Mario Kart", "Audio ADX"],
    tags: ["mods", "n64", "decomp", "gamecube", "sonic", "mario kart", "rom"],
    description: "Nintendo 64 and GameCube modding suites, Snowboard Kids C decompilation progress viewer, Sonic Adventure DX audio replacements, and custom level editors.",
    author: "Chase & Antigravity"
  },

  // ── CYBERSECURITY & HARDENING ────────────────────────────────
  {
    id: "securityplus",
    title: "CompTIA Security+ SY0-701 Exam Simulator",
    name: "Security+",
    icon: "🛡️",
    category: "security",
    categoryLabel: "Cybersecurity",
    status: "Exam Simulator",
    statusType: "live",
    entry: "../comptia exam simulator/index.html",
    path: "projects/comptia exam simulator",
    badges: ["PBQ Engine", "Flashcard Vault", "Timed Mock Exams", "Domain Analytics"],
    tags: ["security+", "comptia", "sy0-701", "pbq", "exam", "cybersecurity", "flashcards"],
    description: "Comprehensive CompTIA Security+ SY0-701 certification simulator featuring realistic performance-based questions (PBQs), randomized question pools, and domain scoring.",
    author: "Chase & Antigravity"
  },
  {
    id: "sentinel",
    title: "Sentinel PC Security Guard & Auditor",
    name: "Sentinel",
    icon: "🛡️",
    category: "security",
    categoryLabel: "Cybersecurity",
    status: "Security Auditor",
    statusType: "live",
    entry: "../MY Security/wwwroot/index.html",
    path: "projects/MY Security",
    badges: ["Posture Score", "Remediation Drawer", "PowerShell Audits", "Hardening"],
    tags: ["sentinel", "security guard", "audit", "hardening", "vulnerability", "windows"],
    description: "Sentinel PC Security Guard & Auditor web dashboard with real-time security posture scoring, vulnerability remediation drawer, and PowerShell status collectors.",
    author: "Chase & Antigravity"
  },
  {
    id: "botfinder",
    title: "BotFinder & RageShield Social Intelligence",
    name: "BotFinder",
    icon: "🤖",
    category: "security",
    categoryLabel: "Cybersecurity",
    status: "Threat Intelligence",
    statusType: "live",
    entry: "../bot finder/dashboard/index.html",
    path: "projects/bot finder",
    badges: ["Ragebait Detector", "Profile Deep Scan", "Live Feed", "Extension"],
    tags: ["bot finder", "rageshield", "bot detection", "social media", "ai bots", "threat intel"],
    description: "Real-time social media bot & ragebait intelligence platform with live feed monitor, account profile deep scanner, and Chrome extension companion.",
    author: "Chase & Antigravity"
  },
  {
    id: "hackedout",
    title: "HackedOut — Global Breach & Cyber Radar",
    name: "HackedOut",
    icon: "🚨",
    category: "security",
    categoryLabel: "Cybersecurity",
    status: "Breach Radar",
    statusType: "live",
    entry: "hacked.html",
    path: "Choogle/hacked.html",
    badges: ["Active Attacks", "Ransomware Tracker", "CVE Radar", "Choogle Suite"],
    tags: ["hacked", "breach", "ransomware", "threat intel", "cve", "cyber attacks"],
    description: "Live cybersecurity attack radar tracking ongoing global corporate breaches, ransomware groups, leak sites, and critical zero-day vulnerability disclosures.",
    author: "Chase & Antigravity"
  },
  {
    id: "vulnguard",
    title: "VulnGuard Vulnerability Management MVC",
    name: "VulnGuard",
    icon: "🔒",
    category: "security",
    categoryLabel: "Cybersecurity",
    status: "Architecture App",
    statusType: "study",
    entry: "../vulnerability management/README.md",
    path: "projects/vulnerability management",
    badges: ["MVC Platform", "SQLite Backend", "Crypto Modules", "Hardening Scripts"],
    tags: ["vulnguard", "vulnerability", "patching", "mvc", "sqlite", "hardening"],
    description: "Vulnerability management MVC web application architecture with local SQLite database, cryptographic hashing tools, and automated system hardening routines.",
    author: "Chase & Antigravity"
  },
  {
    id: "studynotes",
    title: "Security+ Study Notes & Cheatsheets Hub",
    name: "Study Notes",
    icon: "📒",
    category: "security",
    categoryLabel: "Cybersecurity",
    status: "Reference Vault",
    statusType: "study",
    entry: "../note taker/README.md",
    path: "projects/note taker",
    badges: ["Security+ Cheatsheets", "Incident Response", "CLI Handbooks", "Markdown"],
    tags: ["notes", "cheatsheet", "study guide", "comptia", "cli", "incident response"],
    description: "Curated CompTIA Security+ SY0-701 and cybersecurity study notes library, incident response playbook steps, and terminal command reference sheets.",
    author: "Chase & Antigravity"
  },

  // ── AI, OPS & PRODUCTIVITY ──────────────────────────────────
  {
    id: "chai",
    title: "chAI — Intelligent Cyber Assistant",
    name: "chAI",
    icon: "🤖",
    category: "ai",
    categoryLabel: "AI & Productivity",
    status: "Choogle Suite",
    statusType: "live",
    entry: "chai.html",
    path: "Choogle/chai.html",
    badges: ["Conversational AI", "Retro Cyber Theme", "Audio Bleeps", "Code Assist"],
    tags: ["chai", "ai", "assistant", "chatbot", "chat", "cyberpunk", "prompting"],
    description: "Custom intelligent conversational assistant built into Choogle with retro cyber styling, rapid answers, and multi-domain problem solving capabilities.",
    author: "Chase & Antigravity"
  },
  {
    id: "aiops",
    title: "B2B AI Operations Engine & Document Reconciliation",
    name: "AI Ops",
    icon: "💼",
    category: "ai",
    categoryLabel: "AI & Productivity",
    status: "Commercial Engine",
    statusType: "live",
    entry: "../using ai agents for profit/static/index.html",
    path: "projects/using ai agents for profit",
    badges: ["Invoice Matching", "BOL Reconciliation", "KPI Dashboard", "Agent Workflow"],
    tags: ["ai ops", "reconciliation", "invoice", "bol", "b2b", "operations", "automation"],
    description: "Autonomous invoice and BOL document reconciliation engine with operations dashboard, KPI analytics summary, and automated mismatch detection.",
    author: "Chase & Antigravity"
  },
  {
    id: "isthisai",
    title: "Is This AI — Synthetic Content Scanner",
    name: "Is This AI",
    icon: "🔍",
    category: "ai",
    categoryLabel: "AI & Productivity",
    status: "Scanner Tool",
    statusType: "live",
    entry: "../is this AI/is this ai mobile/index.html",
    path: "projects/is this AI",
    badges: ["Mobile Optimized", "Perplexity Heuristics", "Pattern Analyzer"],
    tags: ["ai detector", "is this ai", "synthetic text", "scanner", "mobile", "detector"],
    description: "Mobile-optimized text analyzer inspecting written content for generative AI indicators, sentence perplexity shifts, and robotic syntax markers.",
    author: "Chase & Antigravity"
  },
  {
    id: "tasks",
    title: "Choogle Tasks — Kanban Board Workspace",
    name: "Tasks",
    icon: "📋",
    category: "ai",
    categoryLabel: "AI & Productivity",
    status: "Choogle Suite",
    statusType: "live",
    entry: "tasks.html",
    path: "Choogle/tasks.html",
    badges: ["Drag & Drop", "Local Persistence", "Cyber Scanlines", "Filter Tags"],
    tags: ["tasks", "kanban", "todo", "project management", "workflow", "board"],
    description: "Interactive drag-and-drop Kanban project workspace for organizing study objectives, tracking engineering milestones, and moving task states.",
    author: "Chase & Antigravity"
  },
  {
    id: "notepad",
    title: "Choogle Notepad — Cyber Scratchpad",
    name: "Notepad",
    icon: "📝",
    category: "ai",
    categoryLabel: "AI & Productivity",
    status: "Choogle Suite",
    statusType: "live",
    entry: "notepad.html",
    path: "Choogle/notepad.html",
    badges: ["Auto-Save", "Export .txt", "Distraction Free", "Word Counter"],
    tags: ["notepad", "notes", "editor", "scratchpad", "markdown", "writing"],
    description: "Lightweight, distraction-free notes studio and scratchpad with real-time word counting, automatic local saving, and dark cyber styling.",
    author: "Chase & Antigravity"
  },
  {
    id: "sandbox",
    title: "Antigravity Projects Sandbox Studio",
    name: "Sandbox",
    icon: "🧪",
    category: "ai",
    categoryLabel: "AI & Productivity",
    status: "Staging Testbed",
    statusType: "utility",
    entry: "../sandbox/index.html",
    path: "projects/sandbox",
    badges: ["Component Preview", "Diagnostic Lab", "Testbed Environment"],
    tags: ["sandbox", "testbed", "staging", "testing", "preview", "diagnostics"],
    description: "Centralized preview, diagnostic, and staging testbed environment for experimenting with and testing all Antigravity web components.",
    author: "Chase & Antigravity"
  },

  // ── IT CERTIFICATIONS & SYSTEMS ─────────────────────────────
  {
    id: "rhcsasim",
    title: "RHCSA Linux Terminal Practice Simulator",
    name: "RHCSA Sim",
    icon: "🐧",
    category: "systems",
    categoryLabel: "Systems & Linux",
    status: "Terminal Simulator",
    statusType: "live",
    entry: "../RHCSA Exam200/RHCSA_Terminal_Practice.html",
    path: "projects/RHCSA Exam200",
    badges: ["RHEL 9 CLI", "LVM & Storage", "User Permissions", "Timed Tasks"],
    tags: ["rhcsa", "linux", "terminal", "redhat", "rhel", "bash", "simulator", "ex200"],
    description: "Hands-on browser terminal simulator replicating Red Hat Certified System Administrator EX200 exam challenges, user management, and LVM storage.",
    author: "Chase & Antigravity"
  },
  {
    id: "rhcsacloud",
    title: "RHCSA Exam Quest — Cloud Learning Engine",
    name: "RHCSA Quest",
    icon: "🐧",
    category: "systems",
    categoryLabel: "Systems & Linux",
    status: "Cloud Exam Quest",
    statusType: "live",
    entry: "rhcsa.html",
    path: "Choogle/rhcsa.html",
    badges: ["Cloud Run Hosted", "Gamified Exam", "Scenario Labs", "RHEL 9"],
    tags: ["rhcsa", "cloud run", "quest", "redhat", "linux", "exam prep"],
    description: "Cloud-hosted RHEL 9 RHCSA Exam Quest with scenario-based troubleshooting labs, interactive knowledge checks, and exam readiness grading.",
    author: "Chase & Antigravity"
  },
  {
    id: "vmware",
    title: "VMware vSphere Infrastructure Prep Engine",
    name: "VMware Prep",
    icon: "🖥️",
    category: "systems",
    categoryLabel: "Systems & Linux",
    status: "Virtual Lab",
    statusType: "live",
    entry: "vmware.html",
    path: "Choogle/vmware.html",
    badges: ["vSphere 8", "ESXi Clustering", "vCenter Storage", "HA/DRS Lab"],
    tags: ["vmware", "vsphere", "esxi", "vcenter", "virtualization", "clustering"],
    description: "Interactive VMware vSphere 8 infrastructure training engine with storage policies, clustering, VM lifecycle management, and vCenter exercises.",
    author: "Chase & Antigravity"
  },
  {
    id: "ccna",
    title: "Cisco CCNA 200-301 Networking Lab Console",
    name: "CCNA Lab",
    icon: "🌐",
    category: "systems",
    categoryLabel: "Systems & Linux",
    status: "Networking Lab",
    statusType: "live",
    entry: "ccna.html",
    path: "Choogle/ccna.html",
    badges: ["Cisco IOS CLI", "Subnet Calculator", "VLANs & Trunks", "Routing Tables"],
    tags: ["ccna", "cisco", "networking", "subnetting", "vlans", "routing", "switch"],
    description: "Interactive Cisco CCNA 200-301 networking console simulator with live subnetting calculations, VLAN configuration, routing tables, and CLI drills.",
    author: "Chase & Antigravity"
  },
  {
    id: "powershell",
    title: "PowerShell Scripting & Administration Lab",
    name: "PowerShell",
    icon: "💻",
    category: "systems",
    categoryLabel: "Systems & Linux",
    status: "Admin Lab",
    statusType: "live",
    entry: "powershell.html",
    path: "Choogle/powershell.html",
    badges: ["PowerShell 7", "SysAdmin Scripts", "Cmdlet Reference", "WMI/CIM"],
    tags: ["powershell", "windows", "scripting", "sysadmin", "automation", "cmdlet"],
    description: "Interactive Windows PowerShell automation sandbox with script testing, cmdlet documentation, syntax highlighting, and administration scenarios.",
    author: "Chase & Antigravity"
  },
  {
    id: "dlm",
    title: "DLM Storage & Data Lifecycle Explorer",
    name: "DLM Storage",
    icon: "💾",
    category: "systems",
    categoryLabel: "Systems & Linux",
    status: "Storage Explorer",
    statusType: "live",
    entry: "dlm.html",
    path: "Choogle/dlm.html",
    badges: ["Data Lifecycle", "Tiering Policies", "Retention Rules", "Compliance"],
    tags: ["dlm", "storage", "data lifecycle", "tiering", "backup", "cloud storage"],
    description: "Data lifecycle management and tiering simulation tool demonstrating hot/cold storage transitions, retention compliance, and archive policies.",
    author: "Chase & Antigravity"
  },
  {
    id: "onestop",
    title: "OneStop Media Player & Screen Capture Server",
    name: "OneStop",
    icon: "🎬",
    category: "systems",
    categoryLabel: "Systems & Linux",
    status: "Media Server",
    statusType: "live",
    entry: "../onestop/index.html",
    path: "projects/onestop",
    badges: ["Local Streaming", "Screen Capture", "Video Player", "PowerShell Host"],
    tags: ["onestop", "media player", "video", "screen capture", "streaming", "server"],
    description: "PowerShell-backed local HTTP streaming server, screen capture viewer, and HTML5 video playback console for local recordings.",
    author: "Chase & Antigravity"
  },

  // ── UTILITIES, SEARCH & GUIDES ──────────────────────────────
  {
    id: "choogle",
    title: "Choogle — Flagship Web Search Engine",
    name: "Choogle",
    icon: "🔍",
    category: "utilities",
    categoryLabel: "Tools & Utilities",
    status: "Flagship Search",
    statusType: "live",
    entry: "index.html",
    path: "Choogle/index.html",
    badges: ["Voice Search", "Lens Vision", "Live Widgets", "Easter Eggs"],
    tags: ["choogle", "search", "google", "voice search", "lens", "calculator", "weather"],
    description: "Flagship Google replica search engine featuring speech-to-text recognition, computer vision Lens, custom calculators, weather, and instant project indexing.",
    author: "Chase & Antigravity"
  },
  {
    id: "deployhub",
    title: "Antigravity Deployment & Packaging Hub",
    name: "Deploy Hub",
    icon: "🚀",
    category: "utilities",
    categoryLabel: "Tools & Utilities",
    status: "Management Hub",
    statusType: "live",
    entry: "../deploy/index.html",
    path: "projects/deploy",
    badges: ["Auto Packager", "Zip Manager", "Healthcheck GUI", "Catalog JSON"],
    tags: ["deploy", "packaging", "zip", "maintenance", "routine", "diagnostics"],
    description: "Centralized catalog, zip packager, test suite runner, and healthcheck diagnostics manager for the entire Antigravity project ecosystem.",
    author: "Chase & Antigravity"
  },
  {
    id: "webstore",
    title: "Choogle Web Store — Extensions & Plugins",
    name: "Web Store",
    icon: "🛍️",
    category: "utilities",
    categoryLabel: "Tools & Utilities",
    status: "Choogle Suite",
    statusType: "live",
    entry: "webstore.html",
    path: "Choogle/webstore.html",
    badges: ["Browser Extensions", "Custom Themes", "Add-on Plugins", "Audio Packs"],
    tags: ["webstore", "extensions", "plugins", "themes", "store", "customization"],
    description: "Curated catalog of browser extensions, visual themes, custom tools, and audio feedback packs designed for Choogle and Antigravity.",
    author: "Chase & Antigravity"
  },
  {
    id: "outages",
    title: "Outages Radar — Live Infrastructure Monitor",
    name: "Outages",
    icon: "⚡",
    category: "utilities",
    categoryLabel: "Tools & Utilities",
    status: "Status Monitor",
    statusType: "live",
    entry: "outages.html",
    path: "Choogle/outages.html",
    badges: ["Cloud Services", "ISP Radar", "Live Ping Checks", "Interactive Map"],
    tags: ["outages", "down", "status", "aws", "cloudflare", "steam", "uptime"],
    description: "Real-time service availability and infrastructure outage tracker monitoring AWS, Cloudflare, Azure, Steam, Xbox, and global telecom networks.",
    author: "Chase & Antigravity"
  },
  {
    id: "zfold6",
    title: "Samsung Galaxy Z Fold 6 Master Guide",
    name: "Z Fold 6",
    icon: "📱",
    category: "utilities",
    categoryLabel: "Tools & Utilities",
    status: "Master Guide",
    statusType: "study",
    entry: "../zfold6 features/galaxy_z_fold_6_tips_and_tricks_guide.md",
    path: "projects/zfold6 features",
    badges: ["DeX Workflows", "Multitasking Labs", "S Pen Masterclass", "Galaxy AI"],
    tags: ["zfold6", "galaxy z fold", "fold 6", "samsung", "dex", "multitasking", "guide"],
    description: "Comprehensive master power-user guide and tips for Samsung Galaxy Z Fold 6 multitasking, DeX desktop workflows, and battery optimization.",
    author: "Chase & Antigravity"
  },
  {
    id: "personaltraining",
    title: "Personal Training Routines & Fitness Lab",
    name: "Fitness Lab",
    icon: "🏋️",
    category: "utilities",
    categoryLabel: "Tools & Utilities",
    status: "Fitness Companion",
    statusType: "study",
    entry: "../personal training/README.md",
    path: "projects/personal training",
    badges: ["Workout Routines", "Progress Tracker", "Training Labs", "Milestones"],
    tags: ["fitness", "workout", "training", "exercise", "progress", "health"],
    description: "Personal physical training routine planner, exercise progress trackers, and training milestone logs.",
    author: "Chase & Antigravity"
  },
  {
    id: "synergize",
    title: "Synergize & Pay Private Monetization Blueprint",
    name: "Synergize",
    icon: "💎",
    category: "utilities",
    categoryLabel: "Tools & Utilities",
    status: "Business Blueprint",
    statusType: "live",
    entry: "../synergize and pay/index.html",
    path: "projects/synergize and pay",
    badges: ["Tier Pricing", "Commercial Blueprint", "Portfolio Manifest"],
    tags: ["synergize", "monetization", "business", "pricing", "commercial", "manifest"],
    description: "Confidential portfolio manifest and monetization strategy interactive dashboard displaying pricing, tiers, and commercial blueprints.",
    author: "Chase & Antigravity"
  },
  {
    id: "screenreader",
    title: "Desktop Screen Reader & OCR Companion",
    name: "ScreenReader",
    icon: "👓",
    category: "utilities",
    categoryLabel: "Tools & Utilities",
    status: "Assistive Tool",
    statusType: "study",
    entry: "../screen reader/README.md",
    path: "projects/screen reader",
    badges: ["Desktop OCR", "Text-to-Speech", "Auto Page Turner", "Bookmarks"],
    tags: ["screen reader", "ocr", "tts", "accessibility", "audio reader", "page turner"],
    description: "Desktop OCR, automatic page-turner, and text-to-speech reading companion with bookmark manager.",
    author: "Chase & Antigravity"
  },
  {
    id: "aactalker",
    title: "Chance's AAC Talker — Assistive Speech Device",
    name: "AAC Talker",
    icon: "🗣️",
    category: "utilities",
    categoryLabel: "Tools & Utilities",
    status: "Cloud Run App",
    statusType: "live",
    entry: "https://chance-s-aac-talker-295027341949.us-east1.run.app",
    path: "Cloud Run / Assistive",
    badges: ["Speech Synthesizer", "High Contrast UI", "Accessible Touch"],
    tags: ["aac", "speech", "talker", "assistive", "voice", "accessibility"],
    description: "Accessible augmentative and alternative communication (AAC) speech synthesizer web application for tablets and touchscreens.",
    author: "Chase & Antigravity"
  }
];

// State
let currentCategory = "all";
let searchQuery = "";
let currentSort = "name-asc";
let starredAppIds = new Set();
let audioMuted = false;

// Audio synthesis helper for pleasant retro click sounds
function playAudioBlip(freq = 600, duration = 0.05, type = "sine") {
  if (audioMuted) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // AudioContext blocked or not supported
  }
}

// Load starred from localStorage
function loadStarred() {
  try {
    const saved = localStorage.getItem("choogle-hub-favorites");
    if (saved) {
      starredAppIds = new Set(JSON.parse(saved));
    }
  } catch (e) {
    starredAppIds = new Set();
  }
}

function saveStarred() {
  try {
    localStorage.setItem("choogle-hub-favorites", JSON.stringify([...starredAppIds]));
  } catch (e) {}
}

// Theme handling
function initTheme() {
  const saved = localStorage.getItem("choogle-theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("choogle-theme", next);
  updateThemeIcon(next);
  playAudioBlip(next === "dark" ? 400 : 800, 0.06);
}

function updateThemeIcon(theme) {
  const btn = document.getElementById("theme-toggle-btn");
  if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
}

// Stats Calculation
function updateStatsCounters() {
  const total = APPLICATIONS.length;
  const gamesCount = APPLICATIONS.filter(a => a.category === "games").length;
  const securityCount = APPLICATIONS.filter(a => a.category === "security").length;
  const aiCount = APPLICATIONS.filter(a => a.category === "ai").length;
  const systemsCount = APPLICATIONS.filter(a => a.category === "systems").length;
  const utilitiesCount = APPLICATIONS.filter(a => a.category === "utilities").length;
  const starredCount = starredAppIds.size;

  const statTotal = document.getElementById("stat-total");
  const statGames = document.getElementById("stat-games");
  const statSecurity = document.getElementById("stat-security");
  const statAi = document.getElementById("stat-ai");

  if (statTotal) statTotal.textContent = total;
  if (statGames) statGames.textContent = gamesCount;
  if (statSecurity) statSecurity.textContent = securityCount;
  if (statAi) statAi.textContent = aiCount;

  // Update Category Pill counts
  document.querySelectorAll(".cat-pill").forEach(pill => {
    const cat = pill.dataset.category;
    const countEl = pill.querySelector(".cat-count");
    if (!countEl) return;
    if (cat === "all") countEl.textContent = `(${total})`;
    else if (cat === "favorites") countEl.textContent = `(${starredCount})`;
    else if (cat === "games") countEl.textContent = `(${gamesCount})`;
    else if (cat === "security") countEl.textContent = `(${securityCount})`;
    else if (cat === "ai") countEl.textContent = `(${aiCount})`;
    else if (cat === "systems") countEl.textContent = `(${systemsCount})`;
    else if (cat === "utilities") countEl.textContent = `(${utilitiesCount})`;
  });
}

// Filter and Sort Applications
function getFilteredApps() {
  let list = APPLICATIONS.filter(app => {
    // Category filter
    if (currentCategory === "favorites") {
      if (!starredAppIds.has(app.id)) return false;
    } else if (currentCategory !== "all" && app.category !== currentCategory) {
      return false;
    }

    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = app.title.toLowerCase().includes(q);
      const matchName = app.name.toLowerCase().includes(q);
      const matchDesc = app.description.toLowerCase().includes(q);
      const matchTags = app.tags.some(t => t.toLowerCase().includes(q));
      const matchPath = app.path.toLowerCase().includes(q);
      const matchBadges = app.badges.some(b => b.toLowerCase().includes(q));
      return matchTitle || matchName || matchDesc || matchTags || matchPath || matchBadges;
    }
    return true;
  });

  // Sort
  list.sort((a, b) => {
    if (currentSort === "name-asc") return a.title.localeCompare(b.title);
    if (currentSort === "name-desc") return b.title.localeCompare(a.title);
    if (currentSort === "category") return a.category.localeCompare(b.category);
    return 0;
  });

  return list;
}

// Render Apps Grid
function renderApps() {
  const grid = document.getElementById("apps-grid");
  if (!grid) return;

  const apps = getFilteredApps();
  grid.innerHTML = "";

  if (apps.length === 0) {
    grid.innerHTML = `
      <div class="no-results-banner">
        <h3>🔍 No applications found</h3>
        <p>No projects match "${searchQuery}" in ${currentCategory.toUpperCase()}. Try checking spelling or selecting All.</p>
        <button class="btn-launch" style="margin-top:1.2rem;" onclick="resetFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  apps.forEach(app => {
    const isStarred = starredAppIds.has(app.id);
    const card = document.createElement("div");
    card.className = "app-card";
    card.dataset.id = app.id;

    // Badges HTML
    const badgesHtml = app.badges.map(b => `<span class="tag-pill">${b}</span>`).join("");

    card.innerHTML = `
      <div class="card-header">
        <div class="app-identity">
          <div class="app-card-icon">${app.icon}</div>
          <div class="app-title-group">
            <h3>${app.title}</h3>
            <span class="app-category-badge">${app.categoryLabel}</span>
          </div>
        </div>
        <div class="card-actions-top">
          <button class="star-btn ${isStarred ? 'starred' : ''}" data-id="${app.id}" title="${isStarred ? 'Remove from favorites' : 'Star as favorite'}">
            ${isStarred ? '★' : '☆'}
          </button>
        </div>
      </div>

      <div class="status-pill status-${app.statusType}">
        <span>●</span> ${app.status}
      </div>

      <p class="card-description">${app.description}</p>

      <div class="card-tags">
        ${badgesHtml}
      </div>

      <div class="card-footer">
        <code class="card-path-code" title="${app.path}">📁 ${app.path}</code>
        <div style="display:flex; gap:0.4rem;">
          <button class="btn-preview" data-id="${app.id}" title="Quick info & details">Preview</button>
          <a href="${app.entry}" target="_blank" class="btn-launch" title="Launch ${app.name} in browser">
            Launch 🚀
          </a>
        </div>
      </div>
    `;

    // Star Toggle
    const starBtn = card.querySelector(".star-btn");
    starBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleStar(app.id);
    });

    // Preview
    const prevBtn = card.querySelector(".btn-preview");
    prevBtn.addEventListener("click", () => {
      openPreviewModal(app);
    });

    grid.appendChild(card);
  });
}

function toggleStar(appId) {
  if (starredAppIds.has(appId)) {
    starredAppIds.delete(appId);
    playAudioBlip(320, 0.04);
  } else {
    starredAppIds.add(appId);
    playAudioBlip(780, 0.08);
  }
  saveStarred();
  updateStatsCounters();
  renderApps();
}

function resetFilters() {
  currentCategory = "all";
  searchQuery = "";
  const input = document.getElementById("search-field");
  if (input) input.value = "";
  document.querySelectorAll(".cat-pill").forEach(p => {
    p.classList.toggle("active", p.dataset.category === "all");
  });
  renderApps();
}

// Quick Preview Modal
function openPreviewModal(app) {
  const modal = document.getElementById("preview-modal");
  const title = document.getElementById("modal-title");
  const body = document.getElementById("modal-body");
  const launch = document.getElementById("modal-launch-btn");

  if (!modal || !body) return;

  title.innerHTML = `${app.icon} ${app.title}`;
  launch.href = app.entry;

  const isStarred = starredAppIds.has(app.id);

  body.innerHTML = `
    <div style="display: flex; gap: 1.25rem; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--hub-card-border);">
      <div class="app-card-icon" style="width: 68px; height: 68px; font-size: 2.4rem;">${app.icon}</div>
      <div>
        <h2 style="font-size: 1.4rem; font-weight: 800; letter-spacing: -0.02em;">${app.title}</h2>
        <div style="display: flex; gap: 0.6rem; align-items: center; margin-top: 0.3rem;">
          <span class="status-pill status-${app.statusType}">● ${app.status}</span>
          <span class="app-category-badge" style="margin: 0;">${app.categoryLabel}</span>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--hub-text-muted); margin-bottom: 0.4rem; font-family: var(--font-mono);">Overview</h4>
      <p style="font-size: 0.95rem; line-height: 1.6;">${app.description}</p>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--hub-text-muted); margin-bottom: 0.4rem; font-family: var(--font-mono);">Key Features & Architecture</h4>
      <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
        ${app.badges.map(b => `<span class="tag-pill" style="font-size: 0.8rem; padding: 0.25rem 0.6rem;">${b}</span>`).join("")}
      </div>
    </div>

    <div style="background: rgba(0, 0, 0, 0.04); padding: 1rem; border-radius: 12px; border: 1px solid var(--hub-card-border); font-family: var(--font-mono); font-size: 0.82rem;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
        <span style="color: var(--hub-text-muted);">Source Location:</span>
        <code>${app.path}</code>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: var(--hub-text-muted);">Target Entrypoint:</span>
        <code style="color: var(--c-tan);">${app.entry}</code>
      </div>
    </div>
  `;

  modal.classList.add("open");
  playAudioBlip(550, 0.04);
}

function closePreviewModal() {
  const modal = document.getElementById("preview-modal");
  if (modal) modal.classList.remove("open");
}

// Setup Event Listeners
function setupEvents() {
  // Theme toggle
  const themeBtn = document.getElementById("theme-toggle-btn");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  // Audio mute toggle
  const audioBtn = document.getElementById("audio-toggle-btn");
  if (audioBtn) {
    audioBtn.addEventListener("click", () => {
      audioMuted = !audioMuted;
      audioBtn.textContent = audioMuted ? "🔇" : "🔊";
      if (!audioMuted) playAudioBlip(650, 0.05);
    });
  }

  // Search input
  const searchInput = document.getElementById("search-field");
  const clearBtn = document.getElementById("clear-search-btn");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      if (clearBtn) clearBtn.style.display = searchQuery ? "block" : "none";
      renderApps();
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        searchQuery = "";
        clearBtn.style.display = "none";
        searchInput.focus();
        renderApps();
      });
    }
  }

  // Keyboard shortcut '/' to search
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchInput) {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
    if (e.key === "Escape") {
      closePreviewModal();
    }
  });

  // Category Pills
  document.querySelectorAll(".cat-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentCategory = pill.dataset.category;
      playAudioBlip(480, 0.04);
      renderApps();
    });
  });

  // Sort dropdown
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      renderApps();
    });
  }

  // Modal close
  const modal = document.getElementById("preview-modal");
  const modalClose = document.getElementById("modal-close-btn");
  if (modalClose) modalClose.addEventListener("click", closePreviewModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closePreviewModal();
    });
  }
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadStarred();
  updateStatsCounters();
  setupEvents();
  renderApps();
});
