'use strict';

const BLOCKED_DOMAIN_SUFFIXES = [
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'google-analytics.com',
  'googletagmanager.com',
  'adservice.google.com',
  'pagead2.googlesyndication.com',
  'connect.facebook.net',
  'ads.twitter.com',
  'analytics.twitter.com',
  'analytics.tiktok.com',
  'ads-api.tiktok.com',
  'taboola.com',
  'outbrain.com',
  'criteo.com',
  'criteo.net',
  'scorecardresearch.com',
  'quantserve.com',
  'amazon-adsystem.com',
  'rubiconproject.com',
  'pubmatic.com',
  'openx.net',
  'adnxs.com',
  'hotjar.com',
  'hotjar.io',
  'mixpanel.com',
  'segment.io',
  'segment.com',
  'clarity.ms',
  'sentry.io',
  'adsrvr.org',
  'casalemedia.com',
  'bidswitch.net',
  'demdex.net',
  'krxd.net',
  'moatads.com',
  'chartbeat.com',
  'nr-data.net',
  'fullstory.com',
  'amplitude.com',
  'appsflyer.com',
  'branch.io',
  'media.net',
  'zedo.com',
  'mgid.com',
  'revcontent.com',
  'popcash.net',
  'propellerads.com',
  'adroll.com',
  'mediavine.com',
  'adthrive.com',
  'sharethrough.com',
  'indexww.com',
  '3lift.com',
  'smartadserver.com',
  'omtrdc.net',
  '2o7.net',
  'bugsnag.com',
  'logrocket.com'
];

const BLOCKED_URL_PATTERNS = [
  /\/pagead\//i,
  /\/adserver\//i,
  /\/doubleclick\//i,
  /\/googlesyndication\//i,
  /\/ad_status\.js/i,
  /\/prebid(\.min)?\.js/i,
  /facebook\.com\/tr\b/i,
  /facebook\.net\/tr\b/i
];

function hostMatchesList(hostname) {
  if (!hostname) return false;
  const h = hostname.toLowerCase();
  for (let i = 0; i < BLOCKED_DOMAIN_SUFFIXES.length; i++) {
    const suffix = BLOCKED_DOMAIN_SUFFIXES[i];
    if (h === suffix || h.endsWith('.' + suffix)) {
      return suffix;
    }
  }
  return false;
}

class ChoogleAdblock {
  constructor(store) {
    this.store = store;
    this.tabStats = new Map(); // webContentsId -> { count, recent: [] }
    this._attached = false;
  }

  ensureTab(webContentsId) {
    if (!this.tabStats.has(webContentsId)) {
      this.tabStats.set(webContentsId, { count: 0, recent: [] });
    }
    return this.tabStats.get(webContentsId);
  }

  resetTab(webContentsId) {
    this.tabStats.set(webContentsId, { count: 0, recent: [] });
  }

  removeTab(webContentsId) {
    this.tabStats.delete(webContentsId);
  }

  getTabSummary(webContentsId) {
    const entry = this.tabStats.get(webContentsId);
    if (!entry) return { count: 0, recent: [] };
    return { count: entry.count, recent: entry.recent.slice() };
  }

  testRequest(url, pageHost, resourceType) {
    const settings = this.store.getSettings();
    if (!settings.adblockEnabled) return { blocked: false, reason: 'disabled' };

    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return { blocked: false, reason: 'non-http' };
    }

    if (resourceType === 'mainFrame') {
      return { blocked: false, reason: 'mainFrame' };
    }

    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return { blocked: false, reason: 'invalid-url' };
    }

    const reqHost = parsed.hostname.toLowerCase();
    if (reqHost === 'localhost' || reqHost === '127.0.0.1' || reqHost === '::1') {
      return { blocked: false, reason: 'loopback' };
    }

    const cleanPageHost = String(pageHost || '').toLowerCase();
    if (cleanPageHost && Array.isArray(settings.adblockAllowlist)) {
      if (settings.adblockAllowlist.includes(cleanPageHost)) {
        return { blocked: false, reason: 'allowlisted' };
      }
    }

    const matchedSuffix = hostMatchesList(reqHost);
    if (matchedSuffix) {
      return { blocked: true, host: reqHost, rule: matchedSuffix };
    }

    for (let i = 0; i < BLOCKED_URL_PATTERNS.length; i++) {
      if (BLOCKED_URL_PATTERNS[i].test(url)) {
        return { blocked: true, host: reqHost, rule: BLOCKED_URL_PATTERNS[i].source };
      }
    }

    return { blocked: false, reason: 'clean' };
  }

  attach(session, getPageHostForWebContentsId, onBlocked) {
    if (this._attached) return;
    this._attached = true;

    session.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*'] }, (details, callback) => {
      try {
        const wcId = details.webContentsId;
        const pageHost = typeof getPageHostForWebContentsId === 'function' ? getPageHostForWebContentsId(wcId) : '';
        const verdict = this.testRequest(details.url, pageHost, details.resourceType);

        if (verdict.blocked) {
          if (typeof wcId === 'number' && wcId > 0) {
            const tabEntry = this.ensureTab(wcId);
            tabEntry.count += 1;
            tabEntry.recent.unshift({
              host: verdict.host,
              rule: verdict.rule,
              resourceType: details.resourceType || 'other',
              url: details.url.slice(0, 180),
              ts: Date.now()
            });
            if (tabEntry.recent.length > 30) {
              tabEntry.recent.length = 30;
            }
          }
          const totalBlocked = this.store.incrementBlocked(1);
          if (typeof onBlocked === 'function') {
            onBlocked(wcId, {
              host: verdict.host,
              rule: verdict.rule,
              totalBlocked
            });
          }
          callback({ cancel: true });
          return;
        }
      } catch {
        // Fail open on unexpected inspection error so browsing never breaks
      }
      callback({ cancel: false });
    });
  }
}

module.exports = { ChoogleAdblock, BLOCKED_DOMAIN_SUFFIXES };
