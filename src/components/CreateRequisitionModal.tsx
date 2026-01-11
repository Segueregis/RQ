import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useRequisitions } from '../contexts/RequisitionContext';
import { useAuth } from '../contexts/AuthContext';
import { utsList } from '../data/uts';

interface CreateRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateRequisitionModal: React.FC<CreateRequisitionModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    rq: '',
    valorTotal: '',
    ut: '',
    descricao: '',
    local: '',
    fornecedor: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { addRequisition } = useRequisitions();
  const { currentUser, isViewer } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isViewer) return;

    setIsLoading(true);
    try {
      await addRequisition({
        rq: formData.rq,
        valorTotal: parseFloat(formData.valorTotal),
        ut: formData.ut,
        descricao: formData.descricao,
        local: formData.local,
        fornecedor: formData.fornecedor,
        status: 'pendente',
        userId: currentUser.id
      });
      
      setFormData({
        rq: '',
        valorTotal: '',
        ut: '',
        descricao: '',
        local: '',
        fornecedor: ''
      });
      onClose();
    } catch (error) {
      console.error('Erro ao criar requisição:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Criar Nova RQ</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="rq" className="block text-sm font-medium text-gray-700 mb-1">
                RQ *
              </label>
              <input
                type="text"
                id="rq"
                name="rq"
                value={formData.rq}
                onChange={handleChange}
                maxLength={10}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: RQ001"
              />
            </div>

            <div>
              <label htmlFor="valorTotal" className="block text-sm font-medium text-gray-700 mb-1">
                Valor Total *
              </label>
              <input
                type="number"
                id="valorTotal"
                name="valorTotal"
                value={formData.valorTotal}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="ut" className="block text-sm font-medium text-gray-700 mb-1">
                UT *
              </label>
              <select
                id="ut"
                name="ut"
                value={formData.ut}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione uma UT</option>
                {utsList.map((ut) => (
                  <option key={ut.id} value={ut.id}>
                    {ut.descricao}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição *
              </label>
              <textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descreva a requisição..."
              />
            </div>

            <div>
              <label htmlFor="local" className="block text-sm font-medium text-gray-700 mb-1">
                Local *
              </label>
              <input
                type="text"
                id="local"
                name="local"
                value={formData.local}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Almoxarifado"
              />
            </div>

            <div>
              <label htmlFor="fornecedor" className="block text-sm font-medium text-gray-700 mb-1">
                Fornecedor *
              </label>
              <input
                type="text"
                id="fornecedor"
                name="fornecedor"
                value={formData.fornecedor}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome do fornecedor"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequisitionModal;