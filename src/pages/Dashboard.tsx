import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, TrendingDown, Calendar, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Target, Zap, Download, Upload, RefreshCw, Sparkles, ArrowRight, Activity, PieChart, LogOut, User, Settings, Building2, Loader2, Bell } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import Logo from "@/components/Logo";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTransactionStats } from "@/hooks/useTransactionStats";
import { useTransactions } from "@/hooks/useTransactions";
import { useAutoSync } from "@/hooks/useAutoSync";
import { useAI } from "@/hooks/useAI";
import { useEffect } from "react";
import { ActionPlan, type ActionItem } from "@/components/ActionPlan";
import { RevenuePrediction } from "@/components/RevenuePrediction";
import { SmartGoals } from "@/components/SmartGoals";
import { CreateGoalModal } from "@/components/CreateGoalModal";
import { ExportReport } from "@/components/ExportReport";
import { AlertsCenter } from "@/components/AlertsCenter";
import { NotificationSettings } from "@/components/NotificationSettings";
import { useSmartGoals } from "@/hooks/useSmartGoals";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { aiService } from "@/services/ai.service";
import { supabase } from "@/lib/supabase";
import type { ExportData } from "@/services/export.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KPISkeleton, ChartSkeleton, TransactionsSkeleton, GoalsSkeleton } from "@/components/DashboardSkeleton";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [projectionDays, setProjectionDays] = useState<30 | 60 | 120>(30);

  // Fetch real data from Supabase
  const { stats, monthlyData, cashFlowProjection, daysUntilZero } = useTransactionStats();
  const { transactions, loading: transactionsLoading, addTransaction } = useTransactions();
  const { goals, refreshGoals } = useSmartGoals();

  // Auto-sync functionality
  const { syncStatus, manualSync, getLastSyncText } = useAutoSync();

  // AI Features
  const {
    insights,
    balancePrediction,
    spendingPatterns,
    anomalies,
    loading: aiLoading,
    error: aiError,
    isConfigured: isAIConfigured,
    lastAnalysisDate,
    runFullAnalysis,
    loadLatestAnalysisFromDB,
  } = useAI();

  // Show toast when auto-sync starts and completes
  useEffect(() => {
    if (syncStatus.isSyncing) {
      toast({
        title: "Sincronizando transações",
        description: "Buscando novas transações dos seus bancos conectados...",
      });
    }
  }, [syncStatus.isSyncing]);

  // Fetch user avatar
  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching avatar:', error);
          return;
        }

        // If profile doesn't exist, create it
        if (!data) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{ id: user.id, email: user.email }]);

          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
          return;
        }

        if (data?.avatar_url) {
          setUserAvatar(data.avatar_url);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchUserAvatar();
  }, [user?.id, user?.email]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
  };

  // Estados para controlar modais
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showProjectionModal, setShowProjectionModal] = useState(false);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisComplete, setAiAnalysisComplete] = useState(false);
  const [actionPlanItems, setActionPlanItems] = useState<ActionItem[]>([]);

  // Estados para formulários
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeDescription, setIncomeDescription] = useState("");

  // Use real data from hooks
  const currentBalance = stats.currentBalance;
  const totalRevenue = stats.totalRevenue;
  const totalExpenses = stats.totalExpenses;
  const monthlyGrowth = stats.monthlyGrowth;
  const monthlySavings = stats.monthlySavings;
  // Filter cash flow data based on selected projection period
  const cashFlowData = cashFlowProjection.filter(item => item.day <= projectionDays);
  const revenueExpensesData = monthlyData;

  // Recent 5 transactions for display
  const recentTransactions = transactions.slice(0, 5);

  const analyzedPeriod = 90;

  // Função para registrar despesa
  const handleAddExpense = async () => {
    if (!expenseAmount || !expenseDescription) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para continuar",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(expenseAmount);

    try {
      await addTransaction({
        type: 'expense',
        description: expenseDescription,
        amount: amount,
        category: 'outros',
        payment_method: 'money',
        date: new Date().toISOString(),
        is_recurring: false,
      });

      setExpenseAmount("");
      setExpenseDescription("");
      setShowExpenseModal(false);

      toast({
        title: "Despesa registrada!",
        description: `R$ ${amount.toLocaleString('pt-BR')} adicionado às despesas`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao registrar despesa",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Função para registrar receita
  const handleAddIncome = async () => {
    if (!incomeAmount || !incomeDescription) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para continuar",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(incomeAmount);

    try {
      await addTransaction({
        type: 'income',
        description: incomeDescription,
        amount: amount,
        category: 'receita',
        payment_method: 'money',
        date: new Date().toISOString(),
        is_recurring: false,
      });

      setIncomeAmount("");
      setIncomeDescription("");
      setShowIncomeModal(false);

      toast({
        title: "Receita registrada!",
        description: `R$ ${amount.toLocaleString('pt-BR')} adicionado às receitas`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao registrar receita",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Função para abrir modal de análise (sem rodar nova análise)
  const handleOpenAnalysisModal = () => {
    setShowAIAnalysis(true);
    setAiAnalysisComplete(true);
  };

  // Função para análise de IA com GPT-4o
  const handleAIAnalysis = async () => {
    if (!isAIConfigured) {
      toast({
        title: "API Key do OpenAI necessária",
        description: "Configure a API key do OpenAI no arquivo .env.local",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setShowAIAnalysis(true);
    setAiAnalysisComplete(false);

    try {
      // Executa análise completa com GPT-4o
      await runFullAnalysis();

      setIsAnalyzing(false);
      setAiAnalysisComplete(true);

      toast({
        title: "Análise concluída!",
        description: "Insights de IA gerados com sucesso",
      });
    } catch (error: any) {
      console.error('Error running AI analysis:', error);
      setIsAnalyzing(false);
      setAiAnalysisComplete(false);

      toast({
        title: "Erro na análise",
        description: error.message || "Não foi possível gerar insights",
        variant: "destructive"
      });
    }
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

  // Função para gerar plano de ação com IA
  const handleGenerateActionPlan = async (): Promise<ActionItem[]> => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    if (!isAIConfigured) {
      toast({
        title: "API Key do OpenAI necessária",
        description: "Configure a API key do OpenAI no arquivo .env.local",
        variant: "destructive"
      });
      throw new Error('OpenAI not configured');
    }

    try {
      const monthlyBurn = Math.abs(stats.monthlySavings);
      const actions = await aiService.generateActionPlan(
        user.id,
        daysUntilZero,
        currentBalance,
        monthlyBurn
      );

      setActionPlanItems(actions);

      toast({
        title: "Plano de Ação gerado!",
        description: `${actions.length} ações recomendadas`,
      });

      return actions;
    } catch (error: any) {
      toast({
        title: "Erro ao gerar plano",
        description: error.message || "Não foi possível gerar o plano de ação",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Map AI insight severity to card type
  const getInsightType = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'info';
    }
  };

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'spending':
        return TrendingDown;
      case 'income':
        return TrendingUp;
      case 'balance':
        return DollarSign;
      case 'savings':
        return Target;
      case 'risk':
        return AlertTriangle;
      case 'opportunity':
        return Sparkles;
      default:
        return Activity;
    }
  };

  // Preparar dados para exportação
  const prepareExportData = (): ExportData => {
    // Formatar transações para exportação
    const formattedTransactions = transactions.map(t => ({
      id: t.id,
      amount: t.amount,
      description: t.description,
      type: t.type as 'income' | 'expense',
      date: t.date,
    }));

    // Formatar metas para exportação
    const formattedGoals = goals.map(g => ({
      title: g.title,
      progress: g.progress_percentage || 0,
      target: g.target_amount,
      current: g.current_amount,
    }));

    // Formatar insights de IA
    const formattedInsights = insights.length > 0 ? {
      summary: insights[0]?.summary || insights[0]?.description || 'Análise financeira realizada com sucesso.',
      warnings: insights
        .filter(i => i.severity === 'high' || i.severity === 'medium')
        .map(i => `${i.title}: ${i.description}`),
      recommendations: insights
        .filter(i => i.severity === 'low' || i.category === 'opportunity')
        .map(i => i.action_items?.join(' | ') || i.description),
    } : undefined;

    // Formatar análises detalhadas de IA
    const formattedAIAnalysis = (balancePrediction || anomalies.length > 0 || spendingPatterns.length > 0) ? {
      balancePrediction: balancePrediction ? {
        predicted_balance: balancePrediction.predicted_balance,
        confidence: balancePrediction.confidence,
        days_ahead: balancePrediction.days_ahead,
        trend: balancePrediction.trend,
      } : undefined,
      anomalies: anomalies.map(a => ({
        description: a.transaction_description,
        amount: a.amount,
        date: a.date,
        reason: a.reason,
        severity: a.severity,
      })),
      spendingPatterns: spendingPatterns.map(p => ({
        category: p.category,
        average_amount: p.average_amount,
        trend: p.trend,
        insights: p.insights,
      })),
    } : undefined;

    // Calcular período (últimos 30 dias)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    return {
      currentBalance: currentBalance,
      totalRevenue: totalRevenue,
      totalExpenses: totalExpenses,
      savings: monthlySavings,
      daysUntilZero: daysUntilZero,
      periodStart: startDate.toISOString(),
      periodEnd: endDate.toISOString(),
      transactions: formattedTransactions,
      goals: formattedGoals.length > 0 ? formattedGoals : undefined,
      insights: formattedInsights,
      aiAnalysis: formattedAIAnalysis,
      userName: user?.email?.split('@')[0] || 'Usuário',
      userEmail: user?.email || '',
    };
  };

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

      {/* Header com Logout */}
      <header className="relative z-10 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <Logo size="md" />
              <h1 className="text-xl md:text-2xl font-bold text-foreground">Finora</h1>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Period indicator - hide on mobile */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border/50">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Últimos {analyzedPeriod} dias</span>
              </div>

              {/* Last Sync Indicator - icon only on mobile */}
              {syncStatus.lastSyncAt && (
                <div className="flex items-center gap-2 px-2 md:px-4 py-2 rounded-lg bg-primary/10 border border-primary/30">
                  <RefreshCw className={`w-4 h-4 text-primary ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                  <span className="text-sm text-primary hidden md:inline">
                    Sync: {getLastSyncText()}
                  </span>
                </div>
              )}

              {/* Bank Connection Button - icon only on mobile */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/bank-connections')}
                className="flex items-center gap-2 px-2 md:px-4"
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden md:inline">Conectar Banco</span>
              </Button>

              {/* Alerts Center */}
              <AlertsCenter />

              {/* User Menu - always show profile circle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-muted/50 px-2 md:px-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 overflow-hidden">
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium hidden md:block">{user?.email?.split('@')[0] || 'Usuário'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowNotifications(true)}
                    className="flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Notificações</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Design Premium Aprimorado */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* KPIs Premium - Grid com glassmorphism e gradientes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* Show skeletons only if loading AND no cached data */}
            {stats.loading && currentBalance === 0 && totalRevenue === 0 && totalExpenses === 0 && (
              <>
                <KPISkeleton />
                <KPISkeleton />
                <KPISkeleton />
                <KPISkeleton />
                <KPISkeleton />
              </>
            )}
            {(!stats.loading || currentBalance !== 0 || totalRevenue !== 0 || totalExpenses !== 0) && (
              <>
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
              </>
            )}
          </div>

          {/* Action Plan for Critical Cash Flow */}
          {daysUntilZero < 15 && daysUntilZero > 0 && (
            <ActionPlan
              daysUntilZero={daysUntilZero}
              currentBalance={currentBalance}
              monthlyBurn={Math.abs(stats.monthlySavings)}
              onGenerateAIPlan={handleGenerateActionPlan}
              initialActions={actionPlanItems}
            />
          )}

          {/* Revenue Prediction - Recurring Revenue & Alerts */}
          <RevenuePrediction
            onSendReminder={(clientName, amount) => {
              toast({
                title: "Lembrete de cobrança",
                description: `Lembrete para ${clientName} (R$ ${amount.toLocaleString('pt-BR')}) será enviado`,
              });
            }}
          />

          {/* Seção de Gráficos Premium */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico de Projeção - Design Premium */}
            {stats.loading && cashFlowProjection.length === 0 && (
              <div className="lg:col-span-2">
                <ChartSkeleton />
              </div>
            )}
            {(!stats.loading || cashFlowProjection.length > 0) && (
            <Card className="lg:col-span-2 border-0 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-2xl">
              <CardHeader className="pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-foreground">Projeção de Caixa</CardTitle>
                      <CardDescription className="text-xs">Análise preditiva de {projectionDays} dias</CardDescription>
                    </div>
                  </div>
                </div>
                {/* Period Selection Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant={projectionDays === 30 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setProjectionDays(30)}
                    className="flex-1 text-xs"
                  >
                    30 dias
                  </Button>
                  <Button
                    variant={projectionDays === 60 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setProjectionDays(60)}
                    className="flex-1 text-xs"
                  >
                    60 dias
                  </Button>
                  <Button
                    variant={projectionDays === 120 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setProjectionDays(120)}
                    className="flex-1 text-xs"
                  >
                    120 dias
                  </Button>
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
                        interval={projectionDays === 30 ? 4 : projectionDays === 60 ? 9 : 14}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: 'hsl(var(--border))', opacity: 0.3 }}
                        label={{ value: 'Saldo (R$)', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => {
                          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                          if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                          return value.toString();
                        }}
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
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 7, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
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
            )}

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
                {/* Last Analysis Date & Refresh */}
                {lastAnalysisDate && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-primary/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span className="text-xs text-muted-foreground">
                        Analisado {formatDistanceToNow(new Date(lastAnalysisDate), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ExportReport
                        data={prepareExportData()}
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-primary/10"
                            title="Exportar Relatório"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-primary/10"
                        disabled={aiLoading}
                        onClick={handleAIAnalysis}
                        title="Atualizar Análise"
                      >
                        <RefreshCw className={`w-3 h-3 ${aiLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Show AI insights preview if available */}
                  {isAIConfigured && insights.length > 0 ? (
                    insights.slice(0, 3).map((insight, index) => {
                      const insightType = getInsightType(insight.severity);
                      const Icon = getInsightIcon(insight.category);
                      const colorClass = insightType === 'danger' ? 'destructive' : insightType === 'warning' ? 'warning' : insightType === 'success' ? 'success' : 'primary';

                      return (
                        <div key={index} className={`p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-${colorClass}/20 hover:border-${colorClass}/40 transition-colors`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-${colorClass}/20 flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-4 h-4 text-${colorClass}`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-foreground leading-relaxed">
                                <span className={`font-semibold text-${colorClass}`}>{insight.title}:</span> {insight.description.substring(0, 80)}...
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      {/* Default placeholder insights */}
                      <div className="p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-muted/20">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted/20 flex items-center justify-center flex-shrink-0">
                            <Brain className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {!isAIConfigured
                                ? 'Configure a API do OpenAI para ver insights personalizados'
                                : 'Clique em "Ver Análise Completa" para gerar insights de IA'}
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
                    </>
                  )}
                </div>

                {/* Botão inteligente: se já tem dados, apenas abre. Se não tem, gera */}
                {insights.length > 0 || balancePrediction || anomalies.length > 0 || spendingPatterns.length > 0 ? (
                  <Button
                    variant="gradient"
                    size="sm"
                    className="w-full mt-4 shadow-lg hover:shadow-xl transition-all"
                    onClick={handleOpenAnalysisModal}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Ver Análise Completa
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    variant="gradient"
                    size="sm"
                    className="w-full mt-4 shadow-lg hover:shadow-xl transition-all"
                    onClick={handleAIAnalysis}
                    disabled={aiLoading}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    {aiLoading ? 'Analisando...' : 'Gerar Análise'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
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
                    disabled={syncStatus.isSyncing}
                    onClick={async () => {
                      try {
                        await manualSync();
                        toast({
                          title: "Sincronizado!",
                          description: "Transações atualizadas com sucesso",
                        });
                      } catch (error: any) {
                        toast({
                          title: "Erro ao sincronizar",
                          description: error.message,
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <RefreshCw className={`w-4 h-4 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {transactionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : recentTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Nenhuma transação ainda</p>
                    <p className="text-xs mt-1">Conecte um banco ou adicione transações manualmente</p>
                  </div>
                ) : (
                  recentTransactions.map((transaction) => {
                    // Format date
                    const txDate = new Date(transaction.date);
                    const now = new Date();
                    const diffDays = Math.floor((now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24));
                    let dateText = '';
                    if (diffDays === 0) dateText = 'Hoje';
                    else if (diffDays === 1) dateText = 'Ontem';
                    else dateText = `${diffDays} dias atrás`;

                    return (
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
                            <span className="text-xs text-muted-foreground">{dateText}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground capitalize">{transaction.category}</span>
                            {transaction.synced_from_bank && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Banco</span>
                            )}
                          </div>
                        </div>
                        <div className={`text-sm font-bold ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                          {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR')}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Metas Financeiras + Ações Rápidas - Design Premium */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Smart Goals - IA-powered financial goals */}
            <SmartGoals
              onCreateGoal={() => setShowCreateGoal(true)}
            />

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
                  onClick={insights.length > 0 || balancePrediction || anomalies.length > 0 ? handleOpenAnalysisModal : handleAIAnalysis}
                  disabled={aiLoading}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold">
                      {insights.length > 0 || balancePrediction || anomalies.length > 0 ? 'Ver Análise IA' : 'Análise Detalhada IA'}
                    </span>
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
            <DialogTitle className="flex items-center justify-between text-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div>Análise Detalhada de IA</div>
                  <DialogDescription className="text-sm mt-1">
                    Insights personalizados baseados em machine learning e análise preditiva
                  </DialogDescription>
                </div>
              </div>
              {/* Botão para atualizar análise */}
              {!isAnalyzing && aiAnalysisComplete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAIAnalysis}
                  className="flex items-center gap-2"
                  disabled={aiLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              )}
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
              {/* AI Error State */}
              {aiError && (
                <Card className="border-l-4 border-l-destructive bg-destructive/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      </div>
                      <span>Erro na Análise</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{aiError}</p>
                  </CardContent>
                </Card>
              )}

              {/* Financial Insights */}
              {insights.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Insights Financeiros
                  </h3>
                  {insights.map((insight, index) => {
                    const insightType = getInsightType(insight.severity);
                    const Icon = getInsightIcon(insight.category);

                    return (
                      <Card key={index} className={`border-l-4 transition-all hover:shadow-lg ${
                        insightType === 'success' ? 'border-l-success bg-success/5 hover:bg-success/10' :
                        insightType === 'warning' ? 'border-l-warning bg-warning/5 hover:bg-warning/10' :
                        insightType === 'danger' ? 'border-l-destructive bg-destructive/5 hover:bg-destructive/10' :
                        'border-l-primary bg-primary/5 hover:bg-primary/10'
                      }`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                insightType === 'success' ? 'bg-success/20' :
                                insightType === 'warning' ? 'bg-warning/20' :
                                insightType === 'danger' ? 'bg-destructive/20' :
                                'bg-primary/20'
                              }`}>
                                <Icon className={`w-5 h-5 ${
                                  insightType === 'success' ? 'text-success' :
                                  insightType === 'warning' ? 'text-warning' :
                                  insightType === 'danger' ? 'text-destructive' :
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
                          {insight.action_items && insight.action_items.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground">Ações recomendadas:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {insight.action_items.map((action, i) => (
                                  <li key={i} className="text-xs text-muted-foreground">{action}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Balance Prediction */}
              {balancePrediction && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-primary" />
                    Previsão de Saldo
                  </h3>
                  <Card className="border-l-4 border-l-primary bg-primary/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Saldo previsto em {balancePrediction.days_ahead} dias
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-3xl font-bold text-primary">
                        R$ {balancePrediction.predicted_balance.toLocaleString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Confiança:</span>
                        <Progress value={balancePrediction.confidence * 100} className="h-2 flex-1" />
                        <span className="text-sm font-semibold text-primary">
                          {(balancePrediction.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      {balancePrediction.trend && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Tendência:</strong> {balancePrediction.trend}
                        </p>
                      )}
                      {balancePrediction.factors && balancePrediction.factors.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground">Fatores considerados:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {balancePrediction.factors.map((factor, i) => (
                              <li key={i} className="text-xs text-muted-foreground">{factor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Anomalies */}
              {anomalies.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Anomalias Detectadas
                  </h3>
                  <div className="space-y-3">
                    {anomalies.map((anomaly, index) => (
                      <Card key={index} className="border-l-4 border-l-destructive bg-destructive/5">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center justify-between">
                            <span>{anomaly.transaction_description}</span>
                            <span className="text-xs font-normal text-muted-foreground">
                              {new Date(anomaly.date).toLocaleDateString('pt-BR')}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm text-foreground">{anomaly.reason}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Severidade:</span>
                            <span className={`text-xs font-semibold ${
                              anomaly.severity === 'high' ? 'text-destructive' :
                              anomaly.severity === 'medium' ? 'text-warning' :
                              'text-success'
                            }`}>
                              {anomaly.severity === 'high' ? 'Alta' : anomaly.severity === 'medium' ? 'Média' : 'Baixa'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Spending Patterns */}
              {spendingPatterns.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                    <PieChart className="w-5 h-5 text-primary" />
                    Padrões de Gastos
                  </h3>
                  <div className="space-y-3">
                    {spendingPatterns.map((pattern, index) => (
                      <Card key={index} className="border-l-4 border-l-primary bg-primary/5">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm capitalize">{pattern.category}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Média Mensal</span>
                            <span className="text-sm font-bold">R$ {pattern.average_amount.toLocaleString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Tendência</span>
                            <span className={`text-sm font-semibold flex items-center gap-1 ${
                              pattern.trend === 'increasing' ? 'text-destructive' :
                              pattern.trend === 'decreasing' ? 'text-success' :
                              'text-muted-foreground'
                            }`}>
                              {pattern.trend === 'increasing' && <ArrowUpRight className="w-3 h-3" />}
                              {pattern.trend === 'decreasing' && <TrendingDown className="w-3 h-3" />}
                              {pattern.trend === 'increasing' ? 'Aumentando' : pattern.trend === 'decreasing' ? 'Diminuindo' : 'Estável'}
                            </span>
                          </div>
                          {pattern.insights && (
                            <p className="text-xs text-muted-foreground mt-2">{pattern.insights}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {insights.length === 0 && !balancePrediction && anomalies.length === 0 && spendingPatterns.length === 0 && !aiError && (
                <Card className="border-l-4 border-l-muted bg-muted/5">
                  <CardContent className="py-8 text-center">
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      Não há dados suficientes para gerar insights. Adicione mais transações ou conecte um banco.
                    </p>
                  </CardContent>
                </Card>
              )}
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

      {/* Modal de Criar Meta - Design Premium com IA */}
      <CreateGoalModal
        open={showCreateGoal}
        onClose={() => setShowCreateGoal(false)}
        onSuccess={async () => {
          setShowCreateGoal(false);
          // Refresh goals list
          await refreshGoals();
          toast({
            title: "Meta criada com sucesso!",
            description: "Sua meta foi salva e já está sendo monitorada",
          });
        }}
        currentBalance={currentBalance}
        monthlyIncome={totalRevenue}
        monthlyExpenses={totalExpenses}
      />

      {/* Modal de Configurações de Notificações */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-violet-600" />
              Configurações de Notificações
            </DialogTitle>
            <DialogDescription>
              Configure como e quando você deseja receber notificações sobre seu fluxo de caixa
            </DialogDescription>
          </DialogHeader>
          <NotificationSettings />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
