import fs from "fs";
import path from "path";

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: "Código obrigatório" });
    }

    const invitesPath = path.join(process.cwd(), "data", "invites.json");
    const invites = JSON.parse(fs.readFileSync(invitesPath, "utf8"));

    const invite = invites.find(inv => inv.code === code);

    if (!invite) {
        return res.status(404).json({ valid: false, error: "Invite não existe" });
    }

    if (invite.used) {
        return res.status(400).json({ valid: false, error: "Invite já usado" });
    }

    return res.status(200).json({
        valid: true,
        invite
    });
}
