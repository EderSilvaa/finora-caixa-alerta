# Exemplo de Refatoração - Dashboard

## Como transformar dados mockados em dados reais

### ❌ ANTES (Mockado)

```typescript
// src/pages/Dashboard.tsx (ANTIGO - NÃO USAR)

import { useState } from "react";

const Dashboard = () => {
  // Estados mockados
  const [currentBalance, setCurrentBalance] = useState(3500);
  const [totalRevenue, setTotalRevenue] = useState(11000);
  const [totalExpenses, setTotalExpenses] = useState(9500);
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'income', description: 'Pagamento Cliente XYZ', amount: 2500, date: 'Hoje, 14:30', category: 'Vendas' },
    { id: 2, type: 'expense', description: 'Fornecedor ABC', amount: 850, date: 'Hoje, 10:15', category: 'Fornecedores' },
    // ... mais dados mockados
  ]);

  const [cashFlowData] = useState([
    { day: 0, balance: 3500 },
    { day: 15, balance: 3200 },
    // ... dados mockados
  ]);

  const daysUntilZero = 12;

  // Função mockada
  const handleAddExpense = () => {
    const amount = parseFloat(expenseAmount);
    const newTransaction = {
      id: transactions.length + 1,
      type: 'expense',
      description: expenseDescription,
      amount: amount,
      date: 'Agora',
      category: 'Outros'
    };

    setTransactions([newTransaction, ...transactions.slice(0, 4)]);
    setCurrentBalance(currentBalance - amount);
    setTotalExpenses(totalExpenses + amount);
  };

  return (
    <div>
      <h1>Saldo: R$ {currentBalance}</h1>
      {transactions.map(t => <div key={t.id}>{t.description}</div>)}
    </div>
  );
};
```

---

### ✅ DEPOIS (Real)

```typescript
// src/pages/Dashboard.tsx (NOVO - USAR ESTE)

import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
import { useProjections } from "@/hooks/useProjections";
import { useFinancialGoals } from "@/hooks/useFinancialGoals";
import { useState } from "react";
import { transactionSchema } from "@/lib/validations";

const Dashboard = () => {
  // 1. Pegar usuário autenticado
  const { user, logout } = useAuth();

  // 2. Usar hooks reais com dados do backend
  const {
    transactions,
    currentBalance,
    monthlyStats,
    createTransaction,
    isCreating,
    isLoading: isLoadingTransactions,
  } = useTransactions(user?.id);

  const {
    projectionData,
    daysUntilZero,
    isLoading: isLoadingProjections,
    recalculateProjection,
  } = useProjections(user?.id);

  const {
    goals,
    isLoading: isLoadingGoals,
  } = useFinancialGoals(user?.id);

  // 3. Estados locais APENAS para UI (modals, forms)
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");

  // 4. Função real que salva no banco
  const handleAddExpense = () => {
    if (!expenseAmount || !expenseDescription) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    // Validar com Zod
    const result = transactionSchema.safeParse({
      type: 'expense',
      amount: parseFloat(expenseAmount),
      description: expenseDescription,
      category: 'Outros',
    });

    if (!result.success) {
      toast({
        title: "Erro de validação",
        description: result.error.errors[0].message,
        variant: "destructive"
      });
      return;
    }

    // Criar transação (vai para o Supabase!)
    createTransaction(result.data);

    // Limpar form
    setExpenseAmount("");
    setExpenseDescription("");
    setShowExpenseModal(false);

    // Toast de sucesso é automático (no hook)
  };

  // 5. Loading state
  if (isLoadingTransactions || isLoadingProjections || isLoadingGoals) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // 6. Dados calculados
  const totalRevenue = monthlyStats?.totalIncome || 0;
  const totalExpenses = monthlyStats?.totalExpenses || 0;
  const monthlySavings = totalRevenue - totalExpenses;

  return (
    <div>
      {/* KPI Cards */}
      <Card>
        <CardTitle>Saldo Atual</CardTitle>
        <div className="text-3xl font-bold">
          R$ {(currentBalance || 0).toLocaleString('pt-BR')}
        </div>
      </Card>

      {/* Gráfico de Projeção - agora com dados reais */}
      <ResponsiveContainer>
        <LineChart data={projectionData}>
          <Line dataKey="balance" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>

      {/* Alerta - agora calculado real */}
      {daysUntilZero !== null && (
        <Alert variant="destructive">
          Seu caixa zerará em {daysUntilZero} dias
        </Alert>
      )}

      {/* Transações - agora do banco */}
      {transactions?.map(transaction => (
        <div key={transaction.id}>
          {transaction.description} - R$ {transaction.amount}
        </div>
      ))}

      {/* Metas - agora do banco */}
      {goals?.map(goal => (
        <div key={goal.id}>
          {goal.title}: {goal.percentage}%
        </div>
      ))}

      {/* Modal de Despesa - agora salva real */}
      <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
        <DialogContent>
          <DialogTitle>Registrar Despesa</DialogTitle>
          <Input
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            type="number"
            placeholder="Valor"
          />
          <Input
            value={expenseDescription}
            onChange={(e) => setExpenseDescription(e.target.value)}
            placeholder="Descrição"
          />
          <Button onClick={handleAddExpense} disabled={isCreating}>
            {isCreating ? "Salvando..." : "Registrar Despesa"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
```

