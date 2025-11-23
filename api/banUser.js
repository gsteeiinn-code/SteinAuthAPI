import fs from "fs";
import path from "path";

export default function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

    const { username, reason } = req.body;

    if (!username) return res.status(400).json({ error: "Username obrigatório" });

    const pathBan = path.join(process.cwd(), "data", "banned.json");
    const banned = JSON.parse(fs.readFileSync(pathBan, "utf8"));

    if (banned.some(u => u.username === username))
        return res.status(400).json({ error: "Usuário já banido" });

    banned.push({
        username,
        reason: reason || "Sem motivo informado",
        date: new Date().toISOString()
    });

    fs.writeFileSync(pathBan, JSON.stringify(banned, null, 2));

    res.status(200).json({ success: true });
}
