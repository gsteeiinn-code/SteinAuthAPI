import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Username é obrigatório" });
    }

    const dataPath = path.join(process.cwd(), "data", "banned.json");
    let banned = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    if (!banned.some(u => u.username === username)) {
        return res.status(404).json({ error: "Usuário não está banido" });
    }

    banned = banned.filter(u => u.username !== username);

    fs.writeFileSync(dataPath, JSON.stringify(banned, null, 2));

    return res.status(200).json({ success: true, message: "Ban removido" });
}
