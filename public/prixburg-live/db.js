(function () {
    function hostTenant() {
        var host = String(location.hostname || '').toLowerCase();
        var suffix = '.fortress.vercel.app';
        if (host.endsWith(suffix)) {
            var sub = host.slice(0, -suffix.length);
            if (sub && sub !== 'www' && sub !== 'fortress-zw' && sub.indexOf('.') === -1) return sub;
        }
        if (host.endsWith('.localhost')) {
            var localSub = host.slice(0, -'.localhost'.length);
            if (localSub && localSub.indexOf('.') === -1) return localSub;
        }
        return '';
    }
    var queryTenant = '';
    try { queryTenant = new URLSearchParams(location.search).get('tenant') || ''; } catch (err) { /* ignore */ }
    var tenant = String(hostTenant() || queryTenant || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (tenant) {
        try { sessionStorage.setItem('prixburg-tenant', tenant); } catch (err) { /* ignore */ }
    } else {
        try { tenant = sessionStorage.getItem('prixburg-tenant') || ''; } catch (err) { tenant = ''; }
    }
    tenant = tenant || 'prixburg';
    window.PRIXBURG_TENANT = tenant;
    if (tenant === 'prixburg') return;
    var prefix = 'tenant:' + tenant + ':';
    var origGet = Storage.prototype.getItem;
    var origSet = Storage.prototype.setItem;
    var origRemove = Storage.prototype.removeItem;
    function keep(key) {
        key = String(key || '');
        return key === 'prixburg-tenant' || key.indexOf('tenant:') === 0 || key.indexOf('fortress-') === 0;
    }
    Storage.prototype.getItem = function (key) {
        return origGet.call(this, keep(key) ? key : prefix + key);
    };
    Storage.prototype.setItem = function (key, value) {
        return origSet.call(this, keep(key) ? key : prefix + key, value);
    };
    Storage.prototype.removeItem = function (key) {
        return origRemove.call(this, keep(key) ? key : prefix + key);
    };
})();

const PRIXBURG_DB_DEFAULTS = {
    rawMaterialsData: [],
    prixburgDetergentFormulas: [],
    prixburgReportFiles: { daily: [], weekly: [], monthly: [], yearly: [] },
    prixburgPricing: [],
    prixburgStockMovements: [],
    prixburgCreditPayments: [],
    prixburgLoginDetails: {
        mainUsername: 'CLEANZ',
        mainPassword: 'CLEANZ123',
        settingsUsername: 'PRIXBURG CHEMICALS',
        settingsPassword: 'Prixburg'
    },
    prixburgRecycleBin: [],
    prixburgAppSettings: {
        autoDailyFiles: true,
        projectStartedOn: ''
    }
};

const PRIXBURG_DB_KEYS = Object.keys(PRIXBURG_DB_DEFAULTS);

let prixburgCache = null;
let prixburgWriteQueue = Promise.resolve();
const prixburgWriteGen = {};

function dbClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function dbHeaders(extra) {
    const headers = {
        apikey: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        Accept: 'application/json'
    };
    if (extra) Object.keys(extra).forEach(function (key) { headers[key] = extra[key]; });
    return headers;
}

function dbUrl(path) {
    return NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '') + path;
}

function dbIsNetworkError(err) {
    if (!err) return false;
    const name = err.name || '';
    const msg = String(err.message || err);
    return name === 'AbortError' || name === 'TimeoutError' || name === 'TypeError'
        || /fail|network|abort|timeout|fetch|Load failed/i.test(msg);
}

function dbFetch(url, options, ms) {
    const wait = ms || 8000;
    if (typeof AbortController === 'undefined') {
        return Promise.race([
            fetch(url, options || {}),
            new Promise(function (_, reject) {
                setTimeout(function () { reject(new Error('timeout')); }, wait);
            })
        ]);
    }
    const ctrl = new AbortController();
    const timer = setTimeout(function () { ctrl.abort(); }, wait);
    const opts = {};
    if (options) Object.keys(options).forEach(function (key) { opts[key] = options[key]; });
    opts.signal = ctrl.signal;
    return fetch(url, opts).then(function (res) {
        clearTimeout(timer);
        return res;
    }, function (err) {
        clearTimeout(timer);
        throw err;
    });
}

