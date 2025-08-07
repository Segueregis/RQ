import bcrypt from 'bcryptjs';
import { supabase } from './supabase';
import { User } from '../types';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User | null> => {
  try {
    const hashedPassword = await hashPassword(userData.password);
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: userData.name,
        email: userData.email,
        password_hash: hashedPassword,
        status: userData.status,
        role: userData.role
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      password: '', // Não retornamos a senha
      status: data.status,
      role: data.role,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return null;
  }
};

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  try {
    console.log('Tentando autenticar:', email);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }

    if (!data) {
      console.log('Usuário não encontrado');
      return null;
    }

    console.log('Usuário encontrado:', { 
      email: data.email, 
      status: data.status, 
      role: data.role 
    });

    const isValidPassword = await comparePassword(password, data.password_hash);
    console.log('Senha válida:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Senha inválida');
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      password: '', // Não retornamos a senha
      status: data.status,
      role: data.role,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return null;
  }
};

export const updateUserStatus = async (userId: string, status: 'approved' | 'rejected'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId);

    if (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar status do usuário:', error);
    return false;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }

    return data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '', // Não retornamos a senha
      status: user.status,
      role: user.role,
      createdAt: user.created_at
    }));
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return [];
  }
}; 