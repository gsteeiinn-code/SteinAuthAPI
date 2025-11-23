import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { code, usedBy } = req.body;
  if (!code) return res.status(400).json({ error: "code required" });

  const invitesPath = path.join(process.cwd(), "data", "invites.json");
  let invites = JSON.parse(fs.readFileSync(invitesPath, "utf8"));

  const inv = invites.find(i => i.code === code);
  if (!inv) return res.status(404).json({ error: "Invite não existe" });
  if (inv.used) return res.status(400).json({ error: "Invite já usado" });

  inv.used = true;
  inv.usedBy = usedBy || null;
  inv.usedAt = new Date().toISOString();

  fs.writeFileSync(invitesPath, JSON.stringify(invites, null, 2));
  return res.status(200).json({ success: true, invite: inv });
}
