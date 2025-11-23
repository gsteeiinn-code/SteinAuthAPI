import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).send("");
    const { username, reason } = req.body;

    let banned = await kv.get('banned') || [];
    
    // Evita duplicatas
    if (!banned.some(b => b.username === username)) {
        banned.push({ username, reason, date: new Date().toISOString() });
        await kv.set('banned', banned);
    }

    return res.status(200).json({ success: true });
}
