# Sistema de Análise Contínua de IA - 24/7

## Visão Geral

Sistema que roda análises de IA automaticamente em background, permitindo que o usuário entre no app e já veja os resultados prontos, sem precisar esperar processamento.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Cron Job                        │
│                    (Runs every hour)                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Edge Function: ai-analysis-cron                 │
│  • Fetches users that need analysis                         │
│  • Runs AI analysis for each user                           │
│  • Stores results in ai_analysis_results table              │
│  • Creates alerts for critical issues                       │
│  • Schedules next run                                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Tables                           │
│  • ai_analysis_results (stores analysis history)            │
│  • ai_alerts (critical alerts for user)                     │
│  • ai_analysis_schedule (controls frequency)                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Frontend Dashboard                          │
│  • Reads latest analysis from database                      │
│  • Shows alerts in notification center                      │
│  • No real-time processing needed                           │
└─────────────────────────────────────────────────────────────┘
```

## Componentes

### 1. Database Schema

**Tabela: `ai_analysis_results`**
- Armazena resultados de cada análise
- Campos: insights, predictions, anomalies, spending_patterns
- Indexed por user_id e analysis_date

**Tabela: `ai_alerts`**
- Alertas críticos que precisam de atenção
- Tipos: critical, warning, info
- Status: read/unread

**Tabela: `ai_analysis_schedule`**
- Controla quando rodar análise para cada usuário
- Frequência configurável (padrão: 1 hora)
- Track de falhas consecutivas

### 2. Edge Function

**Arquivo:** `supabase/functions/ai-analysis-cron/index.ts`

**Funcionalidade:**
1. Busca usuários que precisam de análise (next_run_at <= now)
2. Para cada usuário:
   - Busca transações dos últimos 90 dias
   - Calcula snapshot financeiro
   - Roda análise de IA
   - Detecta anomalias
   - Analisa padrões de gastos
   - Prediz saldo futuro
   - Gera alertas para issues críticos
   - Salva resultados no banco
3. Agenda próxima execução

### 3. Cron Job Configuration

Configure no Supabase Dashboard:

```sql
-- Run every hour at :00
SELECT cron.schedule(
  'ai-analysis-hourly',
  '0 * * * *',  -- Every hour
  $$
  SELECT net.http_post(
    url := 'https://[YOUR-PROJECT].supabase.co/functions/v1/ai-analysis-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

## Setup Instructions

### 1. Run Migration

```bash
# Apply the migration
supabase db push

# Or if using Supabase CLI locally
supabase migration up
```

### 2. Deploy Edge Function

```bash
# Deploy the edge function
supabase functions deploy ai-analysis-cron

# Set environment variables
supabase secrets set OPENAI_API_KEY=your-openai-key
```

### 3. Configure Cron Job

No Supabase Dashboard:
1. Vá para Database → Cron Jobs
2. Crie novo job com o SQL acima
3. Ajuste a URL para seu projeto
4. Test com "Run now"

### 4. Verify Setup

```sql
-- Check if schedules were created for users
SELECT * FROM ai_analysis_schedule;

-- Check latest analysis results
SELECT * FROM ai_analysis_results ORDER BY created_at DESC LIMIT 10;

-- Check alerts
SELECT * FROM ai_alerts WHERE is_read = false;
```

## Frontend Integration

### Novo Hook: `useAIAnalysis`

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useAIAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLatestAnalysis();

    // Subscribe to new analyses
    const subscription = supabase
      .channel('ai-analysis')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ai_analysis_results'
      }, loadLatestAnalysis)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadLatestAnalysis = async () => {
    const { data } = await supabase.rpc('get_latest_analysis');
    setAnalysis(data[0]);
    setLoading(false);
  };

  return { analysis, alerts, loading };
}
```

### Dashboard Integration

```typescript
// Old way (real-time processing)
const { insights, loading } = useAI(transactions); // ❌ Slow

