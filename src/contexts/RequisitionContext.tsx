import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Requisition } from '../types';

interface RequisitionContextType {
  requisitions: Requisition[];
  addRequisition: (requisition: Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRequisition: (id: string, updates: Partial<Requisition>) => void;
  getRequisition: (id: string) => Requisition | undefined;
  markAsDelivered: (id: string, notaFiscal?: string, oc?: string) => void;
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

  useEffect(() => {
    const savedRequisitions = localStorage.getItem('requisitions');
    if (savedRequisitions) {
      setRequisitions(JSON.parse(savedRequisitions));
    }
  }, []);

  const saveToStorage = (reqs: Requisition[]) => {
    localStorage.setItem('requisitions', JSON.stringify(reqs));
  };

  const addRequisition = (requisition: Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRequisition: Requisition = {
      ...requisition,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedRequisitions = [...requisitions, newRequisition];
    setRequisitions(updatedRequisitions);
    saveToStorage(updatedRequisitions);
  };

  const updateRequisition = (id: string, updates: Partial<Requisition>) => {
    const updatedRequisitions = requisitions.map(req =>
      req.id === id
        ? { ...req, ...updates, updatedAt: new Date().toISOString() }
        : req
    );
    setRequisitions(updatedRequisitions);
    saveToStorage(updatedRequisitions);
  };

  const getRequisition = (id: string) => {
    return requisitions.find(req => req.id === id);
  };

  const markAsDelivered = (id: string, notaFiscal?: string, oc?: string) => {
    updateRequisition(id, {
      status: 'entregue',
      notaFiscal,
      oc
    });
  };

  const value: RequisitionContextType = {
    requisitions,
    addRequisition,
    updateRequisition,
    getRequisition,
    markAsDelivered
  };

  return (
    <RequisitionContext.Provider value={value}>
      {children}
    </RequisitionContext.Provider>
  );
};