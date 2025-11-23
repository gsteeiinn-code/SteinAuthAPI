import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    const { username, reason } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Username é obrigatório" });
    }

    const dataPath = path.join(process.cwd(), "data", "banned.json");
    const usersPath = path.join(process.cwd(), "data", "users.json");

    const banned = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));

    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(404).json({ error: "Usuário não existe" });
    }

    // evita ban duplicado
    if (banned.some(u => u.username === username)) {
        return res.status(400).json({ error: "Usuário já está banido" });
    }

    banned.push({
        username,
        reason: reason || "Violação das regras",
        date: new Date().toISOString()
    });

    fs.writeFileSync(dataPath, JSON.stringify(banned, null, 2));

    return res.status(200).json({ success: true, message: "Usuário banido" });
}
