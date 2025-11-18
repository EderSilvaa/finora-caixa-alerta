# Guia: Configurar Análise de IA 24/7 no Supabase

## Passo 1: Executar a Migration SQL

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto: `ixcjeoibvhkdhqitkbat`
3. Vá em **Database** → **SQL Editor**
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo: `supabase/migrations/20250117_ai_analysis_system.sql`
6. Clique em **Run** ou pressione `Ctrl+Enter`
7. Verifique se apareceu "Success" ✅

### Verificação:
Execute esta query para confirmar que as tabelas foram criadas:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('ai_analysis_results', 'ai_alerts', 'ai_analysis_schedule');
```
Deve retornar 3 linhas.

---

## Passo 2: Deploy da Edge Function

### Opção A: Usando Supabase Dashboard (Recomendado)

1. No Supabase Dashboard, vá em **Edge Functions**
2. Clique em **Create a new function**
3. Nome: `ai-analysis-cron`
4. Cole o código do arquivo: `supabase/functions/ai-analysis-cron/index.ts`
5. Clique em **Deploy**

### Opção B: Upload Manual do Arquivo

Se a opção acima não funcionar:

1. Vá em **Edge Functions** → **Deploy new version**
2. Faça upload do arquivo `index.ts` que está em `supabase/functions/ai-analysis-cron/`
3. Clique em **Deploy**

---

## Passo 3: Configurar Secrets (Variáveis de Ambiente)

1. No Supabase Dashboard, vá em **Project Settings** → **Edge Functions**
2. Procure por **Secrets** ou **Environment Variables**
3. Adicione a seguinte variável:

**OPENAI_API_KEY**
```
your-openai-api-key-here
```

4. Clique em **Save**

---

## Passo 4: Configurar Cron Job

1. No Supabase Dashboard, vá em **Database** → **Extensions**
2. Procure por `pg_cron` e **habilite** se não estiver ativo
3. Vá em **Database** → **SQL Editor**
4. Crie uma nova query e cole o seguinte SQL:

```sql
-- Habilitar extensão pg_cron se necessário
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Criar cron job para rodar a cada hora
SELECT cron.schedule(
  'ai-analysis-hourly',           -- Nome do job
  '0 * * * *',                     -- Cron expression (a cada hora às :00)
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

5. Execute a query
6. Deve retornar um número (ID do cron job)

### Verificar Cron Jobs Ativos:
```sql
SELECT * FROM cron.job;
```

---

## Passo 5: Testar o Sistema

### 5.1 Testar Edge Function Manualmente

1. No Supabase Dashboard, vá em **Edge Functions**
2. Selecione `ai-analysis-cron`
3. Clique em **Invoke** ou **Test**
4. Deve retornar algo como:
```json
{
  "success": true,
  "processed": 0,
  "results": []
}
```

### 5.2 Inicializar Schedule para seu Usuário

No SQL Editor, execute:
```sql
-- Substitua 'SEU_USER_ID' pelo seu ID de usuário
-- Você pode pegar seu ID com: SELECT id, email FROM auth.users;

INSERT INTO ai_analysis_schedule (user_id, next_run_at)
VALUES (
  'SEU_USER_ID',  -- <- Substitua aqui
  NOW()           -- Rodar agora
)
ON CONFLICT (user_id)
DO UPDATE SET next_run_at = NOW();
```

### 5.3 Forçar Execução Imediata

```sql
-- Chamar a edge function diretamente via SQL
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

### 5.4 Ver Resultados

```sql
-- Ver análises criadas
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

-- Ver alertas gerados
SELECT
  id,
  type,
  title,
  message,
  created_at
FROM ai_alerts
WHERE is_read = false
ORDER BY created_at DESC;
```

---

## Passo 6: Verificar no Frontend

1. Faça login no app
2. Vá para o Dashboard
3. Procure o ícone de sino (🔔) no header
4. Deve mostrar alertas se houver

---

## Troubleshooting

### Problema: Edge Function não executa

**Solução:**
1. Verifique se o OPENAI_API_KEY está configurado corretamente
2. Verifique logs da Edge Function no Dashboard
3. Tente invocar manualmente para ver o erro

### Problema: Cron job não roda

**Verificar:**
```sql
-- Ver últimas execuções
SELECT * FROM cron.job_run_details
WHERE jobname = 'ai-analysis-hourly'
ORDER BY start_time DESC
LIMIT 10;
```

**Recriar Cron Job:**
```sql
-- Deletar
SELECT cron.unschedule('ai-analysis-hourly');

-- Recriar (executar o SQL do Passo 4 novamente)
```

### Problema: Nenhuma análise é criada

**Verificar se tem transações:**
```sql
SELECT user_id, COUNT(*) as transaction_count
FROM transactions
GROUP BY user_id;
```

**Verificar schedule:**
```sql
SELECT * FROM ai_analysis_schedule;
```

---

## Frequência do Cron Job

Para alterar a frequência, edite a cron expression:

```sql
-- A cada 30 minutos
SELECT cron.schedule('ai-analysis-hourly', '*/30 * * * *', ...);

-- A cada 2 horas
SELECT cron.schedule('ai-analysis-hourly', '0 */2 * * *', ...);

-- A cada 6 horas
SELECT cron.schedule('ai-analysis-hourly', '0 */6 * * *', ...);

-- Uma vez por dia (às 8h da manhã)
SELECT cron.schedule('ai-analysis-hourly', '0 8 * * *', ...);
```

---

## Monitoramento

### Verificar Performance

```sql
-- Tempo médio de análise
SELECT
  AVG(analysis_duration_ms) as avg_duration_ms,
  MAX(analysis_duration_ms) as max_duration_ms,
  COUNT(*) as total_analyses
FROM ai_analysis_results
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Taxa de sucesso
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM ai_analysis_results
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;
```

### Ver Falhas

```sql
SELECT
  user_id,
  error_message,
  created_at
FROM ai_analysis_results
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

---

## Próximos Passos

Depois de tudo configurado:

1. ✅ Sistema roda automaticamente a cada hora
2. ✅ Usuários recebem análises sem precisar esperar
3. ✅ Alertas críticos aparecem no sino
4. ✅ Dashboard carrega instantaneamente

**Opcional:**
- Configurar notificações por email para alertas críticos
- Integrar com WhatsApp para avisos
- Adicionar dashboard de monitoramento do sistema
- Implementar análise preditiva com ML

---

## Checklist Final

- [ ] Migration SQL executada
- [ ] Edge Function deployada
- [ ] OPENAI_API_KEY configurada
- [ ] Cron job criado e ativo
- [ ] Schedule inicializado para seu usuário
- [ ] Teste manual executado com sucesso
- [ ] Análise aparecendo na tabela
- [ ] Alertas visíveis no frontend
- [ ] Sistema rodando automaticamente

---

## Contato/Ajuda

Se tiver algum problema:
1. Verifique os logs da Edge Function
2. Execute os SQLs de verificação acima
3. Confirme que todas as variáveis estão corretas
4. Teste manualmente cada passo

Bom trabalho! 🚀
