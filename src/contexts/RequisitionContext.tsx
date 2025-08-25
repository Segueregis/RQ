// /src/contexts/RequisitionContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Requisition } from '../types';
import { createRequisition, getRequisitions, updateRequisition as updateRequisitionAPI, getRequisitionById, deleteRequisition } from '../lib/requisitions';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface KlasmatItem {
  name: string;
  code: string;
  category: string;
  approved: boolean;
}

interface RequisitionContextType {
  requisitions: Requisition[];
  addRequisition: (requisition: Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRequisition: (id: string, updates: Partial<Requisition>) => Promise<void>;
  getRequisition: (id: string) => Promise<Requisition | null>;
  markAsDelivered: (id: string, notaFiscal?: string, oc?: string) => Promise<void>;
  deleteRequisition: (id: string) => Promise<void>;
  klasmatItems: KlasmatItem[];
  createKlasmatItem: (item: Omit<KlasmatItem, 'approved'>) => Promise<void>;
  approveKlasmatItem: (code: string) => Promise<void>;
}

const RequisitionContext = createContext<RequisitionContextType | undefined>(undefined);

export const useRequisitions = () => {
  const context = useContext(RequisitionContext);
  if (!context) throw new Error('useRequisitions must be used within a RequisitionProvider');
  return context;
};

interface RequisitionProviderProps {
  children: ReactNode;
}

export const RequisitionProvider: React.FC<RequisitionProviderProps> = ({ children }) => {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [klasmatItems, setKlasmatItems] = useState<KlasmatItem[]>([]);
  const { currentUser, isAdmin, isViewer } = useAuth();

  // =============================
  // Load data
  // =============================
  useEffect(() => { if (currentUser) loadRequisitions(); }, [currentUser]);
  useEffect(() => { loadKlasmatItems(); }, []);

  const loadRequisitions = async () => {
    if (!currentUser) return;
    const userId = (isAdmin || isViewer) ? undefined : currentUser.id;
    const reqs = await getRequisitions(userId);
    setRequisitions(reqs);
  };

  const loadKlasmatItems = async () => {
    try {
      const { data, error } = await supabase
        .from('klasmat_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar itens Klasmat:', error);
        return;
      }
      if (data) setKlasmatItems(data);
    } catch (err) {
      console.error('Erro inesperado ao carregar itens Klasmat:', err);
    }
  };

  // =============================
  // Funções de Requisições
  // =============================
  const addRequisition = async (requisition: Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser || isViewer) return;
    const newRequisition = await createRequisition({ ...requisition, userId: currentUser.id });
    if (newRequisition) setRequisitions(prev => [newRequisition, ...prev]);
  };

  const updateRequisition = async (id: string, updates: Partial<Requisition>) => {
    if (isViewer) return;
    const success = await updateRequisitionAPI(id, updates);
    if (success) await loadRequisitions();
  };

  const getRequisition = async (id: string) => await getRequisitionById(id);

  const markAsDelivered = async (id: string, notaFiscal?: string, oc?: string) => {
    if (isViewer) return;
    await updateRequisition(id, { status: 'entregue', notaFiscal, oc });
  };

  const deleteRequisitionHandler = async (id: string) => {
    if (isViewer) return;
    const success = await deleteRequisition(id);
    if (success) await loadRequisitions();
  };

  // =============================
// Funções Klasmat
// =============================
const createKlasmatItem = async (item: Omit<KlasmatItem, 'approved'>) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Usuário atual:', user, 'Erro auth:', authError);

    if (authError || !user) {
      console.error('Erro ao obter usuário ou não logado');
      alert('Não foi possível criar o item. Verifique se você está logado.');
      return;
    }

    // Inserir item no Supabase
    const { data, error } = await supabase
      .from('klasmat_codes')
      .insert([{ ...item, approved: false, user_id: user.id }])
      .select();

    if (error) {
      console.error('Erro ao criar item Klasmat:', error);
      alert('Erro ao criar item: ' + error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('Item criado com sucesso:', data[0]);
      setKlasmatItems(prev => [data[0], ...prev]);
    } else {
      console.warn('Nenhum item foi criado. Possível bloqueio por RLS.');
      alert('Item não foi criado. Verifique suas permissões.');
    }
  } catch (err) {
    console.error('Erro inesperado ao criar item Klasmat:', err);
    alert('Erro inesperado ao criar item.');
  }
};

const approveKlasmatItem = async (code: string) => {
  try {
    const { data, error } = await supabase
      .from('klasmat_codes')
      .update({ approved: true })
      .eq('code', code)
      .select();

    if (error) {
      console.error('Erro ao aprovar item:', error);
      alert('Erro ao aprovar item: ' + error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('Item aprovado:', data[0]);
      setKlasmatItems(prev =>
        prev.map(item => item.code === code ? { ...item, approved: true } : item)
      );
    } else {
      console.warn('Nenhum item foi aprovado. Verifique o código.');
      alert('Nenhum item foi aprovado. Verifique o código.');
    }
  } catch (err) {
    console.error('Erro inesperado ao aprovar item:', err);
    alert('Erro inesperado ao aprovar item.');
  }
};


  // =============================
  // Contexto
  // =============================
  const value: RequisitionContextType = {
    requisitions,
    addRequisition,
    updateRequisition,
    getRequisition,
    markAsDelivered,
    deleteRequisition: deleteRequisitionHandler,
    klasmatItems: isAdmin ? klasmatItems : klasmatItems.filter(item => item.approved),
    createKlasmatItem,
    approveKlasmatItem
  };

  return <RequisitionContext.Provider value={value}>{children}</RequisitionContext.Provider>;
};
