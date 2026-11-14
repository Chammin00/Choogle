const SEARCH_DATA = {
  suggestions: [
    "choogle",
    "choogle translate",
    "weather today",
    "calculator online",
    "tic tac toe",
    "google replica project",
    "how does gravity work",
    "antigravity coding assistant",
    "gemini 3.5 flash",
    "cute cat pictures",
    "funny dog videos",
    "why is the sky blue",
    "javascript array methods",
    "who is chase",
    "do a barrel roll",
    "google gravity",
    "askew",
    "linux terminal",
    "steam app",
    "xbox app",
    "chess.com",
    "twitch streams",
    "youtube videos",
    "outages status",
    "is steam down",
    "cloudflare status",
    "at&t outage",
    "power outage map",
    "hacked status",
    "active cyber attacks",
    "ransomware breaches",
    "is jpmorgan hacked",
    "lockheed martin breach",
    "chai ai assistant",
    "chatbot",
    "ai help",
    "notepad editor",
    "notes workspace",
    "tasks kanban",
    "todo board",
    "webstore plugins",
    "extensions store",
    "install add-ons",
    "monopoly",
    "monopoly board game",
    "app hub",
    "apps hub",
    "application hub",
    "my applications",
    "projects hub"
  ],
  
  knowledgePanels: {
    "app hub": {
      title: "Choogle Application Hub",
      subtitle: "Universal Workspace Application & Project Launcher",
      description: "The Choogle Application Hub is the centralized launcher and discovery portal for all 33 web applications, games, cybersecurity suites, AI assistants, and IT labs created across Antigravity /projects.",
      attributes: {
        "Developer": "Chase & Antigravity Assistant",
        "Total Apps": "33 Interactive Projects",
        "Categories": "Games, Cybersecurity, AI & Ops, Linux Systems, Utilities",
        "Entrypoint": "hub.html"
      }
    },
    "application hub": {
      title: "Choogle Application Hub",
      subtitle: "Universal Workspace Application & Project Launcher",
      description: "The Choogle Application Hub is the centralized launcher and discovery portal for all 33 web applications, games, cybersecurity suites, AI assistants, and IT labs created across Antigravity /projects.",
      attributes: {
        "Developer": "Chase & Antigravity Assistant",
        "Total Apps": "33 Interactive Projects",
        "Categories": "Games, Cybersecurity, AI & Ops, Linux Systems, Utilities",
        "Entrypoint": "hub.html"
      }
    },
    "choogle": {
      title: "Choogle",
      subtitle: "Web Search Engine & Replica Project",
      description: "Choogle is a highly interactive, state-of-the-art replica of the classic Google Search engine. Developed as a demonstration of rich vanilla web development, it features full dark mode compatibility, speech-to-text voice recognition, simulated computer vision via Choogle Lens, and a variety of interactive web widgets.",
      attributes: {
        "Developer": "Chase & Antigravity Assistant",
        "Release Date": "July 24, 2026",
        "Written in": "HTML5, Vanilla CSS, Modern JavaScript",
        "Features": "Voice Search, Lens Search, Calculator, Weather, Tic Tac Toe, Custom Easter Eggs"
      }
    },
    "antigravity": {
      title: "Antigravity",
      subtitle: "AI Coding Assistant by Google DeepMind",
      description: "Antigravity is an advanced agentic AI developer designed by Google DeepMind. Equipped with capabilities for code understanding, complex system planning, and autonomous execution, Antigravity assists developers worldwide in building high-quality software solutions.",
      attributes: {
        "Developer": "Google DeepMind",
        "Affiliation": "Alphabet Inc.",
        "Focus Area": "Advanced Agentic Coding",
        "Capabilities": "Multi-file refactoring, planning, web search, code generation"
      }
    },
    "gemini": {
      title: "Gemini",
      subtitle: "Multimodal AI Model Family",
      description: "Gemini is a family of highly capable multimodal artificial intelligence models developed by Google. Ranging from Gemini Nano to Gemini Ultra and Gemini Flash, the models are trained to natively generalize across text, code, images, audio, and video.",
      attributes: {
        "Developer": "Google",
        "Initial Release": "December 6, 2023",
        "Model Types": "Flash, Pro, Ultra, Nano",
        "Parent Company": "Alphabet Inc."
      }
    },
    "chase": {
      title: "Chase",
      subtitle: "Full-Stack Developer & Tech Enthusiast",
      description: "Chase is the creator and user behind the Choogle project. Partnering with the Antigravity AI coding assistant, Chase explores modern frontend patterns, UI replicas, and advanced AI agent workflows.",
      attributes: {
        "Occupation": "Software Engineer",
        "Known for": "Choogle Search, Collaborating with Antigravity",
        "Current Workspace": "Choogle Repository"
      }
    },
    "chase webapps": {
      title: "Chase's Web Applications",
      subtitle: "Custom Interactive Utilities Portfolio",
      description: "A collection of web applications developed and configured by Chase. This portfolio contains the RHCSA Linux prep engine, the VMware vSphere environment virtual architecture simulator, and Chance's AAC communication speech board device.",
      attributes: {
        "Developer": "Chase",
        "RHCSA Prep Engine": "RHEL 9 Mock Exams & Tasks",
        "VMware Studio": "Virtual Nodes Lab Simulator",
        "AAC Talker": "Assistive Sound & Speech Board"
      }
    },
    "rhcsa": {
      title: "RHCSA Exam Quest Prep Engine",
      subtitle: "Red Hat Certified System Administrator Prep Tool",
      description: "An interactive, quest-based prep utility designed by Chase to help students prepare for Red Hat Enterprise Linux 9 system administration exams. Simulates system maintenance, root recovery, storage management, and network troubleshooting tasks.",
      attributes: {
        "Target Exam": "EX200 (RHEL 9)",
        "Platform": "Web (Google Cloud Run)",
        "Topics Covered": "Storage, Containers, Permissions, Systemd, AutoFS"
      }
    },
    "vmware": {
      title: "VMware Infrastructure Prep Engine",
      subtitle: "Virtualization Architecture Laboratory",
      description: "A cloud-based sandbox designed by Chase to simulate VMware vSphere configurations. Users can set up datastores, virtual distributed switches (VDS), ESXi host assignments, and test cluster failover mechanics.",
      attributes: {
        "Focus Areas": "vSphere 8, ESXi, vCenter Server",
        "Lab Simulators": "Host Clustering, Datastore Allocation",
        "Technology": "React & AI Studio"
      }
    },
    "aac": {
      title: "Chance's AAC Talker",
      subtitle: "Assistive Speech & Communication Board",
      description: "An augmentative and alternative communication (AAC) speech board application configured by Chase. Designed to assist users in communicating thoughts and expressions through clear audio buttons and sentence constructions.",
      attributes: {
        "Type": "Augmentative Communication Tool",
        "Features": "Predefined Speech Buttons, Category Filters, Sound Synthesizer",
        "Platform": "Web (Google Cloud Run)"
      }
    },
    "monopoly": {
      title: "Monopoly",
      subtitle: "Interactive Web Board Game",
      description: "A full-featured digital edition of the classic Monopoly board game built for modern web browsers. Includes real estate purchasing, mortgaging, houses, hotels, chance cards, and automated bank accounting.",
      attributes: {
        "Genre": "Turn-based Board Game",
        "Players": "Multiplayer & AI Opponents",
        "Platform": "Browser (HTML5/CSS3/JavaScript)",
        "Features": "Property Trading, Dice Rolling, Jail Mechanics, Bankruptcy Tracking"
      }
    }
  },

  results: {
    "choogle": [
      {
        title: "Choogle - Search Engine Replica",
        url: "https://choogle.dev",
        displayedUrl: "https://choogle.dev",
        snippet: "Experience the ultimate Google Search clone. Search the web, customize settings, toggle dark mode, and play mini-games right in the search engine interfaces."
      },
      {
        title: "Choogle Open Source Code - GitHub",
        url: "https://github.com/chase/choogle",
        displayedUrl: "https://github.com/ › chase › choogle",
        snippet: "A vanilla HTML/CSS/JS recreation of Google Search. Star this project, contribute to the interactive widgets, or host your own version of Choogle."
      },
      {
        title: "How I Built Choogle in 24 Hours",
        url: "https://medium.com/tech/building-choogle-replica",
        displayedUrl: "https://medium.com › tech › building-choogle-replica",
        snippet: "A breakdown of the architecture, design choices, and CSS trickery used to create a pixel-perfect replica of the worlds most famous search homepage."
      }
    ],
    "antigravity": [
      {
        title: "Antigravity Coding Assistant - Google DeepMind",
        url: "https://deepmind.google/technologies/antigravity",
        displayedUrl: "https://deepmind.google › technologies › antigravity",
        snippet: "Introducing Antigravity, our next-generation AI coding agent. Discover how it uses advanced planning and multi-step reasoning to build complete web applications."
      },
      {
        title: "Antigravity IDE & SDK Documentation",
        url: "https://developers.google.com/antigravity",
        displayedUrl: "https://developers.google.com › antigravity",
        snippet: "Learn how to configure the Antigravity SDK, write custom plugins, define specialized subagents, and use slash commands like /goal and /schedule."
      }
    ],
    "gemini": [
      {
        title: "Google Gemini - Official Website",
        url: "https://gemini.google.com",
        displayedUrl: "https://gemini.google.com",
        snippet: "Chat with Gemini to supercharge your ideas. Write, plan, learn, and more with Google's direct portal to its family of advanced AI models."
      },
      {
        title: "Gemini API Overview | Google AI for Developers",
        url: "https://ai.google.dev/gemini-api",
        displayedUrl: "https://ai.google.dev › gemini-api",
        snippet: "Access the Gemini API to integrate multimodal capabilities into your applications. View SDKs for Python, JavaScript, Swift, and Go."
      }
    ],
    "linux terminal": [
      {
        title: "Linux Terminal Simulator - Interactive Bash Console",
        url: "https://choogle.dev/terminal",
        displayedUrl: "https://choogle.dev › terminal",
        snippet: "Run terminal commands directly in your browser. Play with basic utilities, view file contents, run mock hacker animations, and learn shell commands."
      }
    ],
    "steam": [
      {
        title: "Steam Store - Featured Game Releases & Catalog",
        url: "https://store.steampowered.com",
        displayedUrl: "https://store.steampowered.com",
        snippet: "Steam is the ultimate destination for playing, discussing, and creating games. Discover featured releases and community pages."
      }
    ],
    "xbox": [
      {
        title: "Xbox Official Site: Consoles, Games, and Community",
        url: "https://www.xbox.com",
        displayedUrl: "https://www.xbox.com",
        snippet: "Experience the new generation of games and entertainment with Xbox. Play Xbox games on your console, PC, or mobile device with Xbox Game Pass."
      }
    ],
    "chess": [
      {
        title: "Chess.com - Play Chess Online - Free Games",
        url: "https://www.chess.com",
        displayedUrl: "https://www.chess.com",
        snippet: "Play chess online for free against computer engines or real opponents. Solve chess puzzles, study strategies, and read chess news."
      }
    ],
    "twitch": [
      {
        title: "Twitch - Live Game Streaming & Esports Channels",
        url: "https://www.twitch.tv",
        displayedUrl: "https://www.twitch.tv",
        snippet: "Twitch is the world's leading live streaming platform for gamers and the public. Watch live streams, discuss, and chat with creators."
      }
    ],
    "youtube": [
      {
        title: "YouTube - Share Your Videos with the World",
        url: "https://www.youtube.com",
        displayedUrl: "https://www.youtube.com",
        snippet: "Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube."
      }
    ],
    "outages": [
      {
        title: "OutagePulse - Real-time Network & Power Outage Dashboard",
        url: "outages.html",
        displayedUrl: "outages.html",
        snippet: "Check real-time network, gaming, telecom, and power grid status. Report issues locally and view state/city based outages map."
      }
    ],
    "at&t down": [
      {
        title: "AT&T Outage Map & Customer Reports | OutagePulse",
        url: "outages.html?q=at%26t",
        displayedUrl: "outages.html?q=at&t",
        snippet: "View active fiber cut reports, cell tower outages, and broadband status maps for AT&T services on OutagePulse."
      }
    ],
    "is steam down": [
      {
        title: "Steam Status - Is Steam Down right now? | OutagePulse",
        url: "outages.html?q=steam",
        displayedUrl: "outages.html?q=steam",
        snippet: "Check Steam community server status, matchmaking, and shop login reports. View global and regional outage status."
      }
    ],
    "rhcsa": [
      {
        title: "RHEL 9 RHCSA Exam Quest Prep Engine",
        url: "https://rhel-9-rhcsa-exam-quest-511593565817.us-east1.run.app",
        displayedUrl: "https://rhel-9-rhcsa-exam-quest-511593565817.us-east1.run.app",
        snippet: "Prepare for your Red Hat Certified System Administrator exam with this comprehensive interactive quest engine. Features mock exams, task tracking, and command-line diagnostics."
      }
    ],
    "vmware": [
      {
        title: "VMware Infrastructure Prep Engine | Virtualization Lab Studio",
        url: "https://cham-vmware-infrastructure-prep-engine.ai.studio",
        displayedUrl: "https://cham-vmware-infrastructure-prep-engine.ai.studio",
        snippet: "A high-fidelity VMware infrastructure laboratory prep engine designed to simulate vSphere environment configs, virtual networking setups, and storage cluster diagnostics."
      }
    ],
    "ccna": [
      {
        title: "Cisco CCNA Networking Lab - IOS CLI Console",
        url: "ccna.html",
        displayedUrl: "ccna.html",
        snippet: "Simulate Cisco IOS routing architectures. Practice terminal setups, toggle interface link states, and compute networks using the subnet calculator."
      }
    ],
    "dlm": [
      {
        title: "Data Lifecycle Management (DLM) Compliance Console",
        url: "dlm.html",
        displayedUrl: "dlm.html",
        snippet: "Classify database records (PHI/PCI), configure hot/cold storage retention duration thresholds, and toggle cryptographic disk shredding policies."
      }
    ],
    "powershell": [
      {
        title: "Windows PowerShell Scripting Terminal - Practice Console",
        url: "powershell.html",
        displayedUrl: "powershell.html",
        snippet: "Execute cmdlets in an interactive PowerShell console environment. Complete loop scripts to monitor and start stopped services."
      }
    ],
    "aac": [
      {
        title: "Chance's AAC Talker - Augmentative and Alternative Communication Board",
        url: "https://chance-s-aac-talker-295027341949.us-east1.run.app",
        displayedUrl: "https://chance-s-aac-talker-295027341949.us-east1.run.app",
        snippet: "An interactive assistive speech device simulator that allows users to communicate thoughts and sentences through predefined sound buttons and customizable vocabulary arrays."
      }
    ],
    "chai": [
      {
        title: "chAI — Personal AI Assistant | Powered by Google Gemini",
        url: "chai.html",
        displayedUrl: "chai.html",
        snippet: "Your personal AI chatbot built into the Choogle ecosystem. Ask questions, get coding help, study for CCNA, RHCSA, and VMware certifications — powered by Google Gemini."
      }
    ],
    "ai assistant": [
      {
        title: "chAI — Personal AI Assistant | Powered by Google Gemini",
        url: "chai.html",
        displayedUrl: "chai.html",
        snippet: "Chat with chAI, your personal AI assistant. Get real-time answers, coding help, and IT infrastructure guidance powered by Google Gemini's latest models."
      }
    ],
    "notes": [
      {
        title: "Choogle Notepad — Personal Notebook Workspace",
        url: "notepad.html",
        displayedUrl: "notepad.html",
        snippet: "Write persistent notes, auto-save to browser local storage, format with markdown, and download backup files locally."
      }
    ],
    "notepad": [
      {
        title: "Choogle Notepad — Personal Notebook Workspace",
        url: "notepad.html",
        displayedUrl: "notepad.html",
        snippet: "Write persistent notes, auto-save to browser local storage, format with markdown, and download backup files locally."
      }
    ],
    "tasks": [
      {
        title: "Choogle Tasks — Kanban Board Workspace",
        url: "tasks.html",
        displayedUrl: "tasks.html",
        snippet: "Manage and prioritize tasks, organize study objectives, and track projects using an interactive kanban board workspace."
      }
    ],
    "kanban": [
      {
        title: "Choogle Tasks — Kanban Board Workspace",
        url: "tasks.html",
        displayedUrl: "tasks.html",
        snippet: "Manage and prioritize tasks, organize study objectives, and track projects using an interactive kanban board workspace."
      }
    ],
    "store": [
      {
        title: "Choogle Web Store — Extensions & Plugins",
        url: "webstore.html",
        displayedUrl: "webstore.html",
        snippet: "Customize your search experience. Browse, install, and configure mock extensions like AdBlock Choogle, floating chat bubbles, and telemetry trackers."
      }
    ],
    "plugins": [
      {
        title: "Choogle Web Store — Extensions & Plugins",
        url: "webstore.html",
        displayedUrl: "webstore.html",
        snippet: "Customize your search experience. Browse, install, and configure mock extensions like AdBlock Choogle, floating chat bubbles, and telemetry trackers."
      }
    ],
    "extensions": [
      {
        title: "Choogle Web Store — Extensions & Plugins",
        url: "webstore.html",
        displayedUrl: "webstore.html",
        snippet: "Customize your search experience. Browse, install, and configure mock extensions like AdBlock Choogle, floating chat bubbles, and telemetry trackers."
      }
    ],
    "deploy": [
      {
        title: "Antigravity Deployment Hub & Project Catalog",
        url: "../deploy/index.html",
        displayedUrl: "deploy/index.html",
        snippet: "Centralized Antigravity deployment hub with live health checks, project packaging, completed webapp launchers, and active development tracking."
      }
    ],
    "projects": [
      {
        title: "Antigravity Projects & Deployment Hub",
        url: "../deploy/index.html",
        displayedUrl: "deploy/index.html",
        snippet: "Browse all 16 Antigravity projects: launch completed web apps (CompTIA Exam Simulator, Chess, 1st Grade Learning, BotFinder, AI Operations) or track Development in Progress."
      }
    ],
        "sentinel": [
      {
        title: "Sentinel PC Security Guard & Auditor",
        url: "../MY Security/wwwroot/index.html",
        displayedUrl: "../MY Security/wwwroot/index.html",
        snippet: "Sentinel PC Security Guard & Auditor web dashboard with real-time security score, vulnerability remediation drawer, and PowerShell status collectors."
      }
    ],
    "my security": [
      {
        title: "Sentinel PC Security Guard & Auditor",
        url: "../MY Security/wwwroot/index.html",
        displayedUrl: "../MY Security/wwwroot/index.html",
        snippet: "Sentinel PC Security Guard & Auditor web dashboard with real-time security score, vulnerability remediation drawer, and PowerShell status collectors."
      }
    ],
    "pc security": [
      {
        title: "Sentinel PC Security Guard & Auditor",
        url: "../MY Security/wwwroot/index.html",
        displayedUrl: "../MY Security/wwwroot/index.html",
        snippet: "Sentinel PC Security Guard & Auditor web dashboard with real-time security score, vulnerability remediation drawer, and PowerShell status collectors."
      }
    ],
    "audit": [
      {
        title: "Sentinel PC Security Guard & Auditor",
        url: "../MY Security/wwwroot/index.html",
        displayedUrl: "../MY Security/wwwroot/index.html",
        snippet: "Sentinel PC Security Guard & Auditor web dashboard with real-time security score, vulnerability remediation drawer, and PowerShell status collectors."
      }
    ],
    "screensaver": [
      {
        title: "Cosmic Cityscape Interactive Screensaver",
        url: "../desktopscreensaver/Cosmic_Cityscape.html",
        displayedUrl: "../desktopscreensaver/Cosmic_Cityscape.html",
        snippet: "Atmospheric cosmic cityscape canvas screensavers rendered dynamically across seasons (Spring, Summer, Autumn, Winter, Rain)."
      }
    ],
    "cosmic cityscape": [
      {
        title: "Cosmic Cityscape Interactive Screensaver",
        url: "../desktopscreensaver/Cosmic_Cityscape.html",
        displayedUrl: "../desktopscreensaver/Cosmic_Cityscape.html",
        snippet: "Atmospheric cosmic cityscape canvas screensavers rendered dynamically across seasons (Spring, Summer, Autumn, Winter, Rain)."
      }
    ],
    "ambient": [
      {
        title: "Cosmic Cityscape Interactive Screensaver",
        url: "../desktopscreensaver/Cosmic_Cityscape.html",
        displayedUrl: "../desktopscreensaver/Cosmic_Cityscape.html",
        snippet: "Atmospheric cosmic cityscape canvas screensavers rendered dynamically across seasons (Spring, Summer, Autumn, Winter, Rain)."
      }
    ],
    "1st grade": [
      {
        title: "1st Grade Learning & Typing Trainer",
        url: "../1st grade learning/index.html",
        displayedUrl: "../1st grade learning/index.html",
        snippet: "Interactive educational exercises for young learners including elementary phonics drills and keyboard typing trainer."
      }
    ],
    "typing trainer": [
      {
        title: "1st Grade Learning & Typing Trainer",
        url: "../1st grade learning/index.html",
        displayedUrl: "../1st grade learning/index.html",
        snippet: "Interactive educational exercises for young learners including elementary phonics drills and keyboard typing trainer."
      }
    ],
    "phonics": [
      {
        title: "1st Grade Learning & Typing Trainer",
        url: "../1st grade learning/index.html",
        displayedUrl: "../1st grade learning/index.html",
        snippet: "Interactive educational exercises for young learners including elementary phonics drills and keyboard typing trainer."
      }
    ],
    "learning": [
      {
        title: "1st Grade Learning & Typing Trainer",
        url: "../1st grade learning/index.html",
        displayedUrl: "../1st grade learning/index.html",
        snippet: "Interactive educational exercises for young learners including elementary phonics drills and keyboard typing trainer."
      }
    ],
    "rhcsa practice": [
      {
        title: "RHCSA Linux Terminal Practice Simulator",
        url: "../RHCSA Exam200/RHCSA_Terminal_Practice.html",
        displayedUrl: "../RHCSA Exam200/RHCSA_Terminal_Practice.html",
        snippet: "Red Hat Certified System Administrator study suite with interactive browser terminal practice simulator."
      }
    ],
    "terminal simulator": [
      {
        title: "RHCSA Linux Terminal Practice Simulator",
        url: "../RHCSA Exam200/RHCSA_Terminal_Practice.html",
        displayedUrl: "../RHCSA Exam200/RHCSA_Terminal_Practice.html",
        snippet: "Red Hat Certified System Administrator study suite with interactive browser terminal practice simulator."
      }
    ],
    "rhcsa sim": [
      {
        title: "RHCSA Linux Terminal Practice Simulator",
        url: "../RHCSA Exam200/RHCSA_Terminal_Practice.html",
        displayedUrl: "../RHCSA Exam200/RHCSA_Terminal_Practice.html",
        snippet: "Red Hat Certified System Administrator study suite with interactive browser terminal practice simulator."
      }
    ],
    "vulnguard": [
      {
        title: "VulnGuard Vulnerability Management MVC Web App",
        url: "../vulnerability management/README.md",
        displayedUrl: "../vulnerability management/README.md",
        snippet: "VulnGuard vulnerability management MVC web app with SQLite database, hardening services, and crypto tools."
      }
    ],
    "vulnerability management": [
      {
        title: "VulnGuard Vulnerability Management MVC Web App",
        url: "../vulnerability management/README.md",
        displayedUrl: "../vulnerability management/README.md",
        snippet: "VulnGuard vulnerability management MVC web app with SQLite database, hardening services, and crypto tools."
      }
    ],
    "vuln": [
      {
        title: "VulnGuard Vulnerability Management MVC Web App",
        url: "../vulnerability management/README.md",
        displayedUrl: "../vulnerability management/README.md",
        snippet: "VulnGuard vulnerability management MVC web app with SQLite database, hardening services, and crypto tools."
      }
    ],
    "bot finder": [
      {
        title: "BotFinder & RageShield Social Media Intelligence",
        url: "../bot finder/dashboard/index.html",
        displayedUrl: "../bot finder/dashboard/index.html",
        snippet: "Real-time social media bot & ragebait intelligence platform with live feed monitor, profile deep scan, and Chrome extension."
      }
    ],
    "rageshield": [
      {
        title: "BotFinder & RageShield Social Media Intelligence",
        url: "../bot finder/dashboard/index.html",
        displayedUrl: "../bot finder/dashboard/index.html",
        snippet: "Real-time social media bot & ragebait intelligence platform with live feed monitor, profile deep scan, and Chrome extension."
      }
    ],
    "bot detection": [
      {
        title: "BotFinder & RageShield Social Media Intelligence",
        url: "../bot finder/dashboard/index.html",
        displayedUrl: "../bot finder/dashboard/index.html",
        snippet: "Real-time social media bot & ragebait intelligence platform with live feed monitor, profile deep scan, and Chrome extension."
      }
    ],
    "comptia": [
      {
        title: "CompTIA Security+ SY0-701 Exam Simulator",
        url: "../comptia exam simulator/index.html",
        displayedUrl: "../comptia exam simulator/index.html",
        snippet: "Comprehensive CompTIA Security+ SY0-701 exam simulator with practice engines, PBQ engine, flashcards, and mock exam PDFs."
      }
    ],
    "security+": [
      {
        title: "CompTIA Security+ SY0-701 Exam Simulator",
        url: "../comptia exam simulator/index.html",
        displayedUrl: "../comptia exam simulator/index.html",
        snippet: "Comprehensive CompTIA Security+ SY0-701 exam simulator with practice engines, PBQ engine, flashcards, and mock exam PDFs."
      }
    ],
    "exam simulator": [
      {
        title: "CompTIA Security+ SY0-701 Exam Simulator",
        url: "../comptia exam simulator/index.html",
        displayedUrl: "../comptia exam simulator/index.html",
        snippet: "Comprehensive CompTIA Security+ SY0-701 exam simulator with practice engines, PBQ engine, flashcards, and mock exam PDFs."
      }
    ],
    "pbq": [
      {
        title: "CompTIA Security+ SY0-701 Exam Simulator",
        url: "../comptia exam simulator/index.html",
        displayedUrl: "../comptia exam simulator/index.html",
        snippet: "Comprehensive CompTIA Security+ SY0-701 exam simulator with practice engines, PBQ engine, flashcards, and mock exam PDFs."
      }
    ],
    "ai agents": [
      {
        title: "B2B AI Operations Engine & Document Reconciliation",
        url: "../using ai agents for profit/static/index.html",
        displayedUrl: "../using ai agents for profit/static/index.html",
        snippet: "Autonomous invoice and BOL reconciliation engine with interactive operations dashboard, KPI analytics summary, and demo data generator."
      }
    ],
    "operations engine": [
      {
        title: "B2B AI Operations Engine & Document Reconciliation",
        url: "../using ai agents for profit/static/index.html",
        displayedUrl: "../using ai agents for profit/static/index.html",
        snippet: "Autonomous invoice and BOL reconciliation engine with interactive operations dashboard, KPI analytics summary, and demo data generator."
      }
    ],
    "reconciliation": [
      {
        title: "B2B AI Operations Engine & Document Reconciliation",
        url: "../using ai agents for profit/static/index.html",
        displayedUrl: "../using ai agents for profit/static/index.html",
        snippet: "Autonomous invoice and BOL reconciliation engine with interactive operations dashboard, KPI analytics summary, and demo data generator."
      }
    ],
    "invoice": [
      {
        title: "B2B AI Operations Engine & Document Reconciliation",
        url: "../using ai agents for profit/static/index.html",
        displayedUrl: "../using ai agents for profit/static/index.html",
        snippet: "Autonomous invoice and BOL reconciliation engine with interactive operations dashboard, KPI analytics summary, and demo data generator."
      }
    ],
    "onestop": [
      {
        title: "OneStop Media Player & Capture Server",
        url: "../onestop/index.html",
        displayedUrl: "../onestop/index.html",
        snippet: "PowerShell-backed local HTTP streaming server, screen capture viewer, and video player."
      }
    ],
    "media server": [
      {
        title: "OneStop Media Player & Capture Server",
        url: "../onestop/index.html",
        displayedUrl: "../onestop/index.html",
        snippet: "PowerShell-backed local HTTP streaming server, screen capture viewer, and video player."
      }
    ],
    "video player": [
      {
        title: "OneStop Media Player & Capture Server",
        url: "../onestop/index.html",
        displayedUrl: "../onestop/index.html",
        snippet: "PowerShell-backed local HTTP streaming server, screen capture viewer, and video player."
      }
    ],
    "screen reader": [
      {
        title: "Screen Reader Desktop OCR & TTS Companion",
        url: "../screen reader/README.md",
        displayedUrl: "../screen reader/README.md",
        snippet: "Desktop OCR, automatic page-turner, and text-to-speech reading companion with bookmark manager."
      }
    ],
    "ocr": [
      {
        title: "Screen Reader Desktop OCR & TTS Companion",
        url: "../screen reader/README.md",
        displayedUrl: "../screen reader/README.md",
        snippet: "Desktop OCR, automatic page-turner, and text-to-speech reading companion with bookmark manager."
      }
    ],
    "tts": [
      {
        title: "Screen Reader Desktop OCR & TTS Companion",
        url: "../screen reader/README.md",
        displayedUrl: "../screen reader/README.md",
        snippet: "Desktop OCR, automatic page-turner, and text-to-speech reading companion with bookmark manager."
      }
    ],
    "page turner": [
      {
        title: "Screen Reader Desktop OCR & TTS Companion",
        url: "../screen reader/README.md",
        displayedUrl: "../screen reader/README.md",
        snippet: "Desktop OCR, automatic page-turner, and text-to-speech reading companion with bookmark manager."
      }
    ],
    "synergize": [
      {
        title: "Synergize & Pay Private Monetization Blueprint",
        url: "../synergize and pay/index.html",
        displayedUrl: "../synergize and pay/index.html",
        snippet: "Confidential portfolio manifest and monetization strategy interactive dashboard displaying pricing, tiers, and commercial blueprints."
      }
    ],
    "monetization": [
      {
        title: "Synergize & Pay Private Monetization Blueprint",
        url: "../synergize and pay/index.html",
        displayedUrl: "../synergize and pay/index.html",
        snippet: "Confidential portfolio manifest and monetization strategy interactive dashboard displaying pricing, tiers, and commercial blueprints."
      }
    ],
    "portfolio manifest": [
      {
        title: "Synergize & Pay Private Monetization Blueprint",
        url: "../synergize and pay/index.html",
        displayedUrl: "../synergize and pay/index.html",
        snippet: "Confidential portfolio manifest and monetization strategy interactive dashboard displaying pricing, tiers, and commercial blueprints."
      }
    ],
    "zfold6": [
      {
        title: "Samsung Galaxy Z Fold 6 Master Guide",
        url: "../zfold6 features/galaxy_z_fold_6_tips_and_tricks_guide.md",
        displayedUrl: "../zfold6 features/galaxy_z_fold_6_tips_and_tricks_guide.md",
        snippet: "Comprehensive master power-user guide and tips for Samsung Galaxy Z Fold 6 multitasking, DeX mode, and Galaxy AI tools."
      }
    ],
    "galaxy z fold": [
      {
        title: "Samsung Galaxy Z Fold 6 Master Guide",
        url: "../zfold6 features/galaxy_z_fold_6_tips_and_tricks_guide.md",
        displayedUrl: "../zfold6 features/galaxy_z_fold_6_tips_and_tricks_guide.md",
        snippet: "Comprehensive master power-user guide and tips for Samsung Galaxy Z Fold 6 multitasking, DeX mode, and Galaxy AI tools."
      }
    ],
    "fold 6": [
      {
        title: "Samsung Galaxy Z Fold 6 Master Guide",
        url: "../zfold6 features/galaxy_z_fold_6_tips_and_tricks_guide.md",
        displayedUrl: "../zfold6 features/galaxy_z_fold_6_tips_and_tricks_guide.md",
        snippet: "Comprehensive master power-user guide and tips for Samsung Galaxy Z Fold 6 multitasking, DeX mode, and Galaxy AI tools."
      }
    ],
    "note taker": [
      {
        title: "Study Notes Hub & Cheatsheet Library",
        url: "../note taker/README.md",
        displayedUrl: "../note taker/README.md",
        snippet: "CompTIA Security+ SY0-701 study notes, cheatsheets, and session documentation."
      }
    ],
    "study notes": [
      {
        title: "Study Notes Hub & Cheatsheet Library",
        url: "../note taker/README.md",
        displayedUrl: "../note taker/README.md",
        snippet: "CompTIA Security+ SY0-701 study notes, cheatsheets, and session documentation."
      }
    ],
    "security+ notes": [
      {
        title: "Study Notes Hub & Cheatsheet Library",
        url: "../note taker/README.md",
        displayedUrl: "../note taker/README.md",
        snippet: "CompTIA Security+ SY0-701 study notes, cheatsheets, and session documentation."
      }
    ],
    "monopoly": [
      {
        title: "Monopoly - Interactive Browser Board Game",
        url: "../monopoly/index.html",
        displayedUrl: "choogle.dev › monopoly",
        snippet: "Interactive browser Monopoly board game featuring animated dice rolls, property deeds, bank ledger, player tokens, and real estate trading mechanics."
      }
    ],
    "monopoly board game": [
      {
        title: "Monopoly - Interactive Browser Board Game",
        url: "../monopoly/index.html",
        displayedUrl: "choogle.dev › monopoly",
        snippet: "Interactive browser Monopoly board game featuring animated dice rolls, property deeds, bank ledger, player tokens, and real estate trading mechanics."
      }
    ],
    "sandbox": [
      {
        title: "Antigravity Projects Sandbox Studio",
        url: "../sandbox/index.html",
        displayedUrl: "choogle.dev › sandbox",
        snippet: "Centralized preview, diagnostic, and staging testbed environment for all Antigravity projects."
      }
    ],
        "personal training": [
      {
        title: "personal training",
        url: "../personal training/README.md",
        displayedUrl: "../personal training/README.md",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "is this ai": [
      {
        title: "is this AI",
        url: "../is this AI/is this ai mobile/index.html",
        displayedUrl: "../is this AI/is this ai mobile/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "game mods": [
      {
        title: "game mods",
        url: "../game mods/n64 mods/tools/snowboardkids-decomp-main/tools/decompilation_summary/template.html",
        displayedUrl: "../game mods/n64 mods/tools/snowboardkids-decomp-main/tools/decompilation_summary/template.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "google drive organizer": [
      {
        title: "google drive organizer",
        url: "../google drive organizer/public/index.html",
        displayedUrl: "../google drive organizer/public/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "email organizer": [
      {
        title: "email organizer",
        url: "../email organizer/README.md",
        displayedUrl: "../email organizer/README.md",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
    "game studio": [
      {
        title: "game studio",
        url: "../game studio/paper_ronin_expedition/index.html",
        displayedUrl: "../game studio/paper_ronin_expedition/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "automate my day": [
      {
        title: "automate my day",
        url: "../automate my day/README.md",
        displayedUrl: "../automate my day/README.md",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
    "portfolio": [
      {
        title: "portfolio",
        url: "../portfolio/index.html",
        displayedUrl: "../portfolio/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "vr creation apps": [
      {
        title: "VR creation apps",
        url: "../VR creation apps/index.html",
        displayedUrl: "../VR creation apps/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
    "how to train your ai": [
      {
        title: "How to train your AI",
        url: "../How to train your AI/README.md",
        displayedUrl: "../How to train your AI/README.md",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
    "3d images": [
      {
        title: "3d images",
        url: "../3d images/index.html",
        displayedUrl: "../3d images/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "personal assistant": [
      {
        title: "personal assistant",
        url: "../personal assistant/ui/index.html",
        displayedUrl: "../personal assistant/ui/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
    "aws": [
      {
        title: "aws",
        url: "../aws/README.md",
        displayedUrl: "../aws/README.md",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "project refinement": [
      {
        title: "project refinement",
        url: "../project refinement/README.md",
        displayedUrl: "../project refinement/README.md",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
    "backgrounds for gaming,apps": [
      {
        title: "backgrounds for gaming,apps",
        url: "../backgrounds for gaming,apps/index.html",
        displayedUrl: "../backgrounds for gaming,apps/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "architect": [
      {
        title: "architect",
        url: "../architect/index.html",
        displayedUrl: "../architect/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
    "track home value": [
      {
        title: "Track Home Value",
        url: "../Track Home Value/dashboard.html",
        displayedUrl: "../Track Home Value/dashboard.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "track most wanted": [
      {
        title: "track most wanted",
        url: "../track most wanted/dashboard.html",
        displayedUrl: "../track most wanted/dashboard.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "rea": [
      {
        title: "REA",
        url: "../REA/README.md",
        displayedUrl: "../REA/README.md",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
    "ollama": [
      {
        title: "ollama",
        url: "../ollama/index.html",
        displayedUrl: "../ollama/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "stock watch": [
      {
        title: "stock watch",
        url: "../stock watch/README.md",
        displayedUrl: "../stock watch/README.md",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "spam block": [
      {
        title: "spam block",
        url: "../spam block/README.md",
        displayedUrl: "../spam block/README.md",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
    "github portfolio": [
      {
        title: "Github Portfolio",
        url: "../Github Portfolio/index.html",
        displayedUrl: "../Github Portfolio/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "ai models tools from threads": [
      {
        title: "ai models tools from threads",
        url: "../ai models tools from threads/index.html",
        displayedUrl: "../ai models tools from threads/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
    "my custom gui": [
      {
        title: "My Custom Gui",
        url: "../My Custom Gui/index.html",
        displayedUrl: "../My Custom Gui/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "stock bot traders": [
      {
        title: "stock Bot traders",
        url: "../stock Bot traders/gui/templates/index.html",
        displayedUrl: "../stock Bot traders/gui/templates/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
    "scripting": [
      {
        title: "Scripting",
        url: "../Scripting/webpage/index.html",
        displayedUrl: "../Scripting/webpage/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "openshift": [
      {
        title: "openshift",
        url: "../openshift/README.md",
        displayedUrl: "../openshift/README.md",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "record my gameplay": [
      {
        title: "Record my Gameplay",
        url: "../Record my Gameplay/README.md",
        displayedUrl: "../Record my Gameplay/README.md",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "baselines": [
      {
        title: "baselines",
        url: "../baselines/index.html",
        displayedUrl: "../baselines/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
    "agent 365": [
      {
        title: "agent 365",
        url: "../agent 365/agent365/web/index.html",
        displayedUrl: "../agent 365/agent365/web/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
    "ai defense": [
      {
        title: "ai defense",
        url: "../ai defense/index.html",
        displayedUrl: "../ai defense/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
    "mcp": [
      {
        title: "MCP",
        url: "../MCP/README.md",
        displayedUrl: "../MCP/README.md",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
    "my planetarium": [
      {
        title: "My Planetarium",
        url: "../My Planetarium/index.html",
        displayedUrl: "../My Planetarium/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
    "scary water slides": [
      {
        title: "Scary Water Slides",
        url: "../Scary Water Slides/simulator/index.html",
        displayedUrl: "../Scary Water Slides/simulator/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "anime": [
      {
        title: "anime",
        url: "../anime/index.html",
        displayedUrl: "../anime/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
    "chancenvaders": [
      {
        title: "chancenvaders",
        url: "../chancenvaders/index.html",
        displayedUrl: "../chancenvaders/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
    "docker": [
      {
        title: "docker",
        url: "../docker/README.md",
        displayedUrl: "../docker/README.md",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "game library": [
      {
        title: "Game Library",
        url: "../Game Library/index.html",
        displayedUrl: "../Game Library/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "youtube channels": [
      {
        title: "youtube channels",
        url: "../youtube channels/index.html",
        displayedUrl: "../youtube channels/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "index folder": [
      {
        title: "index folder",
        url: "../index folder/index.html",
        displayedUrl: "../index folder/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
        "chrome tab and bar": [
      {
        title: "chrome tab and bar",
        url: "../chrome tab and bar/index.html",
        displayedUrl: "../chrome tab and bar/index.html",
        snippet: "Interactive web tool and application created in Antigravity Projects."
      }
    ],
    "chase webapps": [
      {
        title: "Chase's Operations Directory - Custom Webapps Suite",
        url: "index.html",
        displayedUrl: "choogle.dev › chase-apps",
        snippet: "Access Chase's full suite of responsive web tools including the RHCSA Linux prep engine, VMware lab simulator, and Chance's AAC assistive speech device."
      }
    ],
    "app hub": [
      {
        title: "Choogle Application Hub — All Projects & Tools",
        url: "hub.html",
        displayedUrl: "choogle.dev › hub",
        snippet: "Centralized application hub and unified launcher for all 33 Antigravity projects, interactive web apps, games, security tools, and AI assistants across /projects."
      }
    ],
    "apps hub": [
      {
        title: "Choogle Application Hub — All Projects & Tools",
        url: "hub.html",
        displayedUrl: "choogle.dev › hub",
        snippet: "Centralized application hub and unified launcher for all 33 Antigravity projects, interactive web apps, games, security tools, and AI assistants across /projects."
      }
    ],
    "application hub": [
      {
        title: "Choogle Application Hub — All Projects & Tools",
        url: "hub.html",
        displayedUrl: "choogle.dev › hub",
        snippet: "Centralized application hub and unified launcher for all 33 Antigravity projects, interactive web apps, games, security tools, and AI assistants across /projects."
      }
    ],
    "applications": [
      {
        title: "Choogle Application Hub — All Projects & Tools",
        url: "hub.html",
        displayedUrl: "choogle.dev › hub",
        snippet: "Centralized application hub and unified launcher for all 33 Antigravity projects, interactive web apps, games, security tools, and AI assistants across /projects."
      }
    ]
  }
};

// Generates dynamic, realistic-looking search results for custom queries
function getSearchResults(query) {
  const normalizedQuery = query.toLowerCase().trim();
  
  // If we have custom predefined results, return them
  if (SEARCH_DATA.results[normalizedQuery]) {
    return {
      results: SEARCH_DATA.results[normalizedQuery],
      knowledgePanel: SEARCH_DATA.knowledgePanels[normalizedQuery] || null
    };
  }
  
  // Check if query matches a knowledge panel even if no results
  let knowledgePanel = null;
  for (const key in SEARCH_DATA.knowledgePanels) {
    if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
      knowledgePanel = SEARCH_DATA.knowledgePanels[key];
      break;
    }
  }
  
  // Generate generic dynamic results based on the query keywords
  const capitalizedQuery = query.charAt(0).toUpperCase() + query.slice(1);
  const results = [
    {
      title: `${capitalizedQuery} - Latest News and Updates`,
      url: `https://www.worldnews.com/topic/${encodeURIComponent(normalizedQuery)}`,
      displayedUrl: `https://www.worldnews.com › topic › ${normalizedQuery}`,
      snippet: `Get the latest breaking news, analysis, articles, and discussions about ${capitalizedQuery}. Updated hourly with top stories from around the globe.`
    },
    {
      title: `What is ${capitalizedQuery}? | Comprehensive Guide & Definition`,
      url: `https://www.explainerwiki.org/wiki/${encodeURIComponent(normalizedQuery)}`,
      displayedUrl: `https://www.explainerwiki.org › wiki › ${normalizedQuery}`,
      snippet: `An in-depth overview of ${capitalizedQuery}. Learn about its history, key concepts, practical applications, and common questions answered by subject matter experts.`
    },
    {
      title: `Top 10 Resources for ${capitalizedQuery} Enthusiasts`,
      url: `https://www.curatedlists.io/best-of/${encodeURIComponent(normalizedQuery)}`,
      displayedUrl: `https://www.curatedlists.io › best-of › ${normalizedQuery}`,
      snippet: `Discover the best tools, websites, communities, and books dedicated to ${capitalizedQuery}. Hand-picked by our editors for beginners and experts alike.`
    },
    {
      title: `${capitalizedQuery} Discussions on Reddit`,
      url: `https://www.reddit.com/r/${normalizedQuery.replace(/\s+/g, '')}`,
      displayedUrl: `https://www.reddit.com › r › ${normalizedQuery.replace(/\s+/g, '')}`,
      snippet: `Join the community! Ask questions, share your thoughts, and converse with thousands of other members interested in ${capitalizedQuery}.`
    },
    {
      title: `Tutorial: Getting Started with ${capitalizedQuery}`,
      url: `https://www.codetutorials.dev/courses/${encodeURIComponent(normalizedQuery)}`,
      displayedUrl: `https://www.codetutorials.dev › courses › ${normalizedQuery}`,
      snippet: `Step-by-step guides, video tutorials, and interactive exercises to master ${capitalizedQuery}. Perfect for developers, students, and hobbyists.`
    }
  ];

  return { results, knowledgePanel };
}


