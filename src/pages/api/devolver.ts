import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'src/pages/api/bd.json');
const lerBanco = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const salvarBanco = (dados: any) => fs.writeFileSync(dbPath, JSON.stringify(dados, null, 2));

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { emprestimoId } = req.body; 
  const bd = lerBanco();

  const emprestimo = bd.emprestimos?.find((emp: any) => emp.id === emprestimoId && emp.status === 'ativo');
  if (!emprestimo) {
    return res.status(404).json({ erro: 'Empréstimo ativo não encontrado.' });
  }

 
  emprestimo.livrosIds.forEach((livroId: string) => {
    const livro = bd.livros?.find((l: any) => l.id === livroId);
    if (livro && livro.qtdEmprestados > 0) {
      livro.qtdEmprestados -= 1;
    }
  });


  emprestimo.status = 'concluído';
  emprestimo.dataDevolucao = new Date().toISOString();

  salvarBanco(bd);

  return res.status(200).json({ mensagem: 'Devolução realizada com sucesso!', emprestimo });
}