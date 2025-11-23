import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const users = await kv.get('users') || [];
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json([]);
    }
}
