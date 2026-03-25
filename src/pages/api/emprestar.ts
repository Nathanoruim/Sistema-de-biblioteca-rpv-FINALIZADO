import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dbPath = path.resolve(process.cwd(), 'src/pages/api/bd.json');
const lerBanco = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const salvarBanco = (dados: any) => fs.writeFileSync(dbPath, JSON.stringify(dados, null, 2));

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' });

  const { usuarioId, livrosIds } = req.body; 
  const bd = lerBanco();

  const usuarioExiste = bd.usuarios?.find((user: any) => user.id === usuarioId);
  if (!usuarioExiste) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  const livrosParaEmprestar = [];
  for (let id of livrosIds) {
    const livro = bd.livros?.find((l: any) => l.id === id);
    if (!livro) {
      return res.status(404).json({ erro: `Livro com ID ${id} não encontrado.` });
    }
    if (livro.qtdEmprestados >= livro.quantidade) {
      return res.status(400).json({ erro: `O livro '${livro.titulo}' não tem unidades disponíveis.` });
    }
    livrosParaEmprestar.push(livro);
  }

  
  livrosParaEmprestar.forEach(livro => {
    livro.qtdEmprestados += 1;
  });

  const novoEmprestimo = {
    id: crypto.randomUUID(),
    usuarioId,
    livrosIds,
    status: 'ativo',
    dataEmprestimo: new Date().toISOString()
  };

  if (!bd.emprestimos) bd.emprestimos = [];
  bd.emprestimos.push(novoEmprestimo);
  salvarBanco(bd);

  return res.status(201).json(novoEmprestimo);
}