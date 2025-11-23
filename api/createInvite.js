import fs from "fs";
import path from "path";

export default function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    const invitesPath = path.join(process.cwd(), "data", "invites.json");
    const invites = JSON.parse(fs.readFileSync(invitesPath, "utf8"));

    const code = Math.random().toString(36).substring(2, 12).toUpperCase();

    invites.push({
        code,
        used: false,
        usedBy: null
    });

    fs.writeFileSync(invitesPath, JSON.stringify(invites, null, 2));

    return res.status(200).json({
        success: true,
        code
    });
}

