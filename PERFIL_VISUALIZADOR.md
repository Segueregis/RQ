# Perfil "Visualizador" - Sistema de Permissões

## Visão Geral

O perfil "visualizador" foi adicionado ao sistema para permitir que usuários tenham acesso somente leitura a todas as requisições, sem poder realizar modificações.

## Permissões do Perfil Visualizador

### ✅ **Permissões Concedidas**
1. **Visualizar todas as RQs** na página Home
2. **Acessar a página de detalhes** de qualquer requisição
3. **Usar filtros e busca** na lista de requisições
4. **Ver todos os campos** das requisições (incluindo notas fiscais e OCs)

### ❌ **Permissões Negadas**
1. **Criar novas RQs** - Botão "Criar nova RQ" está oculto
2. **Editar requisições** - Botão "Editar RQ" está oculto
3. **Marcar como entregue** - Botão "Marcar como Entregue" está oculto
4. **Excluir requisições** - Botão "Excluir Requisição" está oculto
5. **Modificar qualquer dado** - Todos os campos são somente leitura

## Implementação Técnica

### Frontend
- **AuthContext**: Adicionada propriedade `isViewer`
- **Home**: Botão "Criar nova RQ" oculto para visualizadores
- **RequisitionDetail**: Todos os botões de ação ocultos para visualizadores
- **CreateRequisitionModal**: Verificação de permissão antes de criar
- **RequisitionContext**: Verificações de permissão em todas as operações

### Backend
- **Database Schema**: Role atualizado para incluir 'visualizador'
- **Row Level Security**: Nova política para visualizadores verem todas as requisições
- **Políticas de Segurança**: Visualizadores só têm permissão SELECT

## Como Criar um Usuário Visualizador

### 1. Via SQL (Direto no Banco)
```sql
INSERT INTO users (name, email, password_hash, status, role) 
VALUES (
  'Nome do Visualizador', 
  'visualizador@empresa.com', 
  '$2b$10$hash_da_senha_aqui', 
  'approved', 
  'visualizador'
);
```

### 2. Via Interface Admin
1. Acesse a página de Administração
2. Crie um novo usuário
3. Altere o role para "visualizador" no banco de dados
4. Aprove o usuário

## Migração para Bancos Existentes

Execute o arquivo `migration_visualizador.sql` no Supabase Dashboard:

1. Acesse o SQL Editor
2. Cole o conteúdo do arquivo
3. Execute a migração
4. Verifique se as políticas foram criadas

## Testando o Perfil Visualizador

### Cenários de Teste
1. **Login como visualizador**
   - Deve conseguir fazer login normalmente
   - Deve ver todas as requisições na Home

2. **Página Home**
   - ✅ Ver tabela de requisições
   - ✅ Usar filtros e busca
   - ❌ Não deve ver botão "Criar nova RQ"

3. **Página de Detalhes**
   - ✅ Ver todos os campos da requisição
   - ✅ Campos em modo somente leitura
   - ❌ Não deve ver botões de edição
   - ❌ Não deve ver botão "Marcar como Entregue"
   - ❌ Não deve ver botão "Excluir"

4. **Tentativas de Modificação**
   - ❌ Não deve conseguir criar requisições
   - ❌ Não deve conseguir editar requisições
   - ❌ Não deve conseguir excluir requisições
   - ❌ Não deve conseguir marcar como entregue

## Segurança

### Políticas de Segurança Aplicadas
- **SELECT**: Visualizadores podem ver todas as requisições
- **INSERT**: Visualizadores não podem criar requisições
- **UPDATE**: Visualizadores não podem modificar requisições
- **DELETE**: Visualizadores não podem excluir requisições

### Verificações Frontend
- Todas as ações são verificadas antes da execução
- Botões e formulários são ocultados/desabilitados
- Context API previne operações não autorizadas

## Troubleshooting

### Problema: Visualizador não consegue ver requisições
**Solução**: Verifique se a política "Viewers can view all requisitions" foi criada

### Problema: Visualizador consegue editar requisições
**Solução**: Verifique se o frontend está usando `isViewer` corretamente

### Problema: Botão "Criar nova RQ" aparece para visualizador
**Solução**: Verifique se a condição `{!isViewer &&` está aplicada no componente Home

## Próximas Melhorias

- [ ] Adicionar indicador visual de perfil no header
- [ ] Criar página de gerenciamento de perfis
- [ ] Adicionar logs de auditoria para visualizadores
- [ ] Implementar permissões granulares por campo 