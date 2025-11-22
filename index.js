const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Configurações
const ADMIN_PASSWORD = "Stein23912387aaaas";
const INVITES_FILE = path.join(__dirname, 'invites.txt');
const USERS_FILE = path.join(__dirname, 'users.json');
const USED_INVITES_FILE = path.join(__dirname, 'used_invites.txt');

// Inicializar arquivos
function initializeFiles() {
    if (!fs.existsSync(INVITES_FILE)) {
        fs.writeFileSync(INVITES_FILE, 'rcp2c7e5phd7a6jb8\n');
    }
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify({}));
    }
    if (!fs.existsSync(USED_INVITES_FILE)) {
        fs.writeFileSync(USED_INVITES_FILE, '');
    }
}

// Funções
function getInvites() {
    if (!fs.existsSync(INVITES_FILE)) return [];
    const data = fs.readFileSync(INVITES_FILE, 'utf8');
    return data.split('\n').filter(line => line.trim() !== '');
}

function getUsedInvites() {
    if (!fs.existsSync(USED_INVITES_FILE)) return [];
    const data = fs.readFileSync(USED_INVITES_FILE, 'utf8');
    return data.split('\n').filter(line => line.trim() !== '');
}

function markInviteAsUsed(invite) {
    fs.appendFileSync(USED_INVITES_FILE, invite + '\n');
}

function consumeInvite(inviteToRemove) {
    const invites = getInvites();
    const newInvites = [];
    let found = false;
    
    for (const inv of invites) {
        if (inv.trim() === inviteToRemove.trim()) {
            found = true;
            markInviteAsUsed(inviteToRemove);
        } else {
            newInvites.push(inv);
        }
    }
    
    if (found) {
        fs.writeFileSync(INVITES_FILE, newInvites.join('\n'));
        return true;
    }
    return false;
}

function loadUsers() {
    if (!fs.existsSync(USERS_FILE)) return {};
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

function saveUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        return false;
    }
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Rotas
app.get('/', (req, res) => {
    const users = loadUsers();
    const invites = getInvites();
    const usedInvites = getUsedInvites();
    
    res.json({
        status: 'online',
        message: 'Stein Auth API - Vercel',
        total_users: Object.keys(users).length,
        active_invites: invites.length,
        used_invites: usedInvites.length,
        version: '4.0.0'
    });
});

app.get('/api/status', (req, res) => {
    const users = loadUsers();
    const invites = getInvites();
    const usedInvites = getUsedInvites();
    
    res.json({
        status: 'online',
        total_users: Object.keys(users).length,
        active_invites: invites.length,
        used_invites: usedInvites.length
    });
});

app.get('/api/check', (req, res) => {
    const invite = (req.query.invite || '').trim();
    const invites = getInvites();
    const usedInvites = getUsedInvites();

    if (usedInvites.includes(invite)) {
        return res.json({ status: 'used' });
    }
    
    if (invites.includes(invite)) {
        res.json({ status: 'valid' });
    } else {
        res.json({ status: 'invalid' });
    }
});

app.get('/api/consume', (req, res) => {
    const invite = (req.query.invite || '').trim();
    const invites = getInvites();
    const usedInvites = getUsedInvites();

    if (usedInvites.includes(invite)) {
        return res.json({ status: 'already_used' });
    }
    
    if (!invites.includes(invite)) {
        return res.json({ status: 'invalid' });
    }

    if (consumeInvite(invite)) {
        res.json({ status: 'used' });
    } else {
        res.json({ status: 'error' });
    }
});

app.get('/api/login', (req, res) => {
    const user = (req.query.user || '').trim();
    const pass = (req.query.pass || '').trim();
    
    if (!user || !pass) {
        return res.send('INVALID_DATA');
    }
    
    const users = loadUsers();
    
    if (users[user] && users[user].password === pass) {
        users[user].lastLogin = new Date().toISOString();
        saveUsers(users);
        res.send('OK');
    } else {
        res.send('INVALID_CREDENTIALS');
    }
});

app.get('/api/create', (req, res) => {
    const user = (req.query.user || '').trim();
    const pass = (req.query.pass || '').trim();
    
    if (!user || !pass) {
        return res.send('MISSING_DATA');
    }
    
    if (user.length < 3 || pass.length < 3) {
        return res.send('INVALID_LENGTH');
    }
    
    const users = loadUsers();
    
    if (users[user]) {
        return res.send('USER_EXISTS');
    }
    
    users[user] = {
        password: pass,
        createdAt: new Date().toISOString(),
        lastLogin: null
    };
    
    if (saveUsers(users)) {
        res.send('CREATED');
    } else {
        res.send('SAVE_ERROR');
    }
});

// Inicializar
initializeFiles();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Stein Auth API running on port ${PORT}`);
});

module.exports = app;