// New way (pre-computed)
const { analysis, loading } = useAIAnalysis(); // ✅ Fast
```

## Benefits

### ✅ Vantagens

1. **Performance:** Usuário não espera processamento
2. **Cost Savings:** Análises rodadas em batch, não em cada page load
3. **Better UX:** Resultados instantâneos ao entrar no app
4. **Proactive Alerts:** Sistema detecta problemas antes do usuário ver
5. **Historical Data:** Mantém histórico de análises
6. **Scalability:** Pode processar milhares de usuários

### 🎯 Use Cases

1. **Morning Report:** Usuário acorda e vê análise da noite
2. **Real-time Alerts:** Notificações push para gastos anormais
3. **Trend Analysis:** Compara análises ao longo do tempo
4. **Predictive:** Avisa antes de problemas acontecerem

## Configuration Options

### Frequency Settings

Usuários podem ajustar frequência de análise:

```typescript
// Update schedule
await supabase
  .from('ai_analysis_schedule')
  .update({ frequency_minutes: 30 }) // Every 30 minutes
  .eq('user_id', userId);
```

### Alert Preferences

```typescript
// Disable/enable analysis
await supabase
  .from('ai_analysis_schedule')
  .update({ enabled: false })
  .eq('user_id', userId);
```

## Monitoring

### Check Cron Job Status

```sql
-- See job runs
SELECT * FROM cron.job_run_details
WHERE jobname = 'ai-analysis-hourly'
ORDER BY start_time DESC
LIMIT 10;

-- Check failure rate
SELECT
  user_id,
  consecutive_failures,
  last_error,
  last_run_at
FROM ai_analysis_schedule
WHERE consecutive_failures > 3;
```

### Performance Metrics

```sql
-- Average analysis duration
SELECT
  AVG(analysis_duration_ms) as avg_duration,
  MAX(analysis_duration_ms) as max_duration,
  COUNT(*) as total_analyses
FROM ai_analysis_results
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Success rate
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM ai_analysis_results
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;
```

## Roadmap

### Phase 1 (Current)
- ✅ Database schema
- ✅ Edge function
- ⏳ Cron job setup
- ⏳ Frontend integration

### Phase 2 (Next)
- [ ] Real-time notifications via push
- [ ] Email alerts for critical issues
- [ ] WhatsApp integration
- [ ] ML model for better predictions

### Phase 3 (Future)
- [ ] Personalized AI coaching
- [ ] Budget recommendations
- [ ] Automated savings suggestions
- [ ] Integration with Open Finance for real-time sync

## Troubleshooting

### Analysis not running

```sql
-- Check schedule
SELECT * FROM ai_analysis_schedule WHERE user_id = 'your-user-id';

-- Force next run
UPDATE ai_analysis_schedule
SET next_run_at = NOW()
WHERE user_id = 'your-user-id';
```

### High failure rate

```sql
-- Check errors
SELECT user_id, last_error, consecutive_failures
FROM ai_analysis_schedule
WHERE consecutive_failures > 0
ORDER BY consecutive_failures DESC;

-- Reset failures
UPDATE ai_analysis_schedule
SET consecutive_failures = 0, last_error = NULL
WHERE user_id = 'your-user-id';
```

### No alerts showing

```sql
-- Check if alerts exist
SELECT * FROM ai_alerts WHERE user_id = 'your-user-id' AND is_read = false;

-- Test alert creation
INSERT INTO ai_alerts (user_id, type, title, message)
VALUES ('your-user-id', 'info', 'Test Alert', 'Testing notification system');
```

## Security

- Edge Function usa `service_role_key` para acesso total
- RLS policies protegem dados de usuários
- Apenas service role pode inserir análises
- Usuários só veem seus próprios dados

## Cost Estimation

**Supabase:**
- Cron Jobs: Free (included in all plans)
- Edge Functions: 500K invocations/month (Free tier)
- Database: ~1KB per analysis × 24/day × 30 days × users

**OpenAI:**
- ~$0.01 per analysis with GPT-4o-mini
- 1000 users × 24 analyses/day = $240/month
- Consider using GPT-3.5-turbo for lower cost

## Next Steps

1. ✅ Executar migration
2. ⏳ Deploy edge function
3. ⏳ Configurar cron job
4. ⏳ Testar com alguns usuários
5. ⏳ Integrar frontend
6. ⏳ Monitor performance
7. 🚀 Launch!