function dbStampKey(key) {
    return key + '__at';
}

function dbRemoteKey(key) {
    var tenant = window.PRIXBURG_TENANT || 'prixburg';
    if (!tenant || tenant === 'prixburg') return key;
    return 'tenant:' + tenant + ':' + key;
}

function dbWriteLocal(key, value, at) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        localStorage.setItem(dbStampKey(key), String(at || Date.now()));
    } catch (err) {
        console.error('Local save failed for ' + key, err);
    }
}

function dbIsEmptyValue(key, value) {
    if (value == null) return true;
    if (key === 'prixburgReportFiles') {
        return ['daily', 'weekly', 'monthly', 'yearly'].every(function (type) {
            return !value[type] || !value[type].length;
        });
    }
    if (Array.isArray(value)) return value.length === 0;
    if (key === 'prixburgLoginDetails') {
        return !value || typeof value !== 'object' || !(value.mainUsername || value.settingsUsername);
    }
    return false;
}

function dbLocalAt(key) {
    return parseInt(localStorage.getItem(dbStampKey(key)) || '0', 10) || 0;
}

function dbMergeLists(remote, local, localIsNewer) {
    const remoteList = Array.isArray(remote) ? remote : [];
    const localList = Array.isArray(local) ? local : [];
    if (localIsNewer && localList.length) return dbClone(localList);
    if (remoteList.length) return dbClone(remoteList);
    return dbClone(localList);
}

function dbMergeKey(key, remote, local, remoteUpdatedAt) {
    const localAt = dbLocalAt(key);
    const remoteAt = remoteUpdatedAt ? Date.parse(remoteUpdatedAt) : 0;
    const localIsNewer = !dbIsEmptyValue(key, local) && localAt > 0 && localAt > remoteAt;
    if (key === 'prixburgReportFiles') {
        const types = ['daily', 'weekly', 'monthly', 'yearly'];
        const out = { daily: [], weekly: [], monthly: [], yearly: [] };
        types.forEach(function (type) {
            out[type] = dbMergeLists(remote && remote[type], local && local[type], localIsNewer);
        });
        return out;
    }
    if (Array.isArray(remote) || Array.isArray(local)) {
        return dbMergeLists(remote, local, localIsNewer);
    }
    if (localIsNewer && local != null) return dbClone(local);
    if (remote == null) return dbClone(local);
    return dbClone(remote);
}

function dbStripHeavyReportContent(cache) {
    const files = cache && cache.prixburgReportFiles;
    if (!files) return false;
    let changed = false;
    ['daily', 'weekly', 'monthly', 'yearly'].forEach(function (type) {
        (files[type] || []).forEach(function (file) {
            if (file && file.content) {
                file.content = '';
                changed = true;
            }
        });
    });
    return changed;
}

function dbLoadAllLocal() {
    const cache = dbClone(PRIXBURG_DB_DEFAULTS);
    PRIXBURG_DB_KEYS.forEach(function (key) {
        const localValue = dbReadLocal(key, null);
        if (localValue == null) return;
        cache[key] = localValue;
    });
    if (dbStripHeavyReportContent(cache)) {
        dbWriteLocal('prixburgReportFiles', cache.prixburgReportFiles);
    }
    return cache;
}

function dbPeek(key) {
    if (!prixburgCache) prixburgCache = dbLoadAllLocal();
    if (!Object.prototype.hasOwnProperty.call(prixburgCache, key)) return PRIXBURG_DB_DEFAULTS[key];
    return prixburgCache[key];
}

