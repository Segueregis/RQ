import { supabase } from './supabase';
import { Requisition } from '../types';

export const createRequisition = async (requisitionData: Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>): Promise<Requisition | null> => {
  try {
    const { data, error } = await supabase
      .from('requisitions')
      .insert({
        rq: requisitionData.rq,
        valor_total: requisitionData.valorTotal,
        ut: requisitionData.ut,
        descricao: requisitionData.descricao,
        local: requisitionData.local,
        fornecedor: requisitionData.fornecedor,
        status: requisitionData.status,
        nota_fiscal: requisitionData.notaFiscal,
        oc: requisitionData.oc,
        data_emissao: requisitionData.dataEmissao,
        valor_nf: requisitionData.valorNF,
        nota_fiscal_pdf_url: requisitionData.notaFiscalPdfUrl,  // Adicionado
        user_id: requisitionData.userId,
        data_envio: requisitionData.dataEnvio,
        usuario_envio: requisitionData.usuarioEnvio
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
      ut: data.ut,
      descricao: data.descricao,
      local: data.local,
      fornecedor: data.fornecedor,
      status: data.status,
      notaFiscal: data.nota_fiscal,
      oc: data.oc,
      dataEmissao: data.data_emissao,
      valorNF: data.valor_nf,
      notaFiscalPdfUrl: data.nota_fiscal_pdf_url,  // Adicionado
      userId: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      dataEnvio: data.data_envio,
      usuarioEnvio: data.usuario_envio
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
      ut: item.ut,
      descricao: item.descricao,
      local: item.local,
      fornecedor: item.fornecedor,
      status: item.status,
      notaFiscal: item.nota_fiscal,
      oc: item.oc,
      dataEmissao: item.data_emissao,
      valorNF: item.valor_nf,
      userId: item.user_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      dataEnvio: item.data_envio,
      usuarioEnvio: item.usuario_envio
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
    if (updates.ut) updateData.ut = updates.ut;
    if (updates.descricao) updateData.descricao = updates.descricao;
    if (updates.local) updateData.local = updates.local;
    if (updates.fornecedor) updateData.fornecedor = updates.fornecedor;
    if (updates.status) updateData.status = updates.status;
    if (updates.notaFiscal !== undefined) updateData.nota_fiscal = updates.notaFiscal;
    if (updates.oc !== undefined) updateData.oc = updates.oc;
    if (updates.dataEmissao !== undefined) updateData.data_emissao = updates.dataEmissao;
    if (updates.valorNF !== undefined) updateData.valor_nf = updates.valorNF;
    if (updates.notaFiscalPdfUrl !== undefined) updateData.nota_fiscal_pdf_url = updates.notaFiscalPdfUrl;  // Adicionado
    if (updates.dataEnvio !== undefined) updateData.data_envio = updates.dataEnvio;
    if (updates.usuarioEnvio !== undefined) updateData.usuario_envio = updates.usuarioEnvio;

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

    if (error) {
      console.error('Erro ao buscar requisição:', error);
      return null;
    }

    return {
      id: data.id,
      rq: data.rq,
      valorTotal: data.valor_total,
      ut: data.ut,
      descricao: data.descricao,
      local: data.local,
      fornecedor: data.fornecedor,
      status: data.status,
      notaFiscal: data.nota_fiscal,
      oc: data.oc,
      dataEmissao: data.data_emissao,
      valorNF: data.valor_nf,
      notaFiscalPdfUrl: data.nota_fiscal_pdf_url,  // Adicionado
      userId: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      dataEnvio: data.data_envio,
      usuarioEnvio: data.usuario_envio
    };
  } catch (error) {
    console.error('Erro ao buscar requisição:', error);
    return null;
  }
};