-- Migração para adicionar o perfil "visualizador"
-- Execute este SQL no Supabase Dashboard para atualizar o banco existente

-- 1. Atualizar a constraint da coluna role para incluir 'visualizador'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'visualizador'));

-- 2. Adicionar política de segurança para visualizadores verem todas as requisições
CREATE POLICY "Viewers can view all requisitions" ON requisitions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'visualizador'
    )
  );

-- 3. Exemplo: Criar um usuário visualizador de teste (opcional)
-- INSERT INTO users (name, email, password_hash, status, role) 
-- VALUES (
--   'Visualizador Teste', 
--   'visualizador@teste.com', 
--   '$2b$10$BuJbZVSrKvBwozIo5zpG8.HVgYlsqrPAPuwjjxNnPhCrVRkSuNYD6', -- hash da senha 'Bemvindo22*'
--   'approved', 
--   'visualizador'
-- ) ON CONFLICT (email) DO NOTHING;

-- 4. Verificar se as políticas foram criadas corretamente
-- SELECT * FROM pg_policies WHERE tablename = 'requisitions'; 