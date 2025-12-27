# FINORA TAX - Conformidade com a Reforma Tributária

## 📋 Visão Geral

O sistema FINORA TAX foi desenvolvido em **conformidade com a Reforma Tributária brasileira** (Lei Complementar 68/2024), preparado para a transição gradual do sistema tributário entre 2026 e 2033.

---

## 🎯 O que é a Reforma Tributária?

A reforma tributária unifica múltiplos tributos em dois impostos principais:

### **IBS - Imposto sobre Bens e Serviços**
- **Substitui**: ICMS (estadual) + ISS (municipal)
- **Alíquota estimada**: ~17.7% (pode variar por estado)
- **Gestão**: Compartilhada entre estados e municípios
- **Início**: Testes em 2026, transição 2027-2032, vigência plena em 2033

### **CBS - Contribuição sobre Bens e Serviços**
- **Substitui**: PIS + COFINS (federais)
- **Alíquota estimada**: ~8.8%
- **Gestão**: Federal
- **Início**: Mesma cronologia do IBS

### **Simples Nacional**
- **Mantido**: Sim, mas adaptado para incluir IBS/CBS
- **Mudança**: Alíquotas serão recalculadas com as novas bases

---

## 📅 Cronograma de Transição (2026-2033)

| Ano  | Sistema Antigo | Sistema Novo (IBS/CBS) | Status            |
|------|----------------|------------------------|-------------------|
| 2026 | 100%           | 0% (testes)            | Preparação        |
| 2027 | 90%            | 10%                    | Início transição  |
| 2028 | 80%            | 20%                    | Transição         |
| 2029 | 70%            | 30%                    | Transição         |
| 2030 | 60%            | 40%                    | Transição         |
| 2031 | 40%            | 60%                    | Transição         |
| 2032 | 20%            | 80%                    | Transição         |
| 2033 | 0%             | 100%                   | **Vigência plena**|

### Exemplo prático (2027):
Se sua receita mensal é **R$ 10.000**:
- **ISS (sistema antigo)**: R$ 10.000 × 2% × 90% = R$ 180
- **IBS (sistema novo)**: R$ 10.000 × 17.7% × 10% = R$ 177
- **Total**: R$ 357 (transição)

---

## ✅ Como o FINORA TAX está Preparado

### 1. **Banco de Dados**
- ✅ Tabela `tax_reform_rates` com alíquotas ano a ano (2026-2033)
- ✅ Campos `ibs_amount` e `cbs_amount` nas tabelas de cálculo
- ✅ Coluna `tax_regime_version` para identificar qual sistema usar
- ✅ Suporte a `transition_percentage` para períodos híbridos

### 2. **Cálculos Automáticos**
- ✅ Função `calculate_reform_taxes()` - calcula IBS/CBS
- ✅ Função `calculate_monthly_tax_with_reform()` - orquestra ambos os sistemas
- ✅ Detecção automática do ano para aplicar transição correta
- ✅ Combinação proporcional de sistemas antigo/novo

### 3. **Interface do Usuário**
- ✅ Modal de configuração suporta definir regime pós-reforma
- ✅ Dashboard mostra separadamente impostos atuais e da reforma
- ✅ Alertas sobre transição e mudanças no regime
- ✅ Visualização de economia/aumento com a reforma

### 4. **Tipos TypeScript**
- ✅ `TaxRegimeVersion`: 'current' | 'transition' | 'reform'
- ✅ `TaxType` inclui 'ibs' e 'cbs'
- ✅ `PostReformRegime` para regimes após 2033
- ✅ Campos opcionais para não quebrar código existente

---

## 🔧 Como Usar o Sistema em Cada Fase

### **Fase 1: Hoje até 2025 (Sistema Atual)**

**Configuração:**
```typescript
{
  tax_regime_version: 'current',
  regime: 'simples_nacional',
  simples_anexo: 'III',
  iss_rate: 2.0
}
```

**Cálculo:** Apenas DAS, ISS, INSS (sistema atual)

---

### **Fase 2: 2026-2032 (Transição)**

**Configuração:**
```typescript
{
  tax_regime_version: 'transition',
  regime: 'simples_nacional',
  simples_anexo: 'III',
  iss_rate: 2.0,        // Ainda necessário (parte antiga)
  ibs_rate: 17.7,       // Nova alíquota
  cbs_rate: 8.8,        // Nova alíquota
  transition_year: 2027 // Define % de cada sistema
}
```

