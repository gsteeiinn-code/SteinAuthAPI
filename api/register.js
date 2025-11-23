import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Permissões de acesso (CORS)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

    const { username, password, invite } = req.body;

    if (!username || !password || !invite) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }

    try {
        // 1. Carregar dados do Banco de Dados (KV)
        const users = await kv.get('users') || [];
        const invites = await kv.get('invites') || [];
        const banned = await kv.get('banned') || [];

        // 2. Verificações
        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            return res.status(400).json({ error: "Usuario ja existe" });
        }
        if (banned.some(b => b.username.toLowerCase() === username.toLowerCase())) {
            return res.status(403).json({ error: "Usuario banido" });
        }

        // 3. Validar Invite
        const inviteIndex = invites.findIndex(i => i.code === invite);

        if (inviteIndex === -1) {
            return res.status(404).json({ error: "Invite invalido" });
        }
        
        if (invites[inviteIndex].used) {
            return res.status(400).json({ error: "Invite ja usado" });
        }

        // --- SUCESSO: SALVAR NO BANCO ---

        // Atualizar invite
        invites[inviteIndex].used = true;
        invites[inviteIndex].usedBy = username;
        
        // Criar usuário
        const newUser = {
            username,
            password,
            inviteUsed: invite,
            date: new Date().toISOString(),
            isAdmin: false
        };
        users.push(newUser);

        // Salvar as listas atualizadas no Redis (KV)
        await kv.set('invites', invites);
        await kv.set('users', users);

        return res.status(200).json({ success: true, message: "Conta criada!" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro interno: " + error.message });
    }
}
