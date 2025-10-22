import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import logo from "@/assets/logo_finora.jpg";

const Simulator = () => {
  const navigate = useNavigate();
  const [weeklyRevenue, setWeeklyRevenue] = useState([5000]);
  const [fixedExpenses, setFixedExpenses] = useState([3000]);
  const [variableExpenses, setVariableExpenses] = useState([1500]);

  const handleSimulate = () => {
    navigate("/results", {
      state: { weeklyRevenue: weeklyRevenue[0], fixedExpenses: fixedExpenses[0], variableExpenses: variableExpenses[0] }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      {/* Header */}
      <div className="w-full max-w-2xl mx-auto mb-6 animate-fade-in">
        <button 
          onClick={() => navigate("/")} 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <img src={logo} alt="Finora" className="h-12 w-auto" />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-2xl mx-auto space-y-8 animate-fade-in-up">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Vamos simular seu fluxo de caixa
          </h1>
          <p className="text-muted-foreground">
            Ajuste os valores abaixo para gerar sua previsão
          </p>
        </div>

        {/* Input Cards */}
        <div className="space-y-6">
          {/* Weekly Revenue */}
          <Card className="p-6 space-y-4 border-2 hover:border-primary transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg text-foreground">Receita Semanal</h3>
                <p className="text-sm text-muted-foreground">Quanto você recebe por semana em média</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  R$ {weeklyRevenue[0].toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
            <Slider
              value={weeklyRevenue}
              onValueChange={setWeeklyRevenue}
              min={500}
              max={20000}
              step={500}
              className="py-2"
            />
          </Card>

          {/* Fixed Expenses */}
          <Card className="p-6 space-y-4 border-2 hover:border-primary transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg text-foreground">Despesas Fixas</h3>
                <p className="text-sm text-muted-foreground">Aluguel, salários, contas fixas</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-destructive">
                  R$ {fixedExpenses[0].toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
            <Slider
              value={fixedExpenses}
              onValueChange={setFixedExpenses}
              min={0}
              max={15000}
              step={500}
              className="py-2"
            />
          </Card>

          {/* Variable Expenses */}
          <Card className="p-6 space-y-4 border-2 hover:border-primary transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg text-foreground">Despesas Variáveis</h3>
                <p className="text-sm text-muted-foreground">Materiais, transporte, outras</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-warning">
                  R$ {variableExpenses[0].toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
            <Slider
              value={variableExpenses}
              onValueChange={setVariableExpenses}
              min={0}
              max={10000}
              step={500}
              className="py-2"
            />
          </Card>
        </div>

        {/* Summary */}
        <Card className="p-6 bg-gradient-to-br from-muted/50 to-muted animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Saldo Semanal</p>
              <p className="text-3xl font-bold text-foreground">
                R$ {(weeklyRevenue[0] - fixedExpenses[0] - variableExpenses[0]).toLocaleString('pt-BR')}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              weeklyRevenue[0] - fixedExpenses[0] - variableExpenses[0] > 0 
                ? 'bg-success/10 text-success' 
                : 'bg-destructive/10 text-destructive'
            }`}>
              {weeklyRevenue[0] - fixedExpenses[0] - variableExpenses[0] > 0 ? 'Positivo' : 'Negativo'}
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <Button 
            variant="gradient" 
            size="lg" 
            className="w-full"
            onClick={handleSimulate}
          >
            Gerar Previsão
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
