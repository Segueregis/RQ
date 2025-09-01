import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { utsList } from '../data/uts';


/**
 * Simula o envio de um e-mail de confirmação para o usuário logado.
 * Em uma aplicação real, isso seria uma chamada para um backend ou uma Supabase Edge Function.
 * @param formData Os dados do formulário da nota fiscal.
 * @param userEmail O e-mail do usuário que receberá a confirmação.
 */
const sendConfirmationEmail = async (formData: {
  numeroNota: string;
  dataEmissao: string;
  fornecedor: string;
  numeroOC: string;
  valorNota: number;
  ut: string;

}, userEmail: string) => {
  console.log(`--- SIMULANDO ENVIO DE EMAIL DE CONFIRMAÇÃO PARA ${userEmail} ---`);

  // Formata a data para o padrão brasileiro (dd/mm/yyyy)
  const formattedDate = new Date(formData.dataEmissao + 'T00:00:00').toLocaleDateString('pt-BR');
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(formData.valorNota);

  const emailBody = `
    <h1>Confirmação de Recebimento de Nota Fiscal</h1>
    <p>Olá,</p>
    <p>Este é um e-mail de confirmação de que sua nota fiscal foi registrada com sucesso no sistema. Seguem os dados enviados:</p>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <tr style="background-color: #f2f2f2;">
        <td style="padding: 8px;"><strong>Campo</strong></td>
        <td style="padding: 8px;"><strong>Valor</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px;"><strong>Número da Nota Fiscal</strong></td>
        <td style="padding: 8px;">${formData.numeroNota}</td>
      </tr>
      <tr>
        <td style="padding: 8px;"><strong>Data de Emissão</strong></td>
        <td style="padding: 8px;">${formattedDate}</td>
      </tr>
      <tr>
        <td style="padding: 8px;"><strong>Fornecedor</strong></td>
        <td style="padding: 8px;">${formData.fornecedor}</td>
      </tr>
      <tr>
        <td style="padding: 8px;"><strong>UT (Unidade de Trabalho)</strong></td>
        <td style="padding: 8px;">${formData.ut}</td>
      </tr>
      <tr>
        <td style="padding: 8px;"><strong>Valor da Nota Fiscal</strong></td>
        <td style="padding: 8px;">${formattedValue}</td>
      </tr>
      <tr>
        <td style="padding: 8px;"><strong>Número da OC</strong></td>
        <td style="padding: 8px;">${formData.numeroOC}</td>
      </tr>
    </table>
    <p>Este é um backup dos dados que você enviou.</p>
    <p>Atenciosamente,<br>Sistema de Requisições</p>
  `;

  console.log("Corpo do E-mail:");
  console.log(emailBody);
  console.log("--- FIM DA SIMULAÇÃO ---");

  // Simula uma chamada de rede
  await new Promise(resolve => setTimeout(resolve, 1000));
};

const NotaFiscalPage = () => {
  const [numeroNota, setNumeroNota] = useState('');
  const [dataEmissao, setDataEmissao] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [numeroOC, setNumeroOC] = useState('');
  const [ut, setUt] = useState('');
  const [valorNota, setValorNota] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.ut) {
      setUt(currentUser.ut);
    }
  }, [currentUser]);

  const handleNumeroNotaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permite apenas caracteres numéricos
    const numericValue = e.target.value.replace(/\D/g, '');
    setNumeroNota(numericValue);
  };

  const handleValorNotaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Permite apenas números e um separador decimal (ponto ou vírgula)
    const sanitizedValue = value.replace(/[^0-9,.]/g, '').replace(',', '.');
    const parts = sanitizedValue.split('.');
    if (parts.length > 2) {
      // Se houver mais de um ponto, mantém apenas o primeiro
      setValorNota(parts[0] + '.' + parts.slice(1).join(''));
    } else {
      setValorNota(sanitizedValue);
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
      setValorNota(unformatted);
    }
  };

  const handleValorBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const num = parseFloat(value.replace(',', '.'));
      if (!isNaN(num)) {
        const formatted = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(num);
        setValorNota(formatted);
      } else {
        setValorNota(''); // Limpa o campo se o valor for inválido
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const valorLimpo = String(valorNota).replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
    const parsedValor = parseFloat(valorLimpo);

    if (!numeroNota || !dataEmissao || !fornecedor || !numeroOC || !ut || !valorNota || isNaN(parsedValor) || !utsList.includes(ut)) {
      setError('Todos os campos são obrigatórios e a UT deve ser uma opção válida da lista.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      if (!currentUser?.email) {
        setError('Não foi possível identificar o e-mail do usuário logado. Faça login novamente.');
        setIsLoading(false);
        return;
      }

      // Objeto de dados para o Supabase, com nomes de colunas correspondentes
      const notaFiscalData = {
        numero_nota: numeroNota,
        data_emissao: dataEmissao,
        fornecedor,
        numero_oc: numeroOC,
        ut,
        valor_nota: parsedValor,
        user_email: currentUser.email,
        status: 'Aguardando Lançamento', // Status inicial padrão
      };

      // 1. Inserir os dados no banco de dados do Supabase
      const { error: insertError } = await supabase.from('notas_fiscais').insert([notaFiscalData]);

      if (insertError) {
        // Se houver um erro no banco, exibe a mensagem e interrompe
        setError(`Erro ao salvar no banco: ${insertError.message}`);
        setIsLoading(false);
        return;
      }

      // 2. Se a inserção for bem-sucedida, envia o e-mail de confirmação
      await sendConfirmationEmail({ numeroNota, dataEmissao, fornecedor, numeroOC, ut, valorNota: parsedValor }, currentUser.email);
      setIsSubmitted(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      setError(`Falha ao enviar a nota fiscal: ${errorMessage}`);
      console.error("Erro no handleSubmit:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="nota-fiscal-container" style={{ position: 'relative' }}>
      <style>{`
        /* Remove as setas dos inputs numéricos no Chrome, Safari, Edge, Opera */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        /* Remove as setas dos inputs numéricos no Firefox */
        input[type=number] { -moz-appearance: textfield; }
        .close-button { position: absolute; top: 1rem; right: 1rem; background: none; border: none; cursor: pointer; color: #888; transition: color 0.2s; }
        .close-button:hover { color: #333; }
        .nota-fiscal-container { max-width: 600px; margin: 2rem auto; padding: 2rem; border: 1px solid #ccc; border-radius: 8px; background-color: #f9f9f9; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .nota-fiscal-container h1 { text-align: center; margin-bottom: 1.5rem; color: #333; font-size: 1.5rem; }
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; color: #555; }
        .form-group input, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; font-size: 1rem; }
        .form-group input:disabled, .form-group select:disabled { background-color: #e9ecef; cursor: not-allowed; }
        .submit-button { width: 100%; padding: 0.75rem; border: none; border-radius: 4px; background-color: #28a745; color: white; font-size: 1rem; cursor: pointer; transition: background-color 0.2s; }
        .submit-button:hover:not(:disabled) { background-color: #218838; }
        .submit-button:disabled { background-color: #cccccc; cursor: not-allowed; }
        .success-message { margin-top: 1rem; padding: 1rem; background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; border-radius: 4px; text-align: center; }
        .error-message { color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: .75rem 1.25rem; margin-bottom: 1rem; border-radius: .25rem; text-align: center; }
      `}</style>
      <button
        onClick={() => navigate('/home')}
        className="close-button"
        aria-label="Fechar"
      >
        <X className="h-6 w-6" />
      </button>
      <h1>Lançamento de Nota Fiscal</h1>
      {isSubmitted ? (
        <div className="success-message">
          <h2>✅ Nota Fiscal Enviada!</h2>
          <p>Sua nota foi registrada e um e-mail de confirmação foi enviado.</p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              // Opcional: Adicionar uma função para limpar o formulário aqui
            }}
            className="submit-button"
          >
            Lançar Nova Nota
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label htmlFor="numeroNota">Número da Nota Fiscal</label>
            <input type="text" id="numeroNota" value={numeroNota} onChange={handleNumeroNotaChange} disabled={isLoading} required inputMode="numeric" />
          </div>
          <div className="form-group">
            <label htmlFor="dataEmissao">Data de Emissão</label>
            <input type="date" id="dataEmissao" value={dataEmissao} onChange={(e) => setDataEmissao(e.target.value)} disabled={isLoading} required />
          </div>
          <div className="form-group">
            <label htmlFor="fornecedor">Fornecedor</label>
            <input type="text" id="fornecedor" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} disabled={isLoading} required />
          </div>
          <div className="form-group">
            <label htmlFor="ut">UT (Unidade de Trabalho)</label>
            <select
              id="ut"
              value={ut}
              onChange={(e) => setUt(e.target.value)}
              disabled={isLoading}
              required
            >
              <option value="" disabled>Selecione uma UT</option>
              {utsList.map((utItem: string) => (
                <option key={utItem} value={utItem}>
                  {utItem}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="valorNota">Valor da Nota Fiscal</label>
            <input
              type="text"
              id="valorNota"
              value={valorNota}
              onChange={handleValorNotaChange}
              onFocus={handleValorFocus}
              onBlur={handleValorBlur}
              disabled={isLoading} required placeholder="R$ 0,00"
              inputMode="decimal"
            />
          </div>
          <div className="form-group">
            <label htmlFor="numeroOC">Número da OC (Ordem de Compra)</label>
            <input type="text" id="numeroOC" value={numeroOC} onChange={(e) => setNumeroOC(e.target.value)} disabled={isLoading} required />
          </div>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar Nota Fiscal'}
          </button>
        </form>
      )}
    </div>
  );
};

export default NotaFiscalPage;