---

## 📋 Checklist de Mudanças

### 1. Imports
```typescript
// ❌ REMOVER
import { useState } from "react"; // Apenas para UI local

// ✅ ADICIONAR
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
import { useProjections } from "@/hooks/useProjections";
import { useFinancialGoals } from "@/hooks/useFinancialGoals";
import { transactionSchema } from "@/lib/validations";
```

### 2. Estados

```typescript
// ❌ REMOVER (dados mockados)
const [currentBalance, setCurrentBalance] = useState(3500);
const [totalRevenue, setTotalRevenue] = useState(11000);
const [totalExpenses, setTotalExpenses] = useState(9500);
const [transactions, setTransactions] = useState([...]);
const [cashFlowData] = useState([...]);
const [financialGoals] = useState([...]);
const daysUntilZero = 12;

// ✅ MANTER (apenas UI local)
const [showExpenseModal, setShowExpenseModal] = useState(false);
const [expenseAmount, setExpenseAmount] = useState("");
const [expenseDescription, setExpenseDescription] = useState("");

// ✅ ADICIONAR (hooks reais)
const { user } = useAuth();
const { transactions, currentBalance, monthlyStats, createTransaction } = useTransactions(user?.id);
const { projectionData, daysUntilZero } = useProjections(user?.id);
const { goals } = useFinancialGoals(user?.id);
```

### 3. Funções de Manipulação

```typescript
// ❌ ANTES (mockado)
const handleAddExpense = () => {
  const newTransaction = {...};
  setTransactions([newTransaction, ...transactions]);
  setCurrentBalance(currentBalance - amount);
  setTotalExpenses(totalExpenses + amount);
};

// ✅ DEPOIS (real)
const handleAddExpense = () => {
  // Validar
  const result = transactionSchema.safeParse({...});
  if (!result.success) return;

  // Criar (salva no banco!)
  createTransaction(result.data);

  // Limpar
  setExpenseAmount("");
  setShowExpenseModal(false);
};
```

### 4. Loading States

```typescript
// ✅ ADICIONAR
if (isLoadingTransactions || isLoadingProjections) {
  return <LoadingSpinner />;
}
```

### 5. Dados Calculados

```typescript
// ❌ ANTES
const monthlySavings = totalRevenue - totalExpenses;

// ✅ DEPOIS
const totalRevenue = monthlyStats?.totalIncome || 0;
const totalExpenses = monthlyStats?.totalExpenses || 0;
const monthlySavings = totalRevenue - totalExpenses;
```

---

## 🔄 Fluxo de Dados

### Mockado (Antigo)
```
User Action → useState → Component Re-render
(dados perdidos ao recarregar)
```

### Real (Novo)
```
User Action → createTransaction() → Supabase → React Query Cache → Component Re-render
(dados persistidos no banco)
```

---

## 🎯 Benefícios da Refatoração

### Performance
- ✅ Cache automático (React Query)
- ✅ Invalidação inteligente
- ✅ Debouncing automático

### UX
- ✅ Loading states
- ✅ Error handling
- ✅ Toasts automáticos
- ✅ Optimistic updates (futuro)

### Desenvolvimento
- ✅ Menos código
- ✅ Type-safe
- ✅ Validação centralizada
- ✅ Fácil debugar

### Dados
- ✅ Persistência real
- ✅ Sincronização multi-device
- ✅ Backup automático
- ✅ Auditoria (created_at, updated_at)

---

## 🚨 Erros Comuns

### 1. Esquecer de passar user?.id

```typescript
// ❌ ERRADO
const { transactions } = useTransactions();

// ✅ CORRETO
const { user } = useAuth();
const { transactions } = useTransactions(user?.id);
```

### 2. Não tratar loading

```typescript
// ❌ ERRADO
return <div>{currentBalance}</div>; // Pode ser undefined!

// ✅ CORRETO
if (isLoading) return <Loading />;
return <div>{currentBalance || 0}</div>;
```

### 3. Não validar antes de criar

```typescript
// ❌ ERRADO
createTransaction({ amount: expenseAmount }); // String!

// ✅ CORRETO
const result = transactionSchema.safeParse({
  amount: parseFloat(expenseAmount)
});
if (result.success) createTransaction(result.data);
```

---

## 📝 Próximos Passos

1. **Backup do Dashboard atual** (por segurança)
2. **Refatorar seção por seção:**
   - KPI Cards
   - Gráfico de projeção
   - Transações
   - Metas
   - Modals
3. **Testar cada mudança** antes de prosseguir
4. **Remover código antigo** aos poucos

---

## 💡 Dica Pro

Use a extensão **React Query Devtools** para debugar:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// No App.tsx
<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

---

**Está pronto para começar?** Siga este exemplo e refatore o Dashboard! 🚀
