import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const invites = await kv.get('invites') || [];
        return res.status(200).json(invites);
    } catch (error) {
        return res.status(500).json([]);
    }
}
