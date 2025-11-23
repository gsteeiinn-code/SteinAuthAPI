import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { username, reason } = req.body;

    try {
        let banned = await kv.get('banned') || [];
        
        if (!banned.some(b => b.username === username)) {
            banned.push({ username, reason, date: new Date().toISOString() });
            await kv.set('banned', banned);
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
