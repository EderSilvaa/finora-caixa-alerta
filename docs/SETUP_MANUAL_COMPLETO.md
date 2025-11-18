# 🚀 Configuração Manual - Sistema de IA 24/7

Guia passo a passo para configurar no Supabase Dashboard (sem CLI)

---

## PASSO 1: Executar a Migration SQL

### 1.1 Abrir o SQL Editor

1. Acesse: https://supabase.com/dashboard
2. Faça login
3. Selecione o projeto: **finora-caixa-alerta** (`ixcjeoibvhkdhqitkbat`)
4. No menu lateral esquerdo, clique em **SQL Editor**
5. Clique em **New Query** (botão verde)

### 1.2 Copiar e Executar o SQL

1. Abra o arquivo: `supabase/migrations/20250117_ai_analysis_system.sql`
2. Copie **TODO** o conteúdo (Ctrl+A, Ctrl+C)
3. Cole no SQL Editor do Supabase
4. Clique em **RUN** (ou pressione Ctrl+Enter)

**Deve aparecer:** ✅ "Success. No rows returned"

### 1.3 Verificar se Criou as Tabelas

Execute esta query no SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('ai_analysis_results', 'ai_alerts', 'ai_analysis_schedule')
ORDER BY table_name;
```

**Deve retornar 3 linhas:**
- ai_alerts
- ai_analysis_results
- ai_analysis_schedule

✅ Se apareceram as 3 tabelas, vá para o Passo 2!

---

## PASSO 2: Criar a Edge Function

### 2.1 Acessar Edge Functions

1. No Supabase Dashboard, menu lateral → **Edge Functions**
2. Clique em **Create a new function**

### 2.2 Configurar a Function

**Nome da função:**
```
ai-analysis-cron
```

### 2.3 Copiar o Código

1. Abra o arquivo: `supabase/functions/ai-analysis-cron/index.ts`
2. Copie **TODO** o conteúdo
3. Cole no editor de código do Supabase

### 2.4 Deploy da Function

1. Clique em **Deploy function** (botão no canto superior direito)
2. Aguarde até aparecer: ✅ "Function deployed successfully"

---

## PASSO 3: Configurar a API Key do OpenAI

### 3.1 Acessar Secrets

1. No menu lateral → **Project Settings** (ícone de engrenagem)
2. Clique em **Edge Functions** (na lista à esquerda)
3. Role até encontrar **Secrets** ou **Environment Variables**

### 3.2 Adicionar Secret

Clique em **Add a new secret** e preencha:

**Name:**
```
OPENAI_API_KEY
```

**Value:**
```
your-openai-api-key-here
```

Clique em **Save** ou **Add secret**

✅ Secret configurado!

---

## PASSO 4: Testar a Edge Function Manualmente

### 4.1 Invocar a Function

1. Volte para **Edge Functions** no menu lateral
2. Clique na função `ai-analysis-cron`
3. Procure por **Invoke** ou **Test** (botão no topo)
4. Clique e aguarde a execução

**Resposta esperada:**
```json
{
  "success": true,
  "processed": 0,
  "results": []
}
```

> **Nota:** `processed: 0` é normal se ainda não tem schedule configurado

### 4.2 Ver os Logs

Na mesma tela, procure por **Logs** ou **Invocations**

Deve mostrar a execução que acabou de rodar

✅ Function está funcionando!

---

## PASSO 5: Habilitar pg_cron (Extensão)

### 5.1 Acessar Extensions

1. Menu lateral → **Database**
2. Clique em **Extensions**

### 5.2 Habilitar pg_cron

1. Na lista de extensões, procure por **pg_cron**
2. Se estiver **OFF**, clique para habilitar (toggle para ON)
3. Aguarde confirmação: ✅ Enabled

---

## PASSO 6: Criar o Cron Job

### 6.1 Voltar ao SQL Editor

1. Menu lateral → **SQL Editor**
2. Clique em **New Query**

### 6.2 Executar SQL do Cron Job

Cole e execute este SQL:

```sql
-- Habilitar extensão (caso não esteja)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Criar cron job para rodar a cada hora
SELECT cron.schedule(
  'ai-analysis-hourly',
  '0 * * * *',  -- A cada hora às :00
  $$
  SELECT
    net.http_post(
      url := 'https://ixcjeoibvhkdhqitkbat.supabase.co/functions/v1/ai-analysis-cron',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y2plb2lidmhrZGhxaXRrYmF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTExNDYsImV4cCI6MjA3Nzc2NzE0Nn0.PhZ6z8fVuN--2trqPNt9dDEQ8wpEDuUEwDEh6u7EMmc'
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);
```

**Deve retornar:** Um número (ex: `1`, `2`, etc.) = ID do cron job

### 6.3 Verificar Cron Jobs Ativos

Execute esta query:

```sql
SELECT
  jobid,
  jobname,
  schedule,
  active
FROM cron.job;
```

**Deve mostrar:**
- jobname: `ai-analysis-hourly`
- schedule: `0 * * * *`
- active: `t` (true)

✅ Cron job criado e ativo!

---

## PASSO 7: Inicializar Schedule para Seu Usuário

### 7.1 Pegar Seu User ID

No SQL Editor, execute:

```sql
SELECT id, email FROM auth.users;
```

Copie o **ID** (UUID) do seu usuário

### 7.2 Criar Schedule

Execute este SQL (substitua `SEU_USER_ID`):

```sql
INSERT INTO ai_analysis_schedule (user_id, next_run_at)
VALUES (
  'SEU_USER_ID',  -- Cole seu ID aqui
  NOW()           -- Rodar agora
)
ON CONFLICT (user_id)
DO UPDATE SET next_run_at = NOW();
```

**Exemplo:**
```sql
INSERT INTO ai_analysis_schedule (user_id, next_run_at)
VALUES (
  '3a03b5cb-5356-4642-90c2-5bd0c8e35571',
  NOW()
);
```

✅ Schedule criado!

---

## PASSO 8: Forçar Primeira Execução

### 8.1 Chamar a Function via SQL

Execute este SQL:

```sql
SELECT
  net.http_post(
    url := 'https://ixcjeoibvhkdhqitkbat.supabase.co/functions/v1/ai-analysis-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y2plb2lidmhrZGhxaXRrYmF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTExNDYsImV4cCI6MjA3Nzc2NzE0Nn0.PhZ6z8fVuN--2trqPNt9dDEQ8wpEDuUEwDEh6u7EMmc'
    ),
    body := '{}'::jsonb
  );
