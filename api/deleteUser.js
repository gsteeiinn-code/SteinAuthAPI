import fs from "fs";
import path from "path";

export default function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Username obrigatório" });
    }

    const usersPath = path.join(process.cwd(), "data", "users.json");
    let users = JSON.parse(fs.readFileSync(usersPath, "utf8"));

    if (!users.some(u => u.username === username)) {
        return res.status(404).json({ error: "Usuário não existe" });
    }

    users = users.filter(u => u.username !== username);

    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    return res.status(200).json({
        success: true,
        message: "Usuário removido"
    });
}
