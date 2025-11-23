import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    // Gera código aleatório
    const code = Math.random().toString(36).substring(2, 12).toUpperCase();
    
    // Cria o objeto do invite
    const newInvite = {
        code: code,
        creator: req.body.creator || "Admin",
        used: false,
        usedBy: null,
        date: new Date().toISOString()
    };

    // Pega a lista atual de invites do banco
    let invites = await kv.get('invites');
    if (!invites) invites = []; // Se não existir, cria lista vazia

    // Adiciona e salva
    invites.push(newInvite);
    await kv.set('invites', invites);

    return res.status(200).json({ success: true, code: code });
}
