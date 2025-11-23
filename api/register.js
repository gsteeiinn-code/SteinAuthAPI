// SteinAuthAPI/api/register.js

const fs = require('fs');
const path = require('path');

// Caminhos dos arquivos JSON
const usersPath = path.join(process.cwd(), 'data', 'users.json');
const invitesPath = path.join(process.cwd(), 'data', 'invites.json');

// Função para ler dados (com tratamento de erro básico)
function readJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Se o arquivo não existir ou for inválido, retorna um array vazio
        return [];
    }
}

module.exports = (req, res) => {
    // 1. Configurações e Verificação de Método
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { username, password, invite } = req.body;

    // 2. Validação de Dados de Entrada
    if (!username || !password || !invite) {
        return res.status(400).json({ error: 'Username, password, and invite code are required.' });
    }

    // 3. Carregar Dados
    let users = readJsonFile(usersPath);
    let invites = readJsonFile(invitesPath);

    // 4. Checar se o Usuário já Existe
    if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
        return res.status(409).json({ error: 'User already exists.' });
    }

    // 5. Encontrar e Validar o Invite
    const inv = invites.find(i => i.code === invite);

    if (!inv) {
        return res.status(404).json({ error: 'Invite code not found.' });
    }

    if (inv.used) {
        return res.status(403).json({ error: 'Invite code already used by ' + inv.usedBy });
    }

    // 6. Criar e Persistir Dados
    
    // Marcar o invite como usado
    inv.used = true;
    inv.usedBy = username;

    // Adicionar o novo usuário
    users.push({
        username: username,
        password: password, // Em um sistema real, a senha deveria ser HASHED!
        isAdmin: false,
        dateCreated: new Date().toISOString()
    });

    // ⚠️ CORREÇÃO CRÍTICA: SALVAR ALTERAÇÕES NOS ARQUIVOS
    // A falta destas linhas causava o erro 500.
    try {
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
        fs.writeFileSync(invitesPath, JSON.stringify(invites, null, 2));
    } catch (writeError) {
        console.error('Failed to write to data files:', writeError);
        // Retorna um erro interno se a escrita falhar
        return res.status(500).json({ error: 'Internal Server Error: Failed to save data.' });
    }
    
    // 7. Resposta de Sucesso
    return res.status(200).json({ success: true, message: 'Account registered successfully.', username: username });
};
