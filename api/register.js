import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    const { username, password, invite } = req.body;

    if (!username || !password || !invite) {
        return res.status(400).json({ error: "Preencha todos os campos (usuario, senha, invite)" });
    }

    try {
        const dataDir = path.join(process.cwd(), "data");
        const usersPath = path.join(dataDir, "users.json");
        const invitesPath = path.join(dataDir, "invites.json");
        const bannedPath = path.join(dataDir, "banned.json");

        // Carregar dados
        const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
        const invites = JSON.parse(fs.readFileSync(invitesPath, "utf8"));
        const banned = JSON.parse(fs.readFileSync(bannedPath, "utf8"));

        // Verificações
        if (users.some(u => u.username === username)) {
            return res.status(400).json({ error: "Este usuario ja existe" });
        }
        if (banned.some(b => b.username === username)) {
            return res.status(403).json({ error: "Este usuario esta banido" });
        }

        // Achar invite
        const inviteObj = invites.find(i => i.code === invite);

        if (!inviteObj) {
            return res.status(404).json({ error: "Invite nao encontrado ou invalido" });
        }
        if (inviteObj.used) {
            return res.status(400).json({ error: "Este invite ja foi usado por: " + inviteObj.usedBy });
        }

        // --- SUCESSO: SALVAR DADOS ---
        
        // 1. Marcar invite como usado
        inviteObj.used = true;
        inviteObj.usedBy = username;

        // 2. Criar usuário
        users.push({
            username,
            password,
            inviteUsed: invite,
            date: new Date().toISOString()
        });

        // 3. Escrever no disco (Isso faltava no seu codigo antigo)
        fs.writeFileSync(invitesPath, JSON.stringify(invites, null, 2));
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

        return res.status(200).json({ success: true, message: "Conta criada com sucesso!" });

    } catch (error) {
        return res.status(500).json({ error: "Erro interno no servidor: " + error.message });
    }
}
