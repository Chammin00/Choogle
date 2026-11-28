/**
 * Choogle Custom Vector Icon Pack (assets/icons/icon-library.js)
 * Bespoke dual-tone geometric 24x24 SVG icons for Choogle Browser & Apps.
 * Zero raw OS emojis. Dual-layer geometry with crisp 1.75px rounded strokes.
 */
(function (root) {
  'use strict';

  var ICONS = {
    // ── BROWSER NAVIGATION & WINDOW CONTROLS ───────────────────────────────
    'nav-back': {
      category: 'browser',
      label: 'Back',
      keywords: 'arrow left previous history',
      body: '<path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />'
    },
    'nav-forward': {
      category: 'browser',
      label: 'Forward',
      keywords: 'arrow right next',
      body: '<path d="M5 12h14" /><path d="M12 5l7 7-7 7" />'
    },
    'nav-reload': {
      category: 'browser',
      label: 'Reload',
      keywords: 'refresh sync',
      body: '<path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 4v5h-5" />'
    },
    'nav-stop': {
      category: 'browser',
      label: 'Stop Loading',
      keywords: 'cancel abort close',
      body: '<circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.16" /><path d="M15 9l-6 6M9 9l6 6" />'
    },
    'nav-home': {
      category: 'browser',
      label: 'Home',
      keywords: 'start newtab',
      body: '<path d="M4 10.5L12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z" fill="currentColor" fill-opacity="0.16" /><path d="M9.5 20.5v-6h5v6" />'
    },
    'tab-new': {
      category: 'browser',
      label: 'New Tab',
      keywords: 'add plus tab',
      body: '<rect x="3" y="4" width="18" height="16" rx="3" fill="currentColor" fill-opacity="0.14" /><path d="M12 8v8M8 12h8" />'
    },
    'tab-close': {
      category: 'browser',
      label: 'Close',
      keywords: 'x dismiss',
      body: '<path d="M17 7L7 17M7 7l10 10" />'
    },
    'tab-pin': {
      category: 'browser',
      label: 'Pin Tab',
      keywords: 'tack lock favorite',
      body: '<path d="M9 4h6l-1 5 3 3v2H7v-2l3-3z" fill="currentColor" fill-opacity="0.18" /><path d="M12 14v6" />'
    },
    'volume-on': {
      category: 'browser',
      label: 'Audio Playing',
      keywords: 'sound speaker mute',
      body: '<path d="M11 5L6 9H3v6h3l5 4z" fill="currentColor" fill-opacity="0.2" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" />'
    },
    'volume-mute': {
      category: 'browser',
      label: 'Muted',
      keywords: 'silent quiet',
      body: '<path d="M11 5L6 9H3v6h3l5 4z" fill="currentColor" fill-opacity="0.16" /><path d="M16 9l5 6M21 9l-5 6" />'
    },
    'layout-dual': {
      category: 'browser',
      label: 'Dual Mode',
      keywords: 'sidebar topbar split layout',
      body: '<rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" fill-opacity="0.12" /><path d="M8 3v18M8 8h13" />'
    },
    'layout-sidebar': {
      category: 'browser',
      label: 'Sidebar Mode',
      keywords: 'vertical tabs arc rail',
      body: '<rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" fill-opacity="0.12" /><path d="M10 3v18" /><path d="M5.5 8h2M5.5 12h2M5.5 16h2" />'
    },
    'layout-topbar': {
      category: 'browser',
      label: 'Top Tab Bar',
      keywords: 'classic horizontal tabs',
      body: '<rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" fill-opacity="0.12" /><path d="M3 8.5h18" /><path d="M8 3v5.5M14 3v5.5" />'
    },
    'shield-on': {
      category: 'browser',
      label: 'Shield Active',
      keywords: 'adblock tracker privacy security',
      body: '<path d="M12 3l7.5 3v5.5c0 4.8-3.2 8.9-7.5 10.2-4.3-1.3-7.5-5.4-7.5-10.2V6z" fill="currentColor" fill-opacity="0.2" /><path d="M9.2 12.2l2 2 3.8-4" />'
    },
    'shield-off': {
      category: 'browser',
      label: 'Shield Paused',
      keywords: 'allowlist disabled',
      body: '<path d="M12 3l7.5 3v5.5c0 4.8-3.2 8.9-7.5 10.2-4.3-1.3-7.5-5.4-7.5-10.2V6z" fill="currentColor" fill-opacity="0.08" /><path d="M4 4l16 16" />'
    },
    'bookmark': {
      category: 'browser',
      label: 'Bookmark',
      keywords: 'star save favorite',
      body: '<path d="M6.5 4h11A1.5 1.5 0 0 1 19 5.5V20l-7-4.2L5 20V5.5A1.5 1.5 0 0 1 6.5 4z" fill="currentColor" fill-opacity="0.14" />'
    },
    'bookmark-filled': {
      category: 'browser',
      label: 'Bookmarked',
      keywords: 'star saved',
      body: '<path d="M6.5 4h11A1.5 1.5 0 0 1 19 5.5V20l-7-4.2L5 20V5.5A1.5 1.5 0 0 1 6.5 4z" fill="currentColor" fill-opacity="0.88" />'
    },
    'downloads': {
      category: 'browser',
      label: 'Downloads',
      keywords: 'files save export',
      body: '<path d="M12 3v11M8 10.5l4 4 4-4" /><path d="M4 16.5v2A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-2" />'
    },
    'history': {
      category: 'browser',
      label: 'History',
      keywords: 'clock recent timeline',
      body: '<circle cx="12" cy="12" r="8.5" fill="currentColor" fill-opacity="0.14" /><path d="M12 7.5v4.8l3.2 2" /><path d="M3.5 12H2m1.8-4.5L5.2 9" />'
    },
    'apps-grid': {
      category: 'browser',
      label: 'Apps Launcher',
      keywords: 'grid menu suite',
      body: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5" fill="currentColor" fill-opacity="0.22" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" fill="currentColor" fill-opacity="0.22" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" fill="currentColor" fill-opacity="0.22" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" fill="currentColor" fill-opacity="0.22" />'
    },
    'settings': {
      category: 'browser',
      label: 'Settings',
      keywords: 'gear preferences config',
      body: '<circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.2" /><path d="M12 3.5v2M12 18.5v2M4.9 6.5l1.7 1M17.4 16.5l1.7 1M3.5 12h2M18.5 12h2M4.9 17.5l1.7-1M17.4 7.5l1.7-1" /><circle cx="12" cy="12" r="6.5" stroke-dasharray="3 2.2" />'
    },
    'search': {
      category: 'browser',
      label: 'Search',
      keywords: 'find lens inspect',
      body: '<circle cx="10.5" cy="10.5" r="6.5" fill="currentColor" fill-opacity="0.14" /><path d="M15.4 15.4L20.5 20.5" />'
    },
    'lock-secure': {
      category: 'browser',
      label: 'HTTPS Secure',
      keywords: 'ssl padlock verified',
      body: '<rect x="5" y="10.5" width="14" height="9.5" rx="2.2" fill="currentColor" fill-opacity="0.2" /><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" /><circle cx="12" cy="15.2" r="1.1" fill="currentColor" />'
    },
    'lock-insecure': {
      category: 'browser',
      label: 'Not Secure',
      keywords: 'warning alert http',
      body: '<path d="M12 4L3.5 19.5h17z" fill="currentColor" fill-opacity="0.18" /><path d="M12 9.5v4.5M12 16.8v.4" />'
    },
    'devtools': {
      category: 'browser',
      label: 'DevTools',
      keywords: 'inspect console code',
      body: '<rect x="3" y="4" width="18" height="16" rx="2.5" fill="currentColor" fill-opacity="0.14" /><path d="M8 9.5l3 2.5-3 2.5M13 15h3.5" />'
    },
    'zoom-in': {
      category: 'browser',
      label: 'Zoom In',
      keywords: 'magnify plus',
      body: '<circle cx="10.5" cy="10.5" r="6.5" fill="currentColor" fill-opacity="0.14" /><path d="M15.4 15.4L20.5 20.5M10.5 8v5M8 10.5h5" />'
    },
    'zoom-out': {
      category: 'browser',
      label: 'Zoom Out',
      keywords: 'magnify minus',
      body: '<circle cx="10.5" cy="10.5" r="6.5" fill="currentColor" fill-opacity="0.14" /><path d="M15.4 15.4L20.5 20.5M8 10.5h5" />'
    },
    'workspace': {
      category: 'browser',
      label: 'Workspaces',
      keywords: 'layers spaces context',
      body: '<path d="M12 3.5l8 4.5-8 4.5-8-4.5z" fill="currentColor" fill-opacity="0.24" /><path d="M4 12l8 4.5 8-4.5M4 16l8 4.5 8-4.5" />'
    },
    'find': {
      category: 'browser',
      label: 'Find in Page',
      keywords: 'filter text match',
      body: '<rect x="3.5" y="5" width="17" height="14" rx="2.5" fill="currentColor" fill-opacity="0.12" /><circle cx="10" cy="11.5" r="3" /><path d="M12.3 13.8L15 16.5" />'
    },
    'external-link': {
      category: 'browser',
      label: 'Open External',
      keywords: 'launch popup new tab',
      body: '<path d="M14 4h6v6M20 4l-9.5 9.5" /><path d="M18 13v5.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H11" />'
    },
    'panel-close': {
      category: 'browser',
      label: 'Toggle Panel',
      keywords: 'sidebar drawer collapse',
      body: '<rect x="3" y="4" width="18" height="16" rx="2.5" fill="currentColor" fill-opacity="0.12" /><path d="M15 4v16" /><path d="M10 9.5L7.5 12 10 14.5" />'
    },
    'plus': {
      category: 'browser',
      label: 'Add',
      keywords: 'create new',
      body: '<path d="M12 5v14M5 12h14" />'
    },
    'trash': {
      category: 'browser',
      label: 'Delete',
      keywords: 'remove clear',
      body: '<path d="M5 7h14M9 7V4.5h6V7" /><path d="M7 7l1 13h8l1-13" fill="currentColor" fill-opacity="0.14" /><path d="M10 11v5.5M14 11v5.5" />'
    },
    'folder': {
      category: 'browser',
      label: 'Folder',
      keywords: 'directory collection',
      body: '<path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4.2l2 2.2H19A1.5 1.5 0 0 1 20.5 8.7v8.8A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z" fill="currentColor" fill-opacity="0.18" />'
    },
    'check': {
      category: 'browser',
      label: 'Confirm',
      keywords: 'done ok verified',
      body: '<path d="M5 12.5l4.5 4.5L19.5 7" />'
    },
    'copy': {
      category: 'browser',
      label: 'Copy',
      keywords: 'clipboard duplicate',
      body: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2" fill="currentColor" fill-opacity="0.18" /><path d="M15.5 8.5V5.5A1.5 1.5 0 0 0 14 4H5.5A1.5 1.5 0 0 0 4 5.5V14a1.5 1.5 0 0 0 1.5 1.5h3" />'
    },
    'download-file': {
      category: 'browser',
      label: 'Export File',
      keywords: 'save svg png ico',
      body: '<path d="M6 3.5h8l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-10.5A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5z" fill="currentColor" fill-opacity="0.16" /><path d="M12 10v6M9.5 13.5l2.5 2.5 2.5-2.5" />'
    },
    'win-min': {
      category: 'browser',
      label: 'Minimize',
      keywords: 'window minimize',
      body: '<path d="M5 12h14" />'
    },
    'win-max': {
      category: 'browser',
      label: 'Maximize',
      keywords: 'window expand',
      body: '<rect x="5" y="5" width="14" height="14" rx="2" />'
    },
    'win-restore': {
      category: 'browser',
      label: 'Restore',
      keywords: 'window unmaximize',
      body: '<rect x="4.5" y="7.5" width="11.5" height="11.5" rx="1.8" /><path d="M8.5 7.5V5.8A1.3 1.3 0 0 1 9.8 4.5h8.4a1.3 1.3 0 0 1 1.3 1.3v8.4a1.3 1.3 0 0 1-1.3 1.3H16" />'
    },
    'win-close': {
      category: 'browser',
      label: 'Close Window',
      keywords: 'exit quit',
      body: '<path d="M6 6l12 12M18 6L6 18" />'
    },

    // ── CHOOGLE SUITE APPS ─────────────────────────────────────────────────
    'app-choogle': {
      category: 'suite',
      label: 'Choogle Emblem',
      keywords: 'brand browser compass',
      body: '<rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="currentColor" fill-opacity="0.16" /><path d="M16.2 15.8a6.2 6.2 0 1 1 0-7.6" stroke-width="2.3" /><polygon points="16.5,12 12.6,14.2 10.8,12 12.6,9.8" fill="currentColor" />'
    },
    'app-hub': {
      category: 'suite',
      label: 'App Hub',
      keywords: 'projects launcher portal',
      body: '<polygon points="12,3 20,7.5 20,16.5 12,21 4,16.5 4,7.5" fill="currentColor" fill-opacity="0.16" /><path d="M12 7v10M7.5 12h9" />'
    },
    'app-chai': {
      category: 'suite',
      label: 'chAI Assistant',
      keywords: 'ai chat assistant spark',
      body: '<path d="M12 3.5l2.1 5.4 5.4 2.1-5.4 2.1L12 18.5l-2.1-5.4L4.5 11l5.4-2.1z" fill="currentColor" fill-opacity="0.22" /><circle cx="18.5" cy="18" r="1.5" fill="currentColor" />'
    },
    'app-tasks': {
      category: 'suite',
      label: 'Tasks Kanban',
      keywords: 'board workflow columns',
      body: '<rect x="3.5" y="4" width="17" height="16" rx="2.5" fill="currentColor" fill-opacity="0.12" /><path d="M9 4v16M15 4v16M5.5 9h1.5M11.2 12h1.6M17 8.5h1.5" />'
    },
    'app-notepad': {
      category: 'suite',
      label: 'Notepad',
      keywords: 'notes editor markdown',
      body: '<rect x="5" y="3.5" width="14" height="17" rx="2.2" fill="currentColor" fill-opacity="0.16" /><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4.5" />'
    },
    'app-webstore': {
      category: 'suite',
      label: 'Web Store',
      keywords: 'extensions plugins modules',
      body: '<path d="M4.5 8h15l-1.2 11.5A1.5 1.5 0 0 1 16.8 21H7.2a1.5 1.5 0 0 1-1.5-1.5z" fill="currentColor" fill-opacity="0.18" /><path d="M8.5 8V6a3.5 3.5 0 0 1 7 0v2" />'
    },
    'app-outages': {
      category: 'suite',
      label: 'Outages Radar',
      keywords: 'status monitor telemetry',
      body: '<circle cx="12" cy="12" r="8.5" fill="currentColor" fill-opacity="0.12" /><path d="M5 12h3.5l2-4.5 3 9 2-4.5H19" />'
    },
    'app-hacked': {
      category: 'suite',
      label: 'HackedOut Monitor',
      keywords: 'breach threat alert',
      body: '<polygon points="12,3.5 20.5,19 3.5,19" fill="currentColor" fill-opacity="0.18" /><path d="M12 9.5v4.5M12 16.5v.5" />'
    },
    'app-rhcsa': {
      category: 'suite',
      label: 'RHCSA Linux Lab',
      keywords: 'redhat rhel terminal shell',
      body: '<rect x="3" y="4.5" width="18" height="15" rx="2.5" fill="currentColor" fill-opacity="0.16" /><path d="M7.5 10l3 2.5-3 2.5M12.5 15h4" />'
    },
    'app-vmware': {
      category: 'suite',
      label: 'VMware Prep',
      keywords: 'hypervisor virtualization cluster',
      body: '<rect x="3.5" y="4.5" width="9" height="9" rx="1.8" fill="currentColor" fill-opacity="0.2" /><rect x="11.5" y="10.5" width="9" height="9" rx="1.8" fill="currentColor" fill-opacity="0.2" />'
    },
    'app-ccna': {
      category: 'suite',
      label: 'CCNA Network Lab',
      keywords: 'router switch subnet',
      body: '<circle cx="12" cy="12" r="8.5" fill="currentColor" fill-opacity="0.14" /><ellipse cx="12" cy="12" rx="3.8" ry="8.5" /><path d="M4 9.5h16M4 14.5h16" />'
    },
    'app-dlm': {
      category: 'suite',
      label: 'DLM Storage',
      keywords: 'database archive disk',
      body: '<ellipse cx="12" cy="6.5" rx="7.5" ry="2.8" fill="currentColor" fill-opacity="0.22" /><path d="M4.5 6.5v11c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-11" /><path d="M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8" />'
    },
    'app-powershell': {
      category: 'suite',
      label: 'PowerShell',
      keywords: 'ps1 automation windows',
      body: '<path d="M4.5 5h16l-2 14h-16z" fill="currentColor" fill-opacity="0.18" /><path d="M8.5 9.5l3 2.5-3.5 2.5M12.5 15h3.5" />'
    },
    'app-icons': {
      category: 'suite',
      label: 'Icon Studio',
      keywords: 'vector designer svg studio',
      body: '<rect x="3.5" y="3.5" width="17" height="17" rx="3.5" fill="currentColor" fill-opacity="0.14" /><polygon points="12,6.5 17.5,12 12,17.5 6.5,12" fill="currentColor" fill-opacity="0.28" /><circle cx="12" cy="12" r="1.8" fill="currentColor" />'
    },
    'app-deploy': {
      category: 'suite',
      label: 'Deploy Hub',
      keywords: 'release launch build',
      body: '<path d="M12 3.5c3.5 2.5 5 6.5 5 10.5l-5 3-5-3c0-4 1.5-8 5-10.5z" fill="currentColor" fill-opacity="0.2" /><circle cx="12" cy="10.5" r="1.6" fill="currentColor" /><path d="M7 14l-2.5 2.5v2L7 17M17 14l2.5 2.5v2L17 17M10 19.5l2 1.5 2-1.5" />'
    },

    // ── PROJECT CATEGORIES ─────────────────────────────────────────────────
    'cat-game': {
      category: 'projects',
      label: 'Games & Sims',
      keywords: 'controller arcade unity godot ue5',
      body: '<rect x="3" y="7" width="18" height="10.5" rx="4.5" fill="currentColor" fill-opacity="0.18" /><path d="M8 10.5v3.5M6.2 12.2h3.5" /><circle cx="15.5" cy="11" r="0.9" fill="currentColor" /><circle cx="17.5" cy="13" r="0.9" fill="currentColor" />'
    },
    'cat-security': {
      category: 'projects',
      label: 'Cybersecurity',
      keywords: 'shield firewall audit defense',
      body: '<path d="M12 3l7 3v5.5c0 4.6-3 8.4-7 9.7-4-1.3-7-5.1-7-9.7V6z" fill="currentColor" fill-opacity="0.2" /><rect x="9.5" y="11" width="5" height="4" rx="1" /><path d="M10.5 11V9.5a1.5 1.5 0 0 1 3 0V11" />'
    },
    'cat-ai': {
      category: 'projects',
      label: 'AI & Agents',
      keywords: 'neural llm model agent',
      body: '<circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.28" /><circle cx="5.5" cy="6.5" r="1.8" /><circle cx="18.5" cy="6.5" r="1.8" /><circle cx="5.5" cy="17.5" r="1.8" /><circle cx="18.5" cy="17.5" r="1.8" /><path d="M7 7.8l3 2.4M17 7.8l-3 2.4M7 16.2l3-2.4M17 16.2l-3-2.4" />'
    },
    'cat-systems': {
      category: 'projects',
      label: 'Systems & Infra',
      keywords: 'server linux rack node',
      body: '<rect x="3.5" y="4.5" width="17" height="6" rx="1.6" fill="currentColor" fill-opacity="0.18" /><rect x="3.5" y="13.5" width="17" height="6" rx="1.6" fill="currentColor" fill-opacity="0.18" /><circle cx="7" cy="7.5" r="1" fill="currentColor" /><circle cx="7" cy="16.5" r="1" fill="currentColor" /><path d="M14 7.5h3.5M14 16.5h3.5" />'
    },
    'cat-media': {
      category: 'projects',
      label: 'Media & Audio',
      keywords: 'video music player stream',
      body: '<rect x="3.5" y="4.5" width="17" height="15" rx="3" fill="currentColor" fill-opacity="0.16" /><polygon points="10,8.5 16.5,12 10,15.5" fill="currentColor" fill-opacity="0.85" />'
    },
    'cat-edu': {
      category: 'projects',
      label: 'Learning & Docs',
      keywords: 'study exam cert book',
      body: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H12v15.5H5.5A1.5 1.5 0 0 0 4 21z" fill="currentColor" fill-opacity="0.16" /><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H12v15.5h6.5A1.5 1.5 0 0 1 20 21z" fill="currentColor" fill-opacity="0.1" />'
    },
    'cat-finance': {
      category: 'projects',
      label: 'Finance & Trading',
      keywords: 'stocks portfolio analytics',
      body: '<rect x="3.5" y="4" width="17" height="16" rx="2.5" fill="currentColor" fill-opacity="0.12" /><path d="M6.5 15.5l4-4.5 3 2.5 4-5.5" /><path d="M15 8h2.5v2.5" />'
    },
    'cat-code': {
      category: 'projects',
      label: 'Developer Tools',
      keywords: 'repo github mcp cli script',
      body: '<path d="M8.5 8L4 12l4.5 4M15.5 8L20 12l-4.5 4M13.2 6l-2.4 12" />'
    },
    'cat-cloud': {
      category: 'projects',
      label: 'Cloud & AWS',
      keywords: 'aws openshift docker deploy',
      body: '<path d="M7.5 18h9.5a3.5 3.5 0 0 0 .5-6.95A5 5 0 0 0 7.7 9.6 3.5 3.5 0 0 0 7.5 18z" fill="currentColor" fill-opacity="0.18" />'
    },
    'cat-mobile': {
      category: 'projects',
      label: 'Mobile & Foldables',
      keywords: 'android zfold phone',
      body: '<rect x="6.5" y="3" width="11" height="18" rx="2.2" fill="currentColor" fill-opacity="0.16" /><path d="M10.5 18h3M12 3v18" stroke-opacity="0.45" />'
    },
    'cat-vr': {
      category: 'projects',
      label: '3D & Spatial',
      keywords: 'vr 3d shaders blender',
      body: '<polygon points="12,3.2 20,7.5 20,16.5 12,20.8 4,16.5 4,7.5" fill="currentColor" fill-opacity="0.16" /><path d="M4 7.5l8 4.5 8-4.5M12 12v8.8" />'
    },
    'cat-docs': {
      category: 'projects',
      label: 'Knowledge & Notes',
      keywords: 'wiki guide readme resume',
      body: '<path d="M6 3.5h8.5L18.5 7.5V19a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5z" fill="currentColor" fill-opacity="0.16" /><path d="M8 10h8M8 13.5h8M8 17h5" />'
    },
    'cat-tools': {
      category: 'projects',
      label: 'Utilities',
      keywords: 'settings tools automation',
      body: '<path d="M14.5 6.5a4 4 0 0 0-5.4 5.4l-4.6 4.6 2 2 4.6-4.6a4 4 0 0 0 5.4-5.4l-2.2 2.2-1.8-.3-.3-1.8z" fill="currentColor" fill-opacity="0.2" />'
    },
    'cat-rocket': {
      category: 'projects',
      label: 'Featured Launch',
      keywords: 'startup web app',
      body: '<path d="M12 3.5c3.5 2.5 5 6.5 5 10.5l-5 3-5-3c0-4 1.5-8 5-10.5z" fill="currentColor" fill-opacity="0.2" /><circle cx="12" cy="10.5" r="1.5" fill="currentColor" />'
    }
  };

  function escapeAttr(val) {
    return String(val == null ? '' : val)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function resolveIcon(name) {
    if (name && ICONS[name]) return ICONS[name];
    return ICONS['cat-rocket'];
  }

  function svg(name, opts) {
    var options = opts || {};
    var size = options.size || 18;
    var strokeWidth = options.strokeWidth || 1.75;
    var className = options.className ? ' class="' + escapeAttr(options.className) + '"' : '';
    var aria = options.title
      ? ' role="img" aria-label="' + escapeAttr(options.title) + '"'
      : ' aria-hidden="true"';
    var def = resolveIcon(name);
    var titleEl = options.title ? '<title>' + escapeAttr(options.title) + '</title>' : '';
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="' +
      size +
      '" height="' +
      size +
      '" fill="none" stroke="currentColor" stroke-width="' +
      strokeWidth +
      '" stroke-linecap="round" stroke-linejoin="round"' +
      className +
      aria +
      '>' +
      titleEl +
      def.body +
      '</svg>'
    );
  }

  function faviconDataUri(name, strokeColor, bgColor) {
    var def = resolveIcon(name);
    var stroke = strokeColor || '#DFBA73';
    var bg = bgColor || '#0D1322';
    var raw =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
      '<rect x="1" y="1" width="30" height="30" rx="8" fill="' +
      bg +
      '" stroke="' +
      stroke +
      '" stroke-opacity="0.45" stroke-width="1.5"/>' +
      '<g transform="translate(4 4)" fill="none" stroke="' +
      stroke +
      '" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">' +
      def.body +
      '</g></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(raw);
  }

  function list() {
    return Object.keys(ICONS).map(function (id) {
      return {
        id: id,
        category: ICONS[id].category,
        label: ICONS[id].label,
        keywords: ICONS[id].keywords
      };
    });
  }

  function get(name) {
    return ICONS[name] || null;
  }

  var api = {
    ICONS: ICONS,
    svg: svg,
    faviconDataUri: faviconDataUri,
    list: list,
    get: get
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.ChoogleIcons = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
