import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingDown, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

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

  const daysUntilZero = 12;
  const currentBalance = 3500;
  const analyzedPeriod = 90;

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
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <Brain className="w-6 h-6 text-white" />
              </div>
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
      <main className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Current Balance Card */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg text-muted-foreground font-normal">Saldo Atual</CardTitle>
              <div className="text-5xl font-bold text-foreground mt-2">
                R$ {currentBalance.toLocaleString('pt-BR')}
              </div>
            </CardHeader>
          </Card>

          {/* Predictive Chart */}
          <Card className="border-border/50 bg-card/50 backdrop-blur shadow-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingDown className="w-5 h-5 text-primary" />
                Projeção de Caixa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
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

              {/* Warning Alert */}
              <div className="mt-8 p-6 rounded-lg bg-destructive/10 border-2 border-destructive/50 shadow-[0_0_20px_hsl(var(--destructive)/0.3)] animate-pulse-glow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-destructive mb-1">
                      Atenção: Caixa em risco
                    </h3>
                    <p className="text-foreground">
                      Seu caixa vai zerar em <span className="font-bold text-destructive">{daysUntilZero} dias</span>.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights Card */}
          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur shadow-glow">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Insights Automáticos da IA
                  </h3>
                  <p className="text-muted-foreground">
                    Baseado nas suas entradas e saídas dos últimos {analyzedPeriod} dias.
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <p className="text-foreground">
                    <span className="font-semibold text-primary">Recomendação:</span> Considere antecipar R$ 1.200 em recebíveis para manter o fluxo positivo pelos próximos 30 dias.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <p className="text-foreground">
                    <span className="font-semibold text-primary">Oportunidade:</span> Suas despesas variáveis aumentaram 15% no último mês. Revise contratos e renegocie quando possível.
                  </p>
                </div>
              </div>

              <Button 
                variant="gradient" 
                size="lg" 
                className="w-full"
              >
                <Brain className="w-5 h-5 mr-2" />
                Ver Recomendações Completas
              </Button>
            </CardContent>
          </Card>
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