# Configuração do Supabase

## Passos para Configurar o Banco de Dados

### 1. Acesse o Supabase Dashboard
- Vá para https://supabase.com/dashboard
- Acesse seu projeto: `mantpsrmrkgwlmomwegi`

### 2. Execute o SQL no Editor SQL
- No dashboard do Supabase, vá para "SQL Editor"
- Clique em "New Query"
- Copie e cole todo o conteúdo do arquivo `database-schema.sql`
- Clique em "Run" para executar

### 3. Verificar as Tabelas
- Vá para "Table Editor" no menu lateral
- Você deve ver duas tabelas criadas:
  - `users` - para gerenciar usuários
  - `requisitions` - para gerenciar requisições

### 4. Verificar o Usuário Admin
- Na tabela `users`, você deve ver um usuário administrador:
  - Email: `regis_etep@outlook.com`
  - Senha: `Bemvindo22*`
  - Status: `approved`
  - Role: `admin`

## Estrutura das Tabelas

### Tabela `users`
- `id` - UUID único do usuário
- `name` - Nome completo
- `email` - Email único
- `password_hash` - Senha criptografada
- `status` - Status do usuário (pending/approved/rejected)
- `role` - Função do usuário (user/admin/visualizador)
- `created_at` - Data de criação

### Tabela `requisitions`
- `id` - UUID único da requisição
- `rq` - Número da requisição
- `valor_total` - Valor total
- `numero_os` - Número da OS
- `descricao` - Descrição
- `local` - Local
- `fornecedor` - Fornecedor
- `status` - Status (pendente/entregue)
- `nota_fiscal` - Número da nota fiscal (opcional)
- `oc` - Ordem de compra (opcional)
- `user_id` - ID do usuário que criou
- `created_at` - Data de criação
- `updated_at` - Data de atualização

## Segurança (Row Level Security)

O banco está configurado com políticas de segurança que garantem:
- Usuários só veem suas próprias requisições
- Admins veem todas as requisições
- Visualizadores veem todas as requisições (somente leitura)
- Usuários só podem editar suas próprias requisições
- Admins podem editar todas as requisições
- Visualizadores não podem editar, criar ou excluir requisições

## Próximos Passos

Após executar o SQL:
1. Teste o login com o usuário admin
2. Crie um novo usuário para testar o registro
3. Aprove o usuário como admin
4. Teste o login do usuário aprovado

## Troubleshooting

Se encontrar problemas:
1. Verifique se o SQL foi executado completamente
2. Confirme que as tabelas foram criadas
3. Verifique se o usuário admin existe na tabela `users`
4. Teste a conexão no console do navegador 