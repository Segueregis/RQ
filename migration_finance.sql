-- Migração para adicionar campos de financeiro à tabela requisitions


-- Adicionar novas colunas (financeiro)
ALTER TABLE requisitions
ADD COLUMN IF NOT EXISTS data_emissao DATE,
ADD COLUMN IF NOT EXISTS valor_nf DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS data_envio DATE,
ADD COLUMN IF NOT EXISTS usuario_envio TEXT;

-- Remover constraint antiga de status (se existir)
ALTER TABLE requisitions
DROP CONSTRAINT IF EXISTS requisitions_status_check;

-- Criar nova constraint com os status corretos
ALTER TABLE requisitions
ADD CONSTRAINT requisitions_status_check
CHECK (
  status IN (
    'pendente',
    'aguardando_lancamento',
    'abriu_chamado',
    'lancada'
    'paga'
    'cancelada'
  )
);
