import fs from "fs";
import path from "path";

export default function handler(req, res) {
    const invitesPath = path.join(process.cwd(), "data", "invites.json");
    const invites = JSON.parse(fs.readFileSync(invitesPath, "utf8"));
    return res.status(200).json(invites);
}

