import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const banned = await kv.get('banned') || [];
    return res.status(200).json(banned);
}
