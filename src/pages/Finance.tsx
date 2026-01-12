import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, DollarSign, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import { useRequisitions } from '../contexts/RequisitionContext';
import { useAuth } from '../contexts/AuthContext';
import { utsList } from '../data/uts';

const Finance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'aguardando_lancamento' | 'lancada' | 'paga' | 'cancelada' | 'abriu_chamado'
  >('aguardando_lancamento');

  const { requisitions, getRequisition, updateRequisition } = useRequisitions();
  const { isViewer, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    notaFiscal: '',
    dataEmissao: '',
    valorNF: 0,
    oc: '',
    ut: ''
  });

  const getUTDescription = (utId: string) => {
    const ut = utsList.find(u => u.id === utId);
    return ut ? ut.descricao : utId;
  };

  const financeRequisitions = useMemo(() => {
    return requisitions.filter(req => {
      const canView = isAdmin || isViewer;
      if (!canView) return false;

      const isFinanceStatus =
        req.status === 'aguardando_lancamento' ||
        req.status === 'lancada' ||
        req.status === 'paga' ||
        req.status === 'cancelada' ||
        req.status === 'abriu_chamado';

      const matchesStatus = filterStatus === 'all' || req.status === filterStatus;

      const matchesSearch =
        !searchTerm ||
        req.notaFiscal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.oc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getUTDescription(req.ut).toLowerCase().includes(searchTerm.toLowerCase());

      return isFinanceStatus && matchesStatus && matchesSearch;
    });
  }, [requisitions, isAdmin, isViewer, filterStatus, searchTerm]);

  const handleRowClick = async (id: string) => {
    const req = await getRequisition(id);
    if (req) {
      setSelectedReq(req);
      setEditData({
        notaFiscal: req.notaFiscal || '',
        dataEmissao: req.dataEmissao || '',
        valorNF: req.valorNF || 0,
        oc: req.oc || '',
        ut: req.ut || ''
      });
      setIsEditing(false);
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aguardando_lancamento': return 'Aguardando Lançamento';
      case 'lancada': return 'Lançada';
      case 'paga': return 'Paga';
      case 'cancelada': return 'Cancelada';
      case 'abriu_chamado': return 'Abriu Chamado';
      case 'pendente': return 'Pendente';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aguardando_lancamento': return 'bg-blue-100 text-blue-800';
      case 'lancada': return 'bg-green-100 text-green-800';
      case 'paga': return 'bg-green-200 text-green-900';
      case 'cancelada': return 'bg-red-100 text-red-800';
      case 'abriu_chamado': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSave = async () => {
    if (selectedReq) {
      await updateRequisition(selectedReq.id, {
        notaFiscal: editData.notaFiscal,
        dataEmissao: editData.dataEmissao,
        valorNF: Number(editData.valorNF),
        oc: editData.oc,
        ut: editData.ut
      });
      setSelectedReq({ ...selectedReq, ...editData });
      setIsEditing(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Título */}
        <div className="flex items-center space-x-2">
          <DollarSign className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por NF, OC ou UT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="aguardando_lancamento">Aguardando Lançamento</option>
                <option value="lancada">Lançada</option>
                <option value="paga">Paga</option>
                <option value="cancelada">Cancelada</option>
                <option value="abriu_chamado">Abriu Chamado</option>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DATA EMISSÃO</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">VALOR NF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OC</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">FORNECEDOR</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {financeRequisitions.map(req => (
                  <tr
                    key={req.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleRowClick(req.id)}
                  >
                    <td className="px-6 py-4">{req.notaFiscal || '-'}</td>
                    <td className="px-6 py-4">{req.dataEmissao ? new Date(req.dataEmissao).toLocaleDateString('pt-BR') : '-'}</td>
                    <td className="px-6 py-4">{req.valorNF ? formatCurrency(req.valorNF) : '-'}</td>
                    <td className="px-6 py-4">{req.oc || '-'}</td>
                    <td className="px-6 py-4">{getUTDescription(req.ut)}</td>
                    <td className="px-6 py-4">{req.fornecedor || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(req.status)}`}>
                        {getStatusLabel(req.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {financeRequisitions.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              Nenhuma nota fiscal encontrada.
            </div>
          )}
        </div>

        {/* Formulário do Financeiro */}
        {selectedReq && (
          <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-200">
            <h2 className="text-lg font-medium text-blue-800 mb-4">Detalhes Financeiro</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NF */}
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">NF</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.notaFiscal}
                    onChange={(e) => setEditData({ ...editData, notaFiscal: e.target.value })}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm text-blue-900 bg-blue-100 p-2 rounded">{selectedReq.notaFiscal || '-'}</p>
                )}
              </div>

              {/* DATA EMISSÃO */}
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">DATA EMISSÃO</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.dataEmissao}
                    onChange={(e) => setEditData({ ...editData, dataEmissao: e.target.value })}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm text-blue-900 bg-blue-100 p-2 rounded">{selectedReq.dataEmissao || '-'}</p>
                )}
              </div>

              {/* VALOR NF */}
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">VALOR NF</label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editData.valorNF}
                    onChange={(e) => setEditData({ ...editData, valorNF: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm text-blue-900 bg-blue-100 p-2 rounded">{formatCurrency(selectedReq.valorNF)}</p>
                )}
              </div>

              {/* OC */}
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">OC</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.oc}
                    onChange={(e) => setEditData({ ...editData, oc: e.target.value })}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm text-blue-900 bg-blue-100 p-2 rounded">{selectedReq.oc || '-'}</p>
                )}
              </div>

              {/* UT */}
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">UT</label>
                <p className="text-sm text-blue-900 bg-blue-100 p-2 rounded">{getUTDescription(selectedReq.ut)}</p>
              </div>

              {/* FORNECEDOR */}
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">FORNECEDOR</label>
                <p className="text-sm text-blue-900 bg-blue-100 p-2 rounded">{selectedReq.fornecedor || '-'}</p>
              </div>

              {/* STATUS */}
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">STATUS</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReq.status)}`}>
                  {getStatusLabel(selectedReq.status)}
                </span>
              </div>
            </div>

            {/* Botões */}
            {selectedReq.status === 'aguardando_lancamento' && !isEditing && (
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Editar Financeiro
                </button>
              </div>
            )}

            {isEditing && (
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Finance;
