import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    // Gera código aleatório (ex: K92J-M3P1)
    const code = Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const newInvite = {
        code: code,
        creator: req.body.creator || "Admin",
        used: false,
        usedBy: null,
        date: new Date().toISOString()
    };

    try {
        let invites = await kv.get('invites');
        if (!invites || !Array.isArray(invites)) invites = [];

        invites.push(newInvite);
        await kv.set('invites', invites);

        return res.status(200).json({ success: true, code: code });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
