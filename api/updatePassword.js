import fs from "fs";
import path from "path";

export default function handler(req, res) {

    if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

    const { username, newPassword } = req.body;

    if (!username || !newPassword)
        return res.status(400).json({ error: "Campos faltando" });

    const usersPath = path.join(process.cwd(), "data", "users.json");
    const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));

    const user = users.find(u => u.username === username);

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    user.password = newPassword;

    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    res.status(200).json({ success: true });
}
