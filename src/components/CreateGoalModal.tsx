import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Target, Calendar, DollarSign } from "lucide-react";
import { useSmartGoals, type CreateGoalData } from "@/hooks/useSmartGoals";
import { useToast } from "@/hooks/use-toast";

interface CreateGoalModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  // Dados financeiros para IA
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

export const CreateGoalModal = ({
  open,
  onClose,
  onSuccess,
  currentBalance,
  monthlyIncome,
  monthlyExpenses,
}: CreateGoalModalProps) => {
  const { toast } = useToast();
  const { createGoal, generateAIGoals } = useSmartGoals();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [category, setCategory] = useState<string>("savings");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const categories = [
    { value: "savings", label: "Economia Geral", icon: "💰" },
    { value: "emergency_fund", label: "Fundo de Emergência", icon: "🚨" },
    { value: "debt_payment", label: "Quitação de Dívidas", icon: "💳" },
    { value: "business_expansion", label: "Expansão do Negócio", icon: "📈" },
    { value: "equipment", label: "Equipamentos", icon: "🛠️" },
    { value: "reserve", label: "Reserva de Caixa", icon: "🏦" },
    { value: "custom", label: "Personalizado", icon: "⭐" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !targetAmount) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e valor alvo",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const goalData: CreateGoalData = {
        title,
        description: description || undefined,
        target_amount: parseFloat(targetAmount),
        current_amount: currentAmount ? parseFloat(currentAmount) : 0,
        target_date: targetDate || undefined,
        category: category as any,
      };

      await createGoal(goalData);

      toast({
        title: "Meta criada!",
        description: `${title} foi adicionada às suas metas`,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setTargetAmount("");
      setCurrentAmount("");
      setTargetDate("");
      setCategory("savings");

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro ao criar meta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAISuggestions = async () => {
    setIsGeneratingAI(true);

    try {
      const suggestions = await generateAIGoals(
        currentBalance,
        monthlyIncome,
        monthlyExpenses
      );

      if (suggestions.length === 0) {
        toast({
          title: "Nenhuma sugestão",
          description: "Não foi possível gerar sugestões com os dados atuais",
          variant: "destructive",
        });
        return;
      }

      // Preencher com a primeira sugestão
      const firstSuggestion = suggestions[0];
      setTitle(firstSuggestion.title);
      setDescription(firstSuggestion.description || "");
      setTargetAmount(firstSuggestion.target_amount.toString());
      setCurrentAmount(firstSuggestion.current_amount?.toString() || "0");
      setTargetDate(firstSuggestion.target_date?.split('T')[0] || "");
      setCategory(firstSuggestion.category || "savings");

      toast({
        title: "Meta sugerida!",
        description: `${suggestions.length} sugestão${suggestions.length > 1 ? 'ões' : ''} baseada${suggestions.length > 1 ? 's' : ''} nos seus dados`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar sugestões",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Calcular preview dos targets
  const calculateTargets = () => {
    if (!targetAmount || !targetDate) return null;

    const target = parseFloat(targetAmount);
    const current = currentAmount ? parseFloat(currentAmount) : 0;
    const remaining = target - current;

    const today = new Date();
    const targetDateObj = new Date(targetDate);
    const daysRemaining = Math.ceil((targetDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0 || remaining <= 0) return null;

    const dailyTarget = remaining / daysRemaining;
    const weeklyTarget = dailyTarget * 7;

    return {
      daysRemaining,
      dailyTarget,
      weeklyTarget,
    };
  };

  const targets = calculateTargets();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-0 bg-gradient-to-br from-card/98 to-card/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div>Criar Nova Meta</div>
              <DialogDescription className="text-sm mt-1">
                Defina objetivos financeiros e acompanhe seu progresso
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* IA Suggestion Button */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  IA Sugerir Meta Personalizada
                </h3>
                <p className="text-xs text-muted-foreground">
                  Baseado no seu saldo (R$ {currentBalance.toLocaleString('pt-BR')}),
                  receitas (R$ {monthlyIncome.toLocaleString('pt-BR')}/mês) e
                  despesas (R$ {monthlyExpenses.toLocaleString('pt-BR')}/mês)
                </p>
              </div>
              <Button
                type="button"
                variant="gradient"
                size="sm"
                onClick={handleAISuggestions}
                disabled={isGeneratingAI}
                className="shadow-lg flex-shrink-0"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Sugerir
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">
              Título da Meta *
            </Label>
            <Input
              id="title"
              placeholder="Ex: Fundo de Emergência, Expansão do Negócio"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Descrição (Opcional)
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva o objetivo desta meta..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-semibold">
              Categoria
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentAmount" className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Valor Atual (R$)
              </Label>
              <Input
                id="currentAmount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount" className="text-sm font-semibold flex items-center gap-2">
                <Target className="w-4 h-4" />
                Valor Alvo (R$) *
              </Label>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                placeholder="15.000,00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="h-12"
                required
              />
            </div>
          </div>

          {/* Target Date */}
          <div className="space-y-2">
            <Label htmlFor="targetDate" className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data Alvo (Opcional)
            </Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="h-12"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Preview of Targets */}
          {targets && (
            <div className="p-4 rounded-xl bg-success/10 border border-success/30 space-y-2">
              <h3 className="text-sm font-semibold text-success">💡 Para atingir esta meta:</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground">{targets.daysRemaining}</p>
                  <p className="text-xs text-muted-foreground">dias restantes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">R$ {targets.dailyTarget.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">por dia</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">R$ {targets.weeklyTarget.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">por semana</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1 shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Criar Meta
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
