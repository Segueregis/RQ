import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, DollarSign } from 'lucide-react';
import Layout from '../components/Layout';
import { useRequisitions } from '../contexts/RequisitionContext';
import { useAuth } from '../contexts/AuthContext';
import { utsList } from '../data/uts';

const Finance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { requisitions } = useRequisitions();
  const { currentUser, isViewer, isAdmin } = useAuth();
  const navigate = useNavigate();

  const getUTDescription = (utId: string) => {
    const ut = utsList.find(u => u.id === utId);
    return ut ? ut.descricao : utId;
  };

  const financeRequisitions = useMemo(() => {
    return requisitions.filter(req => {
      // Visualizadores e admins veem todas as requisições em financeiro
      // Usuários normais veem apenas suas próprias requisições em financeiro
      const matchesUser = isViewer || isAdmin || req.userId === currentUser?.id;
      const inFinance = req.status === 'aguardando_lancamento';
      const matchesSearch = !searchTerm ||
        req.rq.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getUTDescription(req.ut).toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.oc && req.oc.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesUser && inFinance && matchesSearch;
    });
  }, [requisitions, currentUser, isViewer, isAdmin, searchTerm]);

  const handleRowClick = (requisitionId: string) => {
    navigate(`/requisition/${requisitionId}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
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
                  placeholder="Buscar por RQ, OC ou Descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RQ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor da NF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    OC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UT
                  </th>
                  {(isAdmin || isViewer) && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário Envio
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {financeRequisitions.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => handleRowClick(req.id)}
                    className="cursor-pointer hover:bg-gray-50 transition-colors bg-blue-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {req.rq}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {req.valorNF ? formatCurrency(req.valorNF) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {req.fornecedor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {req.notaFiscal || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {req.oc || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {req.ut ? getUTDescription(req.ut) : '-'}
                    </td>
                    {(isAdmin || isViewer) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {req.usuarioEnvio || '-'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Em Financeiro
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {financeRequisitions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma requisição em financeiro.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Finance;