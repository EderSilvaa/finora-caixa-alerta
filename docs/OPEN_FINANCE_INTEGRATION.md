# 🏦 Integração Open Finance Brasil - Finora Caixa Alerta

## Visão Geral

Open Finance é **ESSENCIAL** para o Finora funcionar em produção. Sem ele, os dados continuam manuais. Com ele, você tem **sincronização automática** de transações bancárias em tempo real.

---

## 🎯 O Que Queremos Conseguir

### Core Features com Open Finance:

1. **Conexão Automática com Bancos**
   - Usuário autoriza uma vez
   - Sistema sincroniza transações automaticamente
   - Cobertura: 90%+ dos bancos brasileiros

2. **Sincronização de Transações**
   - Receitas e despesas puxadas automaticamente
   - Categorização inteligente
   - Histórico completo (até 12 meses)

3. **Dados em Tempo Real**
   - Saldo atual atualizado
   - Novas transações detectadas
   - Alertas de movimentações

4. **Projeções Precisas**
   - Baseadas em dados reais (não estimados)
   - Padrões de gastos reais
   - Previsões mais confiáveis

---

## 🏢 Principais Provedores no Brasil

### 1️⃣ **Pluggy** (RECOMENDADO para MVP)

**Por que Pluggy?**
- ✅ **Cobertura:** 90% dos bancos brasileiros
- ✅ **Regulamentado:** Autorizado pelo Banco Central
- ✅ **Preço:** Freemium (grátis para começar)
- ✅ **Brasileiro:** Suporte em PT-BR
- ✅ **Documentação:** Excelente docs + SDKs
- ✅ **Fácil integração:** Widget pronto

**Recursos:**
- Agregação de contas
- Transações categorizadas
- Saldos em tempo real
- Iniciação de pagamentos (Pix via Open Finance)
- Webhooks para atualizações

**Pricing:**
- **Free tier:** Desenvolvimento + testes
- **Pago:** Por API call (preço sob consulta)
- Estimativa: ~R$ 0,05 - R$ 0,20 por transação sincronizada

**Website:** https://www.pluggy.ai

---

### 2️⃣ **Belvo** (Alternativa forte)

**Por que Belvo?**
- ✅ **Cobertura:** América Latina inteira (México, Brasil, Colômbia)
- ✅ **Y Combinator:** Startup bem financiada ($43M Series A)
- ✅ **Compliance:** Regulado BACEN
- ✅ **Features:** Enrichment de dados (categorização IA)
- ✅ **Pagamentos:** Pix via Open Finance

**Recursos:**
- Agregação de dados financeiros
- Categorização com IA
- Score de crédito
- Webhooks
- Sandbox completo

**Pricing:**
- **Modelo:** Pay-per-call (similar Twilio)
- **Preço:** Sob consulta (varia por volume)
- Estimativa: ~R$ 0,10 - R$ 0,30 por API call

**Website:** https://belvo.com

---

### 3️⃣ **Stark Bank** (Open Finance nativo)

**Por que Stark?**
- ✅ **Banking as a Service:** Conta digital + Open Finance
- ✅ **Tudo integrado:** API única para tudo
- ✅ **Brasileiro:** Suporte local
- ✅ **Compliance:** Regulado

**Recursos:**
- Contas digitais para clientes
- Open Finance integrado
- Pix, TED, boletos
- Webhooks

**Pricing:**
- **Modelo:** Por transação
- **Open Finance:** Incluso em alguns planos

**Website:** https://starkbank.com

---

### 4️⃣ **Acesso Direto (APIs Bancárias Próprias)**

**Bancos com APIs Próprias:**
- **Itaú:** https://devportal.itau.com.br
- **Santander:** API Santander Open Finance
- **Bradesco:** BaaS Bradesco
- **Nubank:** API limitada

**Prós:**
- ✅ Sem intermediário
- ✅ Custo zero (algumas APIs)
- ✅ Controle total

**Contras:**
- ❌ Integrar banco por banco (muito trabalho!)
- ❌ Cada banco tem API diferente
- ❌ Manutenção complexa
- ❌ Não viável para MVP

---

## 🏗️ Arquitetura de Integração

### Fluxo Completo:

