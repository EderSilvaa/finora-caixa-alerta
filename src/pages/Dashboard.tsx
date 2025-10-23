import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, TrendingDown, Calendar, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Target, Zap, Download, Upload, RefreshCw, Sparkles, ArrowRight, Activity, PieChart } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import Logo from "@/components/Logo";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estados para controlar modais
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showProjectionModal, setShowProjectionModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisComplete, setAiAnalysisComplete] = useState(false);

  // Estados para formulários
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeDescription, setIncomeDescription] = useState("");

  // Estados dinâmicos
  const [currentBalance, setCurrentBalance] = useState(3500);
  const [totalRevenue, setTotalRevenue] = useState(11000);
  const [totalExpenses, setTotalExpenses] = useState(9500);
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'income', description: 'Pagamento Cliente XYZ', amount: 2500, date: 'Hoje, 14:30', category: 'Vendas' },
    { id: 2, type: 'expense', description: 'Fornecedor ABC', amount: 850, date: 'Hoje, 10:15', category: 'Fornecedores' },
    { id: 3, type: 'income', description: 'Venda Produto', amount: 1200, date: 'Ontem, 16:45', category: 'Vendas' },
    { id: 4, type: 'expense', description: 'Aluguel', amount: 3000, date: 'Ontem, 09:00', category: 'Fixo' },
    { id: 5, type: 'expense', description: 'Energia Elétrica', amount: 450, date: '2 dias atrás', category: 'Fixo' },
  ]);

  // Dados simulados de projeção de caixa
  const [cashFlowData] = useState([
    { day: 0, balance: 3500 },
    { day: 15, balance: 3200 },
    { day: 30, balance: 2800 },
    { day: 45, balance: 2300 },
    { day: 60, balance: 1700 },
    { day: 75, balance: 900 },
    { day: 90, balance: 200 },
    { day: 102, balance: 0 },
  ]);

  // Dados de receitas vs despesas (últimos 6 meses)
  const revenueExpensesData = [
    { month: 'Mai', receita: 8500, despesas: 7200 },
    { month: 'Jun', receita: 9200, despesas: 7800 },
    { month: 'Jul', receita: 8800, despesas: 8200 },
    { month: 'Ago', receita: 9500, despesas: 8500 },
    { month: 'Set', receita: 10200, despesas: 9100 },
    { month: 'Out', receita: totalRevenue, despesas: totalExpenses },
  ];

  // Metas financeiras
  const financialGoals = [
    { id: 1, title: 'Reserva de Emergência', current: 8500, target: 15000, percentage: 57, color: 'primary' },
    { id: 2, title: 'Expansão do Negócio', current: 12000, target: 30000, percentage: 40, color: 'secondary' },
    { id: 3, title: 'Quitação de Dívidas', current: 7500, target: 10000, percentage: 75, color: 'success' },
  ];

  const daysUntilZero = 12;
  const analyzedPeriod = 90;
  const monthlyGrowth = 8.5;
  const monthlySavings = totalRevenue - totalExpenses;

  // Função para registrar despesa
  const handleAddExpense = () => {
    if (!expenseAmount || !expenseDescription) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para continuar",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(expenseAmount);
    const newTransaction = {
      id: transactions.length + 1,
      type: 'expense' as const,
      description: expenseDescription,
      amount: amount,
      date: 'Agora',
      category: 'Outros'
    };

    setTransactions([newTransaction, ...transactions.slice(0, 4)]);
    setCurrentBalance(currentBalance - amount);
    setTotalExpenses(totalExpenses + amount);
    setExpenseAmount("");
    setExpenseDescription("");
    setShowExpenseModal(false);

    toast({
      title: "Despesa registrada!",
      description: `R$ ${amount.toLocaleString('pt-BR')} adicionado às despesas`,
    });
  };

  // Função para registrar receita
  const handleAddIncome = () => {
    if (!incomeAmount || !incomeDescription) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para continuar",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(incomeAmount);
    const newTransaction = {
      id: transactions.length + 1,
      type: 'income' as const,
      description: incomeDescription,
      amount: amount,
      date: 'Agora',
      category: 'Receita'
    };

    setTransactions([newTransaction, ...transactions.slice(0, 4)]);
    setCurrentBalance(currentBalance + amount);
    setTotalRevenue(totalRevenue + amount);
    setIncomeAmount("");
    setIncomeDescription("");
    setShowIncomeModal(false);

    toast({
      title: "Receita registrada!",
      description: `R$ ${amount.toLocaleString('pt-BR')} adicionado às receitas`,
    });
  };

  // Função para simular análise de IA
  const handleAIAnalysis = () => {
    setIsAnalyzing(true);
    setShowAIAnalysis(true);
    setAiAnalysisComplete(false);

    // Simula processamento de IA
    setTimeout(() => {
      setIsAnalyzing(false);
      setAiAnalysisComplete(true);
    }, 3000);
  };

  // Função para nova projeção
  const handleNewProjection = () => {
    setShowProjectionModal(true);

    // Simula cálculo de nova projeção
    setTimeout(() => {
      setShowProjectionModal(false);
      toast({
        title: "Nova projeção calculada!",
        description: "Os gráficos foram atualizados com as novas previsões",
      });
    }, 2500);
  };

  // Insights de IA simulados
  const aiInsights = [
    {
      title: "Padrão Identificado",
      description: "Suas despesas com fornecedores aumentaram 23% nas últimas 3 semanas. Isso pode impactar sua margem de lucro.",
      type: "warning",
      action: "Revisar contratos",
      icon: AlertTriangle
    },
    {
      title: "Oportunidade de Economia",
      description: "Baseado no seu histórico, você pode economizar R$ 1.850/mês renegociando o aluguel e serviços.",
      type: "success",
      action: "Ver detalhes",
      icon: TrendingUp
    },
    {
      title: "Risco de Fluxo",
      description: "Com o padrão atual, há 78% de chance de caixa negativo em 12 dias. Recomendamos antecipar recebíveis.",
      type: "danger",
      action: "Simular antecipação",
      icon: Activity
    },
    {
      title: "Crescimento Sustentável",
      description: "Sua receita cresceu 8.5% vs mês anterior. Mantenha esse ritmo para atingir suas metas trimestrais.",
      type: "success",
      action: "Ver projeção",
      icon: ArrowUpRight
    },
    {
      title: "Análise de Sazonalidade",
      description: "Detectamos um padrão sazonal: suas vendas aumentam 35% na segunda quinzena. Otimize seu estoque.",
      type: "info",
      action: "Planejar estoque",
      icon: PieChart
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary-glow/5 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '3s' }} />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)]" />
      </div>

      {/* Header - Mantido conforme solicitado */}
      <header className="relative z-10 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="md" />
              <h1 className="text-2xl font-bold text-foreground">Finora</h1>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border/50">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Últimos {analyzedPeriod} dias</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Design Premium Aprimorado */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* KPIs Premium - Grid com glassmorphism e gradientes */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Saldo Atual - Design Premium */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2 relative">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saldo Atual</CardTitle>
                    <div className="text-3xl font-bold text-foreground">
                      R$ {currentBalance.toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Receita Mensal - Design Premium */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-success/10 via-card/90 to-card/70 backdrop-blur-xl shadow-2xl hover:shadow-success/20 transition-all duration-300 hover:-translate-y-1 group">
              <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2 relative">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Receita Mensal</CardTitle>
                    <div className="text-3xl font-bold text-success">
                      R$ {totalRevenue.toLocaleString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-success font-medium">
                      <ArrowUpRight className="w-3 h-3" />
                      +{monthlyGrowth}% vs mês anterior
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Despesas Mensais - Design Premium */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-warning/10 via-card/90 to-card/70 backdrop-blur-xl shadow-2xl hover:shadow-warning/20 transition-all duration-300 hover:-translate-y-1 group">
              <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2 relative">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Despesas Mensais</CardTitle>
                    <div className="text-3xl font-bold text-warning">
                      R$ {totalExpenses.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {((totalExpenses/totalRevenue)*100).toFixed(0)}% da receita
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning/20 to-warning/10 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-warning" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Economia - Design Premium */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-card/90 to-card/70 backdrop-blur-xl shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2 relative">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Economia</CardTitle>
                    <div className="text-3xl font-bold text-primary">
                      R$ {monthlySavings.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      Este mês
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Alerta de Caixa - Design Premium */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-destructive/10 via-card/90 to-card/70 backdrop-blur-xl shadow-2xl hover:shadow-destructive/20 transition-all duration-300 hover:-translate-y-1 group">
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2 relative">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alerta de Caixa</CardTitle>
                    <div className="text-3xl font-bold text-destructive">
                      {daysUntilZero} dias
                    </div>
                    <div className="text-xs text-destructive font-medium">
                      Até zerar
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/10 flex items-center justify-center animate-pulse">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Seção de Gráficos Premium */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico de Projeção - Design Premium */}
            <Card className="lg:col-span-2 border-0 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-2xl">
              <CardHeader className="pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-foreground">Projeção de Caixa</CardTitle>
                      <CardDescription className="text-xs">Análise preditiva dos próximos 102 dias</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={cashFlowData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                          <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        opacity={0.15}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: 'hsl(var(--border))', opacity: 0.3 }}
                        label={{ value: 'Dias', position: 'insideBottom', offset: -10, fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: 'hsl(var(--border))', opacity: 0.3 }}
                        label={{ value: 'R$', angle: -90, position: 'insideLeft', fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `R$ ${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                          padding: '12px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                          backdropFilter: 'blur(8px)'
                        }}
                        formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Saldo']}
                        labelFormatter={(label) => `Dia ${label}`}
                      />
                      <ReferenceLine
                        y={0}
                        stroke="hsl(var(--destructive))"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        label={{ value: 'Limite Crítico', position: 'right', fill: 'hsl(var(--destructive))', fontSize: 10 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="url(#lineGradient)"
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', r: 5, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                        activeDot={{ r: 8, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Alerta Premium */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-destructive/10 to-warning/10 border border-destructive/30 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-destructive mb-1">
                        Atenção: Fluxo de caixa em risco
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Com o padrão atual de receitas e despesas, seu saldo zerrará em <span className="font-bold text-destructive">{daysUntilZero} dias</span>. Recomendamos antecipar recebíveis ou reduzir despesas variáveis.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights IA - Design Premium */}
            <Card className="border-0 bg-gradient-to-br from-primary/5 via-card/95 to-secondary/5 backdrop-blur-xl shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">Insights IA</CardTitle>
                    <CardDescription className="text-xs">Análise em tempo real</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-foreground leading-relaxed">
                          <span className="font-semibold text-primary">Recomendação:</span> Antecipe R$ 1.200 em recebíveis para manter fluxo positivo.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-warning/20 hover:border-warning/40 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-foreground leading-relaxed">
                          <span className="font-semibold text-warning">Oportunidade:</span> Despesas variáveis subiram 15%. Revise contratos.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-success/20 hover:border-success/40 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-success" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-foreground leading-relaxed">
                          <span className="font-semibold text-success">Positivo:</span> Receita cresceu {monthlyGrowth}% nas últimas 2 semanas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="gradient"
                  size="sm"
                  className="w-full mt-4 shadow-lg hover:shadow-xl transition-all"
                  onClick={handleAIAnalysis}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Ver Análise Completa
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Receitas vs Despesas + Transações - Design Premium */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico de Barras - Design Premium */}
            <Card className="lg:col-span-2 border-0 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success/20 to-warning/20 flex items-center justify-center">
                      <PieChart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-foreground">Receitas vs Despesas</CardTitle>
                      <CardDescription className="text-xs">Comparativo dos últimos 6 meses</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueExpensesData}>
                      <defs>
                        <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={1} />
                          <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.6} />
                        </linearGradient>
                        <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={1} />
                          <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0.6} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.15} vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: 'hsl(var(--border))', opacity: 0.3 }}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: 'hsl(var(--border))', opacity: 0.3 }}
                        tickFormatter={(value) => `R$ ${value/1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                          padding: '12px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                          backdropFilter: 'blur(8px)'
                        }}
                        formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                      />
                      <Bar dataKey="receita" fill="url(#colorReceita)" radius={[12, 12, 0, 0]} />
                      <Bar dataKey="despesas" fill="url(#colorDespesa)" radius={[12, 12, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Transações Recentes - Design Premium */}
            <Card className="border-0 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">Transações</CardTitle>
                      <CardDescription className="text-xs">Atividade recente</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-primary/10"
                    onClick={() => {
                      toast({
                        title: "Atualizado!",
                        description: "Transações sincronizadas",
                      });
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-background/60 transition-all border border-transparent hover:border-primary/20 cursor-pointer group"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.type === 'income'
                        ? 'bg-success/20 group-hover:bg-success/30'
                        : 'bg-destructive/20 group-hover:bg-destructive/30'
                    } transition-colors`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="w-5 h-5 text-success" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{transaction.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{transaction.date}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">{transaction.category}</span>
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                      {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR')}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Metas Financeiras + Ações Rápidas - Design Premium */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Metas Financeiras - Design Premium */}
            <Card className="border-0 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-foreground">Metas Financeiras</CardTitle>
                    <CardDescription className="text-xs">Progresso dos seus objetivos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {financialGoals.map((goal) => (
                  <div key={goal.id} className="p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{goal.title}</span>
                      <span className="text-sm font-bold text-primary">
                        {goal.percentage}%
                      </span>
                    </div>
                    <div className="relative">
                      <Progress value={goal.percentage} className="h-3" />
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/20 to-transparent rounded-full transition-all"
                        style={{ width: `${goal.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-muted-foreground">
                        R$ {goal.current.toLocaleString('pt-BR')}
                      </span>
                      <span className="text-muted-foreground">
                        Meta: <span className="font-semibold text-foreground">R$ {goal.target.toLocaleString('pt-BR')}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Ações Rápidas - Design Premium */}
            <Card className="border-0 bg-gradient-to-br from-primary/5 via-card/95 to-secondary/5 backdrop-blur-xl shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-foreground">Ações Rápidas</CardTitle>
                    <CardDescription className="text-xs">Gerencie seu fluxo de caixa</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-between h-14 text-base border-2 hover:border-destructive/50 hover:bg-destructive/5 transition-all group"
                  onClick={() => setShowExpenseModal(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                      <Download className="w-5 h-5 text-destructive" />
                    </div>
                    <span className="font-semibold">Registrar Despesa</span>
                  </div>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between h-14 text-base border-2 hover:border-success/50 hover:bg-success/5 transition-all group"
                  onClick={() => setShowIncomeModal(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                      <Upload className="w-5 h-5 text-success" />
                    </div>
                    <span className="font-semibold">Registrar Receita</span>
                  </div>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between h-14 text-base border-2 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                  onClick={handleNewProjection}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold">Nova Projeção</span>
                  </div>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>

                <Button
                  variant="gradient"
                  className="w-full justify-between h-14 text-base shadow-lg hover:shadow-xl transition-all group"
                  onClick={handleAIAnalysis}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold">Análise Detalhada IA</span>
                  </div>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 py-8 mt-20">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            IA Finora — seu copiloto financeiro.
          </p>
        </div>
      </footer>

      {/* Modal de Análise de IA - Design Premium */}
      <Dialog open={showAIAnalysis} onOpenChange={setShowAIAnalysis}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto border-0 bg-gradient-to-br from-card/98 to-card/95 backdrop-blur-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <div>Análise Detalhada de IA</div>
                <DialogDescription className="text-sm mt-1">
                  Insights personalizados baseados em machine learning e análise preditiva
                </DialogDescription>
              </div>
            </DialogTitle>
          </DialogHeader>

          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <Sparkles className="w-10 h-10 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-xl font-semibold text-foreground">Analisando seus dados...</p>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Processando padrões, tendências, sazonalidade e oportunidades de otimização financeira
              </p>
            </div>
          ) : aiAnalysisComplete ? (
            <div className="space-y-4 py-6">
              {aiInsights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <Card key={index} className={`border-l-4 transition-all hover:shadow-lg ${
                    insight.type === 'success' ? 'border-l-success bg-success/5 hover:bg-success/10' :
                    insight.type === 'warning' ? 'border-l-warning bg-warning/5 hover:bg-warning/10' :
                    insight.type === 'danger' ? 'border-l-destructive bg-destructive/5 hover:bg-destructive/10' :
                    'border-l-primary bg-primary/5 hover:bg-primary/10'
                  }`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            insight.type === 'success' ? 'bg-success/20' :
                            insight.type === 'warning' ? 'bg-warning/20' :
                            insight.type === 'danger' ? 'bg-destructive/20' :
                            'bg-primary/20'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              insight.type === 'success' ? 'text-success' :
                              insight.type === 'warning' ? 'text-warning' :
                              insight.type === 'danger' ? 'text-destructive' :
                              'text-primary'
                            }`} />
                          </div>
                          <span>{insight.title}</span>
                        </div>
                        <Sparkles className="w-4 h-4 text-primary" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-foreground leading-relaxed">{insight.description}</p>
                      <Button variant="outline" size="sm" className="group">
                        {insight.action}
                        <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}

              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 border-2 border-primary/30 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-foreground mb-3">Recomendação Principal</h4>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      Com base na análise completa dos seus dados financeiros, recomendamos: <strong className="text-primary">Antecipar R$ 1.200 em recebíveis</strong> e <strong className="text-primary">renegociar contratos com fornecedores</strong> para evitar caixa negativo nos próximos 12 dias e manter a saúde financeira do negócio.
                    </p>
                    <Button variant="gradient" size="default" className="group shadow-lg">
                      Aplicar Recomendações
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Modal de Registrar Despesa - Design Premium */}
      <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
        <DialogContent className="border-0 bg-gradient-to-br from-card/98 to-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <Download className="w-5 h-5 text-destructive" />
              </div>
              Registrar Despesa
            </DialogTitle>
            <DialogDescription>
              Adicione uma nova despesa ao seu fluxo de caixa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="expense-amount" className="text-sm font-semibold">Valor (R$)</Label>
              <Input
                id="expense-amount"
                type="number"
                placeholder="0,00"
                className="h-12 text-base"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-description" className="text-sm font-semibold">Descrição</Label>
              <Input
                id="expense-description"
                placeholder="Ex: Fornecedor, Aluguel, etc"
                className="h-12 text-base"
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
              />
            </div>
            <Button onClick={handleAddExpense} className="w-full h-12 text-base bg-destructive hover:bg-destructive/90 shadow-lg" variant="destructive">
              <Download className="w-5 h-5 mr-2" />
              Registrar Despesa
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Registrar Receita - Design Premium */}
      <Dialog open={showIncomeModal} onOpenChange={setShowIncomeModal}>
        <DialogContent className="border-0 bg-gradient-to-br from-card/98 to-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <Upload className="w-5 h-5 text-success" />
              </div>
              Registrar Receita
            </DialogTitle>
            <DialogDescription>
              Adicione uma nova receita ao seu fluxo de caixa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="income-amount" className="text-sm font-semibold">Valor (R$)</Label>
              <Input
                id="income-amount"
                type="number"
                placeholder="0,00"
                className="h-12 text-base"
                value={incomeAmount}
                onChange={(e) => setIncomeAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="income-description" className="text-sm font-semibold">Descrição</Label>
              <Input
                id="income-description"
                placeholder="Ex: Venda, Pagamento Cliente, etc"
                className="h-12 text-base"
                value={incomeDescription}
                onChange={(e) => setIncomeDescription(e.target.value)}
              />
            </div>
            <Button onClick={handleAddIncome} className="w-full h-12 text-base bg-success hover:bg-success/90 shadow-lg">
              <Upload className="w-5 h-5 mr-2" />
              Registrar Receita
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Nova Projeção - Design Premium */}
      <Dialog open={showProjectionModal} onOpenChange={setShowProjectionModal}>
        <DialogContent className="border-0 bg-gradient-to-br from-card/98 to-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              Calculando Nova Projeção
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <Brain className="w-10 h-10 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-xl font-semibold text-foreground">Recalculando projeções...</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Analisando histórico, tendências e sazonalidade para gerar previsões precisas
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
