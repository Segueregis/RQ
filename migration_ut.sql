-- Migração para alterar numero_os para ut na tabela requisitions

-- Renomear a coluna numero_os para ut
ALTER TABLE requisitions
RENAME COLUMN numero_os TO ut;

-- Atualizar a coluna ut para ser NOT NULL se necessário
-- ALTER TABLE requisitions ALTER COLUMN ut SET NOT NULL;