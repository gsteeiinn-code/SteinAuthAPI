import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const users = await kv.get('users') || [];
    return res.status(200).json(users);
}
