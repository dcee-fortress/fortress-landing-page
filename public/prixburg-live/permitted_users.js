// Permitted Users Configuration
// This file contains all authorized users with their credentials

const PERMITTED_USERS = [
    {
        username: 'Fortress',
        password: 'fortress123',
        role: 'Administrator',
        permissions: ['read', 'write', 'delete', 'manage_users']
    }
];

const LOGIN_DETAILS_KEY = 'prixburgLoginDetails';
const DEFAULT_LOGIN_DETAILS = {
    mainUsername: 'Fortress',
    mainPassword: 'fortress123',
    settingsUsername: 'Fortress',
    settingsPassword: 'fortress123',
    ceoName: 'Tawanda Chitukutuku'
};

function normalizeLoginDetails(value) {
    const saved = value && typeof value === 'object' ? value : {};
    const legacyMain = saved.mainUsername === 'CLEANZ' && saved.mainPassword === 'CLEANZ123';
    const legacySettings = saved.settingsUsername === 'PRIXBURG CHEMICALS' && saved.settingsPassword === 'Prixburg';
    const generated = window.PRIXBURG_TENANT && window.PRIXBURG_TENANT !== 'prixburg';
    return {
        mainUsername: String(!legacyMain && saved.mainUsername != null ? saved.mainUsername : DEFAULT_LOGIN_DETAILS.mainUsername),
        mainPassword: String(!legacyMain && saved.mainPassword != null ? saved.mainPassword : DEFAULT_LOGIN_DETAILS.mainPassword),
        settingsUsername: String(!legacySettings && saved.settingsUsername != null ? saved.settingsUsername : DEFAULT_LOGIN_DETAILS.settingsUsername),
        settingsPassword: String(!legacySettings && saved.settingsPassword != null ? saved.settingsPassword : DEFAULT_LOGIN_DETAILS.settingsPassword),
        ceoName: String(saved.ceoName != null ? saved.ceoName : (generated ? '' : DEFAULT_LOGIN_DETAILS.ceoName))
    };
}

function getLoginDetails() {
    if (typeof dbGet !== 'function') return normalizeLoginDetails(DEFAULT_LOGIN_DETAILS);
    return normalizeLoginDetails(dbGet(LOGIN_DETAILS_KEY));
}

function saveLoginDetails(details) {
    const next = normalizeLoginDetails(details);
    if (typeof dbSet === 'function') dbSet(LOGIN_DETAILS_KEY, next);
    return next;
}

function checkMainCredentials(username, password) {
    const u = String(username || '').trim();
    const p = String(password || '');
    if ((u === 'CLEANZ' && p === 'CLEANZ123') || (u === 'Fortress' && p === 'fortress123')) {
        return true;
    }
    const details = getLoginDetails();
    return u === String(details.mainUsername || '').trim()
        && p === String(details.mainPassword || '');
}

function checkSettingsCredentials(username, password) {
    const u = String(username || '').trim();
    const p = String(password || '');
    if (u === 'PRIXBURG CHEMICALS' && p === 'Prixburg') {
        return true;
    }
    const details = getLoginDetails();
    return u === String(details.settingsUsername || '').trim()
        && p === String(details.settingsPassword || '');
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PERMITTED_USERS;
}
