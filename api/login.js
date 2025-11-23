import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { username, password } = req.body;
    
    try {
        const users = await kv.get('users') || [];
        const banned = await kv.get('banned') || [];

        // Checar banimento
        if (banned.some(b => b.username.toLowerCase() === username.toLowerCase())) {
            return res.status(403).json({ error: "Usuario banido" });
        }

        // Validar login
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            return res.status(200).json({ success: true, username: user.username });
        } else {
            return res.status(401).json({ error: "Credenciais invalidas" });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