```

Aguarde 10-30 segundos...

### 8.2 Verificar Análises Criadas

Execute:

```sql
SELECT
  id,
  user_id,
  created_at,
  status,
  current_balance,
  transaction_count
FROM ai_analysis_results
ORDER BY created_at DESC
LIMIT 5;
```

**Deve aparecer pelo menos 1 linha!**

✅ Primeira análise criada!

### 8.3 Verificar Alertas

Execute:

```sql
SELECT
  id,
  type,
  title,
  message,
  created_at,
  is_read
FROM ai_alerts
ORDER BY created_at DESC
LIMIT 10;
```

Se tiver alertas, aparecerão aqui!

---

## PASSO 9: Testar no Frontend

### 9.1 Abrir a Aplicação

1. Certifique-se de que o servidor está rodando: `npm run dev`
2. Acesse: http://localhost:8080
3. Faça login

### 9.2 Verificar Sino de Notificações

No header do Dashboard, procure o ícone de **sino (🔔)**

- Se tiver alertas, aparecerá um badge vermelho com o número
- Clique no sino para ver os alertas

✅ Sistema funcionando no frontend!

---

## PASSO 10: Verificar Execuções do Cron

### 10.1 Ver Histórico de Execuções

Execute:

```sql
SELECT
  jobname,
  status,
  start_time,
  end_time,
  return_message
