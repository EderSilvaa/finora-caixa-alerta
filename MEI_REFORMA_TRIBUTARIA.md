# MEI e a Reforma Tributária - Guia Completo FINORA TAX

## 🎯 Visão Geral

O **MEI (Microempreendedor Individual)** sofrerá mudanças significativas com a Reforma Tributária. Este documento explica como o sistema FINORA TAX está preparado para essas mudanças.

---

## 📊 MEI Hoje (2024-2025)

### **Regras Atuais**

| Item | Valor/Descrição |
|------|-----------------|
| **Limite anual** | R$ 81.000,00 |
| **Limite mensal** | R$ 6.750,00 |
| **DAS fixo** | ~R$ 70-77/mês (varia por atividade) |
| **Funcionários** | Máximo 1 |
| **INSS** | 5% do salário mínimo (~R$ 70,60 em 2025) |
| **ICMS** | R$ 1,00 (comércio/indústria) |
| **ISS** | R$ 5,00 (prestadores de serviço) |

### **Composição do DAS Mensal**

```
Comércio/Indústria:
- INSS: R$ 70,60
- ICMS: R$ 1,00
- Total: R$ 71,60

Prestador de Serviço:
- INSS: R$ 70,60
- ISS: R$ 5,00
- Total: R$ 75,60

Comércio + Serviço:
- INSS: R$ 70,60
- ICMS: R$ 1,00
- ISS: R$ 5,00
- Total: R$ 76,60
```

---

## 🔄 Mudanças Previstas na Reforma (2026-2033)

### **Fase 1: Preparação (2026)**
- MEI **permanece inalterado** em 2026
- Governo inicia estudos sobre adaptações
- Possível sinalização de novas regras

### **Fase 2: Transição (2027-2032)**

#### **Mudanças Esperadas:**

1. **Aumento do Limite de Faturamento**
   - 2027: R$ 90.000 (projeção)
   - 2028: R$ 100.000
   - 2029: R$ 110.000
   - 2030: R$ 120.000
   - 2031: R$ 130.000
   - 2032: R$ 140.000

2. **Substituição Gradual de ICMS/ISS por IBS**
   ```
   Ano  | ICMS/ISS (antigo) | IBS (novo) | Total
   -----|-------------------|------------|------
   2027 | R$ 5,40 (90%)     | R$ 0,50    | R$ 5,90
   2028 | R$ 4,80 (80%)     | R$ 1,00    | R$ 5,80
   2029 | R$ 3,60 (60%)     | R$ 2,00    | R$ 5,60
   2030 | R$ 2,40 (40%)     | R$ 3,00    | R$ 5,40
   2031 | R$ 1,20 (20%)     | R$ 4,00    | R$ 5,20
   2032 | R$ 0,60 (10%)     | R$ 5,00    | R$ 5,60
   ```

3. **Introdução Gradual da CBS**
   - Pode ser introduzida em valor reduzido
   - Ou mantida em R$ 0 para MEI (benefício)

### **Fase 3: Reforma Plena (2033+)**

#### **MEI Unificado**
- **Novo limite**: ~R$ 150.000/ano (estimativa)
- **DAS mensal estimado**: R$ 119,00
  - INSS: R$ 110,00 (5% do novo salário mínimo projetado)
  - IBS: R$ 6,00 (substitui ICMS + ISS)
  - CBS: R$ 3,00 (novo, mas com valor reduzido para MEI)

#### **Categorias que Podem Sair do MEI**
Algumas atividades de alto valor agregado podem não ser mais permitidas:
- 🚫 Desenvolvimento de software
- 🚫 Consultoria em TI
- 🚫 Marketing digital
- 🚫 Design gráfico profissional
- ✅ Comércio varejista (mantém)
- ✅ Cabeleireiros/estética (mantém)
- ✅ Alimentação (mantém)

---

## ⚠️ Alertas Críticos para MEI

### **1. Limite de Faturamento**

O sistema FINORA TAX cria alertas automáticos:

| Percentual | Severidade | Mensagem |
|------------|------------|----------|
| **80%** | Info | "Atenção ao limite de faturamento" |
| **90%** | Warning | "Você está próximo do limite!" |
| **100%+** | Critical | "Limite ultrapassado - migre URGENTE" |

### **2. Consequências de Ultrapassar o Limite**

Se você ultrapassar R$ 81.000 em 2025:

**Até 20% acima (R$ 97.200):**
- Paga diferença proporcional no ano seguinte
- Pode continuar como MEI no ano seguinte

**Mais de 20% (acima de R$ 97.200):**
- 🚨 **Desenquadramento imediato**
- Migração **obrigatória** para Simples Nacional
- Retroativo ao início do ano
- Recalculo de todos os impostos do ano

**Exemplo prático:**
```
Você faturou R$ 100.000 em 2025:
- Limite: R$ 81.000
- Excesso: R$ 19.000 (23% acima)
- Consequência: Desenquadramento retroativo
- Você deve:
  1. Migrar para Simples Nacional
  2. Recalcular impostos de Jan-Dez/2025
  3. Pagar diferença (DAS do Simples > DAS do MEI)
```

---

## 🛡️ Como o FINORA TAX Protege Você

### **1. Monitoramento em Tempo Real**
- ✅ Toda transação de receita é verificada
- ✅ Sistema calcula % do limite utilizado
- ✅ Alertas automáticos quando se aproxima

### **2. Projeção de Faturamento**
```sql
-- O sistema projeta se você ultrapassará o limite
SELECT check_mei_eligibility('user_id', 2025);

-- Retorna:
{
  "eligible": true,
  "revenue_ytd": 65000.00,
  "limit": 81000.00,
  "utilization_percentage": 80.25,
  "suggested_regime": "mei"
}
```

