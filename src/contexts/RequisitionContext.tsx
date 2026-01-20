import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Requisition } from '../types';
import {
  createRequisition,
  getRequisitions,
  updateRequisition as updateRequisitionAPI,
  getRequisitionById,
  deleteRequisition
} from '../lib/requisitions';
import { useAuth } from './AuthContext';

interface RequisitionContextType {
  requisitions: Requisition[];
  addRequisition: (
    requisition: Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateRequisition: (id: string, updates: Partial<Requisition>) => Promise<void>;
  getRequisition: (id: string) => Promise<Requisition | null>;
  launchToFinance: (id: string, financeData: { notaFiscal: string; oc: string; dataEmissao: string; valorNF: number; fornecedor: string; notaFiscalPdfUrl?: string }) => Promise<void>;  // Modificado
  deleteRequisition: (id: string) => Promise<void>;
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
  const { currentUser, isAdmin, isViewer } = useAuth();

  useEffect(() => {
    if (currentUser) {
      loadRequisitions();
    }
  }, [currentUser]);

  const loadRequisitions = async () => {
    if (!currentUser) return;

    const userId = isAdmin || isViewer ? undefined : currentUser.id;
    const reqs = await getRequisitions(userId);
    setRequisitions(reqs);
  };

  const addRequisition = async (
    requisition: Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
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

  const launchToFinance = async (id: string, financeData: { notaFiscal: string; oc: string; dataEmissao: string; valorNF: number; fornecedor: string; notaFiscalPdfUrl?: string }) => {  // Modificado
    if (isViewer) return;

    await updateRequisition(id, {
      status: 'aguardando_lancamento',
      ...financeData
    });
  };

  const deleteRequisitionHandler = async (id: string) => {
    if (isViewer) return;

    const success = await deleteRequisition(id);
    if (success) {
      await loadRequisitions();
    }
  };

  const value: RequisitionContextType = {
    requisitions,
    addRequisition,
    updateRequisition,
    getRequisition,
    launchToFinance,
    deleteRequisition: deleteRequisitionHandler
  };

  return (
    <RequisitionContext.Provider value={value}>
      {children}
    </RequisitionContext.Provider>
  );
};
