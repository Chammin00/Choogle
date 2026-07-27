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
    "lockheed martin breach"
  ],
  
  knowledgePanels: {
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
    "chase webapps": [
      {
        title: "Chase's Operations Directory - Custom Webapps Suite",
        url: "index.html",
        displayedUrl: "choogle.dev › chase-apps",
        snippet: "Access Chase's full suite of responsive web tools including the RHCSA Linux prep engine, VMware lab simulator, and Chance's AAC assistive speech device."
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
