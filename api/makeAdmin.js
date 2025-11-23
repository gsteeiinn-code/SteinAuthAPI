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

    const adminsPath = path.join(process.cwd(), "data", "admins.json");
    const usersPath = path.join(process.cwd(), "data", "users.json");

    const admins = JSON.parse(fs.readFileSync(adminsPath, "utf8"));
    const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));

    const userExists = users.some(u => u.username === username);

    if (!userExists) {
        return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (admins.includes(username)) {
        return res.status(400).json({ error: "Usuário já é administrador" });
    }

    admins.push(username);

    fs.writeFileSync(adminsPath, JSON.stringify(admins, null, 2));

    return res.status(200).json({
        success: true,
        message: "Usuário promovido a administrador"
    });
}
