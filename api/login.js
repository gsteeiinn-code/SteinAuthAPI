import fs from "fs";
import path from "path";

export default function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Campos faltando" });
    }

    const usersPath = path.join(process.cwd(), "data", "users.json");
    const bannedPath = path.join(process.cwd(), "data", "banned.json");
    const adminsPath = path.join(process.cwd(), "data", "admins.json");

    const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
    const banned = JSON.parse(fs.readFileSync(bannedPath, "utf8"));
    const admins = JSON.parse(fs.readFileSync(adminsPath, "utf8"));

    if (banned.some(b => b.username === username)) {
        return res.status(403).json({ error: "Usuário banido" });
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(404).json({ error: "Login inválido" });
    }

    return res.status(200).json({
        success: true,
        isAdmin: admins.includes(username)
    });
}