**Cálculo:** Sistema misto (ex: 2027 = 90% antigo + 10% novo)

**Dashboard mostra:**
- **Impostos Atuais**: DAS R$ 540 (90%), ISS R$ 180 (90%)
- **Impostos Reforma**: IBS R$ 177 (10%), CBS R$ 88 (10%)
- **Total**: R$ 985

---

### **Fase 3: 2033+ (Reforma Plena)**

**Configuração:**
```typescript
{
  tax_regime_version: 'reform',
  post_reform_regime: 'simples_nacional_unificado',
  ibs_rate: 17.7,
  cbs_rate: 8.8,
  ibs_state: 'SP' // Importante: alíquota pode variar por estado
}
```

**Cálculo:** Apenas IBS + CBS (sistema novo)

**Dashboard mostra:**
- **IBS**: R$ 1.770
- **CBS**: R$ 880
- **Total**: R$ 2.650

---

## 🚀 Executar a Migration de Reforma

Para adicionar suporte à reforma no seu banco de dados:

```bash
# Aplicar migration de reforma tributária
supabase migration up 20250127_tax_reform_compliance
```

Ou via SQL Studio:
```sql
-- Execute o arquivo:
-- supabase/migrations/20250127_tax_reform_compliance.sql
```

---

## 📊 Novidades da Reforma (Além de IBS/CBS)

### 1. **Cashback para Baixa Renda**
- Famílias de baixa renda receberão devolução de parte dos impostos
- Campo no sistema: `eligible_for_cashback`

### 2. **Alíquotas Reduzidas**
- Saúde, educação, transporte público: 60% da alíquota padrão
- Cesta básica, medicamentos essenciais: alíquota zero
- Campo no sistema: `reduced_sectors` na tabela `tax_reform_rates`

### 3. **Fim da "Guerra Fiscal"**
- Alíquotas unificadas entre estados (IBS)
- Acabam os incentivos regionais que geravam distorções

### 4. **Simplificação**
- De 5 tributos (ICMS, ISS, PIS, COFINS, IPI) para 2 (IBS, CBS)
- Redução de custos de conformidade para empresas

---

## ⚠️ Atenção: Incertezas e Atualizações

### **Alíquotas podem mudar**
As alíquotas de 17.7% (IBS) e 8.8% (CBS) são **estimativas iniciais**. O Congresso pode ajustá-las até 2032.

### **Regras do Simples Nacional**
Detalhes de como o Simples Nacional será adaptado ainda estão em regulamentação.

### **Setores com tratamento especial**
Algumas atividades terão regimes diferenciados (combustíveis, energia, etc.)

**Recomendação:** Atualizar o sistema anualmente conforme novas regulamentações sejam publicadas.

---

## 🛠️ Próximos Passos para Manter Conformidade

1. **2025**: Monitorar publicação de leis complementares
2. **2026**: Atualizar alíquotas finais após testes
3. **2027+**: Ajustar taxas de transição conforme governo divulgar
4. **2033**: Verificar se transição foi concluída conforme cronograma

---

## 📚 Referências

- **Lei Complementar 68/2024** - Reforma Tributária
- **Emenda Constitucional 132/2023** - Base da reforma
- **Receita Federal**: https://www.gov.br/receitafederal
- **Simples Nacional**: http://www8.receita.fazenda.gov.br/simplesnacional

---

## 🎓 Glossário

| Termo | Significado |
|-------|-------------|
| **IBS** | Imposto sobre Bens e Serviços (substitui ICMS + ISS) |
| **CBS** | Contribuição sobre Bens e Serviços (substitui PIS + COFINS) |
| **DAS** | Documento de Arrecadação do Simples Nacional |
| **ISS** | Imposto Sobre Serviços (municipal, será substituído pelo IBS) |
| **PIS/COFINS** | Contribuições federais sobre faturamento (serão substituídas pela CBS) |
| **Transição** | Período de 2026 a 2033 onde ambos os sistemas coexistem |
| **Cashback** | Devolução de impostos para famílias de baixa renda |

---

## 💡 Suporte

Dúvidas sobre a conformidade tributária?
- Consulte seu contador
- Verifique atualizações no portal da Receita Federal
- Acompanhe este repositório para atualizações do sistema

---

**Última atualização**: 27/12/2024
**Versão do sistema**: FINORA TAX 1.0 (com suporte à Reforma Tributária)
