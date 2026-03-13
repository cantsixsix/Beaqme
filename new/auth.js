// ═══════════════════════════════════════════
// BEAQME AUTH MODULE
// Extracted from newHome.html, compatible with unit.test.js
// ═══════════════════════════════════════════

const ADMIN_EMAIL = 'ederlanbritoctt@gmail.com';

// ─────────────────────────────────────────
// STORAGE
// ─────────────────────────────────────────
const getUsers    = () => JSON.parse(localStorage.getItem('bq_users')   || '[]');
const saveUsers   = u  => localStorage.setItem('bq_users', JSON.stringify(u));
const getSession  = () => JSON.parse(localStorage.getItem('bq_session') || 'null');
const saveSession = s  => localStorage.setItem('bq_session', JSON.stringify(s));
const clearSession= () => localStorage.removeItem('bq_session');

// Mensagens: { [userEmail]: [{id, text, isAdmin, ts, read}] }
const getChats  = () => JSON.parse(localStorage.getItem('bq_chats') || '{}');
const saveChats = c  => localStorage.setItem('bq_chats', JSON.stringify(c));

function getConv(email) { return getChats()[email] || []; }
function saveConv(email, msgs) {
    const all = getChats();
    all[email] = msgs;
    saveChats(all);
}

// ─────────────────────────────────────────
// AUTH MODAL
// ─────────────────────────────────────────
function openAuth(tab = 'login') {
    const modal = document.getElementById('authModal');
    if (modal) { modal.classList.add('visible'); document.body.style.overflow = 'hidden'; }
    switchTab(tab);
}
function closeAuth() {
    const modal = document.getElementById('authModal');
    if (modal) { modal.classList.remove('visible'); document.body.style.overflow = ''; }
}
function switchTab(tab) {
    const isL = tab === 'login';
    const tabLogin = document.getElementById('tabLogin');
    const tabSignup = document.getElementById('tabSignup');
    const panelLogin = document.getElementById('panelLogin');
    const panelSignup = document.getElementById('panelSignup');
    const loginError = document.getElementById('loginError');
    const signupError = document.getElementById('signupError');
    if (tabLogin) tabLogin.classList.toggle('active', isL);
    if (tabSignup) tabSignup.classList.toggle('active', !isL);
    if (panelLogin) panelLogin.classList.toggle('active', isL);
    if (panelSignup) panelSignup.classList.toggle('active', !isL);
    if (loginError) loginError.style.display = 'none';
    if (signupError) signupError.style.display = 'none';
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const pass  = document.getElementById('loginPass').value;
    const users = getUsers();
    const user  = users.find(u => u.email === email && u.password === btoa(pass));
    if (!user) { document.getElementById('loginError').style.display = 'block'; return; }
    const btn = document.getElementById('loginBtn');
    btn.textContent = 'Entrando…'; btn.disabled = true;
    setTimeout(() => {
        saveSession({ name: user.name, email: user.email });
        closeAuth();
        btn.textContent = 'Entrar'; btn.disabled = false;
        applySession();
    }, 700);
}

function handleSignup(e) {
    e.preventDefault();
    const name  = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const pass  = document.getElementById('signupPass').value;
    const pass2 = document.getElementById('signupPass2').value;
    const errEl = document.getElementById('signupError');

    if (pass !== pass2) { errEl.textContent = 'As senhas nao conferem.'; errEl.style.display = 'block'; return; }
    const users = getUsers();
    if (users.find(u => u.email === email)) { errEl.textContent = 'E-mail ja cadastrado.'; errEl.style.display = 'block'; return; }

    const btn = document.getElementById('signupBtn');
    btn.textContent = 'Criando…'; btn.disabled = true;
    setTimeout(() => {
        users.push({ name, email, password: btoa(pass) });
        saveUsers(users);
        saveSession({ name, email });
        closeAuth();
        btn.textContent = 'Criar conta gratis'; btn.disabled = false;
        applySession();
    }, 800);
}

