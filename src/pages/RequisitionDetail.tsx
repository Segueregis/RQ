import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Edit2, Save, X, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useRequisitions } from '../contexts/RequisitionContext';
import { useAuth } from '../contexts/AuthContext';
import { Requisition } from '../types';
import { utsList } from '../data/uts';

const RequisitionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRequisition, updateRequisition, launchToFinance, deleteRequisition } = useRequisitions();
  const { isAdmin, isViewer } = useAuth();
  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeliveryEditing, setIsDeliveryEditing] = useState(false);
  const [isFinanceEditing, setIsFinanceEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Campos editáveis
  const [editData, setEditData] = useState({
    rq: '',
    valorTotal: 0,
    ut: '', // <-- substitui numeroOS
    descricao: '',
    local: '',
    fornecedor: '',
    notaFiscal: '',
    oc: '',
    dataEmissao: '',
    valorNF: 0
  });
  const [financeData, setFinanceData] = useState({
    usuarioEnvio: ''
  });
  const [financeErrors, setFinanceErrors] = useState<string[]>([]);

  useEffect(() => {
    const loadRequisition = async () => {
      if (id) {
        const req = await getRequisition(id);
        if (req) {
          setRequisition(req);
          setEditData({
            rq: req.rq,
            valorTotal: req.valorTotal,
            ut: req.ut,
            descricao: req.descricao,
            local: req.local,
            fornecedor: req.fornecedor,
            notaFiscal: req.notaFiscal || '',
            oc: req.oc || '',
            dataEmissao: req.dataEmissao || '',
            valorNF: req.valorNF || 0
          });
          setFinanceData({
            usuarioEnvio: req.usuarioEnvio || ''
          });
        }
      }
    };

    loadRequisition();
  }, [id, getRequisition]);

  // Validação em tempo real durante lançamento para financeiro
  useEffect(() => {
    if (isDeliveryEditing) {
      const errors = validateFinanceFields();
      setFinanceErrors(errors);
    }
  }, [editData, isDeliveryEditing]);

  const handleSaveFinance = async () => {
    if (requisition) {
      await updateRequisition(requisition.id, {
        usuarioEnvio: financeData.usuarioEnvio
      });
      setRequisition({
        ...requisition,
        usuarioEnvio: financeData.usuarioEnvio
      });
      setIsFinanceEditing(false);
    }
  };

  const handleCancel = () => {
    if (requisition) {
      setEditData({
        rq: requisition.rq,
        valorTotal: requisition.valorTotal,
        ut: requisition.ut,
        descricao: requisition.descricao,
        local: requisition.local,
        fornecedor: requisition.fornecedor,
        notaFiscal: requisition.notaFiscal || '',
        oc: requisition.oc || '',
        dataEmissao: requisition.dataEmissao || '',
        valorNF: requisition.valorNF || 0
      });
      setFinanceData({
        usuarioEnvio: requisition.usuarioEnvio || ''
      });
    }
    setIsEditing(false);
    setIsDeliveryEditing(false);
    setIsFinanceEditing(false);
    setFinanceErrors([]);
  };

  const handleLaunchToFinance = async () => {
    const errors = validateFinanceFields();
    setFinanceErrors(errors);

    if (errors.length === 0) {
      if (requisition) {
        await launchToFinance(requisition.id, editData.notaFiscal, editData.oc);
        setRequisition({ 
          ...requisition, 
          status: 'em_financeiro', 
          notaFiscal: editData.notaFiscal, 
          oc: editData.oc,
          dataEmissao: editData.dataEmissao,
          valorNF: editData.valorNF,
          fornecedor: editData.fornecedor
        });
        setIsDeliveryEditing(false);
        setFinanceErrors([]);
      }
    }
  };

  const validateFinanceFields = () => {
    const errors = [];

    // Verificar se todos os campos estão preenchidos
    if (!editData.notaFiscal?.trim()) {
      errors.push('Nota Fiscal é obrigatória');
    }
    if (!editData.oc?.trim()) {
      errors.push('OC é obrigatória');
    }
    if (!editData.dataEmissao?.trim()) {
      errors.push('Data Emissão é obrigatória');
    }
    if (!editData.valorNF || editData.valorNF <= 0) {
      errors.push('Valor da NF deve ser maior que zero');
    }
    if (!editData.fornecedor?.trim()) {
      errors.push('Fornecedor é obrigatório');
    }

    // Validar Nota Fiscal: apenas números
    if (editData.notaFiscal && !/^\d+$/.test(editData.notaFiscal.trim())) {
      errors.push('Nota Fiscal deve conter apenas números');
    }

    // Validar OC: deve conter letras E números
    if (editData.oc && !(/^(?=.*[a-zA-Z])(?=.*\d)/.test(editData.oc.trim()))) {
      errors.push('OC deve conter letras e números');
    }

    return errors;
  };

  const handleSave = async () => {
    if (requisition) {
      await updateRequisition(requisition.id, {
        ...editData,
        valorTotal: Number(editData.valorTotal),
        valorNF: Number(editData.valorNF)
      });
      setRequisition({
        ...requisition,
        ...editData,
        valorTotal: Number(editData.valorTotal),
        valorNF: Number(editData.valorNF)
      });
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (requisition) {
      await deleteRequisition(requisition.id);
      navigate('/home');
    }
  };

  const handleValorPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedValue = e.clipboardData.getData('text');
    
    // Converte formato brasileiro (1.234,56) para americano (1234.56)
    const convertedValue = pastedValue
      .replace(/\./g, '') // Remove pontos (separadores de milhares)
      .replace(',', '.'); // Substitui vírgula por ponto (separador decimal)
    
    // Verifica se é um número válido e converte
    const numericValue = parseFloat(convertedValue);
    if (!isNaN(numericValue)) {
      // Atualiza o editData com o valor numérico
      const event = {
        target: { value: convertedValue }
      } as React.ChangeEvent<HTMLInputElement>;
      // Simula o onChange para atualizar o estado
      const newEditData = { ...editData, valorNF: numericValue };
      setEditData(newEditData);
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

  const getUTDescription = (utId: string) => {
    const ut = utsList.find(u => u.id === utId);
    return ut ? ut.descricao : utId;
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
                  : requisition.status === 'em_financeiro'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {requisition.status === 'entregue' ? 'Entregue' : 
               requisition.status === 'em_financeiro' ? 'Em Financeiro' : 'Pendente'}
            </span>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Detalhes da Requisição</h2>
            {requisition.status === 'pendente' && !isViewer && (
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
                {isEditing && !isViewer ? (
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
                  VALOR RQ
                </label>
                {isEditing && !isViewer ? (
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
                  UT
                </label>
                {isEditing && !isViewer ? (
                  <select
                    value={editData.ut}
                    onChange={(e) => setEditData({ ...editData, ut: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione uma UT</option>
                    {utsList.map((ut) => (
                      <option key={ut.id} value={ut.id}>
                        {ut.descricao}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {requisition.ut ? getUTDescription(requisition.ut) : '-'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Local
                </label>
                {isEditing && !isViewer ? (
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
                {isEditing && !isViewer ? (
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
                {isDeliveryEditing && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm font-medium text-blue-800">Preencha para o financeiro</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fornecedor
                </label>
                {(isEditing || isDeliveryEditing) && !isViewer ? (
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

              {isDeliveryEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UT
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {requisition.ut ? getUTDescription(requisition.ut) : '-'}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {requisition.status === 'entregue' ? 'Entregue' : 
                   requisition.status === 'em_financeiro' ? 'Em Financeiro' : 'Pendente'}
                </p>
              </div>

              {/* Campos de entrega */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nota Fiscal (NF)
                </label>
                {(isEditing || isDeliveryEditing) && !isViewer ? (
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
                {(isEditing || isDeliveryEditing) && !isViewer ? (
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
                  Data Emissão
                </label>
                {(isEditing || isDeliveryEditing) && !isViewer ? (
                  <input
                    type="date"
                    value={editData.dataEmissao}
                    onChange={(e) => setEditData({ ...editData, dataEmissao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {requisition.dataEmissao ? formatDate(requisition.dataEmissao) : '-'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VALOR DA NF
                </label>
                {(isEditing || isDeliveryEditing) && !isViewer ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editData.valorNF || ''}
                    onChange={(e) => setEditData({ ...editData, valorNF: Number(e.target.value) })}
                    onPaste={handleValorPaste}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                ) : (
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {requisition.valorNF ? formatCurrency(requisition.valorNF) : '-'}
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
            </div>

            {/* Campos de financeiro */}
            {requisition.status === 'em_financeiro' && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Informações de Financeiro</h3>
                  {!isViewer && (
                    <div className="flex space-x-2">
                      {!isFinanceEditing ? (
                        <button
                          onClick={() => setIsFinanceEditing(true)}
                          className="flex items-center space-x-2 px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span>Editar</span>
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
                            onClick={handleSaveFinance}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UT
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {requisition.ut ? getUTDescription(requisition.ut) : '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usuário que Enviou
                    </label>
                    {isFinanceEditing && !isViewer ? (
                      <input
                        type="text"
                        value={financeData.usuarioEnvio}
                        onChange={(e) => setFinanceData({ ...financeData, usuarioEnvio: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nome do usuário"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {requisition.usuarioEnvio || '-'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Ações de entrega e exclusão */}
            <div className="mt-8 flex justify-between items-center">
              {/* Botão de exclusão para admins */}
              {isAdmin && !isViewer && (
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
                {requisition.status === 'pendente' && !isEditing && !isViewer && (
                  <>
                    {!isDeliveryEditing ? (
                      <button
                        onClick={() => setIsDeliveryEditing(true)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md shadow-sm hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Check className="h-4 w-4" />
                        <span>Lançar para Financeiro</span>
                      </button>
                    ) : (
                      <>
                        {financeErrors.length > 0 && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <ul className="text-sm text-red-800">
                              {financeErrors.map((error, index) => (
                                <li key={index}>• {error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <button
                          onClick={handleCancel}
                          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancelar</span>
                        </button>
                        <button
                          onClick={handleLaunchToFinance}
                          disabled={financeErrors.length > 0}
                          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="h-4 w-4" />
                          <span>Confirmar Lançamento</span>
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