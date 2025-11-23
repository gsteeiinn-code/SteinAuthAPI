import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).send("");
    const { username } = req.body;

    let banned = await kv.get('banned') || [];
    
    // Filtra removendo o usuário
    const newBanned = banned.filter(b => b.username !== username);
    
    await kv.set('banned', newBanned);

    return res.status(200).json({ success: true });
}
