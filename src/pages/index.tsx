import { useState, useEffect } from 'react';

export default function Home() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [livros, setLivros] = useState<any[]>([]);
  const [emprestimos, setEmprestimos] = useState<any[]>([]);

  const [nomeUser, setNomeUser] = useState('');
  const [emailUser, setEmailUser] = useState('');
  const [telefoneUser, setTelefoneUser] = useState('');

  const [tituloLivro, setTituloLivro] = useState('');
  const [autorLivro, setAutorLivro] = useState('');
  const [generoLivro, setGeneroLivro] = useState('');
  const [qtdLivro, setQtdLivro] = useState('');

  const [usuarioSelecionado, setUsuarioSelecionado] = useState('');
  const [livroSelecionado, setLivroSelecionado] = useState('');
  const [emprestimoSelecionado, setEmprestimoSelecionado] = useState('');

  const carregarDados = async () => {
    try {
      const resLivros = await fetch('/api/list/livros');
      setLivros(await resLivros.json());

      const resUsuarios = await fetch('/api/list/usuarios');
      setUsuarios(await resUsuarios.json());

      const resEmprestimos = await fetch('/api/list/emprestimos');
      if(resEmprestimos.ok) setEmprestimos(await resEmprestimos.json());
    } catch (erro) {
      console.error(erro);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const cadastrarUsuario = async () => {
    const res = await fetch('/api/create/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nomeUser, email: emailUser, telefone: telefoneUser })
    });
    const data = await res.json();
    if (res.ok) { 
      alert('Usuário cadastrado com sucesso!'); 
      setNomeUser(''); setEmailUser(''); setTelefoneUser('');
      carregarDados(); 
    } else { 
      alert(' Erro: ' + data.erro);
    }
  };

  const cadastrarLivro = async () => {
    const res = await fetch('/api/create/livros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: tituloLivro, autor: autorLivro, genero: generoLivro, quantidade: Number(qtdLivro) })
    });
    const data = await res.json();
    if (res.ok) { 
      alert('Livro cadastrado com sucesso!'); 
      setTituloLivro(''); setAutorLivro(''); setGeneroLivro(''); setQtdLivro('');
      carregarDados(); 
    } else { 
      alert(' Erro: ' + data.erro);
    }
  };

  const realizarEmprestimo = async () => {
    const res = await fetch('/api/emprestar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId: usuarioSelecionado, livrosIds: [livroSelecionado] })
    });
    const data = await res.json();
    if (res.ok) { 
      alert('Empréstimo realizado! O estoque foi atualizado.'); 
      setUsuarioSelecionado(''); setLivroSelecionado('');
      carregarDados(); 
    } else { 
      alert(' Erro: ' + data.erro); 
    }
  };

  const realizarDevolucao = async () => {
    const res = await fetch('/api/devolver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emprestimoId: emprestimoSelecionado })
    });
    const data = await res.json();
    if (res.ok) { 
      alert('Devolução realizada! Os livros voltaram para o estoque.'); 
      setEmprestimoSelecionado('');
      carregarDados(); 
    } else { 
      alert(' Erro: ' + data.erro); 
    }
  };

  const formatarData = (dataIso: string) => {
    if (!dataIso) return '-';
    const data = new Date(dataIso);
    return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#121212', color: '#eaeaea', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center' }}>Sistema de Biblioteca</h1>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
        
        <div style={cardStyle}>
          <h3 style={titleStyle}>1. Cadastrar Usuário</h3>
          <input style={inputStyle} placeholder="Nome" value={nomeUser} onChange={e => setNomeUser(e.target.value)} />
          <input style={inputStyle} placeholder="E-mail" value={emailUser} onChange={e => setEmailUser(e.target.value)} />
          <input style={inputStyle} placeholder="Telefone" value={telefoneUser} onChange={e => setTelefoneUser(e.target.value)} />
          <button style={btnStyle} onClick={cadastrarUsuario}>Salvar Usuário</button>
        </div>

        <div style={cardStyle}>
          <h3 style={titleStyle}>2. Cadastrar Livro</h3>
          <input style={inputStyle} placeholder="Título do Livro" value={tituloLivro} onChange={e => setTituloLivro(e.target.value)} />
          <input style={inputStyle} placeholder="Autor" value={autorLivro} onChange={e => setAutorLivro(e.target.value)} />
          <input style={inputStyle} placeholder="Gênero" value={generoLivro} onChange={e => setGeneroLivro(e.target.value)} />
          <input style={inputStyle} placeholder="Quantidade Total" type="number" value={qtdLivro} onChange={e => setQtdLivro(e.target.value)} />
          <button style={btnStyle} onClick={cadastrarLivro}>Salvar Livro</button>
        </div>

        <div style={cardStyle}>
          <h3 style={titleStyle}>3. Emprestar Livro</h3>
          <select style={inputStyle} value={usuarioSelecionado} onChange={e => setUsuarioSelecionado(e.target.value)}>
            <option value="">Selecione um Usuário</option>
            {usuarios.map((u: any) => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>

          <select style={inputStyle} value={livroSelecionado} onChange={e => setLivroSelecionado(e.target.value)}>
            <option value="">Selecione um Livro (Estoque)</option>
            {livros.map((l: any) => {
              const disponiveis = l.quantidade - l.qtdEmprestados;
              return (
                <option key={l.id} value={l.id} disabled={disponiveis <= 0}>
                  {l.titulo} (Disponíveis: {disponiveis})
                </option>
              );
            })}
          </select>
          <button style={btnStyle} onClick={realizarEmprestimo}>Realizar Empréstimo</button>
        </div>

        <div style={cardStyle}>
          <h3 style={titleStyle}>4. Devolução</h3>
          <select style={inputStyle} value={emprestimoSelecionado} onChange={e => setEmprestimoSelecionado(e.target.value)}>
            <option value="">Selecione um Empréstimo Ativo</option>
            {emprestimos.filter((e: any) => e.status === 'ativo').map((emp: any) => {
              const user = usuarios.find(u => u.id === emp.usuarioId);
              const nomeLivro = livros.find(l => l.id === (emp.livrosIds || [])[0])?.titulo || 'Livro';
              
              return (
                <option key={emp.id} value={emp.id}>
                  {user?.nome} devolvendo "{nomeLivro}"
                </option>
              );
            })}
          </select>
          <button style={btnStyle} onClick={realizarDevolucao}>Devolver Livro(s)</button>
        </div>

      </div>

   
      <div style={{ maxWidth: '1260px', margin: '40px auto 0 auto', backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '8px', boxShadow: '0 8px 16px rgba(0,0,0,0.5)' }}>
        <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: 0 }}>Histórico de Empréstimos</h3>
        
        {emprestimos.length === 0 ? (
          <p style={{ color: '#aaa', textAlign: 'center' }}>Nenhum empréstimo registrado ainda.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#2c2c2c', textAlign: 'left' }}>
                  <th style={thStyle}>Usuário</th>
                  <th style={thStyle}>Livro</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Data/Hora Coleta</th>
                  <th style={thStyle}>Data/Hora Devolução</th>
                </tr>
              </thead>
              <tbody>
                {emprestimos.map((emp: any) => {
                  const user = usuarios.find(u => u.id === emp.usuarioId)?.nome || 'Desconhecido';
                  const livro = livros.find(l => l.id === (emp.livrosIds || [])[0])?.titulo || 'Desconhecido';
                  const isAtivo = emp.status === 'ativo';

                  return (
                    <tr key={emp.id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={tdStyle}>{user}</td>
                      <td style={tdStyle}>{livro}</td>
                      <td style={tdStyle}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '12px', 
                          fontWeight: 'bold',
                          backgroundColor: isAtivo ? '#3a2a00' : '#003311',
                          color: isAtivo ? '#ffcc00' : '#00ff55'
                        }}>
                          {isAtivo ? ' Emprestado' : '   Devolvido'}
                        </span>
                      </td>
                      <td style={tdStyle}>{formatarData(emp.dataEmprestimo)}</td>
                      <td style={tdStyle}>{formatarData(emp.dataDevolucao)}</td>
                    </tr>
                  );
                }).reverse()} 
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

const cardStyle = {
  backgroundColor: '#1e1e1e',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
  width: '300px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '12px',
  color: '#ffffff'
};

const titleStyle = {
  margin: '0 0 10px 0',
  borderBottom: '1px solid #333',
  paddingBottom: '8px',
  fontSize: '18px'
};

const inputStyle = {
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #444',
  backgroundColor: '#2c2c2c',
  color: '#ffffff',
  fontSize: '14px',
  outline: 'none'
};

const btnStyle = {
  padding: '12px',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  marginTop: '10px',
  transition: 'background-color 0.2s'
};

const thStyle = {
  padding: '12px',
  borderBottom: '2px solid #444',
  color: '#ccc'
};

const tdStyle = {
  padding: '12px',
  color: '#eaeaea'
};