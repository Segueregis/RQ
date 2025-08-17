-- Criação da tabela de usuários
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'visualizador')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criação da tabela de requisições
CREATE TABLE requisitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rq TEXT NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  numero_os TEXT NOT NULL,
  descricao TEXT NOT NULL,
  local TEXT NOT NULL,
  fornecedor TEXT NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'entregue')),
  nota_fiscal TEXT,
  oc TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criação da tabela de itens Klasmat
CREATE TABLE klasmat_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_requisitions_updated_at 
    BEFORE UPDATE ON requisitions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_klasmat_codes_updated_at 
    BEFORE UPDATE ON klasmat_codes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário administrador padrão
-- Senha: Bemvindo22* (hash bcrypt)
INSERT INTO users (name, email, password_hash, status, role) 
VALUES (
  'Administrador', 
  'regis_etep@outlook.com', 
  '$2b$10$BuJbZVSrKvBwozIo5zpG8.HVgYlsqrPAPuwjjxNnPhCrVRkSuNYD6', -- hash da senha 'Bemvindo22*'
  'approved', 
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE klasmat_codes ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para usuários
-- Usuários podem ver apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Admins podem ver todos os usuários
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Admins podem atualizar qualquer usuário
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Políticas de segurança para requisições
-- Usuários podem ver apenas suas próprias requisições
CREATE POLICY "Users can view own requisitions" ON requisitions
  FOR SELECT USING (user_id::text = auth.uid()::text);

-- Admins podem ver todas as requisições
CREATE POLICY "Admins can view all requisitions" ON requisitions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Visualizadores podem ver todas as requisições
CREATE POLICY "Viewers can view all requisitions" ON requisitions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'visualizador'
    )
  );

-- Usuários podem inserir suas próprias requisições
CREATE POLICY "Users can insert own requisitions" ON requisitions
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- Usuários podem atualizar apenas suas próprias requisições
CREATE POLICY "Users can update own requisitions" ON requisitions
  FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Admins podem atualizar qualquer requisição
CREATE POLICY "Admins can update all requisitions" ON requisitions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Usuários podem deletar apenas suas próprias requisições
CREATE POLICY "Users can delete own requisitions" ON requisitions
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- Admins podem deletar qualquer requisição
CREATE POLICY "Admins can delete all requisitions" ON requisitions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Políticas de segurança para itens Klasmat
-- Usuários podem ver apenas seus próprios itens Klasmat
CREATE POLICY "Users can view own klasmat codes" ON klasmat_codes
  FOR SELECT USING (user_id::text = auth.uid()::text);

-- Admins podem ver todos os itens Klasmat
CREATE POLICY "Admins can view all klasmat codes" ON klasmat_codes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Usuários podem inserir seus próprios itens Klasmat
CREATE POLICY "Users can insert own klasmat codes" ON klasmat_codes
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- Usuários podem atualizar apenas seus próprios itens Klasmat
CREATE POLICY "Users can update own klasmat codes" ON klasmat_codes
  FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Admins podem atualizar qualquer item Klasmat
CREATE POLICY "Admins can update all klasmat codes" ON klasmat_codes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Usuários podem deletar apenas seus próprios itens Klasmat
CREATE POLICY "Users can delete own klasmat codes" ON klasmat_codes
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- Admins podem deletar qualquer item Klasmat
CREATE POLICY "Admins can delete all klasmat codes" ON klasmat_codes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );