import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    const { username, password, invite } = req.body;

    if (!username || !password || !invite) {
        return res.status(400).json({ error: "Campos faltando" });
    }

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
        return res.status(400).json({ error: "Usuário já existe" });
    }
    if (banned.some(b => b.username === username)) {
        return res.status(403).json({ error: "Este usuário está banido" });
    }

    const inviteObj = invites.find(i => i.code === invite);

    if (!inviteObj) {
        return res.status(404).json({ error: "Invite inválido/inexistente" });
    }
    if (inviteObj.used) {
        return res.status(400).json({ error: "Invite já utilizado" });
    }

    // SUCESSO: Atualizar dados
    inviteObj.used = true;
    inviteObj.usedBy = username;

    users.push({
        username,
        password,
        inviteUsed: invite,
        date: new Date().toISOString()
    });

    // SALVAR NO ARQUIVO (Isso faltava antes)
    fs.writeFileSync(invitesPath, JSON.stringify(invites, null, 2));
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    return res.status(200).json({ success: true, message: "Conta criada com sucesso!" });
}
