import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dbPath = path.resolve(process.cwd(), 'src/pages/api/bd.json');
const lerBanco = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const salvarBanco = (dados: any) => fs.writeFileSync(dbPath, JSON.stringify(dados, null, 2));

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' });

  const { titulo, genero, autor, quantidade } = req.body;
  const bd = lerBanco();

  if (!titulo || !genero || !autor || quantidade === undefined) {
    return res.status(400).json({ erro: 'Título, gênero, autor e quantidade são obrigatórios.' });
  }

  const livroDuplicado = bd.livros?.find((livro: any) => livro.titulo === titulo && livro.autor === autor);
  if (livroDuplicado) {
    return res.status(400).json({ erro: 'Este livro já está cadastrado no sistema.' });
  }

  const novoLivro = {
    id: crypto.randomUUID(),
    titulo,
    genero,
    autor,
    quantidade: Number(quantidade),
    qtdEmprestados: 0
  };

  if (!bd.livros) bd.livros = [];
  bd.livros.push(novoLivro);
  salvarBanco(bd);

  return res.status(201).json(novoLivro);
}