### **3. Cálculo Automático de DAS**
```sql
-- Sistema calcula DAS correto baseado no ano
SELECT calculate_mei_tax('user_id', 12, 2025);

-- Retorna:
{
  "das_amount": 75.60,
  "inss_amount": 70.60,
  "iss_amount": 5.00,
  "revenue_ytd": 65000.00,
  "over_limit": false
}
```

### **4. Suporte à Transição (2026+)**
```sql
-- Em 2027, sistema calculará automaticamente:
{
  "das_amount": 85.80, // Novo valor
  "inss_amount": 80.00,
  "icms_amount": 0.90,  // 90% do antigo
  "iss_amount": 4.50,   // 90% do antigo
  "ibs_amount": 0.50,   // 10% do novo
  "regime_version": "transition"
}
```

---

## 🚀 Plano de Migração MEI → Simples Nacional

Se você precisar migrar do MEI para Simples Nacional, o FINORA TAX te guia:

### **Quando Migrar?**

**Desenquadramento Automático:**
- Ultrapassou 20% do limite
- Contratou mais de 1 funcionário
- Passou a exercer atividade não permitida

**Desenquadramento Voluntário:**
- Quer faturar mais de R$ 81.000
- Mudou de atividade
- Quer contratar mais funcionários

### **Passos da Migração:**

1. **Solicitar desenquadramento:**
   - Portal do Simples Nacional
   - App MEI (gov.br)

2. **Escolher anexo do Simples:**
   - Anexo III (serviços) - mais comum
   - Anexo I (comércio)

3. **Atualizar no FINORA TAX:**
   ```typescript
   // Modal de configuração
   regime: 'simples_nacional'
   simples_anexo: 'III'
   ```

4. **Novo DAS será calculado:**
   - MEI: R$ 75,60 fixo
   - Simples Nacional Anexo III (R$ 81k/ano):
     - Alíquota: ~6%
     - DAS mensal: ~R$ 405,00 (em R$ 6.750/mês de receita)

### **Comparação Financeira:**

| Regime | Receita Mensal | Imposto Mensal | % da Receita |
|--------|----------------|----------------|--------------|
| MEI | R$ 6.750 | R$ 75,60 | 1,12% |
| Simples Nacional | R$ 6.750 | ~R$ 405,00 | 6,00% |
| MEI | R$ 10.000 | R$ 75,60 | 0,76% |
| Simples Nacional | R$ 10.000 | ~R$ 600,00 | 6,00% |

**Diferença anual (R$ 81k):**
- MEI: R$ 907,20
- Simples: R$ 4.860,00
- **Economia do MEI: R$ 3.952,80/ano** ✅

---

## 📋 Checklist: Você Ainda Pode Ser MEI?

- [ ] Faturamento anual até R$ 81.000?
- [ ] Máximo 1 funcionário?
- [ ] Atividade permitida no MEI? (consulte tabela CNAE)
- [ ] Não é sócio de outra empresa?
- [ ] Não tem filial?
- [ ] Não exerce profissão regulamentada? (médico, advogado, etc.)

**Se marcou ✅ em todos:** Você pode ser MEI!
**Se marcou ❌ em algum:** Precisa migrar para Simples Nacional

---

## 🔮 Futuro do MEI (Cenários Possíveis)

### **Cenário 1: MEI Fortalecido (Otimista)**
- Limite aumenta para R$ 150k
- Mais atividades permitidas
- IBS/CBS com valores reduzidos
- MEI Plus criado (até R$ 300k)

### **Cenário 2: MEI Mantido (Realista)**
- Limite ajustado pela inflação
- Atividades atuais mantidas
- Adaptação gradual para IBS/CBS
- Benefícios preservados

### **Cenário 3: MEI Restrito (Pessimista)**
- Limite mantém R$ 81k
- Algumas atividades saem do MEI
- IBS/CBS podem elevar DAS
- Mais fiscalização

---

## 🛠️ Usar o Sistema

### **1. Configurar como MEI**
```typescript
// Modal de configuração FINORA TAX
{
  regime: 'mei',
  iss_rate: 0, // MEI não precisa informar
  has_employees: false, // Máximo 1
  employee_count: 0
}
```

### **2. Lançar Receitas**
- Sistema calcula automaticamente % do limite
- Alertas aparecem quando necessário

### **3. Ver Projeção**
- Dashboard mostra faturamento acumulado
- Gráfico de tendência mensal
- Previsão de quando atingirá limite

### **4. Preparar para Reforma (2026+)**
- Sistema atualizará automaticamente
- Novos campos de IBS/CBS
- Simulações de impacto

---

## 📞 Suporte e Dúvidas

**Dúvidas sobre MEI:**
- Portal do Empreendedor: https://www.gov.br/empresas-e-negocios/pt-br/empreendedor
- Receita Federal: 0800 7226 227

**Consultar Atividades Permitidas:**
- CNAE MEI: https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/tabelas-mei

**Calcular DAS:**
- App MEI (gov.br)
- FINORA TAX (cálculo automático)

---

## 📚 Referências

- **Lei Complementar 123/2006** - Estatuto do MEI
- **Lei Complementar 68/2024** - Reforma Tributária
- **Resolução CGSN 140/2018** - Regras do Simples Nacional
- **Portal do Empreendedor** - Informações oficiais do MEI

---

**Última atualização**: 27/12/2024
**Versão do sistema**: FINORA TAX 1.0 (com suporte total ao MEI e Reforma Tributária)

---

## 💡 Dica Final

> **O MEI é ótimo enquanto você está dentro dos limites.** Quando crescer, migrar para Simples Nacional não é um problema - é uma **conquista**! Significa que seu negócio está crescendo. O FINORA TAX te acompanha nessa jornada.