// ─────────────────────────────────────────
// AVATAR DROPDOWN
// ─────────────────────────────────────────
function toggleUserDropdown() {
    const btn = document.getElementById('avatarBtn');
    if (btn) btn.classList.toggle('open');
}
function closeUserDropdown() {
    const btn = document.getElementById('avatarBtn');
    if (btn) btn.classList.remove('open');
}

// ─────────────────────────────────────────
// SESSION (render header by role)
// ─────────────────────────────────────────
function isAdmin(email) { return email.toLowerCase() === ADMIN_EMAIL.toLowerCase(); }

function applySession() {
    const s = getSession();
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');

    if (!s) {
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        const floatChat = document.getElementById('floatChat');
        if (floatChat) floatChat.style.display = 'none';
        return;
    }

    const admin = isAdmin(s.email);
    const initial = s.name.charAt(0).toUpperCase();

    if (authButtons) authButtons.style.display = 'none';
    if (userMenu) userMenu.style.display = 'block';

    const circle = document.getElementById('avatarCircle');
    if (circle) {
        circle.textContent = initial;
        circle.className = 'avatar-circle ' + (admin ? 'admin-avatar' : 'user-avatar-c');
    }
    const avatarName = document.getElementById('avatarName');
    if (avatarName) avatarName.textContent = s.name.split(' ')[0];
    const ddName = document.getElementById('ddName');
    if (ddName) ddName.textContent = s.name;
    const ddEmail = document.getElementById('ddEmail');
    if (ddEmail) ddEmail.textContent = s.email;
    const roleEl = document.getElementById('ddRole');
    if (roleEl) {
        roleEl.textContent = admin ? 'Admin' : 'Usuario';
        roleEl.className = 'dd-role ' + (admin ? 'admin' : 'user');
    }

    const ddContent = document.getElementById('ddContent');
    if (ddContent) ddContent.innerHTML = admin ? buildAdminDropdown() : buildUserDropdown();

    const mobileAuthArea = document.getElementById('mobileAuthArea');
    if (mobileAuthArea) mobileAuthArea.innerHTML = buildMobileUser(s, admin);

    const floatChat = document.getElementById('floatChat');
    if (floatChat) floatChat.style.display = admin ? 'none' : 'block';

    if (admin) {
        updateAdminUnreadBadge();
    } else {
        updateUserUnreadBadge(s.email);
    }
}

function buildAdminDropdown() {
    return `
        <div class="dd-section-title">Ferramentas</div>
        <button class="dd-item" onclick="openInboxModal(); closeUserDropdown()">Mensagens <span id="ddUnreadCount" style="margin-left:auto;background:#f87171;color:#fff;font-size:.65rem;font-weight:800;padding:2px 6px;border-radius:8px;display:none;"></span></button>
        <div class="dd-separator"></div>
        <div class="dd-section-title">Links</div>
        <a class="dd-item" href="../tools/task.html">Task Workspace</a>
        <a class="dd-item" href="../tools/finance.html">Finance Dashboard</a>
        <a class="dd-item" href="../tools/health.html">Health Pro</a>`;
}

function buildUserDropdown() {
    return `
        <button class="dd-item" onclick="openChatModal(); closeUserDropdown()">
            Chat com Beaqme
            <span id="ddUserUnread" style="margin-left:auto;background:#f87171;color:#fff;font-size:.65rem;font-weight:800;padding:2px 6px;border-radius:8px;display:none;"></span>
        </button>
        <div class="dd-separator"></div>
        <div class="dd-section-title">Ferramentas</div>
        <a class="dd-item" href="tools/task.html">Task Workspace</a>
        <a class="dd-item" href="tools/finance.html">Finance Dashboard</a>
        <a class="dd-item" href="tools/health.html">Health Pro</a>`;
}

