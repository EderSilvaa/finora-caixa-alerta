# Como Testar a IA - GPT-4o

## ✅ O Servidor Está Rodando!

Acesse: **http://localhost:8080**

## 🧪 Teste a Análise de IA

### Passo 1: Faça Login
- Acesse o dashboard
- Faça login com sua conta

### Passo 2: Execute a Análise
- No dashboard, procure o card **"Insights IA"** no lado direito
- Clique no botão **"Ver Análise Completa"**
- Aguarde 5-10 segundos enquanto o GPT-4o analisa seus dados

### Passo 3: Veja os Resultados

O modal mostrará:

#### 📊 **Insights Financeiros**
- Análises personalizadas baseadas nas SUAS transações
- Severidade: Alta (vermelho), Média (amarelo), Baixa (verde)
- Categorias: gastos, receita, saldo, economia, risco, oportunidade
- Ações recomendadas específicas

#### 🔮 **Previsão de Saldo**
- Saldo previsto para 30 dias
- Nível de confiança (0-100%)
- Tendência (crescente/decrescente/estável)
- Fatores considerados na análise

#### 🚨 **Anomalias Detectadas**
- Transações suspeitas ou incomuns
- Valores muito acima da média
- Possíveis duplicatas
- Severidade do problema

#### 📈 **Padrões de Gastos**
- Análise por categoria
- Média mensal de cada categoria
- Tendências (aumentando/diminuindo/estável)
- Insights específicos com recomendações

## 🔍 Verifique no Console

Abra o Console do Navegador (F12) e veja os logs:

```
[useAI] Running full AI analysis...
[AI] Generating insights for user: xxx
[AI] Generated 5 insights
[AI] Predicting balance for 30 days ahead
[AI] Balance prediction: {predicted_balance: 15420.50, ...}
[AI] Detecting anomalies
[AI] Detected 2 anomalies
[AI] Analyzing spending patterns
[AI] Analyzed 5 patterns
[useAI] Full analysis complete
```

## ⚙️ Como Funciona

### 1. Busca Dados Reais
```typescript
// Pega suas transações dos últimos 90 dias do Supabase
const financialData = await getUserFinancialData(userId)
```

### 2. Monta o Prompt
```typescript
// Cria prompt personalizado com SEUS dados
const prompt = createInsightsPrompt(financialData)
```

### 3. Chama o GPT-4o
```typescript
// Envia para a API da OpenAI
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'system', content: '...' }, { role: 'user', content: prompt }],
  response_format: { type: 'json_object' }
})
```

### 4. Processa e Salva
```typescript
// Salva no Supabase e exibe no Dashboard
await saveInsights(userId, insights)
```

## 🧮 Dados Analisados

O GPT-4o recebe:

- ✅ Saldo atual
- ✅ Total de receitas (90 dias)
- ✅ Total de despesas (90 dias)
- ✅ Todas as transações recentes
- ✅ Análise por categoria
- ✅ Médias e tendências

## 💡 Exemplos de Insights Reais

### Insight de Risco (Severidade Alta):
```json
{
  "title": "Risco de Saldo Negativo",
  "description": "Com o padrão atual de gastos, seu saldo pode ficar negativo em 12 dias. Despesas aumentaram 23% vs receitas.",
  "category": "risk",
  "severity": "high",
  "action_items": [
    "Antecipar R$ 1.200 em recebíveis",
    "Reduzir despesas variáveis em 15%",
    "Negociar prazo com fornecedores"
  ]
}
```

### Insight de Oportunidade (Severidade Média):
```json
{
  "title": "Oportunidade de Economia",
  "description": "Seus gastos com alimentação estão 35% acima da média. R$ 850/mês podem ser economizados.",
  "category": "opportunity",
  "severity": "medium",
  "action_items": [
    "Fazer meal prep 3x por semana",
    "Usar apps de cashback",
    "Comparar preços antes de comprar"
  ]
}
```

### Previsão de Saldo:
```json
{
  "predicted_balance": 15420.50,
  "confidence": 0.85,
  "days_ahead": 30,
  "trend": "Tendência crescente com volatilidade moderada",
  "factors": [
    "Receita recorrente de R$ 5.000/mês detectada",
    "Despesas fixas estáveis em R$ 3.200/mês",
    "Sazonalidade: gastos aumentam 15% na segunda quinzena",
    "Padrão de economias mensais de R$ 1.800"
  ]
}
```

## 🐛 Troubleshooting

### "API Key do OpenAI necessária"
✅ Verifique `vite.config.ts` - a API key deve estar no bloco `define`
✅ Reinicie o servidor: Ctrl+C → `npm run dev`

### "Não há dados suficientes"
✅ Adicione mais transações manualmente
✅ Conecte um banco via Pluggy
✅ Precisa de pelo menos 5-10 transações

### "Failed to generate insights"
✅ Abra o Console do navegador (F12) para ver o erro
✅ Verifique se a API key da OpenAI é válida
✅ Confirme que tem créditos na conta OpenAI

### Análise muito lenta (>30 segundos)
✅ Normal na primeira vez (cold start)
✅ Verifique sua conexão com internet
✅ OpenAI pode estar com rate limiting

## 📊 Custos por Análise

- **1 análise completa**: ~$0.015 (R$ 0,08)
- **10 análises/dia**: ~$4.50/mês
- **100 usuários**: ~$45/mês

## 🎯 Próximos Passos

1. ✅ **Testou a análise?** Parabéns! A IA está funcionando!
2. 🔄 **Conecte mais bancos** via Pluggy para dados mais ricos
3. 📅 **Configure análise automática** (diária/semanal)
4. 📧 **Implemente alertas** por email quando houver riscos
5. 🚀 **Deploy em produção** (mova API calls para backend)

## 🎉 Pronto!

Sua plataforma agora tem:
- ✅ Análise preditiva real com GPT-4o
- ✅ Insights personalizados baseados em dados reais
- ✅ Detecção de anomalias e fraudes
- ✅ Previsão matemática de saldo
- ✅ Padrões de gastos inteligentes

**A IA NÃO é mockada** - ela analisa SEUS dados reais e gera insights únicos para cada usuário! 🚀
