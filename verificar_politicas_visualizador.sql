-- Script para verificar e corrigir políticas de segurança para visualizadores
-- Execute este SQL no Supabase Dashboard

-- 1. Verificar políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'requisitions'
ORDER BY policyname;

-- 2. Remover política de visualizador se existir (para recriar)
DROP POLICY IF EXISTS "Viewers can view all requisitions" ON requisitions;

-- 3. Criar política correta para visualizadores
CREATE POLICY "Viewers can view all requisitions" ON requisitions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'visualizador'
    )
  );

-- 4. Verificar se a política foi criada
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'requisitions' 
AND policyname = 'Viewers can view all requisitions';

-- 5. Testar se um usuário visualizador consegue ver requisições
-- (Execute isso como um usuário visualizador logado)
-- SELECT COUNT(*) FROM requisitions; 