function dbGet(key) {
    if (!prixburgCache) prixburgCache = dbLoadAllLocal();
    if (!Object.prototype.hasOwnProperty.call(prixburgCache, key)) return dbClone(PRIXBURG_DB_DEFAULTS[key]);
    return dbClone(prixburgCache[key]);
}

function dbSet(key, value) {
    if (!prixburgCache) prixburgCache = dbClone(PRIXBURG_DB_DEFAULTS);
    const stored = dbClone(value);
    const gen = (prixburgWriteGen[key] = (prixburgWriteGen[key] || 0) + 1);
    prixburgCache[key] = stored;
    dbWriteLocal(key, stored);
    prixburgWriteQueue = prixburgWriteQueue.then(function () {
        if (prixburgWriteGen[key] !== gen) return;
        return dbUpsert(key, stored);
    }).catch(function (err) {
        console.error('Supabase save failed for ' + key, err);
        if (!dbIsNetworkError(err)) dbShowError(err.message || String(err));
    });
    return prixburgWriteQueue;
}

function dbUpsert(key, value) {
    return dbFetch(dbUrl('/rest/v1/prixburg_data?on_conflict=key'), {
        method: 'POST',
        headers: dbHeaders({
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates,return=minimal'
        }),
        body: JSON.stringify({
            key: dbRemoteKey(key),
            value: value,
            updated_at: new Date().toISOString()
        })
    }, 12000).then(function (res) {
        if (!res.ok) {
            return res.text().then(function (text) {
                throw new Error(text || ('Supabase HTTP ' + res.status));
            });
        }
    });
}

function dbReadLocal(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
    } catch (err) {
        return fallback;
    }
}

function dbClearLocal() {
    PRIXBURG_DB_KEYS.forEach(function (key) {
        localStorage.removeItem(key);
    });
    localStorage.removeItem('allowedUsers');
}

function dbShowError(message) {
    if (typeof document === 'undefined') return;
    var box = document.getElementById('prixburgDbError');
    if (!box) {
        box = document.createElement('div');
        box.id = 'prixburgDbError';
        box.className = 'db-error';
        document.body.appendChild(box);
    }
    box.textContent = 'Supabase: ' + message;
}

function initPrixburgDb() {
    const gensAtStart = {};
    const memory = prixburgCache;
    PRIXBURG_DB_KEYS.forEach(function (key) {
        gensAtStart[key] = prixburgWriteGen[key] || 0;
    });
    prixburgCache = dbLoadAllLocal();
    if (memory) {
        PRIXBURG_DB_KEYS.forEach(function (key) {
            if ((prixburgWriteGen[key] || 0) > 0 && memory[key] != null) {
                prixburgCache[key] = dbClone(memory[key]);
            }
        });
    }
    return dbFetch(dbUrl('/rest/v1/prixburg_data?select=key,value,updated_at'), {
        headers: dbHeaders()
    }, 8000).then(function (res) {
        if (res.status === 404) {
            throw new Error('Create table public.prixburg_data in the Supabase SQL editor. Run supabase/schema.sql.');
        }
        if (!res.ok) {
            return res.text().then(function (text) {
                throw new Error(text || ('Supabase HTTP ' + res.status));
            });
        }
        return res.json();
    }).then(function (rows) {
        const remoteMap = {};
        const remotePrefix = (window.PRIXBURG_TENANT && window.PRIXBURG_TENANT !== 'prixburg')
            ? 'tenant:' + window.PRIXBURG_TENANT + ':'
            : '';
        (rows || []).forEach(function (row) {
            if (!row || !row.key) return;
            var logical = row.key;
            if (remotePrefix) {
                if (String(row.key).indexOf(remotePrefix) !== 0) return;
                logical = String(row.key).slice(remotePrefix.length);
            } else if (String(row.key).indexOf('tenant:') === 0) {
                return;
            }
            if (PRIXBURG_DB_KEYS.indexOf(logical) !== -1) remoteMap[logical] = row;
        });
        PRIXBURG_DB_KEYS.forEach(function (key) {
            if ((prixburgWriteGen[key] || 0) > gensAtStart[key]) return;
            const remoteRow = remoteMap[key];
            const localValue = prixburgCache[key];
            if (remoteRow) {
                const remoteAt = remoteRow.updated_at ? Date.parse(remoteRow.updated_at) : 0;
                const merged = dbMergeKey(key, remoteRow.value, localValue, remoteRow.updated_at);
                prixburgCache[key] = merged;
                if (!dbIsEmptyValue(key, localValue) && dbLocalAt(key) > remoteAt) {
                    dbSet(key, merged);
                } else {
                    dbWriteLocal(key, merged, remoteAt || Date.now());
                }
            } else if (!dbIsEmptyValue(key, localValue)) {
                dbSet(key, localValue);
            }
        });
    }).catch(function (err) {
        console.error('Supabase init failed', err);
        if (!dbIsNetworkError(err)) dbShowError(err.message || String(err));
        PRIXBURG_DB_KEYS.forEach(function (key) {
            if ((prixburgWriteGen[key] || 0) > gensAtStart[key]) return;
            const localValue = dbReadLocal(key, null);
            if (localValue != null) prixburgCache[key] = localValue;
        });
    });
}

