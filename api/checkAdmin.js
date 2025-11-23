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

    const adminsPath = path.join(process.cwd(), "data", "admins.json");
    const admins = JSON.parse(fs.readFileSync(adminsPath, "utf8"));

    const isAdmin = admins.includes(username);

    return res.status(200).json({
        username,
        isAdmin
    });
}
