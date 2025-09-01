import { supabase } from './supabase';
import { Requisition } from '../types';

export const getRequisitions = async (userId?: string): Promise<Requisition[]> => {
  let query = supabase.from('requisitions').select('*').order('createdAt', { ascending: false });

  if (userId) {
    query = query.eq('userId', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar requisições:', error);
    return [];
  }
  return data || [];
};

export const getRequisitionById = async (id: string): Promise<Requisition | null> => {
  const { data, error } = await supabase.from('requisitions').select('*').eq('id', id).single();
  if (error) {
    console.error('Erro ao buscar requisição por ID:', error);
    return null;
  }
  return data;
};

type RequisitionCreationData = Omit<Requisition, 'id' | 'createdAt' | 'updatedAt' | 'status'>;

export const createRequisition = async (reqData: RequisitionCreationData): Promise<Requisition | null> => {
  const { valorTotal, numeroOS, userId, ...rest } = reqData;
  const dbData = {
    ...rest,
    valor_total: valorTotal,
    numero_os: numeroOS,
    user_id: userId,
    status: 'pendente',
  };

  const { data, error } = await supabase
    .from('requisitions')
    .insert(dbData)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar requisição no Supabase:', error);
    return null;
  }
  return data;
};

export const updateRequisition = async (id: string, updates: Partial<Requisition>): Promise<boolean> => {
  const { valorTotal, numeroOS, notaFiscal, ...rest } = updates;
  const dbUpdates: Record<string, any> = { ...rest };
  if (valorTotal !== undefined) dbUpdates.valor_total = valorTotal;
  if (numeroOS !== undefined) dbUpdates.numero_os = numeroOS;
  if (notaFiscal !== undefined) dbUpdates.nota_fiscal = notaFiscal;

  const { error } = await supabase.from('requisitions').update(dbUpdates).eq('id', id);
  if (error) console.error('Erro ao atualizar requisição:', error);
  return !error;
};

export const deleteRequisition = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('requisitions').delete().eq('id', id);
  if (error) console.error('Erro ao deletar requisição:', error);
  return !error;
};