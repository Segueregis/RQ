import { supabase } from './supabase';
import { Requisition } from '../types';

export const createRequisition = async (requisitionData: Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>): Promise<Requisition | null> => {
  try {
    const { data, error } = await supabase
      .from('requisitions')
      .insert({
        rq: requisitionData.rq,
        valor_total: requisitionData.valorTotal,
        numero_os: requisitionData.numeroOS,
        descricao: requisitionData.descricao,
        local: requisitionData.local,
        fornecedor: requisitionData.fornecedor,
        status: requisitionData.status,
        nota_fiscal: requisitionData.notaFiscal,
        oc: requisitionData.oc,
        user_id: requisitionData.userId
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar requisição:', error);
      return null;
    }

    return {
      id: data.id,
      rq: data.rq,
      valorTotal: data.valor_total,
      numeroOS: data.numero_os,
      descricao: data.descricao,
      local: data.local,
      fornecedor: data.fornecedor,
      status: data.status,
      notaFiscal: data.nota_fiscal,
      oc: data.oc,
      userId: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Erro ao criar requisição:', error);
    return null;
  }
};

export const getRequisitions = async (userId?: string): Promise<Requisition[]> => {
  try {
    let query = supabase
      .from('requisitions')
      .select('*')
      .order('created_at', { ascending: false });

    // Se userId for fornecido, filtra apenas as requisições do usuário
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar requisições:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      rq: item.rq,
      valorTotal: item.valor_total,
      numeroOS: item.numero_os,
      descricao: item.descricao,
      local: item.local,
      fornecedor: item.fornecedor,
      status: item.status,
      notaFiscal: item.nota_fiscal,
      oc: item.oc,
      userId: item.user_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } catch (error) {
    console.error('Erro ao buscar requisições:', error);
    return [];
  }
};

export const updateRequisition = async (id: string, updates: Partial<Requisition>): Promise<boolean> => {
  try {
    const updateData: any = {};
    
    if (updates.rq) updateData.rq = updates.rq;
    if (updates.valorTotal) updateData.valor_total = updates.valorTotal;
    if (updates.numeroOS) updateData.numero_os = updates.numeroOS;
    if (updates.descricao) updateData.descricao = updates.descricao;
    if (updates.local) updateData.local = updates.local;
    if (updates.fornecedor) updateData.fornecedor = updates.fornecedor;
    if (updates.status) updateData.status = updates.status;
    if (updates.notaFiscal !== undefined) updateData.nota_fiscal = updates.notaFiscal;
    if (updates.oc !== undefined) updateData.oc = updates.oc;

    const { error } = await supabase
      .from('requisitions')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar requisição:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar requisição:', error);
    return false;
  }
};

export const deleteRequisition = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('requisitions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar requisição:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao deletar requisição:', error);
    return false;
  }
};

export const getRequisitionById = async (id: string): Promise<Requisition | null> => {
  try {
    const { data, error } = await supabase
      .from('requisitions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      rq: data.rq,
      valorTotal: data.valor_total,
      numeroOS: data.numero_os,
      descricao: data.descricao,
      local: data.local,
      fornecedor: data.fornecedor,
      status: data.status,
      notaFiscal: data.nota_fiscal,
      oc: data.oc,
      userId: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Erro ao buscar requisição:', error);
    return null;
  }
}; 