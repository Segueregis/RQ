import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Edit2, Save, X } from 'lucide-react';
import Layout from '../components/Layout';
import { useRequisitions } from '../contexts/RequisitionContext';
import { Requisition } from '../types';

const RequisitionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRequisition, markAsDelivered } = useRequisitions();
  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notaFiscal, setNotaFiscal] = useState('');
  const [oc, setOc] = useState('');

  useEffect(() => {
    if (id) {
      const req = getRequisition(id);
      if (req) {
        setRequisition(req);
        setNotaFiscal(req.notaFiscal || '');
        setOc(req.oc || '');
      }
    }
  }, [id, getRequisition]);

  const handleMarkAsDelivered = () => {
    if (requisition) {
      markAsDelivered(requisition.id, notaFiscal, oc);
      setRequisition({ ...requisition, status: 'entregue', notaFiscal, oc });
      setIsEditing(false);
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
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Detalhes da Requisição</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RQ
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{requisition.rq}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Total
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {formatCurrency(requisition.valorTotal)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número da OS
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{requisition.numeroOS}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Local
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{requisition.local}</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{requisition.descricao}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fornecedor
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{requisition.fornecedor}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {requisition.status === 'entregue' ? 'Entregue' : 'Pendente'}
                </p>
              </div>

              {/* Campos adicionais para entrega */}
              <div>
                <label htmlFor="notaFiscal" className="block text-sm font-medium text-gray-700 mb-1">
                  Nota Fiscal (NF)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    id="notaFiscal"
                    value={notaFiscal}
                    onChange={(e) => setNotaFiscal(e.target.value)}
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
                <label htmlFor="oc" className="block text-sm font-medium text-gray-700 mb-1">
                  OC
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    id="oc"
                    value={oc}
                    onChange={(e) => setOc(e.target.value)}
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

            {/* Ações */}
            <div className="mt-8 flex justify-end space-x-3">
              {requisition.status === 'pendente' && (
                <>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Editar para Entrega</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setNotaFiscal(requisition.notaFiscal || '');
                          setOc(requisition.oc || '');
                        }}
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
                        <span>Marcar como Entregue</span>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RequisitionDetail;