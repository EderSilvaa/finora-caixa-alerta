import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, CheckCircle2, Loader2, Sparkles, TrendingUp, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  impact: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  category: "revenue" | "expense" | "negotiation" | "financing";
}

interface ActionPlanProps {
  daysUntilZero: number;
  currentBalance: number;
  monthlyBurn: number;
  onGenerateAIPlan?: () => Promise<ActionItem[]>;
  initialActions?: ActionItem[];
}

export const ActionPlan = ({
  daysUntilZero,
  currentBalance,
  monthlyBurn,
  onGenerateAIPlan,
  initialActions = []
}: ActionPlanProps) => {
  const [actions, setActions] = useState<ActionItem[]>(initialActions);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPlan, setShowPlan] = useState(false);

  // Check if situation is critical (less than 15 days)
  const isCritical = daysUntilZero < 15 && daysUntilZero > 0;
  const isEmergency = daysUntilZero < 7 && daysUntilZero > 0;

  const completedCount = actions.filter(a => a.completed).length;
  const progressPercentage = actions.length > 0 ? (completedCount / actions.length) * 100 : 0;

  const handleGeneratePlan = async () => {
    if (!onGenerateAIPlan) return;

    setIsGenerating(true);
    setShowPlan(true);

    try {
      const generatedActions = await onGenerateAIPlan();
      setActions(generatedActions);
    } catch (error) {
      console.error('Error generating action plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleAction = (id: string) => {
    setActions(actions.map(action =>
      action.id === id ? { ...action, completed: !action.completed } : action
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'primary';
      default: return 'muted';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue': return TrendingUp;
      case 'expense': return DollarSign;
      case 'negotiation': return Calendar;
      default: return Sparkles;
    }
  };

  // Don't show if not critical
  if (!isCritical && !showPlan) return null;

  return (
    <Card className={`border-0 bg-gradient-to-br backdrop-blur-xl shadow-2xl ${
      isEmergency
        ? 'from-destructive/15 via-card/95 to-destructive/10'
        : 'from-warning/10 via-card/95 to-warning/5'
    }`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isEmergency
                ? 'bg-destructive/20 animate-pulse'
                : 'bg-warning/20'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${
                isEmergency ? 'text-destructive' : 'text-warning'
              }`} />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-foreground">
                {isEmergency ? '🚨 Plano de Ação EMERGENCIAL' : '⚠️ Plano de Ação para Caixa'}
              </CardTitle>
              <CardDescription className="text-sm">
                Seu caixa zerará em <span className="font-bold text-destructive">{daysUntilZero} dias</span>
              </CardDescription>
            </div>
          </div>
          {!showPlan && (
            <Button
              variant="gradient"
              size="sm"
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="shadow-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Plano com IA
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Loading State */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <Sparkles className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Analisando seu fluxo de caixa e gerando ações personalizadas...
            </p>
          </div>
        )}

        {/* Action Plan */}
        {!isGenerating && actions.length > 0 && (
          <>
            {/* Progress Summary */}
            <div className="p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Progresso do Plano</span>
                <span className="text-sm font-bold text-primary">
                  {completedCount}/{actions.length} concluídas
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              {completedCount === actions.length && (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-semibold">Todas as ações concluídas! 🎉</span>
                </div>
              )}
            </div>

            {/* Impact Estimate */}
            <div className="p-4 rounded-xl bg-success/10 border border-success/30">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-success mb-1">Impacto Estimado</p>
                  <p className="text-xs text-muted-foreground">
                    Completar todas as ações pode adicionar <span className="font-bold text-success">+{Math.round(daysUntilZero * 1.5)} dias</span> de sobrevivência
                  </p>
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Ações Recomendadas
              </h3>

              {actions.map((action) => {
                const Icon = getCategoryIcon(action.category);
                const priorityColor = getPriorityColor(action.priority);

                return (
                  <div
                    key={action.id}
                    className={`p-4 rounded-xl border transition-all ${
                      action.completed
                        ? 'bg-success/5 border-success/20 opacity-70'
                        : 'bg-background/60 backdrop-blur-sm border-border/50 hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={action.completed}
                        onCheckedChange={() => toggleAction(action.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                            <h4 className={`text-sm font-semibold ${
                              action.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}>
                              {action.title}
                            </h4>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            action.priority === 'high'
                              ? 'bg-destructive/20 text-destructive'
                              : action.priority === 'medium'
                              ? 'bg-warning/20 text-warning'
                              : 'bg-primary/20 text-primary'
                          }`}>
                            {action.priority === 'high' ? 'Urgente' : action.priority === 'medium' ? 'Importante' : 'Baixa'}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed ${
                          action.completed ? 'text-muted-foreground' : 'text-foreground'
                        }`}>
                          {action.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">Impacto:</span>
                          <span className="font-semibold text-success">{action.impact}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Regenerate Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGeneratePlan}
              disabled={isGenerating}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Novo Plano
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}

        {/* Empty State */}
        {!isGenerating && actions.length === 0 && showPlan && (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Não foi possível gerar um plano de ação. Tente novamente.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
