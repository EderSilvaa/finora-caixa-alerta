import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Sparkles } from "lucide-react";
import logo from "@/assets/logo_finora.jpg";

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-md space-y-8 animate-fade-in-up">
        {/* Logo */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Finora Finanças" className="h-16 w-auto" />
          </div>
          
          <h1 className="text-4xl font-bold text-foreground">
            Preveja seu caixa antes do aperto
          </h1>
          
          <p className="text-lg text-muted-foreground">
            A Finora te avisa quando seu caixa pode zerar — e sugere o que fazer
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 py-6">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="p-2 rounded-lg bg-gradient-primary">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Previsão automática</h3>
              <p className="text-sm text-muted-foreground">
                Veja quando seu dinheiro vai acabar e planeje com antecedência
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Alertas inteligentes</h3>
              <p className="text-sm text-muted-foreground">
                Receba avisos antes de ficar sem grana
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Sugestões práticas</h3>
              <p className="text-sm text-muted-foreground">
                Dicas automáticas para melhorar seu fluxo de caixa
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <Button 
            variant="gradient" 
            size="lg" 
            className="w-full"
            onClick={() => navigate("/simulator")}
          >
            Simular agora
          </Button>
          
          <p className="text-center text-xs text-muted-foreground">
            Sem cadastro. Simule gratuitamente em 2 minutos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
