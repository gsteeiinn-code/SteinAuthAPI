import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    const { username, password, invite } = req.body;

    if (!username || !password || !invite) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }

    try {
        // Carregar dados do banco (Redis)
        let users = await kv.get('users') || [];
        let invites = await kv.get('invites') || [];
        let banned = await kv.get('banned') || [];

        // Verificações
        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            return res.status(400).json({ error: "Usuario ja existe" });
        }
        if (banned.some(b => b.username.toLowerCase() === username.toLowerCase())) {
            return res.status(403).json({ error: "Usuario banido" });
        }

        // Verificar Invite
        const inviteIndex = invites.findIndex(i => i.code === invite);
        
        if (inviteIndex === -1) {
            return res.status(404).json({ error: "Invite invalido" });
        }
        
        if (invites[inviteIndex].used) {
            return res.status(400).json({ error: "Invite ja usado" });
        }

        // --- SUCESSO: SALVAR DADOS NO BANCO ---
        
        // 1. Atualizar Invite
        invites[inviteIndex].used = true;
        invites[inviteIndex].usedBy = username;
        await kv.set('invites', invites);

        // 2. Criar Usuário
        const newUser = {
            username,
            password,
            inviteUsed: invite,
            date: new Date().toISOString(),
            isAdmin: false
        };
        
        users.push(newUser);
        await kv.set('users', users);

        return res.status(200).json({ success: true, message: "Conta criada com sucesso!" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro no servidor: " + error.message });
    }
}
