import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { authenticateUser, createUser } from '../lib/auth';
import { supabase } from '../lib/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      // Lógica antiga: Verifica se há um usuário salvo localmente
      const savedUserString = localStorage.getItem('currentUser');
      if (savedUserString) {
        try {
          const savedUser = JSON.parse(savedUserString);
          // Busca o perfil mais recente do banco para garantir dados atualizados
          const { data: freshUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', savedUser.id)
            .single();

          if (error || !freshUser) {
            console.error('Erro ao revalidar usuário ou usuário não encontrado. Fazendo logout.', error);
            logout();
          } else {
            setCurrentUser(freshUser);
            localStorage.setItem('currentUser', JSON.stringify(freshUser));
          }
        } catch (e) {
          console.error('Erro ao ler dados do usuário do localStorage. Fazendo logout.', e);
          logout();
        }
      }
      setLoading(false);
    };

    bootstrapAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Lógica antiga: autenticação manual
    const user = await authenticateUser(email, password);
    
    if (user && user.status === 'approved') {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const register = async (name: string, email: string, password: string, ut: string): Promise<boolean> => {
    // Lógica antiga: criação manual
    const newUser = await createUser({
      name, email, password, ut,
      status: 'pending',
      role: 'user'
    });
    if (!newUser) {
      return false;
    }
    return true;
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    isViewer: currentUser?.role === 'viewer',
    isFinanceiro: currentUser?.role === 'financeiro',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
