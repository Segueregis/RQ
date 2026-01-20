import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Edit2, Save, X, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useRequisitions } from '../contexts/RequisitionContext';
import { useAuth } from '../contexts/AuthContext';
import { Requisition } from '../types';
import { utsList } from '../data/uts';
import { supabase } from '../lib/supabase';  // Adicionado

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

  const [editData, setEditData] = useState({
    rq: '',
    valorTotal: 0,
    ut: '',
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
  const [notaFiscalPDF, setNotaFiscalPDF] = useState<File | null>(null);  // Adicionado

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
          setFinanceData({ usuarioEnvio: req.usuarioEnvio || '' });
        }
      }
    };
    loadRequisition();
  }, [id, getRequisition]);

  useEffect(() => {
    if (isDeliveryEditing) {
      const errors = validateFinanceFields();
      setFinanceErrors(errors);
    }
  }, [editData, isDeliveryEditing]);

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
      setFinanceData({ usuarioEnvio: requisition.usuarioEnvio || '' });
    }
    setIsEditing(false);
    setIsDeliveryEditing(false);
    setIsFinanceEditing(false);
    setFinanceErrors([]);
  };

  const validateFinanceFields = () => {
    const errors: string[] = [];
    if (!editData.notaFiscal?.trim()) errors.push('Nota Fiscal é obrigatória');
    if (!editData.oc?.trim()) errors.push('OC é obrigatória');
    if (!editData.dataEmissao?.trim()) errors.push('Data Emissão é obrigatória');
    if (!editData.valorNF || editData.valorNF <= 0) errors.push('Valor da NF deve ser maior que zero');
    if (!editData.fornecedor?.trim()) errors.push('Fornecedor é obrigatório');

    if (editData.notaFiscal && !/^\d+$/.test(editData.notaFiscal.trim()))
      errors.push('Nota Fiscal deve conter apenas números');
    if (editData.oc && !(/^(?=.*[a-zA-Z])(?=.*\d)/.test(editData.oc.trim())))
      errors.push('OC deve conter letras e números');

    return errors;
  };

  const handleSaveFinance = async () => {
    if (requisition) {
      await updateRequisition(requisition.id, { usuarioEnvio: financeData.usuarioEnvio });
      setRequisition({ ...requisition, usuarioEnvio: financeData.usuarioEnvio });
      setIsFinanceEditing(false);
    }
  };

  const handleUploadNotaFiscalPDF = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${requisition?.id}_nota_fiscal.${fileExt}`;
      const filePath = `notas-fiscais/${fileName}`;

      const { data, error } = await supabase.storage
        .from('notas-fiscais')  // Assumindo bucket 'notas-fiscais'
        .upload(filePath, file);

      if (error) {
        console.error('Erro ao fazer upload do PDF:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('notas-fiscais')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      return null;
    }
  };

  const handleLaunchToFinance = async () => {
    const errors = validateFinanceFields();
    setFinanceErrors(errors);
    if (errors.length === 0 && requisition) {
      let notaFiscalPdfUrl: string | undefined;
      if (notaFiscalPDF) {
                // ...existing code...
          const handleLaunchToFinance = async () => {
            const errors = validateFinanceFields();
            setFinanceErrors(errors);
            if (errors.length === 0 && requisition) {
              let notaFiscalPdfUrl: string | undefined;
              if (notaFiscalPDF) {
                const url = await handleUploadNotaFiscalPDF(notaFiscalPDF);
                if (url) {
                  notaFiscalPdfUrl = url;
                } else {
                  console.warn('Falha no upload do PDF, mas continuando...');
                }
              }
        
              await launchToFinance(requisition.id, {
                notaFiscal: editData.notaFiscal,
                oc: editData.oc,
                dataEmissao: editData.dataEmissao,
                valorNF: editData.valorNF,
                fornecedor: editData.fornecedor,
                notaFiscalPdfUrl
              });
              setRequisition({
                ...requisition,
                status: 'aguardando_lancamento',
                notaFiscal: editData.notaFiscal,
                oc: editData.oc,
                dataEmissao: editData.dataEmissao,
                valorNF: editData.valorNF,
                fornecedor: editData.fornecedor,
                notaFiscalPdfUrl
              });
              setIsDeliveryEditing(false);
              setFinanceErrors([]);
              setNotaFiscalPDF(null);  // Limpar
            }
          };
        // ...existing code... = await handleUploadNotaFiscalPDF(notaFiscalPDF);
        if (!notaFiscalPdfUrl) {
          // Opcional: mostrar erro, mas como é opcional, talvez continuar
          console.warn('Falha no upload do PDF, mas continuando...');
        }
      }

      await launchToFinance(requisition.id, {
        notaFiscal: editData.notaFiscal,
        oc: editData.oc,
        dataEmissao: editData.dataEmissao,
        valorNF: editData.valorNF,
        fornecedor: editData.fornecedor,
        notaFiscalPdfUrl
      });
      setRequisition({
        ...requisition,
        status: 'aguardando_lancamento',
        notaFiscal: editData.notaFiscal,
        oc: editData.oc,
        dataEmissao: editData.dataEmissao,
        valorNF: editData.valorNF,
        fornecedor: editData.fornecedor,
        notaFiscalPdfUrl
      });
      setIsDeliveryEditing(false);
      setFinanceErrors([]);
      setNotaFiscalPDF(null);  // Limpar
    }
  };

  const handleSave = async () => {
    if (requisition) {
      await updateRequisition(requisition.id, { ...editData, valorTotal: Number(editData.valorTotal), valorNF: Number(editData.valorNF) });
      setRequisition({ ...requisition, ...editData, valorTotal: Number(editData.valorTotal), valorNF: Number(editData.valorNF) });
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (requisition) {
      await deleteRequisition(requisition.id);
      navigate('/home');
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getUTDescription = (utId: string) => {
    const ut = utsList.find(u => u.id === utId);
    return ut ? ut.descricao : utId;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'aguardando_lancamento': return 'Aguardando Lançamento';
      case 'lancada': return 'Lançada';
      case 'paga': return 'Paga';
      case 'cancelada': return 'Cancelada';
      case 'abriu_chamado': return 'Abriu Chamado';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aguardando_lancamento': return 'bg-blue-100 text-blue-800';
      case 'abriu_chamado': return 'bg-red-100 text-red-800';
      case 'lancada': return 'bg-green-100 text-green-800';
      case 'paga': return 'bg-purple-100 text-purple-800';
      case 'cancelada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (!requisition) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Requisição não encontrada.</p>
          <button onClick={() => navigate('/home')} className="mt-4 text-blue-600 hover:text-blue-500">Voltar para Home</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/home')} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Requisição {requisition.rq}</h1>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(requisition.status)}`}>
              {getStatusLabel(requisition.status)}
            </span>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Detalhes da Requisição</h2>
            {requisition.status === 'pendente' && !isViewer && (
              <div className="flex space-x-2">
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100">
                    <Edit2 className="h-4 w-4" />
                    <span>Editar RQ</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button onClick={handleCancel} className="flex items-center space-x-2 px-3 py-1 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100">
                      <X className="h-4 w-4" /> <span>Cancelar</span>
                    </button>
                    <button onClick={handleSave} className="flex items-center space-x-2 px-3 py-1 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
                      <Save className="h-4 w-4" /> <span>Salvar</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campos principais */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RQ</label>
              {isEditing && !isViewer ? (
                <input type="text" value={editData.rq} onChange={e => setEditData({...editData, rq: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
              ) : <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{requisition.rq}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">VALOR RQ</label>
              {isEditing && !isViewer ? (
                <input type="number" step="0.01" value={editData.valorTotal} onChange={e => setEditData({...editData, valorTotal: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-md" />
              ) : <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{formatCurrency(requisition.valorTotal)}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UT</label>
              {isEditing && !isViewer ? (
                <select value={editData.ut} onChange={e => setEditData({...editData, ut: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                  <option value="">Selecione uma UT</option>
                  {utsList.map(u => <option key={u.id} value={u.id}>{u.descricao}</option>)}
                </select>
              ) : <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{requisition.ut ? getUTDescription(requisition.ut) : '-'}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
              {isEditing && !isViewer ? (
                <input type="text" value={editData.local} onChange={e => setEditData({...editData, local: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
              ) : <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{requisition.local}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              {isEditing && !isViewer ? (
                <textarea value={editData.descricao} onChange={e => setEditData({...editData, descricao: e.target.value})} rows={3} className="w-full px-3 py-2 border rounded-md" />
              ) : <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{requisition.descricao}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <p className={`text-sm p-2 rounded ${getStatusColor(requisition.status)}`}>{getStatusLabel(requisition.status)}</p>
            </div>

            {/* Botão Lançar para Financeiro */}
            {requisition.status === 'pendente' && !isEditing && !isViewer && !isDeliveryEditing && (
              <div className="md:col-span-2">
                <button onClick={() => setIsDeliveryEditing(true)} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100">
                  <Check className="h-4 w-4" /> <span>Lançar para Financeiro</span>
                </button>
              </div>
            )}

            {/* Container azul Financeiro */}
            {isDeliveryEditing && (
              <div className="md:col-span-2 mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-4">Preencha para o financeiro</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fornecedor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                    <input type="text" value={editData.fornecedor} onChange={e => setEditData({...editData, fornecedor: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                  </div>
                  {/* Nota Fiscal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nota Fiscal (NF)</label>
                    <input type="text" value={editData.notaFiscal} onChange={e => setEditData({...editData, notaFiscal: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                  </div>
                  {/* OC */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OC</label>
                    <input type="text" value={editData.oc} onChange={e => setEditData({...editData, oc: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                  </div>
                  {/* Data Emissão */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Emissão</label>
                    <input type="date" value={editData.dataEmissao} onChange={e => setEditData({...editData, dataEmissao: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                  </div>
                  {/* Valor NF */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">VALOR DA NF</label>
                    <input type="number" step="0.01" value={editData.valorNF || ''} onChange={e => setEditData({...editData, valorNF: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-md" />
                  </div>
                  {/* Importar PDF NF */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Importar PDF (NF)</label>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={(e) => setNotaFiscalPDF(e.target.files?.[0] || null)} 
                      className="w-full px-3 py-2 border rounded-md" 
                    />
                    {notaFiscalPDF && <p className="text-sm text-gray-600 mt-1">{notaFiscalPDF.name}</p>}
                  </div>
                </div>

                {/* Mensagens de erro */}
                {financeErrors.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <ul className="text-sm text-red-800">
                      {financeErrors.map((err, i) => <li key={i}>• {err}</li>)}
                    </ul>
                  </div>
                )}

                {/* Botões Financeiro */}
                <div className="mt-4 flex space-x-2">
                  <button onClick={handleCancel} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    <X className="h-4 w-4" /> <span>Cancelar</span>
                  </button>
                  <button onClick={handleLaunchToFinance} disabled={financeErrors.length > 0} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Check className="h-4 w-4" /> <span>Confirmar Lançamento</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botão Excluir Requisição */}
          {!isViewer && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100">
                <Trash2 className="h-4 w-4" /> <span>Excluir Requisição</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <p className="mb-4 text-gray-900">Tem certeza que deseja excluir esta requisição?</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RequisitionDetail;