```
┌─────────────┐
│   Usuário   │
│  (Finora)   │
└──────┬──────┘
       │
       │ 1. Clica "Conectar Banco"
       ↓
┌─────────────────────┐
│   Widget Pluggy     │ ← Popup de autorização
│   (OAuth consent)   │
└──────────┬──────────┘
           │
           │ 2. Autoriza acesso
           ↓
     ┌───────────┐
     │  Pluggy   │
     │    API    │
     └─────┬─────┘
           │
           │ 3. Conecta com banco
           ↓
     ┌───────────┐
     │   Banco   │
     │  (Itaú,   │
     │ Nubank...) │
     └─────┬─────┘
           │
           │ 4. Retorna dados
           ↓
     ┌───────────┐
     │  Pluggy   │ ← Categoriza e normaliza
     └─────┬─────┘
           │
           │ 5. Webhook notification
           ↓
┌──────────────────────┐
│   Finora Backend     │
│  (Supabase Edge Fn)  │
└──────────┬───────────┘
           │
           │ 6. Salva transações
           ↓
     ┌───────────┐
     │ Supabase  │
     │ Postgres  │
     └─────┬─────┘
           │
           │ 7. Real-time update
           ↓
┌──────────────────────┐
│   Dashboard Finora   │ ← Dados aparecem!
└──────────────────────┘
```

---

## 💻 Implementação Técnica

### Fase 1: Setup Inicial (Pluggy)

#### 1.1 Criar Conta Pluggy

```bash
# 1. Acesse https://dashboard.pluggy.ai
# 2. Crie conta (grátis)
# 3. Crie um novo app
# 4. Copie Client ID e Client Secret
```

#### 1.2 Instalar SDK

```bash
npm install pluggy-sdk
```

#### 1.3 Configurar Variáveis de Ambiente

```env
# .env
VITE_PLUGGY_CLIENT_ID=your_client_id
VITE_PLUGGY_CLIENT_SECRET=your_client_secret (NUNCA NO FRONTEND!)
PLUGGY_WEBHOOK_URL=https://seu-projeto.supabase.co/functions/v1/pluggy-webhook
```

#### 1.4 Criar Serviço Pluggy

```typescript
// src/services/pluggy.service.ts
import { PluggyClient } from 'pluggy-sdk'

const pluggyClient = new PluggyClient({
  clientId: import.meta.env.VITE_PLUGGY_CLIENT_ID,
  clientSecret: process.env.PLUGGY_CLIENT_SECRET, // Backend only!
})

export const pluggyService = {
  /**
   * Criar access token para widget
   */
  async createConnectToken(userId: string) {
    const { accessToken } = await pluggyClient.createConnectToken({
      clientUserId: userId,
    })
    return accessToken
  },

  /**
   * Listar contas conectadas
   */
  async getAccounts(itemId: string) {
    const accounts = await pluggyClient.fetchAccounts(itemId)
    return accounts
  },

  /**
   * Buscar transações
   */
  async getTransactions(accountId: string, from: Date, to: Date) {
    const transactions = await pluggyClient.fetchTransactions(accountId, {
      from: from.toISOString(),
      to: to.toISOString(),
    })
    return transactions
  },

  /**
   * Sincronizar transações com banco
   */
  async syncTransactions(userId: string, accountId: string) {
    const transactions = await this.getTransactions(
      accountId,
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 dias atrás
      new Date()
    )

    // Salvar no Supabase
    const { data, error } = await supabase
      .from('transactions')
      .upsert(
        transactions.results.map(t => ({
          user_id: userId,
          external_id: t.id,
          type: t.type === 'DEBIT' ? 'expense' : 'income',
          amount: Math.abs(t.amount),
          description: t.description,
          category: t.category || 'Outros',
          date: t.date,
        })),
        { onConflict: 'external_id' }
      )

    return { success: !error, count: transactions.results.length }
  },
}
```

#### 1.5 Criar Widget de Conexão

```typescript
// src/components/BankConnectWidget.tsx
import { useEffect, useRef } from 'react'
import { pluggyService } from '@/services/pluggy.service'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

export function BankConnectWidget() {
  const { user } = useAuth()
  const { toast } = useToast()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user || !containerRef.current) return

    // Carregar Pluggy Connect Widget
    const script = document.createElement('script')
    script.src = 'https://cdn.pluggy.ai/pluggy-connect/v2/pluggy-connect.js'
    script.async = true

    script.onload = async () => {
      try {
        // Criar access token
        const token = await pluggyService.createConnectToken(user.id)

        // Inicializar widget
        const pluggyConnect = new (window as any).PluggyConnect({
          connectToken: token,
          includeSandbox: import.meta.env.DEV, // Sandbox em desenvolvimento
          onSuccess: async (itemData: any) => {
            toast({
              title: 'Banco conectado!',
              description: 'Sincronizando transações...',
            })

            // Sincronizar transações
            await pluggyService.syncTransactions(user.id, itemData.item.id)

            toast({
              title: 'Sincronização concluída!',
              description: 'Suas transações foram importadas.',
            })
          },
          onError: (error: any) => {
            toast({
              title: 'Erro ao conectar',
              description: error.message,
              variant: 'destructive',
            })
          },
        })

        // Renderizar widget
        pluggyConnect.init()
      } catch (error: any) {
        console.error('Erro ao inicializar Pluggy:', error)
      }
    }

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [user])

  return (
    <div>
      <Button onClick={() => {/* Trigger widget */}}>
        Conectar Banco
      </Button>
      <div ref={containerRef} id="pluggy-connect-container" />
    </div>
  )
}
```

