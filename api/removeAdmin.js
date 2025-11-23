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
    let admins = JSON.parse(fs.readFileSync(adminsPath, "utf8"));

    if (!admins.includes(username)) {
        return res.status(404).json({ error: "Usuário não é administrador" });
    }

    admins = admins.filter(a => a !== username);

    fs.writeFileSync(adminsPath, JSON.stringify(admins, null, 2));

    return res.status(200).json({
        success: true,
        message: "Administrador removido"
    });
}
