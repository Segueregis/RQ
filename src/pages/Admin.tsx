import React, { useState, useEffect } from 'react';
import { Users, Check, X, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { User } from '../types';

const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  };

  const updateUserStatus = async (userId: string, status: 'approved' | 'rejected') => {
    setIsLoading(true);
    try {
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, status } : user
      );
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingUsers = users.filter(user => user.status === 'pending' && user.role !== 'admin');
  const approvedUsers = users.filter(user => user.status === 'approved' && user.role !== 'admin');
  const rejectedUsers = users.filter(user => user.status === 'rejected' && user.role !== 'admin');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const UserCard: React.FC<{ user: User; showActions?: boolean }> = ({ user, showActions = false }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-xs text-gray-500 mt-1">
            Cadastrado em: {formatDate(user.createdAt)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              user.status === 'approved'
                ? 'bg-green-100 text-green-800'
                : user.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {user.status === 'approved' ? 'Aprovado' : 
             user.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
          </span>
        </div>
      </div>
      {showActions && (
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => updateUserStatus(user.id, 'approved')}
            disabled={isLoading}
            className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="h-4 w-4" />
            <span>Aprovar</span>
          </button>
          <button
            onClick={() => updateUserStatus(user.id, 'rejected')}
            disabled={isLoading}
            className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" />
            <span>Rejeitar</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">Administração de Usuários</h1>
        </div>

        {/* Usuários Pendentes */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Usuários Pendentes ({pendingUsers.length})
            </h2>
          </div>
          
          {pendingUsers.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">Não há usuários pendentes de aprovação.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingUsers.map(user => (
                <UserCard key={user.id} user={user} showActions={true} />
              ))}
            </div>
          )}
        </section>

        {/* Usuários Aprovados */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Check className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Usuários Aprovados ({approvedUsers.length})
            </h2>
          </div>
          
          {approvedUsers.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">Nenhum usuário aprovado ainda.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {approvedUsers.map(user => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </section>

        {/* Usuários Rejeitados */}
        {rejectedUsers.length > 0 && (
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <X className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Usuários Rejeitados ({rejectedUsers.length})
              </h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rejectedUsers.map(user => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default Admin;