function buildMobileUser(s, admin) {
    const initial = s.name.charAt(0).toUpperCase();
    const toolLinks = `
        <a href="${admin ? '../' : ''}tools/task.html" class="btn btn-outline btn-small" style="width:100%;display:flex;justify-content:center;gap:8px;" onclick="toggleMenu()">Task</a>
        <a href="${admin ? '../' : ''}tools/finance.html" class="btn btn-outline btn-small" style="width:100%;display:flex;justify-content:center;gap:8px;" onclick="toggleMenu()">Finance</a>
        <a href="${admin ? '../' : ''}tools/health.html" class="btn btn-outline btn-small" style="width:100%;display:flex;justify-content:center;gap:8px;" onclick="toggleMenu()">Health</a>`;

    let buttons = admin
        ? `<button class="btn btn-outline btn-small" style="width:100%;display:flex;justify-content:center;gap:8px;" onclick="toggleMenu();openInboxModal()">Mensagens</button>${toolLinks}`
        : `<button class="btn btn-outline btn-small" style="width:100%;display:flex;justify-content:center;gap:8px;" onclick="toggleMenu();openChatModal()">Chat com Beaqme</button>${toolLinks}`;

    return `<div style="display:flex;flex-direction:column;gap:8px;">
        <div style="display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--glass);border-radius:10px;border:1px solid var(--border);">
            <div class="avatar-circle ${admin ? 'admin-avatar' : 'user-avatar-c'}" style="width:28px;height:28px;font-size:.75rem;">${initial}</div>
            <span style="font-size:.88rem;color:var(--text-secondary);">${s.name.split(' ')[0]}</span>
        </div>
        ${buttons}
        <button class="btn btn-danger btn-small" style="width:100%;display:flex;justify-content:center;" onclick="toggleMenu();logout()">Sair</button>
    </div>`;
}

function logout() {
    clearSession();
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const floatChat = document.getElementById('floatChat');
    const mobileAuthArea = document.getElementById('mobileAuthArea');
    if (authButtons) authButtons.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
    if (floatChat) floatChat.style.display = 'none';
    if (mobileAuthArea) mobileAuthArea.innerHTML =
        `<div class="mobile-auth">
            <a href="#" class="btn btn-outline btn-small" style="flex:1;justify-content:center;" onclick="toggleMenu();openAuth('login')">Entrar</a>
            <a href="#" class="btn btn-primary btn-small" style="flex:1;justify-content:center;" onclick="toggleMenu();openAuth('signup')">Criar conta</a>
        </div>`;
    closeUserDropdown();
}

// ─────────────────────────────────────────
// CHAT — USER
// ─────────────────────────────────────────
let chatActive = false;
function openChatModal() {
    chatActive = true;
    const modal = document.getElementById('chatModal');
    if (modal) { modal.classList.add('visible'); document.body.style.overflow = 'hidden'; }
    renderChat();
    markUserMessagesRead();
}
function closeChatModal() {
    chatActive = false;
    const modal = document.getElementById('chatModal');
    if (modal) { modal.classList.remove('visible'); document.body.style.overflow = ''; }
}

