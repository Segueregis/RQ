import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import CreateRequisitionModal from '../components/CreateRequisitionModal';
import { useRequisitions } from '../contexts/RequisitionContext';
import { useAuth } from '../contexts/AuthContext';
import { utsList } from '../data/uts';

const Home: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pendente' | 'aguardando_lancamento'
  >('all');

  const { requisitions } = useRequisitions();
  const { currentUser, isViewer, isAdmin } = useAuth();
  const navigate = useNavigate();

  const getUTDescription = (utId: string) => {
    const ut = utsList.find(u => u.id === utId);
    return ut ? ut.descricao : utId;
  };

  const filteredRequisitions = useMemo(() => {
    return requisitions.filter(req => {
      // Admin e Viewer veem tudo
      // Usuário comum vê apenas as próprias
      const matchesUser =
        isAdmin || isViewer || req.userId === currentUser?.id;

      // Home NÃO exibe itens que já estão no financeiro
      const notInFinance =
        req.status === 'pendente';

      const matchesSearch =
        !searchTerm ||
        req.rq.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getUTDescription(req.ut).toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.oc && req.oc.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        filterStatus === 'all' || req.status === filterStatus;

      return matchesUser && notInFinance && matchesSearch && matchesStatus;
    });
  }, [requisitions, currentUser, isViewer, isAdmin, searchTerm, filterStatus]);

  const handleRowClick = (requisitionId: string) => {
    navigate(`/requisition/${requisitionId}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'aguardando_lancamento':
        return 'Aguardando Lançamento';
      case 'abriu_chamado':
        return 'Abriu Chamado';
      case 'lancada':
        return 'Lançada';
        case 'lancada':
        return 'Lançada';
      case 'paga':
        return 'Paga';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Requisições</h1>

          {!isViewer && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Criar nova RQ</span>
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por RQ, OC, UT ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as 'all' | 'pendente' | 'aguardando_lancamento')
                }
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos os Status</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RQ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor RQ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Local</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fornecedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredRequisitions.map(req => (
                  <tr
                    key={req.id}
                    onClick={() => handleRowClick(req.id)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium">{req.rq}</td>
                    <td className="px-6 py-4">{formatCurrency(req.valorTotal)}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{req.descricao}</td>
                    <td className="px-6 py-4">{req.local}</td>
                    <td className="px-6 py-4">{req.fornecedor}</td>
                    <td className="px-6 py-4">
                      {getStatusLabel(req.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRequisitions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Nenhuma requisição encontrada.
            </div>
          )}
        </div>
      </div>

      <CreateRequisitionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Layout>
  );
};

export default Home;