---

### Fase 2: Webhook para Atualizações Automáticas

#### 2.1 Criar Supabase Edge Function

```bash
# Criar função no Supabase
supabase functions new pluggy-webhook
```

```typescript
// supabase/functions/pluggy-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // Verificar assinatura do webhook (segurança)
    const signature = req.headers.get('x-pluggy-signature')
    // TODO: Validar signature

    const payload = await req.json()

    // Processar evento
    switch (payload.event) {
      case 'item/created':
        // Nova conexão bancária
        console.log('Nova conta conectada:', payload.data.item.id)
        break

      case 'transactions/deleted':
      case 'transactions/updated':
        // Sincronizar transações
        const { itemId, accountId } = payload.data
        await syncTransactions(itemId, accountId)
        break

      case 'item/error':
        // Erro na conexão
        console.error('Erro no item:', payload.data.error)
        break
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

async function syncTransactions(itemId: string, accountId: string) {
  // Buscar transações via Pluggy API
  // Salvar no Supabase
  // Invalidar cache React Query
}
```

#### 2.2 Configurar Webhook no Pluggy Dashboard

```
1. Acesse https://dashboard.pluggy.ai
2. Vá em Settings → Webhooks
3. Adicione: https://seu-projeto.supabase.co/functions/v1/pluggy-webhook
4. Eventos: transactions.created, transactions.updated, item.error
5. Salve e copie o webhook secret
```

---

## 💰 Análise de Custos

### Cenário: 1.000 usuários ativos

**Assumindo:**
- 1.000 usuários
- Cada um conecta 2 bancos (média)
- ~100 transações/mês por usuário
- Sincronização diária

**Cálculo Pluggy (estimado):**

```
Conexões iniciais:
1.000 usuários × 2 bancos = 2.000 conexões
Custo: ~R$ 0 (setup é grátis)

Sincronizações mensais:
1.000 usuários × 30 dias × 2 bancos = 60.000 syncs/mês
Custo estimado: R$ 0,05 por sync = R$ 3.000/mês

Transações processadas:
1.000 usuários × 100 transações = 100.000 transações
Custo: Incluso nas syncs

TOTAL ESTIMADO: R$ 3.000 - R$ 5.000/mês
```

**Modelo de Receita Finora para cobrir:**
- Cobrar R$ 29,90/mês por usuário
- 1.000 usuários = R$ 29.900/mês
- Custo Open Finance: R$ 3.000 - R$ 5.000 (10-17% da receita)
- **Margem boa!** ✅

---

## 📋 Roadmap de Implementação

### Sprint 1: MVP Open Finance (1 semana)

**Objetivos:**
- [x] Pesquisar provedores
- [ ] Criar conta Pluggy
- [ ] Implementar widget de conexão
- [ ] Testar em sandbox
- [ ] Sincronizar transações manualmente

**Entregável:** Botão "Conectar Banco" funcional em sandbox

---

### Sprint 2: Sincronização Automática (1 semana)

**Objetivos:**
- [ ] Criar Edge Function webhook
- [ ] Configurar webhooks no Pluggy
- [ ] Implementar sync automático
- [ ] Adicionar status de conexão
- [ ] Error handling

**Entregável:** Transações sincronizam automaticamente

---

### Sprint 3: Categorização e Enriquecimento (1 semana)

**Objetivos:**
- [ ] Usar categorias do Pluggy
- [ ] Implementar recategorização manual
- [ ] Adicionar regras customizadas
- [ ] Melhorar algoritmo de projeção com dados reais

**Entregável:** Transações bem categorizadas, projeções precisas

---

### Sprint 4: Múltiplas Contas (1 semana)

