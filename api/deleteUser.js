import fs from "fs";
import path from "path";

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Username é obrigatório" });
    }

    const usersPath = path.join(process.cwd(), "data", "users.json");
    const bannedPath = path.join(process.cwd(), "data", "banned.json");
    const adminsPath = path.join(process.cwd(), "data", "admins.json");

    let users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
    let banned = JSON.parse(fs.readFileSync(bannedPath, "utf8"));
    let admins = JSON.parse(fs.readFileSync(adminsPath, "utf8"));

    if (!users.some(u => u.username === username)) {
        return res.status(404).json({ error: "Usuário não existe" });
    }

    users = users.filter(u => u.username !== username);
    banned = banned.filter(b => b.username !== username);
    admins = admins.filter(a => a !== username);

    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    fs.writeFileSync(bannedPath, JSON.stringify(banned, null, 2));
    fs.writeFileSync(adminsPath, JSON.stringify(admins, null, 2));

    return res.status(200).json({
        success: true,
        message: "Usuário deletado com sucesso"
    });
}
