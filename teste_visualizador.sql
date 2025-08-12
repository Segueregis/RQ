-- Script de teste para verificar o perfil visualizador
-- Execute este SQL no Supabase Dashboard

-- 1. Criar usuário visualizador de teste
INSERT INTO users (name, email, password_hash, status, role) 
VALUES (
  'Visualizador Teste', 
  'visualizador@teste.com', 
  '$2b$10$BuJbZVSrKvBwozIo5zpG8.HVgYlsqrPAPuwjjxNnPhCrVRkSuNYD6', -- senha: Bemvindo22*
  'approved', 
  'visualizador'
) ON CONFLICT (email) DO NOTHING;

-- 2. Verificar se o usuário foi criado
SELECT id, name, email, role, status FROM users WHERE email = 'visualizador@teste.com';

-- 3. Verificar quantas requisições existem no sistema
SELECT COUNT(*) as total_requisicoes FROM requisitions;

-- 4. Verificar políticas de segurança ativas
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'requisitions'
ORDER BY policyname;

-- 5. Testar consulta como visualizador (simular)
-- Esta consulta deve retornar todas as requisições se as políticas estiverem corretas
SELECT 
    r.id,
    r.rq,
    r.descricao,
    r.status,
    u.name as criador
FROM requisitions r
LEFT JOIN users u ON r.user_id = u.id
ORDER BY r.created_at DESC
LIMIT 10; 