function renderChat() {
    const s = getSession(); if (!s) return;
    const msgs = getConv(s.email);
    const container = document.getElementById('chatMessages');
    const empty = document.getElementById('chatEmpty');
    if (!container) return;

    if (msgs.length === 0) {
        if (empty) { empty.style.display = 'block'; container.innerHTML = ''; container.appendChild(empty); }
        return;
    }
    if (empty) empty.style.display = 'none';

    container.innerHTML = msgs.map(m => `
        <div class="chat-bubble ${m.isAdmin ? 'from-admin' : 'from-user'}">
            ${escHtml(m.text)}
            <div class="bubble-time">${formatTime(m.ts)}</div>
        </div>`).join('');
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const s = getSession(); if (!s) return;
    const input = document.getElementById('chatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const msgs = getConv(s.email);
    msgs.push({ id: Date.now(), text, isAdmin: false, ts: Date.now(), read: false });
    saveConv(s.email, msgs);

    input.value = '';
    input.style.height = 'auto';
    renderChat();
    updateAdminUnreadBadge();

    const hasAdminReply = msgs.some(m => m.isAdmin);
    if (!hasAdminReply) {
        setTimeout(() => {
            const msgs2 = getConv(s.email);
            msgs2.push({ id: Date.now()+1, text: 'Oi! Recebi sua mensagem e responderei em breve.', isAdmin: true, ts: Date.now(), read: false });
            saveConv(s.email, msgs2);
            if (chatActive) renderChat();
            updateUserUnreadBadge(s.email);
        }, 1500);
    }
}

function markUserMessagesRead() {
    const s = getSession(); if (!s) return;
    const msgs = getConv(s.email).map(m => m.isAdmin ? { ...m, read: true } : m);
    saveConv(s.email, msgs);
    updateUserUnreadBadge(s.email);
}

function updateUserUnreadBadge(email) {
    const count = getConv(email).filter(m => m.isAdmin && !m.read).length;
    const fb = document.getElementById('floatUnread');
    const db = document.getElementById('ddUserUnread');
    if (fb) { fb.textContent = count; fb.classList.toggle('hidden', count === 0); }
    if (db) { db.textContent = count; db.style.display = count > 0 ? 'inline-block' : 'none'; }
}

// ─────────────────────────────────────────
// INBOX — ADMIN
// ─────────────────────────────────────────
let currentConvEmail = null;

function openInboxModal() {
    const modal = document.getElementById('inboxModal');
    if (modal) { modal.classList.add('visible'); document.body.style.overflow = 'hidden'; }
    showInboxList();
    closeUserDropdown();
}
function closeInboxModal() {
    const modal = document.getElementById('inboxModal');
    if (modal) { modal.classList.remove('visible'); document.body.style.overflow = ''; }
    currentConvEmail = null;
}

function showInboxList() {
    const inboxView = document.getElementById('inboxView');
    const convView = document.getElementById('convView');
    if (inboxView) inboxView.style.display = 'block';
    if (convView) convView.style.display = 'none';
    currentConvEmail = null;

    const all   = getChats();
    const users = getUsers();
    const list  = document.getElementById('inboxList');
    if (!list) return;

    const threads = Object.entries(all).map(([email, msgs]) => {
        const user   = users.find(u => u.email === email);
        const name   = user ? user.name : email;
        const last   = msgs[msgs.length - 1];
        const unread = msgs.filter(m => !m.isAdmin && !m.read).length;
        return { email, name, last, unread };
    }).filter(t => t.last).sort((a, b) => b.last.ts - a.last.ts);

    if (threads.length === 0) {
        list.innerHTML = '<div class="inbox-empty">Nenhuma mensagem ainda.</div>';
        return;
    }

    list.innerHTML = threads.map(t => `
        <div class="inbox-item" onclick="openConv('${escAttr(t.email)}')">
            <div class="inbox-avatar">${t.name.charAt(0).toUpperCase()}</div>
            <div class="inbox-info">
                <div class="inbox-name">${escHtml(t.name)}</div>
                <div class="inbox-preview">${escHtml(t.last.text)}</div>
            </div>
            <div class="inbox-meta">
                <div class="inbox-time">${formatTime(t.last.ts)}</div>
                ${t.unread > 0 ? `<div class="inbox-unread">${t.unread}</div>` : ''}
            </div>
        </div>`).join('');
}

function openConv(email) {
    currentConvEmail = email;
    const inboxView = document.getElementById('inboxView');
    const convView = document.getElementById('convView');
    if (inboxView) inboxView.style.display = 'none';
    if (convView) convView.style.display = 'block';

    const msgs = getConv(email).map(m => !m.isAdmin ? { ...m, read: true } : m);
    saveConv(email, msgs);
    updateAdminUnreadBadge();

    renderConv();
    const input = document.getElementById('convInput');
    if (input) input.focus();
}

function renderConv() {
    if (!currentConvEmail) return;
    const msgs = getConv(currentConvEmail);
    const container = document.getElementById('convMessages');
    if (!container) return;
    container.innerHTML = msgs.map(m => `
        <div class="chat-bubble ${m.isAdmin ? 'from-user' : 'from-admin'}">
            ${escHtml(m.text)}
            <div class="bubble-time">${formatTime(m.ts)}</div>
        </div>`).join('');
    container.scrollTop = container.scrollHeight;
}

function sendAdminReply() {
    if (!currentConvEmail) return;
    const input = document.getElementById('convInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const msgs = getConv(currentConvEmail);
    msgs.push({ id: Date.now(), text, isAdmin: true, ts: Date.now(), read: false });
    saveConv(currentConvEmail, msgs);
    input.value = '';
    renderConv();
    updateUserUnreadBadge(currentConvEmail);
}

function updateAdminUnreadBadge() {
    const all = getChats();
    const total = Object.values(all).reduce((sum, msgs) => sum + msgs.filter(m => !m.isAdmin && !m.read).length, 0);
    const badge = document.getElementById('unreadBadge');
    const ddCount = document.getElementById('ddUnreadCount');
    if (badge) { badge.textContent = total || ''; badge.setAttribute('data-count', total); badge.style.display = total > 0 ? 'flex' : 'none'; }
    if (ddCount) { ddCount.textContent = total; ddCount.style.display = total > 0 ? 'inline-block' : 'none'; }
}

// ─────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────
function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escAttr(str) { return String(str).replace(/'/g,'&#39;'); }
function formatTime(ts) {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'agora';
    if (diff < 3600000) return Math.floor(diff/60000) + 'min';
    if (diff < 86400000) return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
    return d.getDate() + '/' + (d.getMonth()+1);
}

// ─────────────────────────────────────────
// INIT
// ─────────────────────────────────────────
const BqAuth = {
    init(config) {
        // Create admin account if not exists
        const users = getUsers();
        if (!users.find(u => u.email === ADMIN_EMAIL)) {
            users.push({ name: 'Ederlan', email: ADMIN_EMAIL, password: btoa('beaqme2026') });
            saveUsers(users);
        }

        // Close modals on escape
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') { closeUserDropdown(); closeAuth(); closeChatModal(); closeInboxModal(); }
        });

        // Close dropdown on outside click
        document.addEventListener('click', e => {
            const avatarBtn = document.getElementById('avatarBtn');
            if (avatarBtn && !avatarBtn.contains(e.target)) closeUserDropdown();
        });

        applySession();
    }
};

// Expose on window for compatibility with tests
if (typeof window !== 'undefined') {
    window.ADMIN_EMAIL = ADMIN_EMAIL;
    window.getUsers = getUsers;
    window.saveUsers = saveUsers;
    window.getSession = getSession;
    window.saveSession = saveSession;
    window.clearSession = clearSession;
    window.getChats = getChats;
    window.saveChats = saveChats;
    window.getConv = getConv;
    window.saveConv = saveConv;
    window.openAuth = openAuth;
    window.closeAuth = closeAuth;
    window.switchTab = switchTab;
    window.handleLogin = handleLogin;
    window.handleSignup = handleSignup;
    window.toggleUserDropdown = toggleUserDropdown;
    window.closeUserDropdown = closeUserDropdown;
    window.isAdmin = isAdmin;
    window.applySession = applySession;
    window.logout = logout;
    window.openChatModal = openChatModal;
    window.closeChatModal = closeChatModal;
    window.renderChat = renderChat;
    window.sendMessage = sendMessage;
    window.openInboxModal = openInboxModal;
    window.closeInboxModal = closeInboxModal;
    window.showInboxList = showInboxList;
    window.openConv = openConv;
    window.renderConv = renderConv;
    window.sendAdminReply = sendAdminReply;
    window.escHtml = escHtml;
    window.escAttr = escAttr;
    window.formatTime = formatTime;
    window.BqAuth = BqAuth;
}
