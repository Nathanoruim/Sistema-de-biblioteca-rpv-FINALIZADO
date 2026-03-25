import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';


const dbPath = path.resolve(process.cwd(), 'src/pages/api/bd.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
 
  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido. Usa GET.' });
  }

  try {
    
    const bd = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    
    return res.status(200).json(bd.usuarios || []);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno ao tentar ler a base de dados.' });
  }
}