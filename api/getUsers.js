import fs from "fs";
import path from "path";

export default function handler(req, res) {
    const usersPath = path.join(process.cwd(), "data", "users.json");
    const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
    return res.status(200).json(users);
}

