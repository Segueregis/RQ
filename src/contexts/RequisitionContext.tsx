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
  if (context === undefined) {
    throw new Error('useRequisitions must be used within a RequisitionProvider');
  }
  return context;
};

interface RequisitionProviderProps {
  children: ReactNode;
}

export const RequisitionProvider: React.FC<RequisitionProviderProps> = ({ children }) => {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [klasmatItems, setKlasmatItems] = useState<KlasmatItem[]>([]);
  const { currentUser, isAdmin, isViewer } = useAuth();

  useEffect(() => {
    if (currentUser) {
      loadRequisitions();
    }
  }, [currentUser]);

  useEffect(() => {
    loadKlasmatItems();
  }, []);

  const loadRequisitions = async () => {
    if (!currentUser) return;
    
    const userId = (isAdmin || isViewer) ? undefined : currentUser.id;
    const reqs = await getRequisitions(userId);
    setRequisitions(reqs);
  };

  const loadKlasmatItems = async () => {
    // Simulação de carregamento de itens Klasmat
    const items = [
      { name: 'Item 1', code: '19.059.0029', category: 'CIVIL', approved: true },
      { name: 'Item 2', code: '19.059.0030', category: 'ELETRICA', approved: false }
    ];
    setKlasmatItems(items);
  };

  const addRequisition = async (requisition: Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser || isViewer) return;

    const newRequisition = await createRequisition({
      ...requisition,
      userId: currentUser.id
    });

    if (newRequisition) {
      setRequisitions(prev => [newRequisition, ...prev]);
    }
  };

  const updateRequisition = async (id: string, updates: Partial<Requisition>) => {
    if (isViewer) return;
    
    const success = await updateRequisitionAPI(id, updates);
    if (success) {
      await loadRequisitions();
    }
  };

  const getRequisition = async (id: string) => {
    return await getRequisitionById(id);
  };

  const markAsDelivered = async (id: string, notaFiscal?: string, oc?: string) => {
    if (isViewer) return;
    
    await updateRequisition(id, {
      status: 'entregue',
      notaFiscal,
      oc
    });
  };

  const deleteRequisitionHandler = async (id: string) => {
    if (isViewer) return;
    
    const success = await deleteRequisition(id);
    if (success) {
      await loadRequisitions();
    }
  };

  const createKlasmatItem = async (item: Omit<KlasmatItem, 'approved'>) => {
    try {
      const { data, error } = await supabase
        .from('klasmat_codes')
        .insert({
          name: item.name,
          code: item.code,
          category: item.category,
          approved: false,
          user_id: currentUser?.id,
        });

      if (error) {
        console.error('Erro ao criar item Klasmat:', error);
        return;
      }

      if (data) {
        setKlasmatItems((prev) => [...prev, data[0]]);
      }
    } catch (err) {
      console.error('Erro ao criar item Klasmat:', err);
    }
  };

  const approveKlasmatItem = async (code: string) => {
    setKlasmatItems((prev) =>
      prev.map((item) => (item.code === code ? { ...item, approved: true } : item))
    );
  };

  const value: RequisitionContextType = {
    requisitions,
    addRequisition,
    updateRequisition,
    getRequisition,
    markAsDelivered,
    deleteRequisition: deleteRequisitionHandler,
    klasmatItems: klasmatItems.filter((item) => item.approved || isAdmin),
    createKlasmatItem,
    approveKlasmatItem
  };

  return (
    <RequisitionContext.Provider value={value}>
      {children}
    </RequisitionContext.Provider>
  );
};