FROM cron.job_run_details
WHERE jobname = 'ai-analysis-hourly'
ORDER BY start_time DESC
LIMIT 10;
```

Mostra as últimas 10 execuções do cron job

### 10.2 Ver Logs da Edge Function

1. Menu lateral → **Edge Functions**
2. Clique em `ai-analysis-cron`
3. Procure por **Logs** ou **Invocations**
4. Veja as execuções recentes

---

## 🎯 CHECKLIST FINAL

Marque cada item conforme completa:

- [ ] ✅ Migration SQL executada (3 tabelas criadas)
- [ ] ✅ Edge Function `ai-analysis-cron` deployada
- [ ] ✅ Secret `OPENAI_API_KEY` configurado
- [ ] ✅ Extensão `pg_cron` habilitada
- [ ] ✅ Cron job `ai-analysis-hourly` criado
- [ ] ✅ Schedule inicializado para meu usuário
- [ ] ✅ Primeira análise executada manualmente
- [ ] ✅ Análise aparecendo na tabela `ai_analysis_results`
- [ ] ✅ Alertas visíveis no sino do frontend
- [ ] ✅ Cron job rodando automaticamente a cada hora

---

## 🔧 TROUBLESHOOTING

### Problema: Edge Function dá erro ao executar

**Verificar:**
1. Se o `OPENAI_API_KEY` está configurado corretamente
2. Nos logs da Edge Function, qual é o erro exato
3. Se tem transações cadastradas (precisa ter dados para analisar)

**Solução:**
```sql
-- Ver se tem transações
SELECT COUNT(*) FROM transactions WHERE user_id = 'SEU_USER_ID';
```

### Problema: Cron job não está rodando

**Verificar se está ativo:**
```sql
SELECT * FROM cron.job WHERE jobname = 'ai-analysis-hourly';
```

**Se `active = f` (false), reativar:**
```sql
SELECT cron.alter_job('ai-analysis-hourly', schedule := '0 * * * *', active := true);
```

### Problema: Nenhuma análise é criada

**Verificar schedule:**
```sql
SELECT * FROM ai_analysis_schedule WHERE user_id = 'SEU_USER_ID';
```

**Forçar next_run_at para agora:**
```sql
UPDATE ai_analysis_schedule
SET next_run_at = NOW()
WHERE user_id = 'SEU_USER_ID';
```

Depois execute a function manualmente (Passo 8.1)

### Problema: Sino não aparece no frontend

**Verificar se tem alertas:**
```sql
SELECT COUNT(*) FROM ai_alerts WHERE user_id = 'SEU_USER_ID' AND is_read = false;
```

**Se retornar 0:**
- É normal, ainda não tem alertas críticos
- O sino só aparece quando há alertas não lidos

**Se retornar > 0 mas não aparece:**
- Limpe o cache do navegador (Ctrl+Shift+R)
- Faça logout e login novamente

---

## 📊 MONITORAMENTO CONTÍNUO

### Performance das Análises

```sql
-- Tempo médio de análise (últimas 24h)
SELECT
  AVG(analysis_duration_ms) as avg_ms,
  MAX(analysis_duration_ms) as max_ms,
  COUNT(*) as total
FROM ai_analysis_results
WHERE created_at > NOW() - INTERVAL '24 hours';
```

### Taxa de Sucesso

```sql
-- % de sucesso vs falha (últimas 24h)
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as pct
FROM ai_analysis_results
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;
```

### Próxima Execução

```sql
-- Ver quando roda próxima análise
SELECT
  user_id,
  next_run_at,
  next_run_at - NOW() as time_until_next
FROM ai_analysis_schedule
ORDER BY next_run_at;
```

---

## 🎉 PARABÉNS!

Se chegou até aqui, seu sistema de IA 24/7 está configurado e rodando!

### O que acontece agora?

✅ **A cada hora**, o cron job vai:
1. Buscar usuários que precisam de análise
2. Processar transações
3. Gerar insights de IA
4. Detectar anomalias
5. Criar alertas críticos
6. Salvar tudo no banco

✅ **Quando o usuário entrar no app**:
1. Dados já estão prontos
2. Carregamento instantâneo (< 1s)
3. Alertas aparecem no sino
4. Nenhuma espera por processamento

### Próximos Passos Opcionais

- [ ] Configurar notificações por email
- [ ] Integrar com WhatsApp
- [ ] Adicionar mais tipos de alertas
- [ ] Criar dashboard de monitoramento
- [ ] Implementar ML para previsões melhores

---

**Dúvidas?** Volte aqui e reveja os passos ou consulte o Troubleshooting! 🚀
