import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const bannedPath = path.join(process.cwd(), "data", "banned.json");
  try {
    const banned = JSON.parse(fs.readFileSync(bannedPath, "utf8"));
    return res.status(200).json(banned);
  } catch (e) {
    return res.status(200).json([]);
  }
}
