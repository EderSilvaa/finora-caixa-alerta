import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, AlertCircle, CheckCircle2, Clock, Sparkles, Plus } from "lucide-react";
import { useSmartGoals } from "@/hooks/useSmartGoals";

interface SmartGoalsProps {
  onCreateGoal?: () => void;
}

export const SmartGoals = ({ onCreateGoal }: SmartGoalsProps) => {
  const { goals, loading, totalProgress, goalsOnTrack, goalsBehind } = useSmartGoals();

  if (loading) {
    return (
      <Card className="border-0 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Metas Financeiras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Carregando metas...</div>
        </CardContent>
      </Card>
    );
  }

  if (goals.length === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Metas Financeiras</CardTitle>
                <CardDescription className="text-xs">Defina objetivos e acompanhe progresso</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground mb-4">Nenhuma meta criada ainda</p>
          <Button variant="gradient" size="sm" onClick={onCreateGoal}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Meta
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'emergency_fund': return 'destructive';
      case 'savings': return 'success';
      case 'business_expansion': return 'primary';
      case 'debt_payment': return 'warning';
      default: return 'secondary';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      savings: 'Economia',
      emergency_fund: 'Emergência',
      debt_payment: 'Dívida',
      business_expansion: 'Expansão',
      equipment: 'Equipamento',
      reserve: 'Reserva',
      custom: 'Personalizado',
    };
    return labels[category] || category;
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-foreground">Metas Financeiras</CardTitle>
              <CardDescription className="text-xs">
                {goalsOnTrack} no prazo • {goalsBehind} atrasada{goalsBehind !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-semibold border-primary/30 text-primary">
            {totalProgress}% progresso geral
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {goals.map((goal) => {
          const daysRemaining = goal.target_date
            ? Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null;

          return (
            <div
              key={goal.id}
              className="p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">{goal.title}</span>
                    {goal.is_ai_suggested && (
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        IA
                      </Badge>
                    )}
                    <Badge variant={getCategoryColor(goal.category)} className="text-xs">
                      {getCategoryLabel(goal.category)}
                    </Badge>
                  </div>
                  {goal.description && (
                    <p className="text-xs text-muted-foreground">{goal.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold text-primary">{goal.progress_percentage}%</span>
                  {!goal.on_track && goal.days_behind > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      -{goal.days_behind}d
                    </Badge>
                  )}
                </div>
              </div>

              <div className="relative">
                <Progress value={goal.progress_percentage} className="h-3" />
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/20 to-transparent rounded-full transition-all"
                  style={{ width: `${goal.progress_percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-muted-foreground">
                    R$ {goal.current_amount.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-muted-foreground"> / </span>
                  <span className="font-semibold text-foreground">
                    R$ {goal.target_amount.toLocaleString('pt-BR')}
                  </span>
                </div>
                {daysRemaining !== null && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className={`font-semibold ${
                      daysRemaining < 7 ? 'text-warning' : daysRemaining < 0 ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {daysRemaining > 0 ? `${daysRemaining} dias` : 'Vencido'}
                    </span>
                  </div>
                )}
              </div>

              {/* On Track Status */}
              {goal.on_track ? (
                <div className="flex items-center gap-2 text-xs text-success">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="font-medium">No prazo</span>
                  {goal.daily_target && (
                    <span className="text-muted-foreground">
                      • R$ {goal.daily_target.toFixed(2)}/dia
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-warning">
                  <AlertCircle className="w-3 h-3" />
                  <span className="font-medium">{goal.days_behind} dias atrasado</span>
                  {goal.daily_target && (
                    <span className="text-muted-foreground">
                      • precisa R$ {(goal.daily_target * 1.5).toFixed(2)}/dia para recuperar
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <Button variant="outline" className="w-full" onClick={onCreateGoal}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Nova Meta
        </Button>
      </CardContent>
    </Card>
  );
};
