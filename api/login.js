import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { username, password } = req.body;
    
    const users = await kv.get('users') || [];
    const banned = await kv.get('banned') || [];

    if (banned.some(b => b.username.toLowerCase() === username.toLowerCase())) {
        return res.status(403).json({ error: "Banido" });
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        return res.status(200).json({ success: true, user });
    } else {
        return res.status(401).json({ error: "Credenciais invalidas" });
    }
}
