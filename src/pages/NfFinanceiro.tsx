import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Hourglass, Sigma, X } from 'lucide-react';

// Definindo o tipo para os dados da Nota Fiscal, incluindo os novos campos
type NotaFiscal = {
  id: string;
  created_at: string;
  numero_nota: string;
  data_emissao: string;
  fornecedor: string;
  numero_oc: string;
  ut: string;
  valor_nota: number;
  status: 'Lançado' | 'Aguardando Lançamento' | 'Tratativa';
};

const NfFinanceiroPage = () => {
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | NotaFiscal['status']>('all');
  const [error, setError] = useState('');
  const { isFinanceiro, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Espera a autenticação carregar antes de verificar as permissões
    if (!authLoading && !isFinanceiro && !isAdmin) {
      navigate('/home');
    }
  }, [isFinanceiro, isAdmin, authLoading, navigate]);

  const fetchNotas = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notas_fiscais')
      .select('id, created_at, numero_nota, data_emissao, fornecedor, numero_oc, ut, valor_nota, status')
      .order('created_at', { ascending: false });

    if (error) {
      setError('Erro ao buscar as notas fiscais: ' + error.message);
      console.error(error);
    } else {
      setNotas(data as NotaFiscal[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isFinanceiro || isAdmin) {
      fetchNotas();
    }
  }, [isFinanceiro, isAdmin, fetchNotas]);

  const handleStatusChange = async (id: string, newStatus: NotaFiscal['status']) => {
    const notaToUpdate = notas.find(n => n.id === id);
    if (!notaToUpdate || notaToUpdate.status === newStatus) {
      return; // Não faz nada se o status for o mesmo
    }

    const originalNotas = [...notas];
    setNotas(notas.map(n => n.id === id ? { ...n, status: newStatus } : n));

    const { error: updateError } = await supabase
      .from('notas_fiscais')
      .update({ status: newStatus })
      .eq('id', id);

    if (updateError) {
      setError('Falha ao atualizar o status: ' + updateError.message);
      setNotas(originalNotas); // Reverte em caso de erro
    }
  };

  const statusCounts = useMemo(() => {
    return notas.reduce((acc, nota) => {
      if (nota.status === 'Lançado') acc.lancado++;
      else if (nota.status === 'Aguardando Lançamento') acc.aguardando++;
      else if (nota.status === 'Tratativa') acc.tratativa++;
      return acc;
    }, { lancado: 0, aguardando: 0, tratativa: 0 });
  }, [notas]);

  const filteredNotas = useMemo(() => {
    if (filterStatus === 'all') {
      return notas;
    }
    return notas.filter(nota => nota.status === filterStatus);
  }, [notas, filterStatus]);

  if (authLoading || (!isFinanceiro && !isAdmin)) {
    return <div className="loading">Carregando...</div>;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="nf-financeiro-container">
      <style>{`
        .nf-financeiro-container {
          padding: 2rem;
          max-width: 1200px;
          margin: auto;
          font-family: sans-serif;
          position: relative;
        }
        .close-button { position: absolute; top: 1rem; right: 1rem; background: none; border: none; cursor: pointer; color: #888; transition: color 0.2s; }
        .close-button:hover { color: #333; }
        .nf-financeiro-container h1 {
          text-align: center;
          margin-bottom: 2rem;
          color: #333;
        }
        .status-panel {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .status-card {
          padding: 1.5rem;
          border-radius: 8px;
          color: white;
          text-align: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .status-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 500;
          text-transform: uppercase;
          opacity: 0.9;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .status-card .count {
          font-size: 2.5rem;
          font-weight: bold;
          text-align: right;
        }
        .status-card.lancado { background-color: #28a745; }
        .status-card.aguardando { background-color: #fd7e14; }
        .status-card.tratativa { background-color: #dc3545; }
        .status-card.totais { background-color: #007bff; }
        .table-container {
          overflow-x: auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .nf-table {
          width: 100%;
          border-collapse: collapse;
        }
        .nf-table th,
        .nf-table td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid #ddd;
          text-align: left;
          vertical-align: middle;
          white-space: nowrap;
        }
        .nf-table th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        .nf-table tbody tr:hover {
          background-color: #f1f1f1;
        }
        .status-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }
        .status-select {
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          border: 1px solid #ccc;
          font-weight: bold;
          cursor: pointer;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
        }
        .status-select.lançado { background-color: #d4edda; color: #155724; border-color: #c3e6cb; }
        .status-select.aguardando-lançamento { background-color: #fff3cd; color: #856404; border-color: #ffeeba; }
        .status-select.tratativa { background-color: #f8d7da; color: #721c24; border-color: #f5c6cb; }
        .loading,
        .error {
          text-align: center;
          font-size: 1.2rem;
          padding: 2rem;
          color: #555;
        }
        .error { color: #dc3545; }
        .filter-controls {
          margin-bottom: 1.5rem;
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .filter-controls button {
          padding: 0.5rem 1rem;
          border: 1px solid #ccc;
          background-color: white;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }
        .filter-controls button.active {
          background-color: #007bff;
          color: white;
          border-color: #007bff;
        }
        .filter-controls button:hover:not(.active) {
          background-color: #e9ecef;
        }
      `}</style>
      <button onClick={() => navigate('/home')} className="close-button" aria-label="Fechar">
        <X className="h-6 w-6" />
      </button>
      <h1>Painel Financeiro de Notas Fiscais</h1>
      <div className="status-panel">
        <div className="status-card lancado"><h3><CheckCircle2 size={24}/> NF - Lançadas</h3><p className="count">{statusCounts.lancado}</p></div>
        <div className="status-card aguardando"><h3><Hourglass size={24}/> NF - Aguardando Lançamento</h3><p className="count">{statusCounts.aguardando}</p></div>
        <div className="status-card tratativa"><h3><AlertTriangle size={24}/> NF - Em Tratativa</h3><p className="count">{statusCounts.tratativa}</p></div>
        <div className="status-card totais"><h3><Sigma size={24}/> NF Totais</h3><p className="count">{notas.length}</p></div>
      </div>

      {loading && <p className="loading">Carregando notas...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="filter-controls">
            <button onClick={() => setFilterStatus('all')} className={filterStatus === 'all' ? 'active' : ''}>Todos</button>
            <button onClick={() => setFilterStatus('Lançado')} className={filterStatus === 'Lançado' ? 'active' : ''}>Lançados</button>
            <button onClick={() => setFilterStatus('Aguardando Lançamento')} className={filterStatus === 'Aguardando Lançamento' ? 'active' : ''}>Aguardando</button>
            <button onClick={() => setFilterStatus('Tratativa')} className={filterStatus === 'Tratativa' ? 'active' : ''}>Em Tratativa</button>
          </div>
          <div className="table-container">
            <table className="nf-table">
              <thead>
                <tr>
                  <th>Nota Fiscal</th>
                  <th>Data de Emissão</th>
                  <th>Fornecedor</th>
                  <th>UT</th>
                  <th>Valor</th>
                  <th>Número OC</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotas.map((nota) => (
                  <tr key={nota.id}>
                    <td>{nota.numero_nota}</td>
                    <td>{new Date(nota.data_emissao + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td>{nota.fornecedor}</td>
                    <td title={nota.ut}>{nota.ut.substring(0, 25) + (nota.ut.length > 25 ? '...' : '')}</td>
                    <td>{formatCurrency(nota.valor_nota)}</td>
                    <td>{nota.numero_oc}</td>
                    <td>
                      <select
                        value={nota.status}
                        onChange={(e) => handleStatusChange(nota.id, e.target.value as NotaFiscal['status'])}
                        className={`status-select ${nota.status.toLowerCase().replace(/\s/g, '-')}`}
                      >
                        <option value="Aguardando Lançamento">Aguardando Lançamento</option>
                        <option value="Lançado">Lançado</option>
                        <option value="Tratativa">Tratativa</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredNotas.length === 0 && (
              <p className="loading">Nenhuma nota fiscal encontrada para este status.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NfFinanceiroPage;
