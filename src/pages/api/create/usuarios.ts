import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dbPath = path.resolve(process.cwd(), 'src/pages/api/bd.json');
const lerBanco = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const salvarBanco = (dados: any) => fs.writeFileSync(dbPath, JSON.stringify(dados, null, 2));

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' });

  const { nome, email, telefone } = req.body;
  const bd = lerBanco();

  if (!nome || !email || !telefone) {
    return res.status(400).json({ erro: 'Nome, email e telefone são obrigatórios.' });
  }

  const emailExiste = bd.usuarios?.find((user: any) => user.email === email);
  if (emailExiste) {
    return res.status(400).json({ erro: 'Este email já está cadastrado.' });
  }

  const novoUsuario = {
    id: crypto.randomUUID(),
    nome,
    email,
    telefone
  };

  if (!bd.usuarios) bd.usuarios = [];
  bd.usuarios.push(novoUsuario);
  salvarBanco(bd);

  return res.status(201).json(novoUsuario);
}