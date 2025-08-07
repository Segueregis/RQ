import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Edit2, Save, X, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useRequisitions } from '../contexts/RequisitionContext';
import { useAuth } from '../contexts/AuthContext';
import { Requisition } from '../types';

const RequisitionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRequisition, updateRequisition, markAsDelivered, deleteRequisition } = useRequisitions();
  const { isAdmin } = useAuth();
  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeliveryEditing, setIsDeliveryEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Campos editáveis
  const [editData, setEditData] = useState({
    rq: '',
    valorTotal: 0,
    numeroOS: '',
    descricao: '',
    local: '',
    fornecedor: '',
    notaFiscal: '',
    oc: ''
  });

  useEffect(() => {
    const loadRequisition = async () => {
      if (id) {
        const req = await getRequisition(id);
        if (req) {
          setRequisition(req);
          setEditData({
            rq: req.rq,
            valorTotal: req.valorTotal,
            numeroOS: req.numeroOS,
            descricao: req.descricao,
            local: req.local,
            fornecedor: req.fornecedor,
            notaFiscal: req.notaFiscal || '',
            oc: req.oc || ''
          });
        }
      }
    };

    loadRequisition();
  }, [id, getRequisition]);

  const handleSave = async () => {
    if (requisition) {
      await updateRequisition(requisition.id, {
        ...editData,
        valorTotal: Number(editData.valorTotal)
      });
      setRequisition({
        ...requisition,
        ...editData,
        valorTotal: Number(editData.valorTotal)
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (requisition) {
      setEditData({
        rq: requisition.rq,
        valorTotal: requisition.valorTotal,
        numeroOS: requisition.numeroOS,
        descricao: requisition.descricao,
        local: requisition.local,
        fornecedor: requisition.fornecedor,
        notaFiscal: requisition.notaFiscal || '',
        oc: requisition.oc || ''
      });
    }
    setIsEditing(false);
    setIsDeliveryEditing(false);
  };

  const handleMarkAsDelivered = async () => {
    if (requisition) {
      await markAsDelivered(requisition.id, editData.notaFiscal, editData.oc);
      setRequisition({ 
        ...requisition, 
        status: 'entregue', 
        notaFiscal: editData.notaFiscal, 
        oc: editData.oc 
      });
      setIsDeliveryEditing(false);
    }
  };

  const handleDelete = async () => {
    if (requisition) {
      await deleteRequisition(requisition.id);
      navigate('/home');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!requisition) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Requisição não encontrada.</p>
          <button
            onClick={() => navigate('/home')}
            className="mt-4 text-blue-600 hover:text-blue-500"
          >
            Voltar para Home
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Requisição {requisition.rq}
            </h1>
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                requisition.status === 'entregue'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {requisition.status === 'entregue' ? 'Entregue' : 'Pendente'}
            </span>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Detalhes da Requisição</h2>
            {requisition.status === 'pendente' && (
              <div className="flex space-x-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Editar RQ</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-3 py-1 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancelar</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-3 py-1 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Save className="h-4 w-4" />
                      <span>Salvar</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RQ
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.rq}
                    onChange={(e) => setEditData({ ...editData, rq: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Número da RQ"
                  />
                ) : (
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{requisition.rq}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Total
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editData.valorTotal}
                    onChange={(e) => setEditData({ ...editData, valorTotal: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                ) : (
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {formatCurrency(requisition.valorTotal)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número da OS
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.numeroOS}
                    onChange={(e) => setEditData({ ...editData, numeroOS: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Número da OS"
                  />
                ) : (
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{requisition.numeroOS}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Local
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.local}
                    onChange={(e) => setEditData({ ...editData, local: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Local"
                  />
                ) : (
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{requisition.local}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.descricao}
                    onChange={(e) => setEditData({ ...editData, descricao: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descrição da requisição"
                  />
                ) : (
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{requisition.descricao}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fornecedor
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.fornecedor}
                    onChange={(e) => setEditData({ ...editData, fornecedor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Fornecedor"
                  />
                ) : (
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{requisition.fornecedor}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {requisition.status === 'entregue' ? 'Entregue' : 'Pendente'}
                </p>
              </div>

              {/* Campos de entrega */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nota Fiscal (NF)
                </label>
                {(isEditing || isDeliveryEditing) ? (
                  <input
                    type="text"
                    value={editData.notaFiscal}
                    onChange={(e) => setEditData({ ...editData, notaFiscal: e.target.value })}
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: NF123456"
                  />
                ) : (
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {requisition.notaFiscal || '-'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OC
                </label>
                {(isEditing || isDeliveryEditing) ? (
                  <input
                    type="text"
                    value={editData.oc}
                    onChange={(e) => setEditData({ ...editData, oc: e.target.value })}
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: OC789012"
                  />
                ) : (
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {requisition.oc || '-'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Criado em
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {formatDate(requisition.createdAt)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Atualizado em
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {formatDate(requisition.updatedAt)}
                </p>
              </div>
            </div>

            {/* Ações de entrega e exclusão */}
            <div className="mt-8 flex justify-between items-center">
              {/* Botão de exclusão para admins */}
              {isAdmin && (
                <div>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md shadow-sm hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Excluir Requisição</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancelar</span>
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Confirmar Exclusão</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Ações de entrega */}
              <div className="flex space-x-3">
                {requisition.status === 'pendente' && !isEditing && (
                  <>
                    {!isDeliveryEditing ? (
                      <button
                        onClick={() => setIsDeliveryEditing(true)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md shadow-sm hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <Check className="h-4 w-4" />
                        <span>Marcar como Entregue</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleCancel}
                          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancelar</span>
                        </button>
                        <button
                          onClick={handleMarkAsDelivered}
                          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <Check className="h-4 w-4" />
                          <span>Confirmar Entrega</span>
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RequisitionDetail;