-- Migração para adicionar campos de financeiro à tabela requisitions

-- Adicionar novas colunas
ALTER TABLE requisitions
ADD COLUMN IF NOT EXISTS data_emissao DATE,
ADD COLUMN IF NOT EXISTS valor_nf DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS data_envio DATE,
ADD COLUMN IF NOT EXISTS usuario_envio TEXT;

-- Atualizar o constraint de status para incluir 'aguardando_lancamento'
ALTER TABLE requisitions
DROP CONSTRAINT IF EXISTS requisitions_status_check;

ALTER TABLE requisitions
ADD CONSTRAINT requisitions_status_check
CHECK (status IN ('pendente', 'entregue', 'aguardando_lancamento'));