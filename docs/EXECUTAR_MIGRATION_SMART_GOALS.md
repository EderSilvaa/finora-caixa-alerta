# Como Executar a Migration do Smart Goals

## Problema
O dashboard está carregando, mas a tabela `financial_goals` ainda não existe no banco de dados Supabase. Por isso, o componente de Metas Financeiras não está funcionando completamente.

## Solução Rápida: Executar Migration no Supabase Dashboard

### Passo 1: Acessar o Supabase Dashboard
1. Acesse: https://supabase.com/dashboard
2. Faça login
3. Selecione o projeto: **ixcjeoibvhkdhqitkbat**

### Passo 2: Abrir o SQL Editor
1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**

### Passo 3: Copiar e Executar o SQL

Copie TODO o conteúdo do arquivo:
```
supabase/migrations/20250113_smart_goals.sql
```

E cole no editor SQL do Supabase.

### Passo 4: Executar
1. Clique em **Run** (ou pressione Ctrl+Enter)
2. Aguarde a mensagem de sucesso
3. Você verá algo como: "Success. No rows returned"

### Passo 5: Verificar
No menu lateral, clique em **Table Editor** e verifique se a tabela `financial_goals` foi criada.

## O que foi criado?

A migration cria:
- ✅ Tabela `financial_goals` com todas as colunas necessárias
- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de segurança (users só veem suas próprias metas)
- ✅ Índices para performance
- ✅ Triggers para atualizar timestamps
- ✅ Função para calcular se meta está no prazo

## Após executar a migration

1. Recarregue o Dashboard no navegador
2. O componente "Metas Financeiras" deve aparecer
3. Você poderá criar metas manualmente ou com sugestões da IA

## Status Atual

**Correção Temporária Aplicada**:
O hook `useSmartGoals` foi modificado para não travar o Dashboard caso a tabela não exista. Ele simplesmente retorna uma lista vazia e mostra um warning no console:
```
[useSmartGoals] Table financial_goals does not exist yet. Run migration.
```

Depois de executar a migration, tudo funcionará perfeitamente! 🚀

---

**Criado em**: 2025-01-13
**Status**: ⚠️ Aguardando execução da migration