function whenDbReady(fn) {
    function start() {
        var vault = window.fortressVaultReady || Promise.resolve();
        vault.then(function () {
            if (!prixburgCache) prixburgCache = dbLoadAllLocal();
            try { fn(); } catch (err) { console.error(err); }
            (window.dbReady || Promise.resolve()).then(fn).catch(function () { fn(); });
        });
    }
    if (document.body) {
        start();
    } else {
        document.addEventListener('DOMContentLoaded', start);
    }
}

function waitForDbReady(ms) {
    const ready = window.dbReady || Promise.resolve();
    return Promise.race([
        Promise.resolve(ready).catch(function () {}),
        new Promise(function (resolve) { setTimeout(resolve, ms == null ? 2500 : ms); })
    ]);
}

function registerPrixburgServiceWorker() {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').then(function (reg) {
            reg.update().catch(function () {});
            if (reg.waiting) {
                try { reg.waiting.postMessage({ type: 'SKIP_WAITING' }); } catch (err) { /* ignore */ }
            }
        }).catch(function () {});
    });
}

function getAppSettings() {
    const saved = dbGet('prixburgAppSettings') || {};
    return {
        autoDailyFiles: saved.autoDailyFiles !== false,
        projectStartedOn: saved.projectStartedOn || ''
    };
}

function saveAppSettings(next) {
    dbSet('prixburgAppSettings', Object.assign({}, getAppSettings(), next || {}));
}

function autoDailyFilesOn() {
    return getAppSettings().autoDailyFiles !== false;
}

window.dbPeek = dbPeek;
window.dbGet = dbGet;
window.dbSet = dbSet;
window.whenDbReady = whenDbReady;
window.waitForDbReady = waitForDbReady;
window.getAppSettings = getAppSettings;
window.saveAppSettings = saveAppSettings;
window.autoDailyFilesOn = autoDailyFilesOn;
window.dbLiveReady = false;
registerPrixburgServiceWorker();
window.dbReady = new Promise(function (resolve, reject) {
    function begin() {
        var vault = window.fortressVaultReady || Promise.resolve();
        vault.then(function () {
        if (!prixburgCache) prixburgCache = dbLoadAllLocal();
        initPrixburgDb().then(function (value) {
            window.dbLiveReady = true;
            resolve(value);
        }).catch(function (err) {
            window.dbLiveReady = true;
            reject(err);
        });
        });
    }
    function afterPaint() {
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(function () { setTimeout(begin, 0); });
        } else {
            setTimeout(begin, 0);
        }
    }
    if (document.body) afterPaint();
    else document.addEventListener('DOMContentLoaded', afterPaint);
});
