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

    const usersPath = path.join(process.cwd(), "data", "users.json");
    const invitesPath = path.join(process.cwd(), "data", "invites.json");

    const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
    const invites = JSON.parse(fs.readFileSync(invitesPath, "utf8"));

    if (users.some(u => u.username === username)) {
        return res.status(400).json({ error: "Usuário já existe" });
    }

    const inv = invites.find(i => i.code === invite);

    if (!inv) {
        return res.status(404).json({ error: "Invite inválido" });
    }

    if (inv.used) {
        return res.status(400).json({ error: "Invite já usado" });
    }

    inv.used = true;
    inv.usedBy = username;

    users.push({
        username,
        password,
        createdAt: new Date().toISOString()
    });

    fs.writeFileSync(invitesPath, JSON.stringify(invites, null, 2));
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    return res.status(200).json({
        success: true,
        message: "Conta criada com sucesso!"
    });
}

