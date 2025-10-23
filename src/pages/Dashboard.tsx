import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingDown, Calendar, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Target, Zap, Download, Upload, RefreshCw } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import Logo from "@/components/Logo";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Dados simulados de projeção de caixa (últimos 90 dias)
  const cashFlowData = [
    { day: 0, balance: 3500 },
    { day: 15, balance: 3200 },
    { day: 30, balance: 2800 },
    { day: 45, balance: 2300 },
    { day: 60, balance: 1700 },
    { day: 75, balance: 900 },
    { day: 90, balance: 200 },
    { day: 102, balance: 0 },
  ];

  // Dados de receitas vs despesas (últimos 6 meses)
  const revenueExpensesData = [
    { month: 'Mai', receita: 8500, despesas: 7200 },
    { month: 'Jun', receita: 9200, despesas: 7800 },
    { month: 'Jul', receita: 8800, despesas: 8200 },
    { month: 'Ago', receita: 9500, despesas: 8500 },
    { month: 'Set', receita: 10200, despesas: 9100 },
    { month: 'Out', receita: 11000, despesas: 9500 },
  ];

  // Transações recentes
  const recentTransactions = [
    { id: 1, type: 'income', description: 'Pagamento Cliente XYZ', amount: 2500, date: 'Hoje, 14:30' },
    { id: 2, type: 'expense', description: 'Fornecedor ABC', amount: 850, date: 'Hoje, 10:15' },
    { id: 3, type: 'income', description: 'Venda Produto', amount: 1200, date: 'Ontem, 16:45' },
    { id: 4, type: 'expense', description: 'Aluguel', amount: 3000, date: 'Ontem, 09:00' },
    { id: 5, type: 'expense', description: 'Energia Elétrica', amount: 450, date: '2 dias atrás' },
  ];

  // Metas financeiras
  const financialGoals = [
    { id: 1, title: 'Reserva de Emergência', current: 8500, target: 15000, percentage: 57 },
    { id: 2, title: 'Expansão do Negócio', current: 12000, target: 30000, percentage: 40 },
    { id: 3, title: 'Quitação de Dívidas', current: 7500, target: 10000, percentage: 75 },
  ];

  const daysUntilZero = 12;
  const currentBalance = 3500;
  const analyzedPeriod = 90;
  const monthlyGrowth = 8.5;
  const monthlySavings = 1500;
  const totalRevenue = 11000;
  const totalExpenses = 9500;

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

      {/* Header */}
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

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Grid - 5 KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Current Balance Card */}
            <Card className="border-border/50 bg-card/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs text-muted-foreground font-medium">Saldo Atual</CardTitle>
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground mt-1">
                  R$ {currentBalance.toLocaleString('pt-BR')}
                </div>
              </CardHeader>
            </Card>

            {/* Revenue Card */}
            <Card className="border-success/30 bg-success/5 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs text-muted-foreground font-medium">Receita Mensal</CardTitle>
                  <ArrowUpRight className="w-4 h-4 text-success" />
                </div>
                <div className="text-2xl font-bold text-success mt-1">
                  R$ {totalRevenue.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-success mt-1">+{monthlyGrowth}% vs mês anterior</p>
              </CardHeader>
            </Card>

            {/* Expenses Card */}
            <Card className="border-warning/30 bg-warning/5 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs text-muted-foreground font-medium">Despesas Mensais</CardTitle>
                  <ArrowDownRight className="w-4 h-4 text-warning" />
                </div>
                <div className="text-2xl font-bold text-warning mt-1">
                  R$ {totalExpenses.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{((totalExpenses/totalRevenue)*100).toFixed(0)}% da receita</p>
              </CardHeader>
            </Card>

            {/* Savings Card */}
            <Card className="border-primary/30 bg-primary/5 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs text-muted-foreground font-medium">Economia</CardTitle>
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary mt-1">
                  R$ {monthlySavings.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Este mês</p>
              </CardHeader>
            </Card>

            {/* Days Until Zero Card */}
            <Card className="border-destructive/30 bg-destructive/5 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs text-muted-foreground font-medium">Alerta de Caixa</CardTitle>
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                <div className="text-2xl font-bold text-destructive mt-1">
                  {daysUntilZero} dias
                </div>
                <p className="text-xs text-destructive mt-1">Até zerar</p>
              </CardHeader>
            </Card>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Predictive Chart - Takes 2 columns */}
            <Card className="lg:col-span-2 border-border/50 bg-card/70 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground text-base">
                  <TrendingDown className="w-5 h-5 text-primary" />
                  Projeção de Caixa
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[280px] w-full">
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
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="hsl(var(--border))" 
                      opacity={0.2}
                    />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: 'Dias', position: 'insideBottom', offset: -10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: 'R$', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `R$ ${value}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--popover-foreground))'
                      }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Saldo']}
                      labelFormatter={(label) => `Dia ${label}`}
                    />
                    <ReferenceLine 
                      y={0} 
                      stroke="hsl(var(--destructive))" 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="url(#lineGradient)"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                      activeDot={{ r: 8, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Warning Alert - Compact */}
              <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-destructive">
                      Atenção: Caixa em risco
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Zera em <span className="font-bold text-destructive">{daysUntilZero} dias</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

            {/* AI Insights Card - Sidebar */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Insights IA
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <p className="text-xs text-foreground leading-relaxed">
                    <span className="font-semibold text-primary">Recomendação:</span> Antecipe R$ 1.200 em recebíveis para manter fluxo positivo.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <p className="text-xs text-foreground leading-relaxed">
                    <span className="font-semibold text-primary">Oportunidade:</span> Despesas variáveis subiram 15%. Revise contratos.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <p className="text-xs text-foreground leading-relaxed">
                    <span className="font-semibold text-success">Positivo:</span> Receita cresceu 8% nas últimas 2 semanas.
                  </p>
                </div>

                <Button
                  variant="gradient"
                  size="sm"
                  className="w-full mt-2"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Ver Mais
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Second Row - Revenue/Expenses Chart + Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue vs Expenses Chart - 2 columns */}
            <Card className="lg:col-span-2 border-border/50 bg-card/70 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground text-base">
                  <BarChart className="w-5 h-5 text-primary" />
                  Receitas vs Despesas (6 meses)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueExpensesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `R$ ${value/1000}k`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                      />
                      <Bar dataKey="receita" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="despesas" fill="hsl(var(--warning))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions - 1 column */}
            <Card className="border-border/50 bg-card/70 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-foreground">
                    Transações Recentes
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="h-8">
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                      {transaction.type === 'income' ? (
                        <Upload className="w-4 h-4 text-success" />
                      ) : (
                        <Download className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{transaction.date}</p>
                    </div>
                    <div className={`text-xs font-bold ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                      {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR')}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Third Row - Financial Goals + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Goals */}
            <Card className="border-border/50 bg-card/70 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground text-base">
                  <Target className="w-5 h-5 text-primary" />
                  Metas Financeiras
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {financialGoals.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{goal.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {goal.percentage}%
                      </span>
                    </div>
                    <Progress value={goal.percentage} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>R$ {goal.current.toLocaleString('pt-BR')}</span>
                      <span>Meta: R$ {goal.target.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground text-base">
                  <Zap className="w-5 h-5 text-primary" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Download className="w-4 h-4 mr-2" />
                  Registrar Despesa
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Upload className="w-4 h-4 mr-2" />
                  Registrar Receita
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Nova Projeção
                </Button>
                <Button variant="gradient" className="w-full justify-start" size="lg">
                  <Brain className="w-4 h-4 mr-2" />
                  Análise Detalhada IA
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
    </div>
  );
};

export default Dashboard;