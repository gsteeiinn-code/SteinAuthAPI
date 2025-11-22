const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Arquivo onde os usuários serão armazenados
const USERS_FILE = path.join(__dirname, 'users.json');

// Inicializar arquivo de usuários se não existir
function initializeUsersFile() {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify({}));
        console.log('Arquivo de usuários criado');
    }
}

// Carregar usuários do arquivo
function loadUsers() {
    try {
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
    return {};
}

// Salvar usuários no arquivo
function saveUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar usuários:', error);
        return false;
    }
}

// Middleware para parsing de URL
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rota de criação de conta
app.get('/api/create', (req, res) => {
    const { user, pass } = req.query;
    
    // Validar parâmetros
    if (!user || !pass) {
        return res.send('MISSING_DATA');
    }
    
    if (user.length < 3 || pass.length < 3) {
        return res.send('INVALID_LENGTH');
    }
    
    // Carregar usuários existentes
    const users = loadUsers();
    
    // Verificar se usuário já existe
    if (users[user]) {
        return res.send('USER_EXISTS');
    }
    
    // Criar novo usuário
    users[user] = {
        password: pass,
        createdAt: new Date().toISOString(),
        lastLogin: null
    };
    
    // Salvar usuários
    if (saveUsers(users)) {
        console.log(`Conta criada: ${user}`);
        res.send('CREATED');
    } else {
        res.send('SAVE_ERROR');
    }
});

// Rota de login
app.get('/login', (req, res) => {
    const { user, pass } = req.query;
    
    // Validar parâmetros
    if (!user || !pass) {
        return res.send('INVALID_DATA');
    }
    
    // Carregar usuários
    const users = loadUsers();
    
    // Verificar se usuário existe e senha está correta
    if (users[user] && users[user].password === pass) {
        // Atualizar último login
        users[user].lastLogin = new Date().toISOString();
        saveUsers(users);
        
        console.log(`Login bem-sucedido: ${user}`);
        res.send('OK');
    } else {
        console.log(`Tentativa de login falhou: ${user}`);
        res.send('INVALID_CREDENTIALS');
    }
});

// Rota para listar usuários (apenas para admin/depuração)
app.get('/admin/users', (req, res) => {
    const users = loadUsers();
    res.json({
        totalUsers: Object.keys(users).length,
        users: users
    });
});

// Rota para deletar usuário (apenas para admin/depuração)
app.get('/admin/delete', (req, res) => {
    const { user } = req.query;
    const users = loadUsers();
    
    if (users[user]) {
        delete users[user];
        saveUsers(users);
        res.send(`Usuário ${user} deletado`);
    } else {
        res.send('USER_NOT_FOUND');
    }
});

// Health check
app.get('/', (req, res) => {
    const users = loadUsers();
    res.json({
        status: 'API Stein Auth Online',
        totalUsers: Object.keys(users).length,
        version: '1.0.0'
    });
});

// Inicializar a API
const PORT = process.env.PORT || 3000;

// Garantir que o arquivo de usuários existe ao iniciar
initializeUsersFile();

app.listen(PORT, () => {
    const users = loadUsers();
    console.log(`🚀 Stein Auth API rodando na porta ${PORT}`);
    console.log(`📊 Total de usuários registrados: ${Object.keys(users).length}`);
});

module.exports = app;