**Objetivos:**
- [ ] Suportar múltiplos bancos por usuário
- [ ] Dashboard consolidado
- [ ] Seleção de conta principal
- [ ] Filtros por banco

**Entregável:** Usuário pode conectar N bancos

---

### Sprint 5: Produção (1 semana)

**Objetivos:**
- [ ] Remover sandbox
- [ ] Configurar produção no Pluggy
- [ ] Testes com usuários reais
- [ ] Monitoramento e alertas
- [ ] Documentação

**Entregável:** Open Finance em produção!

---

## 🔐 Segurança e Compliance

### Checklist de Segurança:

- [ ] **LGPD Compliance**
  - Termo de consentimento claro
  - Usuário pode revogar acesso
  - Dados criptografados

- [ ] **Banco Central**
  - Usar apenas provedores autorizados (Pluggy ✅)
  - Seguir normas Open Finance Brasil

- [ ] **Webhook Security**
  - Validar assinatura do webhook
  - HTTPS obrigatório
  - Rate limiting

- [ ] **Dados Sensíveis**
  - NUNCA armazenar senhas bancárias
  - Tokens criptografados
  - Logs sem dados sensíveis

---

## 🚨 Riscos e Mitigações

### Risco 1: Custo Escalar Rápido
**Mitigação:**
- Limitar syncs a 1x/dia por padrão
- Usuário premium: sync em tempo real
- Cache agressivo

### Risco 2: Banco Desconectar
**Mitigação:**
- Notificar usuário
- Botão "Reconectar" visível
- Instruções claras

### Risco 3: API Instável
**Mitigação:**
- Retry logic
- Fallback para entrada manual
- Monitoramento 24/7

### Risco 4: Categorização Errada
**Mitigação:**
- Permitir recategorização manual
- Machine learning para melhorar
- Feedback loop

---

## 📊 Alternativas e Comparação

| Feature | Pluggy | Belvo | Stark | APIs Diretas |
|---------|--------|-------|-------|--------------|
| **Cobertura BR** | 90% | 85% | 70% | Banco a banco |
| **Facilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| **Preço** | Freemium | Pay-per-call | Incluso | Grátis |
| **Docs** | Excelente | Muito bom | Bom | Variável |
| **Suporte PT** | ✅ | ✅ | ✅ | ✅ |
| **Widget Pronto** | ✅ | ✅ | ✅ | ❌ |
| **Sandbox** | ✅ | ✅ | ✅ | Limitado |
| **Webhooks** | ✅ | ✅ | ✅ | Variável |

**Recomendação:** Começar com **Pluggy** para MVP.

---

## 🎯 Próximos Passos Imediatos

### Faça HOJE (15 min):
1. Acesse https://dashboard.pluggy.ai
2. Crie conta gratuita
3. Crie um app de teste
4. Copie Client ID e Client Secret
5. Teste o widget em sandbox

### Faça esta SEMANA:
1. Implementar `pluggy.service.ts`
2. Criar `BankConnectWidget.tsx`
3. Adicionar botão no Dashboard
4. Testar conexão com banco sandbox

### Faça PRÓXIMO MÊS:
1. Implementar webhook
2. Sync automático
3. Categorização
4. Beta test com 10 usuários reais

---

## 📞 Contatos Úteis

**Pluggy:**
- Website: https://pluggy.ai
- Docs: https://docs.pluggy.ai
- Email: contato@pluggy.ai
- Slack Community: (pedir acesso)

**Belvo:**
- Website: https://belvo.com
- Docs: https://developers.belvo.com
- Email: sales@belvo.com

**Open Finance Brasil:**
- Website: https://openfinancebrasil.org.br
- Docs técnicas: https://openbanking-brasil.github.io

---

## ✅ Checklist Final

Antes de ir para produção com Open Finance:

- [ ] Conta criada no provedor (Pluggy)
- [ ] Widget de conexão implementado
- [ ] Sincronização funcionando
- [ ] Webhook configurado
- [ ] Teste com banco real (sandbox)
- [ ] Categorização funcionando
- [ ] Tratamento de erros robusto
- [ ] Termo de consentimento LGPD
- [ ] Monitoramento configurado
- [ ] Plano de custos aprovado
- [ ] Beta test com usuários reais
- [ ] Documentação completa

---

**Open Finance é o diferencial do Finora!** Com ele, você sai na frente da concorrência oferecendo sincronização automática. 🚀

Vamos implementar? Me avisa quando terminar o setup do Supabase que partimos para o Pluggy!
