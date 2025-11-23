import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Busca a lista do banco de dados
    const invites = await kv.get('invites') || [];
    
    // Retorna a lista (O Batch vai filtrar o que é 'used: false')
    return res.status(200).json(invites);
}
