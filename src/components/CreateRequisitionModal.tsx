import React, { useState, useEffect } from 'react';
import { useRequisitions } from '../contexts/RequisitionContext';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

interface CreateRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateRequisitionModal: React.FC<CreateRequisitionModalProps> = ({ isOpen, onClose }) => {
  const [rq, setRq] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [numeroOS, setNumeroOS] = useState('');
  const [descricao, setDescricao] = useState('');
  const [local, setLocal] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { addRequisition } = useRequisitions();
  const { currentUser } = useAuth();

  // Efeito para preencher o local com a UT do usuário
  useEffect(() => {
    if (isOpen && currentUser?.ut) {
      setLocal(currentUser.ut);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const cleanUpAndClose = () => {
    // Limpa o formulário
    setRq('');
    setValorTotal('');
    setNumeroOS('');
    setDescricao('');
    setLocal(currentUser?.ut || '');
    setFornecedor('');
    setError('');
    // Fecha o modal
    onClose();
  };

  const handleValorTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Permite apenas números e um separador decimal (ponto ou vírgula)
    const sanitizedValue = value.replace(/[^0-9,.]/g, '').replace(',', '.');
    const parts = sanitizedValue.split('.');
    if (parts.length > 2) {
      // Se houver mais de um ponto, mantém apenas o primeiro
      setValorTotal(parts[0] + '.' + parts.slice(1).join(''));
    } else {
      setValorTotal(sanitizedValue);
    }
  };

  const handleValorFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Converte 'R$ 1.234,56' para '1234.56' para facilitar a edição
    const unformatted = value
      .replace('R$', '')
      .trim()
      .replace(/\./g, '')
      .replace(',', '.');
    
    if (unformatted && !isNaN(parseFloat(unformatted))) {
      setValorTotal(unformatted);
    }
  };

  const handleValorBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const num = parseFloat(value.replace(',', '.'));
      if (!isNaN(num)) {
        setValorTotal(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num));
      } else {
        setValorTotal(''); // Limpa o campo se o valor for inválido
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Você precisa estar logado para criar uma requisição.');
      return;
    }

    const valorLimpo = String(valorTotal).replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
    const valorNumerico = parseFloat(valorLimpo);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      setError('O valor total inserido é inválido.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await addRequisition({
        rq,
        valorTotal: valorNumerico,
        numeroOS,
        descricao,
        local,
        fornecedor,
        userId: currentUser.id,
      });
      
      cleanUpAndClose();

    } catch (err) {
      console.error("Falha ao criar requisição:", err);
      setError(err instanceof Error ? err.message : 'Falha ao criar a requisição. Verifique os dados e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
        <button onClick={cleanUpAndClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold mb-4">Criar Nova Requisição</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="RQ" value={rq} onChange={(e) => setRq(e.target.value)} required className="p-2 border rounded" />
            <input
              type="text"
              placeholder="R$ 0,00"
              value={valorTotal}
              onChange={handleValorTotalChange}
              onFocus={handleValorFocus}
              onBlur={handleValorBlur}
              required
              className="p-2 border rounded"
              inputMode="decimal"
            />
            <input type="text" placeholder="Número da OS" value={numeroOS} onChange={(e) => setNumeroOS(e.target.value)} required className="p-2 border rounded" />
            <input type="text" placeholder="Local" value={local} onChange={(e) => setLocal(e.target.value)} required className="p-2 border rounded" />
          </div>
          <input type="text" placeholder="Fornecedor" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} required className="p-2 border rounded w-full" />
          <textarea placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} required className="p-2 border rounded w-full h-24" />
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={cleanUpAndClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequisitionModal;
