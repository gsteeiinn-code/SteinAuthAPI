import fs from "fs";
import path from "path";

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: "Invite obrigatório" });
    }

    const invitesPath = path.join(process.cwd(), "data", "invites.json");
    let invites = JSON.parse(fs.readFileSync(invitesPath, "utf8"));

    if (!invites.some(inv => inv.code === code)) {
        return res.status(404).json({ error: "Invite não existe" });
    }

    invites = invites.filter(inv => inv.code !== code);

    fs.writeFileSync(invitesPath, JSON.stringify(invites, null, 2));

    return res.status(200).json({
        success: true,
        message: "Invite removido!"
    });
}
